#!/usr/bin/env node

import { spawn } from "node:child_process";
import { constants } from "node:fs";
import {
	access,
	copyFile,
	cp,
	mkdir,
	mkdtemp,
	readFile,
	rm,
	stat,
	writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Absolute path to the theme repository root (the parent of `scripts/`).
 */
const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

interface CommandResult {
	code: number | null;
	signal: NodeJS.Signals | null;
	stdout: string;
	stderr: string;
	combined: string;
	durationMs: number;
}

interface StepDefinition {
	name: string;
	command: string;
	args: string[];
	cwd: string;
	expectedFiles?: string[];
}

/**
 * Where the theme under test comes from.
 *
 * - `local`: install the local working tree of this repository (default), so the
 *   test exercises the actual code on the current branch, including uncommitted
 *   changes. This is what makes the test meaningful as a pre-push / CI gate.
 * - `submodule`: clone the published theme from its remote via `git submodule add`,
 *   reproducing the documented quickstart install. Useful to verify the public
 *   install path, but does **not** see local changes.
 */
type ThemeSource = "local" | "submodule";

interface RoutineOptions {
	projectName: string;
	themeSource: ThemeSource;
	themePath: string;
	themeRepo: string;
	themeDir: string;
	themeName: string;
	configFile: string;
	keepOnSuccess: boolean;
	keepOnFailure: boolean;
	verbose: boolean;
}

interface StepReport {
	step: string;
	commandLine: string;
	cwd: string;
	result: CommandResult;
}

interface HtmlAssertion {
	description: string;
	test: (html: string) => boolean;
}

const DEFAULT_OPTIONS: RoutineOptions = {
	projectName: "quickstart",
	themeSource: "local",
	themePath: REPO_ROOT,
	themeRepo: "https://github.com/gohugo-ananke/ananke.git",
	themeDir: "themes/ananke",
	themeName: "ananke",
	configFile: "hugo.toml",
	keepOnSuccess: false,
	keepOnFailure: true,
	verbose: true,
};

/**
 * Print CLI help.
 */
function printHelp(): void {
	console.log(
		`
Usage:
  node scripts/test-hugo-quickstart.ts [options]

Options:
  --project-name=<name>         Hugo project folder name inside the temp directory
  --theme-path=<path>           Install the theme from this local directory (default: this repo).
                                Implies local mode; tests the actual working tree.
  --use-submodule               Install the published theme via "git submodule add" instead
                                of the local working tree (verifies the documented quickstart).
  --theme-repo=<url>            Git URL for the theme submodule (only used with --use-submodule)
  --theme-dir=<path>            Theme target directory inside the project
  --theme-name=<name>           Theme name written into hugo.toml
  --config-file=<file>          Hugo config file to update
  --keep-on-success             Do not delete the temp directory when the test passes
  --no-keep-on-failure          Delete the temp directory when the test fails
  --quiet                       Reduce step logging
  --help                        Show this help
`.trim(),
	);
}

/**
 * Parse CLI arguments into routine options.
 *
 * @param argv Raw CLI arguments after the executable and script path.
 * @returns Parsed routine options.
 * @throws Error when an unknown argument is passed.
 */
function parseArgs(argv: string[]): RoutineOptions {
	const options: RoutineOptions = { ...DEFAULT_OPTIONS };

	for (const arg of argv) {
		if (arg === "--help") {
			printHelp();
			process.exit(0);
		}

		if (arg === "--keep-on-success") {
			options.keepOnSuccess = true;
			continue;
		}

		if (arg === "--no-keep-on-failure") {
			options.keepOnFailure = false;
			continue;
		}

		if (arg === "--quiet") {
			options.verbose = false;
			continue;
		}

		if (arg === "--use-submodule") {
			options.themeSource = "submodule";
			continue;
		}

		if (arg.startsWith("--theme-path=")) {
			options.themePath = resolve(arg.slice("--theme-path=".length));
			options.themeSource = "local";
			continue;
		}

		if (arg.startsWith("--project-name=")) {
			options.projectName = arg.slice("--project-name=".length);
			continue;
		}

		if (arg.startsWith("--theme-repo=")) {
			options.themeRepo = arg.slice("--theme-repo=".length);
			continue;
		}

		if (arg.startsWith("--theme-dir=")) {
			options.themeDir = arg.slice("--theme-dir=".length);
			continue;
		}

		if (arg.startsWith("--theme-name=")) {
			options.themeName = arg.slice("--theme-name=".length);
			continue;
		}

		if (arg.startsWith("--config-file=")) {
			options.configFile = arg.slice("--config-file=".length);
			continue;
		}

		throw new Error(`Unknown argument: ${arg}`);
	}

	return options;
}

/**
 * Format a command for human-readable logging.
 *
 * @param command Executable name.
 * @param args Executable arguments.
 * @returns Full command line.
 */
function formatCommand(command: string, args: string[]): string {
	return [command, ...args]
		.map((part) => (/\s/.test(part) ? JSON.stringify(part) : part))
		.join(" ");
}

/**
 * Run a command and capture stdout/stderr.
 *
 * @param command Executable name.
 * @param args Executable arguments.
 * @param cwd Working directory.
 * @returns Command execution result.
 */
async function runCommand(
	command: string,
	args: string[],
	cwd: string,
): Promise<CommandResult> {
	const started = Date.now();

	return new Promise<CommandResult>((resolve, reject) => {
		const child = spawn(command, args, {
			cwd,
			env: process.env,
			stdio: ["ignore", "pipe", "pipe"],
		});

		let stdout = "";
		let stderr = "";

		child.stdout.on("data", (chunk: Buffer | string) => {
			stdout += chunk.toString();
		});

		child.stderr.on("data", (chunk: Buffer | string) => {
			stderr += chunk.toString();
		});

		child.on("error", (error: Error) => {
			reject(error);
		});

		child.on("close", (code, signal) => {
			const durationMs = Date.now() - started;
			const combined = [stdout, stderr]
				.filter(Boolean)
				.join(stdout && stderr ? "\n" : "");

			resolve({
				code,
				signal,
				stdout,
				stderr,
				combined,
				durationMs,
			});
		});
	});
}

/**
 * Ensure a file or directory exists.
 *
 * @param filePath Absolute path to check.
 */
async function assertFileExists(filePath: string): Promise<void> {
	await access(filePath, constants.F_OK);
}

/**
 * Ensure a file or directory does not exist.
 *
 * @param filePath Absolute path to check.
 */
async function assertFileDoesNotExist(filePath: string): Promise<void> {
	try {
		await access(filePath, constants.F_OK);
		throw new Error(`Unexpected path exists: ${filePath}`);
	} catch (error: unknown) {
		if (
			error instanceof Error &&
			error.message.startsWith("Unexpected path exists:")
		) {
			throw error;
		}
	}
}

/**
 * Read a UTF-8 text file.
 *
 * @param filePath Absolute file path.
 * @returns File contents.
 */
async function readTextFile(filePath: string): Promise<string> {
	return readFile(filePath, "utf8");
}

/**
 * Write a UTF-8 text file.
 *
 * @param filePath Absolute file path.
 * @param content File contents.
 */
async function writeTextFile(filePath: string, content: string): Promise<void> {
	await writeFile(filePath, content, "utf8");
}

/**
 * Remove the generated public directory inside the temporary project.
 *
 * @param projectRoot Absolute path to the temporary quickstart project.
 */
async function removePublicDir(projectRoot: string): Promise<void> {
	const publicPath = join(projectRoot, "public");
	await rm(publicPath, { recursive: true, force: true });
}

/**
 * Execute one step and validate success.
 *
 * @param step Step definition.
 * @returns Step report.
 * @throws Error when the command fails or an expected file is missing.
 */
async function executeStep(step: StepDefinition): Promise<StepReport> {
	const result = await runCommand(step.command, step.args, step.cwd);
	const commandLine = formatCommand(step.command, step.args);

	if (result.code !== 0) {
		const details = [
			`Step failed: ${step.name}`,
			`Command: ${commandLine}`,
			`Working directory: ${step.cwd}`,
			`Exit code: ${String(result.code)}`,
			result.signal ? `Signal: ${result.signal}` : "",
			result.stdout ? `STDOUT:\n${result.stdout}` : "",
			result.stderr ? `STDERR:\n${result.stderr}` : "",
		]
			.filter(Boolean)
			.join("\n\n");

		throw new Error(details);
	}

	if (step.expectedFiles) {
		for (const relativePath of step.expectedFiles) {
			const absolutePath = join(step.cwd, relativePath);

			try {
				await assertFileExists(absolutePath);
			} catch (error: unknown) {
				const message =
					error instanceof Error
						? error.message
						: "Unknown file assertion error";

				throw new Error(
					[
						`Step failed: ${step.name}`,
						`Command: ${commandLine}`,
						`Working directory: ${step.cwd}`,
						`Expected file missing: ${absolutePath}`,
						`Details: ${message}`,
						result.stdout ? `STDOUT:\n${result.stdout}` : "",
						result.stderr ? `STDERR:\n${result.stderr}` : "",
					]
						.filter(Boolean)
						.join("\n\n"),
				);
			}
		}
	}

	return {
		step: step.name,
		commandLine,
		cwd: step.cwd,
		result,
	};
}

/**
 * Determine whether a Hugo command generates output in `public/`.
 *
 * @param step Step definition.
 * @returns True when the command is a build command.
 */
function isHugoBuildCommand(step: StepDefinition): boolean {
	if (step.command !== "hugo") {
		return false;
	}

	if (step.args.length === 0) {
		return true;
	}

	if (step.args.includes("--buildDrafts")) {
		return true;
	}

	return false;
}

/**
 * Execute a Hugo build command after clearing the generated public directory.
 *
 * @param step Step definition.
 * @param projectRoot Absolute path to the temporary quickstart project.
 * @returns Step report.
 */
async function executeHugoBuildStep(
	step: StepDefinition,
	projectRoot: string,
): Promise<StepReport> {
	await removePublicDir(projectRoot);
	return executeStep(step);
}

/**
 * Escape a string for safe use in a regular expression.
 *
 * @param value Raw string.
 * @returns Escaped string.
 */
function escapeRegExp(value: string): string {
	return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Assert that Hugo config contains the expected theme assignment somewhere in
 * the file, without requiring the whole config to match a fixed template.
 *
 * Accepts either single or double quotes, for example:
 * - theme = 'ananke'
 * - theme = "ananke"
 *
 * @param configPath Absolute config path.
 * @param themeName Expected theme name.
 * @throws Error when the config does not contain the expected theme line.
 */
async function assertThemeConfigured(
	configPath: string,
	themeName: string,
): Promise<void> {
	const config = await readTextFile(configPath);
	const themePattern = new RegExp(
		String.raw`^\s*theme\s*=\s*['"]${escapeRegExp(themeName)}['"]\s*$`,
		"m",
	);

	if (!themePattern.test(config)) {
		throw new Error(
			[
				"Strict assertion failed: theme configuration missing or incorrect.",
				`Config file: ${configPath}`,
				`Expected to find a line like: theme = '${themeName}'`,
				"Actual file contents:",
				config,
			].join("\n\n"),
		);
	}
}

/**
 * Return homepage assertions for the initial static build.
 *
 * @returns List of homepage assertions.
 */
function getHomepageAssertions(): HtmlAssertion[] {
	return [
		{
			description: "homepage contains an HTML document root",
			test: (html: string): boolean => /<html\b/i.test(html),
		},
		{
			description: "homepage contains a document title",
			test: (html: string): boolean => /<title>[\s\S]*?<\/title>/i.test(html),
		},
		{
			description: "homepage contains a body element",
			test: (html: string): boolean => /<body\b/i.test(html),
		},
		{
			description: "homepage contains at least one stylesheet reference",
			test: (html: string): boolean =>
				/<link\b[^>]*rel=["']stylesheet["'][^>]*>/i.test(html),
		},
		{
			description: "homepage contains at least one navigation-related landmark",
			test: (html: string): boolean => /<(nav|header)\b/i.test(html),
		},
		{
			description: "homepage contains theme-generated CSS class markers",
			test: (html: string): boolean =>
				/\b(ma[0-9]|pa[0-9]|bg-black|near-white|sans-serif)\b/i.test(html),
		},
		{
			description: "homepage contains a main content area",
			test: (html: string): boolean => /<(main|article|section)\b/i.test(html),
		},
	];
}

/**
 * Assert that the generated homepage looks like a real themed render.
 *
 * @param homepagePath Absolute path to `public/index.html`.
 * @throws Error when one or more assertions fail.
 */
async function assertHomepageLooksValid(homepagePath: string): Promise<void> {
	const html = await readTextFile(homepagePath);
	const failures: string[] = [];

	if (html.trim().length === 0) {
		throw new Error(
			[
				"Strict assertion failed: generated homepage is empty.",
				`Homepage file: ${homepagePath}`,
			].join("\n\n"),
		);
	}

	for (const assertion of getHomepageAssertions()) {
		if (!assertion.test(html)) {
			failures.push(`- ${assertion.description}`);
		}
	}

	if (failures.length > 0) {
		throw new Error(
			[
				"Strict assertion failed: generated homepage did not match expected render checks.",
				`Homepage file: ${homepagePath}`,
				"Failed assertions:",
				...failures,
			].join("\n"),
		);
	}
}

/**
 * Extract the auto-generated date line from a Hugo content file with TOML frontmatter.
 *
 * @param content Raw file contents.
 * @returns Original date line.
 * @throws Error when the date line is missing.
 */
function extractGeneratedDateLine(content: string): string {
	const match = content.match(/^\s*date\s*=\s*.+$/m);

	if (!match) {
		throw new Error(
			[
				"Strict assertion failed: could not find auto-generated date line in content file.",
				"Actual file contents:",
				content,
			].join("\n\n"),
		);
	}

	return match[0];
}

/**
 * Replace the generated content with the requested sample draft while preserving
 * the original date line created by `hugo new`.
 *
 * @param contentPath Absolute path to the content file.
 */
async function replaceGeneratedContent(contentPath: string): Promise<void> {
	const original = await readTextFile(contentPath);
	const dateLine = extractGeneratedDateLine(original);

	const updated = [
		"+++",
		"title = 'My First Post'",
		dateLine,
		"draft = true",
		"+++",
		"## Introduction",
		"",
		"This is **bold** text, and this is *emphasized* text.",
		"",
		"Visit the [Hugo](https://gohugo.io) website!",
		"",
	].join("\n");

	await writeTextFile(contentPath, updated);
}

/**
 * Replace the root Hugo config with the requested quickstart config.
 *
 * @param configPath Absolute path to `hugo.toml`.
 * @param themeName Theme name to set.
 */
async function replaceHugoConfig(
	configPath: string,
	themeName: string,
): Promise<void> {
	const content = [
		"baseURL = 'https://example.com/'",
		"locale = 'en-gb'",
		"title = 'Ananke Test Quickstart'",
		`theme = '${themeName}'`,
		"",
	].join("\n");

	await writeTextFile(configPath, content);
}

/**
 * Assert that the generated page contains the expected rendered draft content.
 *
 * @param pageHtml HTML from `public/foo/index.html`.
 */
function assertDraftPageRendered(pageHtml: string): void {
	const failures: string[] = [];

	if (!/<h2[^>]*>\s*Introduction\s*<\/h2>/i.test(pageHtml)) {
		failures.push("- heading 'Introduction' was not rendered as an h2 element");
	}

	if (!/<strong>\s*bold\s*<\/strong>/i.test(pageHtml)) {
		failures.push("- bold Markdown was not rendered as a <strong> element");
	}

	if (!/<em>\s*emphasized\s*<\/em>/i.test(pageHtml)) {
		failures.push("- emphasized Markdown was not rendered as an <em> element");
	}

	if (
		!/<a[^>]+href=["']https:\/\/gohugo\.io["'][^>]*>\s*Hugo\s*<\/a>/i.test(
			pageHtml,
		)
	) {
		failures.push("- Markdown link was not rendered as an anchor element");
	}

	if (!/My First Post/i.test(pageHtml)) {
		failures.push("- post title was not visible on the rendered page");
	}

	if (failures.length > 0) {
		throw new Error(
			[
				"Strict assertion failed: draft page content was not rendered as expected.",
				"Failed assertions:",
				...failures,
			].join("\n"),
		);
	}
}

/**
 * Assert that the generated homepage reflects updated title and locale configuration.
 *
 * Locale is checked strictly on the `<html>` tag.
 *
 * @param homepageHtml HTML from `public/index.html`.
 */
function assertUpdatedConfigInOutput(homepageHtml: string): void {
	const failures: string[] = [];

	if (!/Ananke Test Quickstart/i.test(homepageHtml)) {
		failures.push(
			"- updated site title was not visible in the generated output",
		);
	}

	if (!/<html[^>]+lang=["']en-gb["'][^>]*>/i.test(homepageHtml)) {
		failures.push(
			"- updated locale 'en-gb' was not present in the <html lang=\"en-gb\"> tag",
		);
	}

	if (failures.length > 0) {
		throw new Error(
			[
				"Strict assertion failed: updated config was not reflected in the generated output.",
				"Failed assertions:",
				...failures,
			].join("\n"),
		);
	}
}

/**
 * Assert that the draft page is not part of the production build.
 *
 * @param projectRoot Project root.
 * @param homepagePath Absolute path to `public/index.html`.
 */
async function assertDraftHiddenInProduction(
	projectRoot: string,
	homepagePath: string,
): Promise<void> {
	const draftOutputPath = join(projectRoot, "public", "foo", "index.html");
	await assertFileDoesNotExist(draftOutputPath);

	const homepageHtml = await readTextFile(homepagePath);

	if (/My First Post/i.test(homepageHtml)) {
		throw new Error(
			[
				"Strict assertion failed: draft post title was visible in the production homepage output.",
				`Homepage file: ${homepagePath}`,
			].join("\n\n"),
		);
	}
}

/**
 * Sentinel CSS class used to verify the configurable hero header spacing.
 *
 * Issue #504: the height of the hero header is controlled by the
 * `header_section_class` parameter. The value is unique so it can only appear in
 * the output when the front matter override is honoured.
 */
const HEADER_SECTION_CLASS_MARKER = "ananke-header-test-pv7";

/**
 * Default header section spacing rendered by `page-header.html` for a single
 * page with a featured image when `header_section_class` is not set.
 */
const DEFAULT_PAGE_HEADER_SECTION_CLASS = "tc-l pv6 ph3 ph4-ns";

/**
 * Create two single pages that exercise the configurable header section class:
 * one overrides `header_section_class` in front matter, the other relies on the
 * theme default. Both set `featured_image` so the hero header branch renders.
 *
 * @param contentDir Absolute path to the project `content` directory.
 */
async function writeHeaderSectionClassFixtures(
	contentDir: string,
): Promise<void> {
	const overridePage = [
		"+++",
		"title = 'Custom Header Height'",
		"featured_image = '/images/custom-hero.jpg'",
		`header_section_class = '${HEADER_SECTION_CLASS_MARKER} ph3 ph4-ns'`,
		"+++",
		"",
		"Body.",
		"",
	].join("\n");

	const defaultPage = [
		"+++",
		"title = 'Default Header Height'",
		"featured_image = '/images/default-hero.jpg'",
		"+++",
		"",
		"Body.",
		"",
	].join("\n");

	await writeTextFile(join(contentDir, "custom-header.md"), overridePage);
	await writeTextFile(join(contentDir, "default-header.md"), defaultPage);
}

/**
 * Assert that the configurable `header_section_class` parameter is honoured on
 * hero headers and that omitting it keeps the historical default spacing.
 *
 * @param projectRoot Absolute path to the temporary quickstart project.
 * @throws Error when the override is dropped, leaks, or the default changes.
 */
async function assertHeaderSectionClassConfigurable(
	projectRoot: string,
): Promise<void> {
	const failures: string[] = [];

	const overrideHtml = await readTextFile(
		join(projectRoot, "public", "custom-header", "index.html"),
	);
	const defaultHtml = await readTextFile(
		join(projectRoot, "public", "default-header", "index.html"),
	);

	if (!overrideHtml.includes(HEADER_SECTION_CLASS_MARKER)) {
		failures.push(
			`- custom 'header_section_class' value '${HEADER_SECTION_CLASS_MARKER}' was not applied to the hero header`,
		);
	}

	if (defaultHtml.includes(HEADER_SECTION_CLASS_MARKER)) {
		failures.push(
			"- custom 'header_section_class' value leaked onto a page that did not set it",
		);
	}

	if (!defaultHtml.includes(DEFAULT_PAGE_HEADER_SECTION_CLASS)) {
		failures.push(
			`- default header section spacing '${DEFAULT_PAGE_HEADER_SECTION_CLASS}' was missing when 'header_section_class' was not set`,
		);
	}

	if (failures.length > 0) {
		throw new Error(
			[
				"Strict assertion failed: configurable header section class did not behave as expected.",
				"Failed assertions:",
				...failures,
			].join("\n"),
		);
	}
}

/**
 * Markup only emitted by `summary-with-image.html` when a featured image is
 * rendered, used to detect that list cards switched to the image template.
 */
const LIST_CARD_IMAGE_MARKER = 'class="img"';

/**
 * Markup emitted by the summary templates when a card date is rendered.
 */
const SUMMARY_CARD_DATE_MARKER = "datetime=";

/**
 * Create a content section whose list page exercises both the image and the
 * date behaviour of summary cards: one page has a featured image, the other
 * does not, and both carry an explicit date.
 *
 * @param contentDir Absolute path to the project `content` directory.
 */
async function writeListCardFixtures(contentDir: string): Promise<void> {
	const sectionDir = join(contentDir, "cards");
	await mkdir(sectionDir, { recursive: true });

	const sectionIndex = ["+++", "title = 'Cards'", "+++", "", ""].join("\n");

	const withImage = [
		"+++",
		"title = 'Card With Image'",
		"date = 2024-01-15T00:00:00Z",
		"featured_image = '/images/card-hero.jpg'",
		"+++",
		"",
		"Card body.",
		"",
	].join("\n");

	const withoutImage = [
		"+++",
		"title = 'Card Without Image'",
		"date = 2024-02-20T00:00:00Z",
		"+++",
		"",
		"Card body.",
		"",
	].join("\n");

	await writeTextFile(join(sectionDir, "_index.md"), sectionIndex);
	await writeTextFile(join(sectionDir, "with-image.md"), withImage);
	await writeTextFile(join(sectionDir, "without-image.md"), withoutImage);
}

/**
 * Assert that a list page renders summary cards with the expected image and
 * date behaviour.
 *
 * @param listHtml HTML from the rendered list page.
 * @param label Human-readable description of the configuration under test.
 * @param expectations Whether image cards and dates are expected in the output.
 * @throws Error when the rendered cards do not match the expectations.
 */
function assertListCardSummaries(
	listHtml: string,
	label: string,
	expectations: { images: boolean; dates: boolean },
): void {
	const failures: string[] = [];
	const hasImage = listHtml.includes(LIST_CARD_IMAGE_MARKER);
	const hasDate = listHtml.includes(SUMMARY_CARD_DATE_MARKER);

	if (expectations.images && !hasImage) {
		failures.push(
			"- expected image summary cards but the list rendered no card image",
		);
	}

	if (!expectations.images && hasImage) {
		failures.push(
			"- image summary cards were rendered when 'ananke.pages.show_list_images' was not enabled",
		);
	}

	if (expectations.dates && !hasDate) {
		failures.push(
			"- expected summary card dates but none were rendered by default",
		);
	}

	if (!expectations.dates && hasDate) {
		failures.push(
			"- summary card dates were rendered when 'ananke.pages.show_date' was false",
		);
	}

	if (failures.length > 0) {
		throw new Error(
			[
				`Strict assertion failed: list card summaries (${label}) did not behave as expected.`,
				"Failed assertions:",
				...failures,
			].join("\n"),
		);
	}
}

/**
 * Determine whether a directory is the work tree of a Git repository.
 *
 * @param path Absolute directory path.
 * @returns True when `path` is inside a Git work tree.
 */
async function isGitWorkTree(path: string): Promise<boolean> {
	const result = await runCommand(
		"git",
		["-C", path, "rev-parse", "--is-inside-work-tree"],
		path,
	);

	return result.code === 0 && result.stdout.trim() === "true";
}

/**
 * Copy the local theme working tree into the project's theme directory.
 *
 * When the source is a Git work tree, the file list is derived from Git so that
 * ignored paths (`node_modules`, `public`, generated resources, ...) are skipped
 * automatically while uncommitted and untracked-but-not-ignored changes are still
 * included. This makes the test reflect the exact state of the current branch.
 *
 * @param themePath Absolute path to the local theme source directory.
 * @param destination Absolute path to the theme directory inside the project.
 * @throws Error when the source contains no theme files.
 */
async function copyLocalTheme(
	themePath: string,
	destination: string,
): Promise<void> {
	if (await isGitWorkTree(themePath)) {
		const listing = await runCommand(
			"git",
			[
				"-C",
				themePath,
				"ls-files",
				"-z",
				"--cached",
				"--others",
				"--exclude-standard",
			],
			themePath,
		);

		if (listing.code !== 0) {
			throw new Error(
				`Failed to list theme files via git in ${themePath}:\n${listing.stderr}`,
			);
		}

		const relativePaths = listing.stdout.split("\0").filter(Boolean);

		if (relativePaths.length === 0) {
			throw new Error(`No theme files found in ${themePath}`);
		}

		for (const relativePath of relativePaths) {
			const source = join(themePath, relativePath);

			try {
				const stats = await stat(source);
				if (!stats.isFile()) {
					continue;
				}
			} catch {
				// Tracked but deleted in the work tree: nothing to copy.
				continue;
			}

			const target = join(destination, relativePath);
			await mkdir(dirname(target), { recursive: true });
			await copyFile(source, target);
		}

		return;
	}

	// Fallback for a non-Git source directory: copy recursively while excluding
	// heavy or generated paths that would never ship with the theme.
	const excludedNames = new Set(["node_modules", "public", ".git"]);
	await cp(themePath, destination, {
		recursive: true,
		filter: (source: string): boolean => {
			if (excludedNames.has(basename(source))) {
				return false;
			}

			return !source.includes(join("resources", "_gen"));
		},
	});
}

/**
 * Install the theme into the temporary project, either from the local working
 * tree (default) or from the published remote via a Git submodule.
 *
 * @param options Runtime options.
 * @param projectRoot Absolute path to the temporary quickstart project.
 * @param reports Accumulated step reports (appended to in submodule mode).
 * @throws Error when installation fails or the theme is incomplete.
 */
async function installTheme(
	options: RoutineOptions,
	projectRoot: string,
	reports: StepReport[],
): Promise<void> {
	const destination = join(projectRoot, options.themeDir);

	if (options.verbose) {
		console.log(`\n[RUN] Install theme (source: ${options.themeSource})`);
	}

	if (options.themeSource === "submodule") {
		const step: StepDefinition = {
			name: "Add theme as Git submodule",
			command: "git",
			args: ["submodule", "add", options.themeRepo, options.themeDir],
			cwd: projectRoot,
			expectedFiles: [options.themeDir, ".gitmodules"],
		};
		const report = await executeStep(step);
		reports.push(report);

		if (options.verbose) {
			console.log(
				`[OK ] ${step.name} (${report.result.durationMs} ms, exit ${String(report.result.code)})`,
			);
		}

		return;
	}

	const started = Date.now();
	await copyLocalTheme(options.themePath, destination);

	// Sanity check: a usable theme must at least expose theme.toml and layouts.
	await assertFileExists(join(destination, "theme.toml"));
	await assertFileExists(join(destination, "layouts"));

	if (options.verbose) {
		console.log(
			`[OK ] Copied local theme from ${options.themePath} (${Date.now() - started} ms)`,
		);
	}
}

/**
 * Run a list of command steps with consistent logging and reporting.
 *
 * @param steps Steps to execute in order.
 * @param options Runtime options.
 * @param projectRoot Absolute path to the temporary quickstart project.
 * @param reports Accumulated step reports (appended to).
 */
async function runSteps(
	steps: StepDefinition[],
	options: RoutineOptions,
	projectRoot: string,
	reports: StepReport[],
): Promise<void> {
	for (const step of steps) {
		if (options.verbose) {
			console.log(`\n[RUN] ${step.name}`);
			console.log(`      ${formatCommand(step.command, step.args)}`);
		}

		const report = isHugoBuildCommand(step)
			? await executeHugoBuildStep(step, projectRoot)
			: await executeStep(step);

		reports.push(report);

		if (options.verbose) {
			console.log(
				`[OK ] ${step.name} (${report.result.durationMs} ms, exit ${String(report.result.code)})`,
			);

			const trimmedOutput = report.result.combined.trim();
			if (trimmedOutput) {
				console.log(trimmedOutput);
			}
		}
	}
}

/**
 * Run the full Hugo quickstart verification routine.
 *
 * @param options Runtime options.
 * @returns Process exit code.
 */
async function runRoutine(options: RoutineOptions): Promise<number> {
	const sandboxRoot = await mkdtemp(join(tmpdir(), "hugo-quickstart-"));
	const projectRoot = join(sandboxRoot, options.projectName);

	const reports: StepReport[] = [];

	// Steps that prepare the project before the theme is installed.
	const setupSteps: StepDefinition[] = [
		{
			name: "Create Hugo project",
			command: "hugo",
			args: ["new", "project", options.projectName],
			cwd: sandboxRoot,
			expectedFiles: [join(options.projectName, options.configFile)],
		},
		{
			name: "Initialise Git repository",
			command: "git",
			args: ["init"],
			cwd: projectRoot,
			expectedFiles: [".git"],
		},
	];

	// Steps that run once the theme is in place.
	const buildSteps: StepDefinition[] = [
		{
			name: "Configure theme in Hugo config",
			command: "bash",
			args: [
				"-lc",
				`printf "\\ntheme = '${options.themeName}'\\n" >> ${JSON.stringify(options.configFile)}`,
			],
			cwd: projectRoot,
			expectedFiles: [options.configFile],
		},
		{
			name: "Build site",
			command: "hugo",
			args: [],
			cwd: projectRoot,
			expectedFiles: ["public/index.html"],
		},
	];

	try {
		console.log(`Test root: ${sandboxRoot}`);
		console.log(`Project root: ${projectRoot}`);
		console.log(
			options.themeSource === "submodule"
				? `Theme source: submodule (${options.themeRepo})`
				: `Theme source: local (${options.themePath})`,
		);

		await runSteps(setupSteps, options, projectRoot, reports);
		await installTheme(options, projectRoot, reports);
		await runSteps(buildSteps, options, projectRoot, reports);

		const configPath = join(projectRoot, options.configFile);
		const homepagePath = join(projectRoot, "public/index.html");
		const contentPath = join(projectRoot, "content/foo.md");
		const draftOutputPath = join(projectRoot, "public", "foo", "index.html");

		console.log("\n[RUN] Strict config assertion");
		await assertThemeConfigured(configPath, options.themeName);
		console.log("[OK ] Strict config assertion");

		console.log("\n[RUN] Strict homepage assertion");
		await assertHomepageLooksValid(homepagePath);
		console.log("[OK ] Strict homepage assertion");

		console.log("\n[RUN] Create sample content");
		const createContentStep: StepDefinition = {
			name: "Create sample content",
			command: "hugo",
			args: ["new", "foo.md"],
			cwd: projectRoot,
			expectedFiles: ["content/foo.md"],
		};
		const createContentReport = await executeStep(createContentStep);
		reports.push(createContentReport);

		if (options.verbose) {
			console.log(
				`      ${formatCommand(createContentStep.command, createContentStep.args)}`,
			);
			console.log(
				`[OK ] ${createContentStep.name} (${createContentReport.result.durationMs} ms, exit ${String(createContentReport.result.code)})`,
			);

			const trimmedOutput = createContentReport.result.combined.trim();
			if (trimmedOutput) {
				console.log(trimmedOutput);
			}
		}

		console.log("\n[RUN] Replace generated content with quickstart sample");
		await replaceGeneratedContent(contentPath);
		console.log("[OK ] Replace generated content with quickstart sample");

		console.log("\n[RUN] Build drafts and verify rendered draft content");
		const draftBuildStep: StepDefinition = {
			name: "Build site with drafts",
			command: "hugo",
			args: ["--buildDrafts"],
			cwd: projectRoot,
			expectedFiles: ["public/index.html", "public/foo/index.html"],
		};
		const draftBuildReport = await executeHugoBuildStep(
			draftBuildStep,
			projectRoot,
		);
		reports.push(draftBuildReport);

		if (options.verbose) {
			console.log(
				`      ${formatCommand(draftBuildStep.command, draftBuildStep.args)}`,
			);
			console.log(
				`[OK ] ${draftBuildStep.name} (${draftBuildReport.result.durationMs} ms, exit ${String(draftBuildReport.result.code)})`,
			);

			const trimmedOutput = draftBuildReport.result.combined.trim();
			if (trimmedOutput) {
				console.log(trimmedOutput);
			}
		}

		const draftPageHtml = await readTextFile(draftOutputPath);
		assertDraftPageRendered(draftPageHtml);
		console.log("[OK ] Build drafts and verify rendered draft content");

		console.log("\n[RUN] Replace root hugo.toml with quickstart config");
		await replaceHugoConfig(configPath, options.themeName);
		console.log("[OK ] Replace root hugo.toml with quickstart config");

		console.log("\n[RUN] Build drafts and verify updated title and locale");
		const configBuildStep: StepDefinition = {
			name: "Build site with updated config and drafts",
			command: "hugo",
			args: ["--buildDrafts"],
			cwd: projectRoot,
			expectedFiles: ["public/index.html", "public/foo/index.html"],
		};
		const configBuildReport = await executeHugoBuildStep(
			configBuildStep,
			projectRoot,
		);
		reports.push(configBuildReport);

		if (options.verbose) {
			console.log(
				`      ${formatCommand(configBuildStep.command, configBuildStep.args)}`,
			);
			console.log(
				`[OK ] ${configBuildStep.name} (${configBuildReport.result.durationMs} ms, exit ${String(configBuildReport.result.code)})`,
			);

			const trimmedOutput = configBuildReport.result.combined.trim();
			if (trimmedOutput) {
				console.log(trimmedOutput);
			}
		}

		const updatedHomepageHtml = await readTextFile(homepagePath);
		assertUpdatedConfigInOutput(updatedHomepageHtml);
		console.log("[OK ] Build drafts and verify updated title and locale");

		console.log("\n[RUN] Production build should exclude draft content");
		const productionBuildStep: StepDefinition = {
			name: "Build production site without drafts",
			command: "hugo",
			args: [],
			cwd: projectRoot,
			expectedFiles: ["public/index.html"],
		};
		const productionBuildReport = await executeHugoBuildStep(
			productionBuildStep,
			projectRoot,
		);
		reports.push(productionBuildReport);

		if (options.verbose) {
			console.log(
				`      ${formatCommand(productionBuildStep.command, productionBuildStep.args)}`,
			);
			console.log(
				`[OK ] ${productionBuildStep.name} (${productionBuildReport.result.durationMs} ms, exit ${String(productionBuildReport.result.code)})`,
			);

			const trimmedOutput = productionBuildReport.result.combined.trim();
			if (trimmedOutput) {
				console.log(trimmedOutput);
			}
		}

		await assertDraftHiddenInProduction(projectRoot, homepagePath);
		console.log("[OK ] Production build should exclude draft content");

		console.log("\n[RUN] Configurable hero header section class (issue #504)");
		await writeHeaderSectionClassFixtures(join(projectRoot, "content"));
		const headerSectionBuildStep: StepDefinition = {
			name: "Build site with configurable header section fixtures",
			command: "hugo",
			args: [],
			cwd: projectRoot,
			expectedFiles: [
				"public/custom-header/index.html",
				"public/default-header/index.html",
			],
		};
		const headerSectionBuildReport = await executeHugoBuildStep(
			headerSectionBuildStep,
			projectRoot,
		);
		reports.push(headerSectionBuildReport);

		if (options.verbose) {
			console.log(
				`      ${formatCommand(headerSectionBuildStep.command, headerSectionBuildStep.args)}`,
			);
			console.log(
				`[OK ] ${headerSectionBuildStep.name} (${headerSectionBuildReport.result.durationMs} ms, exit ${String(headerSectionBuildReport.result.code)})`,
			);

			const trimmedOutput = headerSectionBuildReport.result.combined.trim();
			if (trimmedOutput) {
				console.log(trimmedOutput);
			}
		}

		await assertHeaderSectionClassConfigurable(projectRoot);
		console.log("[OK ] Configurable hero header section class (issue #504)");

		console.log("\n[RUN] List page image cards and summary dates (issue #217)");
		await writeListCardFixtures(join(projectRoot, "content"));
		const cardsListPath = join(
			projectRoot,
			"public",
			"cards",
			"index.html",
		);

		// Default configuration: no image cards, but dates show by default.
		await writeTextFile(
			configPath,
			[
				"baseURL = 'https://example.com/'",
				"title = 'Ananke Test Quickstart'",
				`theme = '${options.themeName}'`,
				"",
			].join("\n"),
		);
		const cardsDefaultBuildStep: StepDefinition = {
			name: "Build site with default summary cards",
			command: "hugo",
			args: [],
			cwd: projectRoot,
			expectedFiles: ["public/cards/index.html"],
		};
		const cardsDefaultBuildReport = await executeHugoBuildStep(
			cardsDefaultBuildStep,
			projectRoot,
		);
		reports.push(cardsDefaultBuildReport);
		assertListCardSummaries(
			await readTextFile(cardsListPath),
			"defaults",
			{ images: false, dates: true },
		);

		// Opt in to image cards and disable summary dates: images appear and the
		// dates disappear, proving the two settings are independent.
		await writeTextFile(
			configPath,
			[
				"baseURL = 'https://example.com/'",
				"title = 'Ananke Test Quickstart'",
				`theme = '${options.themeName}'`,
				"[params.ananke.pages]",
				"show_list_images = true",
				"show_date = false",
				"",
			].join("\n"),
		);
		const cardsImagesBuildStep: StepDefinition = {
			name: "Build site with image cards and dates disabled",
			command: "hugo",
			args: [],
			cwd: projectRoot,
			expectedFiles: ["public/cards/index.html"],
		};
		const cardsImagesBuildReport = await executeHugoBuildStep(
			cardsImagesBuildStep,
			projectRoot,
		);
		reports.push(cardsImagesBuildReport);
		assertListCardSummaries(
			await readTextFile(cardsListPath),
			"image cards with dates disabled",
			{ images: true, dates: false },
		);

		console.log("[OK ] List page image cards and summary dates (issue #217)");

		console.log("\nResult: PASS");

		if (options.keepOnSuccess) {
			console.log(`Keeping successful test directory: ${projectRoot}`);
		} else {
			await rm(sandboxRoot, { recursive: true, force: true });
			console.log(`Deleted successful test directory: ${sandboxRoot}`);
		}

		return 0;
	} catch (error: unknown) {
		const message = error instanceof Error ? error.message : "Unknown error";

		console.error("\nResult: FAIL");
		console.error(message);

		if (reports.length > 0) {
			console.error("\nCompleted command steps before failure:");
			for (const report of reports) {
				console.error(`- ${report.step}`);
			}
		}

		if (options.keepOnFailure) {
			console.error(
				`\nKept failing test directory for inspection: ${projectRoot}`,
			);
		} else {
			await rm(sandboxRoot, { recursive: true, force: true });
			console.error(`\nDeleted failing test directory: ${sandboxRoot}`);
		}

		return 1;
	}
}

/**
 * Main entry point.
 */
async function main(): Promise<void> {
	try {
		const options = parseArgs(process.argv.slice(2));
		const exitCode = await runRoutine(options);
		process.exit(exitCode);
	} catch (error: unknown) {
		const message =
			error instanceof Error ? error.message : "Unknown fatal error";
		console.error(`Fatal error: ${message}`);
		process.exit(1);
	}
}

await main();

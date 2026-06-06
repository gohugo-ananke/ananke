#!/usr/bin/env node
/**
 * Build the test fixture site against the *local* theme working tree.
 *
 * Hugo resolves a classic theme from `<themesDir>/<themeName>`. We create a
 * temporary themes directory containing a symlink `ananke -> <repo root>` so
 * the build exercises the current branch (including uncommitted changes)
 * without committing an absolute-path symlink. Output goes to
 * `tests/fixtures/site/public`, which the static server then serves.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, symlinkSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");
const siteDir = resolve(here, "..", "fixtures", "site");
const publicDir = join(siteDir, "public");

export function buildFixtureSite() {
	const themesDir = mkdtempSync(join(tmpdir(), "ananke-test-themes-"));
	try {
		symlinkSync(repoRoot, join(themesDir, "ananke"), "dir");
		rmSync(publicDir, { recursive: true, force: true });
		const result = spawnSync(
			"hugo",
			[
				"--source",
				siteDir,
				"--themesDir",
				themesDir,
				"--destination",
				publicDir,
				"--environment",
				"production",
				"--logLevel",
				"warn",
			],
			{ stdio: "inherit" },
		);
		if (result.status !== 0) {
			throw new Error(`hugo build failed with code ${result.status}`);
		}
	} finally {
		rmSync(themesDir, { recursive: true, force: true });
	}
	return publicDir;
}

// Allow running directly: `node tests/support/prepare-site.mjs`
if (import.meta.url === `file://${process.argv[1]}`) {
	buildFixtureSite();
}

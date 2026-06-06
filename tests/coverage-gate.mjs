#!/usr/bin/env node
/**
 * Feature -> test coverage gate.
 *
 * Fails when a user-facing feature has no test catalogued:
 *   - every direct key under the [ananke] table in config/_default/params.toml
 *   - every shortcode in layouts/_shortcodes/
 * must appear in tests/catalog.yaml with a non-empty `tests` list.
 *
 * It also reports catalog entries that no longer match a real param/shortcode
 * (stale entries), so the catalog stays in sync as features are added, renamed,
 * or removed.
 *
 * Scope note: only the direct [ananke] toggles are gated here (not the deep
 * [ananke.social.networks.*] catalog). Widen `collectAnankeParams` as the gate
 * matures.
 */
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..");

/** Direct `key = value` entries under the top-level [ananke] table. */
function collectAnankeParams() {
	const toml = readFileSync(
		join(repoRoot, "config", "_default", "params.toml"),
		"utf8",
	);
	const keys = new Set();
	let inAnanke = false;
	for (const raw of toml.split("\n")) {
		const line = raw.trim();
		if (line.startsWith("[")) {
			inAnanke = line === "[ananke]";
			continue;
		}
		if (!inAnanke || line === "" || line.startsWith("#")) continue;
		const eq = line.indexOf("=");
		if (eq > 0) keys.add(`ananke.${line.slice(0, eq).trim()}`);
	}
	return keys;
}

/** Shortcode names from layouts/_shortcodes/*.html. */
function collectShortcodes() {
	const dir = join(repoRoot, "layouts", "_shortcodes");
	return new Set(
		readdirSync(dir)
			.filter((f) => f.endsWith(".html"))
			.map((f) => f.replace(/\.html$/, "")),
	);
}

function catalogued(section) {
	const out = new Set();
	for (const [name, value] of Object.entries(section || {})) {
		if (value && Array.isArray(value.tests) && value.tests.length > 0) {
			out.add(name);
		}
	}
	return out;
}

const catalog = parse(readFileSync(join(here, "catalog.yaml"), "utf8")) || {};
const params = collectAnankeParams();
const shortcodes = collectShortcodes();
const catParams = catalogued(catalog.params);
const catShortcodes = catalogued(catalog.shortcodes);

const errors = [];
for (const p of params) {
	if (!catParams.has(p))
		errors.push(`param '${p}' has no test in tests/catalog.yaml`);
}
for (const s of shortcodes) {
	if (!catShortcodes.has(s))
		errors.push(`shortcode '${s}' has no test in tests/catalog.yaml`);
}
// Stale catalog entries (kept as warnings so renames are noticed promptly).
const warnings = [];
for (const p of Object.keys(catalog.params || {})) {
	if (!params.has(p)) warnings.push(`catalog param '${p}' no longer exists`);
}
for (const s of Object.keys(catalog.shortcodes || {})) {
	if (!shortcodes.has(s))
		warnings.push(`catalog shortcode '${s}' no longer exists`);
}

for (const w of warnings) console.warn(`warning: ${w}`);
if (errors.length > 0) {
	console.error("\nCoverage gate failed:");
	for (const e of errors) console.error(`  - ${e}`);
	console.error(
		"\nAdd the feature and at least one test reference to tests/catalog.yaml.",
	);
	process.exit(1);
}
console.log(
	`Coverage gate passed: ${params.size} ananke param(s), ${shortcodes.size} shortcode(s) all have tests.`,
);

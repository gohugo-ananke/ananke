#!/usr/bin/env node
/**
 * Feature -> test coverage gate.
 *
 * Fails when a user-facing feature has no test catalogued:
 *   - every direct key under the tables in GATED_TABLES in
 *     config/_default/params.toml
 *   - every shortcode in layouts/_shortcodes/
 * must appear in tests/catalog.yaml with a non-empty `tests` list.
 *
 * It also reports catalog entries that no longer match a real param/shortcode
 * (stale entries), so the catalog stays in sync as features are added, renamed,
 * or removed.
 *
 * Scope note: only the direct keys of the tables in GATED_TABLES are gated
 * here (not the deep [ananke.social.networks.*] catalog). Widen GATED_TABLES
 * as the gate matures.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import TOML from "@iarna/toml";
import { parse } from "yaml";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(process.argv[2] || join(here, ".."));

/** Tables in config/_default/params.toml whose direct keys are gated. */
const GATED_TABLES = [
  "ananke",
  "ananke.navigation",
  "ananke.navigation.classes",
];

/** Direct `key = value` entries under the gated tables. */
function collectAnankeParams() {
  const toml = readFileSync(
    join(repoRoot, "config", "_default", "params.toml"),
    "utf8",
  );
  const config = TOML.parse(toml);
  const keys = new Set();
  for (const table of GATED_TABLES) {
    const values = table.split(".").reduce((node, key) => node?.[key], config);
    for (const [key, value] of Object.entries(values || {})) {
      if (value === null || typeof value !== "object" || Array.isArray(value)) {
        keys.add(`${table}.${key}`);
      }
    }
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

const catalog =
  parse(readFileSync(join(repoRoot, "tests", "catalog.yaml"), "utf8")) || {};
const params = collectAnankeParams();
const shortcodes = collectShortcodes();
const catParams = catalogued(catalog.params);
const catShortcodes = catalogued(catalog.shortcodes);

const errors = [];
for (const section of [catalog.params, catalog.shortcodes]) {
  for (const [feature, entry] of Object.entries(section || {})) {
    for (const ref of entry?.tests || []) {
      if (typeof ref !== "string") {
        errors.push(`${feature}: test reference must be a path string`);
        continue;
      }
      const path = resolve(repoRoot, ref);
      const local = relative(repoRoot, path);
      if (
        isAbsolute(ref) ||
        local.startsWith("..") ||
        local.split(/[\\/]/).includes("scratch") ||
        !(
          /\.(spec|test)\.(ts|mjs)$/.test(ref) ||
          ref === "scripts/test-hugo-quickstart.ts"
        )
      ) {
        errors.push(`${feature}: invalid test path '${ref}'`);
      } else if (!existsSync(path) || !statSync(path).isFile()) {
        errors.push(`${feature}: test file '${ref}' does not exist`);
      }
    }
  }
}
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

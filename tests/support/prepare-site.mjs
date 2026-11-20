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
import { stripVTControlCharacters } from "node:util";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "..", "..");
const siteDir = resolve(here, "..", "fixtures", "site");

export function buildFixtureSite(options = {}) {
  const source = options.source || siteDir;
  const destination = options.destination || join(source, "public");
  const expectedModes = source === siteDir ? ["unknown", "invalid"] : [];
  const themesDir = mkdtempSync(join(tmpdir(), "ananke-test-themes-"));
  try {
    symlinkSync(repoRoot, join(themesDir, "ananke"), "dir");
    rmSync(destination, { recursive: true, force: true });
    const result = spawnSync(
      "hugo",
      [
        "--source",
        source,
        "--themesDir",
        themesDir,
        "--destination",
        destination,
        "--baseURL",
        `http://localhost:${process.env.ANANKE_TEST_PORT || 4321}/`,
        "--environment",
        "production",
        "--printPathWarnings",
        "--logLevel",
        "warn",
        ...(options.config ? ["--config", options.config] : []),
      ],
      { encoding: "utf8" },
    );
    const output = `${result.stdout || ""}\n${result.stderr || ""}`;
    process.stdout.write(output);
    if (result.error) throw result.error;
    const expectedWarnings =
      options.expectedWarnings ||
      expectedModes.map(
        (mode) =>
          `[ananke] Invalid ananke.navigation.submenu_mode "${mode}"; using split. Choose split, hover, click, or toplevel.`,
      );
    checkDiagnostics(output, expectedWarnings);
    options.onOutput?.(output);
    if (result.status !== 0) {
      throw new Error(`hugo build failed with code ${result.status}`);
    }
  } finally {
    rmSync(themesDir, { recursive: true, force: true });
  }
  return destination;
}

export function checkDiagnostics(output, expectedWarnings = []) {
  const warnings = stripVTControlCharacters(output)
    .split("\n")
    .filter((line) => /^(?:WARN|DEPRECATED)\s/.test(line));
  const matches = (line, expected) => {
    const message = line.replace(/^(?:WARN|DEPRECATED)\s+/, "");
    return typeof expected === "string"
      ? message === expected
      : expected.test(message);
  };
  for (const expected of expectedWarnings) {
    if (warnings.filter((line) => matches(line, expected)).length !== 1) {
      throw new Error(`Expected exactly one fixture warning: ${expected}`);
    }
  }
  const unexpected = warnings.filter(
    (line) => !expectedWarnings.some((expected) => matches(line, expected)),
  );
  if (unexpected.length) {
    throw new Error(
      `Unexpected Hugo warnings/deprecations:\n${unexpected.join("\n") || output}`,
    );
  }
}

// Allow running directly: `node tests/support/prepare-site.mjs`
if (import.meta.url === `file://${process.argv[1]}`) {
  buildFixtureSite();
}

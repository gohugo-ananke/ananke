import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

function check(script, html) {
  const root = mkdtempSync(join(tmpdir(), "ananke-static-gate-"));
  try {
    writeFileSync(join(root, "index.html"), html);
    return spawnSync(process.execPath, [script, root], { encoding: "utf8" });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("invalid markup fails the markup gate", () => {
  const result = check(
    "tests/support/check-markup.mjs",
    '<!doctype html><html lang="en"><head><title>Invalid</title></head><body><ul><p>Invalid list child</p></ul></body></html>',
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /element-permitted-content/);
});
test("missing internal files fail the link gate", () => {
  const result = check(
    "tests/support/check-links.mjs",
    '<a href="http://localhost:4321/missing/">Missing page</a>',
  );
  assert.equal(result.status, 2);
  assert.match(result.stdout + result.stderr, /File not found/);
});
test("missing fragments fail the link gate", () => {
  const result = check(
    "tests/support/check-links.mjs",
    '<a href="#missing">Missing anchor</a>',
  );
  assert.equal(result.status, 2);
  assert.match(result.stdout + result.stderr, /[Ff]ragment/);
});

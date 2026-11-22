import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";

const gate = resolve("tests/coverage-gate.mjs");
function runFixture({
  params = "",
  shortcode = false,
  reference = "tests/e2e/example.spec.ts",
  makeTest = true,
  docs = "",
} = {}) {
  const root = mkdtempSync(join(tmpdir(), "ananke-coverage-gate-"));
  const write = (file, content) => {
    mkdirSync(dirname(join(root, file)), { recursive: true });
    writeFileSync(join(root, file), content);
  };
  try {
    write(
      "config/_default/params.toml",
      `[ananke]\nexisting = true\n${params}`,
    );
    write(
      "tests/catalog.yaml",
      `params:\n  ananke.existing:\n    tests: ["${reference}"]\n${docs ? `    docs: "${docs}"\n` : ""}`,
    );
    mkdirSync(join(root, "layouts/_shortcodes"), { recursive: true });
    if (shortcode) write("layouts/_shortcodes/new.html", "<p>new</p>");
    if (makeTest)
      write("tests/e2e/example.spec.ts", "// fixture test reference\n");
    return spawnSync(process.execPath, [gate, root], { encoding: "utf8" });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("registered features pass", () => assert.equal(runFixture().status, 0));
test("an unregistered parameter fails", () => {
  const result = runFixture({ params: "new = false\n" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /ananke.new.*has no test/);
});
test("an unregistered shortcode fails", () => {
  const result = runFixture({ shortcode: true });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /shortcode 'new'.*has no test/);
});
test("a deleted test fails", () => {
  const result = runFixture({ makeTest: false });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /does not exist/);
});
test("a reference outside the repository fails", () => {
  const result = runFixture({ reference: "../example.spec.ts" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /invalid test path/);
});

test("multiline arrays and commented table headers cannot bypass the gate", () => {
  const result = runFixture({
    params: '[ananke.navigation] # comment\nnew = [\n  "one",\n  "two",\n]\n',
  });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /ananke.navigation.new.*has no test/);
});

test("a documentation path passes", () => {
  assert.equal(
    runFixture({ docs: "/configuration/reference/#homepage" }).status,
    0,
  );
});

test("an invalid documentation path fails", () => {
  const result = runFixture({ docs: "https://example.com/page" });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /invalid docs path/);
});

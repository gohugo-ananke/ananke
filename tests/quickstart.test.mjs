import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";

test("documented quickstart installs and builds the local theme", () => {
  const result = spawnSync(
    process.execPath,
    ["scripts/test-hugo-quickstart.ts"],
    { encoding: "utf8" },
  );
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});

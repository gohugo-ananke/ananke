import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import { buildFixtureSite } from "../../support/prepare-site.mjs";

const source = dirname(fileURLToPath(import.meta.url));
test("copy_code=false disables the site-wide code wrapper and button (#986)", () => {
  const output = buildFixtureSite({ source });
  const $ = load(readFileSync(join(output, "example/index.html"), "utf8"));
  assert.equal($(".code-copy, .code-block").length, 0);
  assert.match($("pre code").text(), /copy_code = false/);
});

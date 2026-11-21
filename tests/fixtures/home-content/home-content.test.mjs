import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import { buildFixtureSite } from "../../support/prepare-site.mjs";

const root = dirname(fileURLToPath(import.meta.url));

function home(name) {
  const output = buildFixtureSite({ source: join(root, name) });
  return load(readFileSync(join(output, "index.html"), "utf8"));
}

test("home page without content renders no introduction article (#663)", () => {
  const $ = home("empty");
  assert.equal($("main > article").length, 0);
  assert.equal($("main a[href$='/post/first/']").length > 0, true);
});

test("home page with content renders the introduction article (#663)", () => {
  const $ = home("filled");
  assert.equal($("main > article").length, 1);
  assert.equal($("main > article").text().trim(), "Home introduction.");
});

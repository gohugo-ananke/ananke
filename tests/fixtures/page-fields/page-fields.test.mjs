import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import { buildFixtureSite } from "../../support/prepare-site.mjs";

const source = dirname(fileURLToPath(import.meta.url));

test("explicit page fields retain title, description, and overview fallbacks", () => {
  const output = buildFixtureSite({ source });
  const page = (name) => load(readFileSync(join(output, name), "utf8"));
  const home = page("index.html");
  assert.equal(home("title").text(), "Page fields fixture");
  const explicit = page("articles/explicit/index.html");
  assert.equal(
    explicit("title").text(),
    "Explicit title | Page fields fixture",
  );
  assert.equal(
    explicit("header .white-80").text().trim(),
    "Explicit description",
  );
  assert.deepEqual(
    explicit(".ananke-submenu-overview a")
      .map((_, link) => explicit(link).text())
      .get(),
    ["All articles", "Overview", "Custom overview"],
  );
  const untitled = page("fallback/untitled/index.html");
  assert.equal(untitled("title").text(), "Page fields fixture");
  const custom = page("articles/custom/index.html");
  assert.equal(custom("title").text(), "Custom title | Page fields fixture");
  assert.equal(custom("header .white-80").text().trim(), "Custom description");
});

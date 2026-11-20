import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import { buildFixtureSite } from "../../support/prepare-site.mjs";

const source = dirname(fileURLToPath(import.meta.url));
for (const [name, config, images, dates, sectionTitles] of [
  ["defaults", "hugo.toml", 0, 2, 2],
  ["image cards without dates", "hugo.toml,images.toml", 1, 0, 0],
  [
    "plain cards without dates or section titles",
    "hugo.toml,plain.toml",
    0,
    0,
    0,
  ],
]) {
  test(`list cards: ${name} (#217, #1109)`, () => {
    const output = buildFixtureSite({ source, config });
    const $ = load(readFileSync(join(output, "cards/index.html"), "utf8"));
    assert.equal($("main img.img").length, images);
    assert.equal($("main time[datetime]").length, dates);
    assert.equal(
      $("main span.f6.db").filter((_, el) => $(el).text() === "Cards").length,
      sectionTitles,
    );
    assert.equal($("main h1 a").length, 2);
  });
}

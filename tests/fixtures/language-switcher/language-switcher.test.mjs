import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import { buildFixtureSite } from "../../support/prepare-site.mjs";

const source = dirname(fileURLToPath(import.meta.url));

test("language switcher shows configured labels with language attributes (#707)", () => {
  const output = buildFixtureSite({ source });
  const $ = load(readFileSync(join(output, "page/index.html"), "utf8"));
  const links = $("header ul a[hreflang]")
    .map((_, el) => ({
      text: $(el).text().trim(),
      lang: $(el).attr("lang"),
      hreflang: $(el).attr("hreflang"),
      href: $(el).attr("href"),
    }))
    .get();
  assert.deepEqual(links, [
    { text: "Deutsch", lang: "de-DE", hreflang: "de-DE", href: "/de/page/" },
    { text: "fr", lang: "fr-FR", hreflang: "fr-FR", href: "/fr/page/" },
  ]);
});

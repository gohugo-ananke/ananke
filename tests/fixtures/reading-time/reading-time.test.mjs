import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import { buildFixtureSite } from "../../support/prepare-site.mjs";

const source = dirname(fileURLToPath(import.meta.url));

function readingTime(output, path) {
  const $ = load(readFileSync(join(output, path), "utf8"));
  return $("article header span.f6.tracked").first().text().trim();
}

test("reading time uses the singular unit as a compound adjective (#870)", () => {
  const output = buildFixtureSite({ source });
  assert.equal(
    readingTime(output, "posts/short/index.html"),
    "- One minute read",
  );
  assert.equal(readingTime(output, "posts/long/index.html"), "- 3 minute read");
});

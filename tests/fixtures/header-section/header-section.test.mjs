import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { load } from "cheerio";
import { buildFixtureSite } from "../../support/prepare-site.mjs";

const source = dirname(fileURLToPath(import.meta.url));
test("header_section_class overrides only its page (#504)", () => {
  const output = buildFixtureSite({ source });
  const custom = load(readFileSync(join(output, "custom/index.html"), "utf8"));
  const defaults = load(
    readFileSync(join(output, "default/index.html"), "utf8"),
  );
  assert.equal(custom("header .fixture-custom-height").length, 1);
  assert.equal(defaults("header .fixture-custom-height").length, 0);
  assert.equal(defaults("header .tc-l.pv6.ph3.ph4-ns").length, 1);
});

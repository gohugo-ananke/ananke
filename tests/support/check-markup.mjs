import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { load } from "cheerio";
import { HtmlValidate } from "html-validate";

const validator = new HtmlValidate({ extends: ["html-validate:standard"] });
let count = 0;
async function validate(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) await validate(path);
    else if (entry.name.endsWith(".html")) {
      let source = readFileSync(path, "utf8");
      // Hugo's built-in pagination redirects omit <body>. Verify the redirect
      // and supply its implied empty body before validating the document.
      if (/[/\\]page[/\\]1[/\\]index.html$/.test(path)) {
        const $ = load(source);
        assert.equal($("meta[http-equiv=refresh]").length, 1, path);
        assert.ok($("link[rel=canonical]").attr("href"), path);
        source = $.html();
      }
      const report = await validator.validateString(source, path);
      assert.ok(report.valid, JSON.stringify(report.results, null, 2));
      count++;
    }
  }
}
await validate(process.argv[2] || "tests/fixtures/site/public");
console.log(`Markup gate passed: ${count} HTML files.`);

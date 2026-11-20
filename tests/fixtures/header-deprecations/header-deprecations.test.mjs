import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { load } from "cheerio";
import { buildFixtureSite } from "../../support/prepare-site.mjs";

test("header override deprecation is emitted once and can be suppressed (#1120)", () => {
  const source = mkdtempSync(join(tmpdir(), "ananke-header-override-"));
  const config = 'theme = "ananke"\ntitle = "Header override"\n';
  try {
    writeFileSync(join(source, "hugo.toml"), config);
    let output = "";
    const onOutput = (log) => {
      output = log;
    };
    buildFixtureSite({ source, onOutput });
    assert.doesNotMatch(output, /ananke\/DEPR/);
    const partials = join(source, "layouts/_partials");
    mkdirSync(partials, { recursive: true });
    writeFileSync(
      join(partials, "site-navigation.html"),
      '<nav class="fixture-deprecated-nav">Custom navigation</nav>',
    );
    const destination = buildFixtureSite({
      source,
      onOutput,
      expectedWarnings: [
        /^ananke\/DEPR Your project overrides layouts\/_partials\/site-navigation\.html\. Overriding the header partials is deprecated/,
      ],
    });
    assert.equal(output.split("ananke/DEPR").length - 1, 1);
    assert.match(output, /ananke-deprecated-site-navigation/);
    const $ = load(readFileSync(join(destination, "index.html"), "utf8"));
    assert.equal($("nav.fixture-deprecated-nav").length, 1);
    writeFileSync(
      join(source, "hugo.toml"),
      `ignoreLogs = ["ananke-deprecated-site-navigation"]\n${config}`,
    );
    buildFixtureSite({ source, onOutput });
    assert.doesNotMatch(output, /ananke\/DEPR/);
  } finally {
    rmSync(source, { recursive: true, force: true });
  }
});

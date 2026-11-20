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

const cases = [
  { label: "defaults", single: true, summary: true },
  {
    label: "shared site fallback",
    site: { show_date: false },
    single: false,
    summary: false,
  },
  {
    label: "specific site over shared site",
    site: { show_date: false, show_single_date: true },
    single: true,
    summary: false,
  },
  {
    label: "summary site override",
    site: { show_date: true, show_summary_date: false },
    single: true,
    summary: false,
  },
  {
    label: "page shared over specific site",
    site: { show_single_date: false, show_summary_date: false },
    page: { show_date: true },
    single: true,
    summary: true,
  },
  {
    label: "page shared false over site true",
    site: { show_single_date: true, show_summary_date: true },
    page: { show_date: false },
    single: false,
    summary: false,
  },
  {
    label: "specific page over shared page",
    page: { show_date: false, show_single_date: true },
    single: true,
    summary: false,
  },
  {
    label: "summary page over shared page",
    page: { show_date: true, show_summary_date: false },
    single: true,
    summary: false,
  },
  {
    label: "opposite independent settings",
    page: { show_single_date: false, show_summary_date: true },
    single: false,
    summary: true,
  },
  {
    label: "cascade over site",
    site: { show_summary_date: true },
    cascade: { show_summary_date: false },
    single: true,
    summary: false,
  },
  {
    label: "page over cascade",
    cascade: { show_single_date: false, show_summary_date: false },
    page: { show_single_date: true, show_summary_date: true },
    single: true,
    summary: true,
  },
  {
    label: "page map over cascade map",
    cascade: { show_summary_date: false },
    page: { show_date: true },
    single: true,
    summary: true,
  },
  {
    label: "undated page",
    page: { show_single_date: true, show_summary_date: true },
    undated: true,
    single: false,
    summary: false,
  },
];
const settings = (values = {}) =>
  Object.entries(values).map(([key, value]) => `${key} = ${value}`);
for (const variant of ["compact", "image", "post"]) {
  for (const scenario of cases) {
    test(`${variant}: ${scenario.label} (#1112)`, () => {
      const source = mkdtempSync(join(tmpdir(), "ananke-date-settings-"));
      try {
        mkdirSync(join(source, "content/cards"), { recursive: true });
        writeFileSync(
          join(source, "hugo.toml"),
          [
            'theme = "ananke"',
            'title = "Date fixture"',
            "[params]",
            'mainSections = ["cards"]',
            "[params.ananke.pages]",
            `show_list_images = ${variant === "image"}`,
            ...settings(scenario.site),
            "",
          ].join("\n"),
        );
        writeFileSync(
          join(source, "content/cards/_index.md"),
          [
            "+++",
            'title = "Cards"',
            ...(variant === "post" ? ['type = "post"'] : []),
            ...(scenario.cascade
              ? ["[cascade.params.ananke]", ...settings(scenario.cascade)]
              : []),
            "+++",
            "",
          ].join("\n"),
        );
        for (const name of ["with-image", "without-image"]) {
          writeFileSync(
            join(source, `content/cards/${name}.md`),
            [
              "+++",
              `title = "${name}"`,
              ...(scenario.undated ? [] : ["date = 2024-01-15T00:00:00Z"]),
              ...(variant === "post" ? ['type = "post"'] : []),
              ...(name === "with-image"
                ? ['featured_image = "/images/card.jpg"']
                : []),
              ...(scenario.page
                ? ["[params.ananke]", ...settings(scenario.page)]
                : []),
              "+++",
              "",
              "Date setting fixture.",
              "",
            ].join("\n"),
          );
        }
        const output = buildFixtureSite({ source });
        for (const name of ["with-image", "without-image"]) {
          const $ = load(
            readFileSync(join(output, `cards/${name}/index.html`), "utf8"),
          );
          assert.equal(
            $("time.f6.mv4.dib.tracked").length,
            scenario.single ? 1 : 0,
          );
        }
        for (const file of ["cards/index.html", "index.html"]) {
          const $ = load(readFileSync(join(output, file), "utf8"));
          assert.equal(
            $('time[datetime="2024-01-15T00:00:00Z"]').length,
            scenario.summary ? 2 : 0,
            file,
          );
        }
      } finally {
        rmSync(source, { recursive: true, force: true });
      }
    });
  }
}

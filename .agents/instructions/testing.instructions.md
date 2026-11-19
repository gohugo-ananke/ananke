---
applyTo: "tests/**,layouts/_shortcodes/**/*.html,config/_default/params.toml"
---

# Feature tests

* For new or changed parameters or shortcodes, add fixture content under `tests/fixtures/site/`, add a relevant Playwright spec under `tests/e2e/`, and register it in `tests/catalog.yaml`.
* Name browser tests `<feature>.spec.ts`. Include interaction, rendered output, accessibility, or no-JavaScript checks as relevant.
* Run relevant tests using `.agents/references/development.md`; see `tests/README.md` for the fixture structure.
* The coverage gate requires non-empty test lists for direct `[ananke]` keys and shortcodes. Nested parameter tables are not currently gated; do not treat this as complete behavioural coverage.

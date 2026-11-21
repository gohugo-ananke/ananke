# Testing issue status

This is the implementation record for the testing epic [#1004](https://github.com/gohugo-ananke/ananke/issues/1004). All issues of the epic are closed. The [`Theme tests` workflow](../.github/workflows/tests.yml) runs the lint, browser, static, and Lighthouse jobs on every push and pull request.

| Issue | Closed | Implemented | Known limits and follow-up work |
| --- | --- | --- | --- |
| [#1004](https://github.com/gohugo-ananke/ananke/issues/1004) | 2026-11-21 | Layered testing commands and CI configuration | Continue the backfill queue below |
| [#1005](https://github.com/gohugo-ananke/ananke/issues/1005) | 2026-11-20 | Node runner, standard reporter, watch command, Cheerio assertions, and feature mini-sites for #504, #217, #1109, copy disablement, date precedence, and header deprecations | None |
| [#1006](https://github.com/gohugo-ananke/ananke/issues/1006) | 2026-11-20 | Local build/serve harness, pinned Playwright container CI job, shared page-type data, and report artifacts | None |
| [#1007](https://github.com/gohugo-ananke/ananke/issues/1007) | 2026-11-20 | Axe across page types including the contact form, contrast fixes, zero-violation assertions, CI, and manual checklist | The manual checklist requires human checks |
| [#1008](https://github.com/gohugo-ananke/ananke/issues/1008) | 2026-11-20 | No-JavaScript navigation, submenu, image, copy-control, and code-selection tests at mobile and desktop sizes | None |
| [#1009](https://github.com/gohugo-ananke/ananke/issues/1009) | 2026-11-20 | Six page types at two viewports, deterministic capture settings, comparison gate, and CI baseline artifact workflow | Changed baselines require human review in the pull request |
| [#1010](https://github.com/gohugo-ananke/ananke/issues/1010) | 2026-11-20 | Lighthouse CI, score and asset budgets, reports, and CI job | None |
| [#1011](https://github.com/gohugo-ananke/ananke/issues/1011) | 2026-11-20 | HTML validity, offline links and fragments, diagnostic assertions, and CI job | External link availability is outside this deterministic gate |
| [#1012](https://github.com/gohugo-ananke/ananke/issues/1012) | 2026-11-20 | TOML parsing, executable-path validation, mutation tests, missing edit-page registration, CI, documentation, and PR checkbox | Other nested parameter tables remain outside the declared gate scope |
| [#1013](https://github.com/gohugo-ananke/ananke/issues/1013) | 2026-11-20 | Copy wrapper, inline-code exclusion, copy feedback and clipboard, no-JavaScript rendering, site-wide disablement, and real shortcode tests | Continue the backfill queue below |
| [#1014](https://github.com/gohugo-ananke/ananke/issues/1014) | 2026-11-21 | Contributor guide in [README.md](README.md#add-or-change-a-feature) and the Tests section of `CONTRIBUTING.md` | None |
| [#1015](https://github.com/gohugo-ananke/ananke/issues/1015) | 2026-11-20 | WCAG AA contrast fixes for summary cards and bylines | None |

## Backfill queue

* Home content alignment, recent posts, and categories: dedicated DOM assertions for each setting and disabled state.
* Header layout and hooks: widen parameter registration to nested configuration once behaviour-specific tests exist.
* Social follow/share settings and network definitions: output, accessible names, escaping, and no-JavaScript checks.
* Since and edit-page shortcodes: configured targets, repository formats, empty input, warning cases, and missing source files.

## Scope of the automated checks

Contrast, native form labels, and email instructions are covered by passing axe, accessible-name, keyboard, and browser-validation checks. The mobile menu is collapsed before DOMContentLoaded when JavaScript is available, while no-JavaScript navigation stays expanded. The fixture server negotiates gzip and has tests for compressed, uncompressed, and explicitly refused gzip responses.

Automated checks do not establish full accessibility conformance. Use the [manual testing guide](manual-tests.md) for release candidates and relevant UI changes.

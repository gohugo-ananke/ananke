# Testing issue status

This is an implementation record for the open `type:tests` reports. Local validation does not establish that a GitHub Actions run passed. No issues have been closed.

| Issue | Implemented | Remaining work or blocker |
| --- | --- | --- |
| [#1004](https://github.com/gohugo-ananke/ananke/issues/1004) | Layered testing commands and CI configuration | Complete the child issues below |
| [#1005](https://github.com/gohugo-ananke/ananke/issues/1005) | Node runner, standard reporter, watch command, Cheerio assertions, and feature mini-sites for #504, #217, #1109, copy disablement, date precedence, and header deprecations | Remote checks are verified in the PR before merge |
| [#1006](https://github.com/gohugo-ananke/ananke/issues/1006) | Local build/serve harness, pinned Playwright container CI job, shared page-type data, and report artifacts | Remote checks are verified in the PR before merge |
| [#1007](https://github.com/gohugo-ananke/ananke/issues/1007) | Axe across page types including the contact form, contrast fixes, zero-violation assertions, CI, and manual checklist | Manual checklist requires human checks; first remote CI run |
| [#1008](https://github.com/gohugo-ananke/ananke/issues/1008) | No-JavaScript navigation, submenu, image, copy-control, and code-selection tests at mobile and desktop sizes | Remote checks are verified in the PR before merge |
| [#1009](https://github.com/gohugo-ananke/ananke/issues/1009) | Six page types at two viewports, deterministic capture settings, comparison gate, and CI baseline artifact workflow | Initial CI baselines included; comparison run and human PR review pending |
| [#1010](https://github.com/gohugo-ananke/ananke/issues/1010) | Lighthouse CI, score and asset budgets, reports, and CI job | All nine local runs pass the unchanged budgets; first remote CI run |
| [#1011](https://github.com/gohugo-ananke/ananke/issues/1011) | HTML validity, offline links and fragments, diagnostic assertions, and CI job | Remote checks are verified in the PR before merge; external link availability is outside this deterministic gate |
| [#1012](https://github.com/gohugo-ananke/ananke/issues/1012) | TOML parsing, executable-path validation, mutation tests, missing edit-page registration, CI, documentation, and PR checkbox | Other nested parameter tables remain outside the declared gate scope |
| [#1013](https://github.com/gohugo-ananke/ananke/issues/1013) | Copy wrapper, inline-code exclusion, copy feedback and clipboard, no-JavaScript rendering, site-wide disablement, and real shortcode tests | Continue the backfill queue below |

## Backfill queue

* Home content alignment, recent posts, and categories: dedicated DOM assertions for each setting and disabled state.
* Header layout and hooks: widen parameter registration to nested configuration once behaviour-specific tests exist.
* Social follow/share settings and network definitions: output, accessible names, escaping, and no-JavaScript checks.
* Since and edit-page shortcodes: configured targets, repository formats, empty input, warning cases, and missing source files.

## Decisions and acceptance still needed

Contrast, native form labels, and email instructions are now covered by passing axe, accessible-name, keyboard, and browser-validation checks. The mobile menu is collapsed before DOMContentLoaded when JavaScript is available, while no-JavaScript navigation stays expanded. The fixture server negotiates gzip and has tests for compressed, uncompressed, and explicitly refused gzip responses. Lighthouse passes all nine local runs with the original score and transfer budgets.

Remote CI has run: Node, browser interaction/accessibility, and Lighthouse checks passed. The lychee archive extraction path has been corrected after its first CI failure. Initial visual baselines were generated in CI and are included for comparison and human PR review. The manual accessibility checklist also requires human checks; automated checks do not establish full conformance.

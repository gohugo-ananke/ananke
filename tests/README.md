# Theme tests

The tests build against the local theme working tree, including uncommitted changes. No published theme download is needed, except for the optional submodule installation smoke test.

## Commands

Use Node.js 26 or later, a compatible Hugo, and `npm ci`. Install Chromium with `npx playwright install chromium`. Static link checks also require lychee 0.24.2.

| Command | Checks |
| --- | --- |
| `npm test` | Node test runner: feature mini-sites, gate regression tests, and the quickstart installation smoke test |
| `npm run test:fixtures` | Feature mini-sites with Cheerio DOM assertions |
| `npm run test:watch` | Node watch mode for feature and gate tests |
| `npm run test:e2e` | Browser interaction, axe, and no-JavaScript tests |
| `npm run test:coverage-gate` | Parameter and shortcode registration, and test file paths |
| `npm run test:static` | Build diagnostics, HTML validity, and offline internal links and fragments |
| `npm run test:visual` | Screenshots against reviewed CI baselines |
| `npm run test:performance` | Lighthouse budgets, with three runs per URL |
| `npm run test:quickstart` | Direct quickstart installation smoke test |
| `npm run test:quickstart:submodule` | Published submodule installation, which does not test local changes |

The watch command watches imported JavaScript test files. Restart it after changing Hugo templates or fixture content. Each test run rebuilds the affected mini-site.

## Layout

* `fixtures/<feature>/`: one mini-site and its co-located Node tests per migrated feature.
* `fixtures/site/`: the shared browser fixture, with home, list, single, taxonomy, terms, and 404 pages.
* `e2e/`: browser, accessibility, no-JavaScript, and visual tests.
* `support/prepare-site.mjs`: shared local-theme fixture builder.
* `catalog.yaml`: feature registration.
* `unit/`: regression tests for the coverage gate.
* `visual-baselines/`: reviewed screenshots generated in CI.
* `.playwright/`: ignored reports and screenshots.

The fixture builder creates a temporary theme symlink and removes it after the build. It passes an explicit base URL, so a developer's `HUGO_BASEURL` cannot send tests to another server. `ANANKE_TEST_PORT` changes the browser server port. Lighthouse uses port 4321; run it separately from browser tests.

## Add or change a feature

1. Add a fixture that exercises the behaviour. Use a feature mini-site for build and DOM checks, or the shared site for browser checks.
2. Add assertions for the rendered result and relevant interaction, accessibility, and no-JavaScript behaviour.
3. Register the parameter or shortcode in `catalog.yaml` with executable test file paths.
4. Run the relevant tests and `npm run test:coverage-gate`.
5. Update the separate documentation repository for user-facing theme changes.

The gate parses TOML and checks direct values in `[ananke]`, `[ananke.navigation]`, and `[ananke.navigation.classes]`, plus all theme shortcodes. A new unregistered parameter or shortcode fails. Missing, invalid, or out-of-repository test paths fail. Other nested tables remain outside this gate. A registration does not prove that assertions cover every behaviour. Stale entries produce warnings.

## Static checks

Unexpected Hugo warnings, deprecations, and path warnings fail the shared fixture build. Builds run at info log level so that new `INFO deprecated:` messages also fail before Hugo promotes them to warnings. Ordinary info messages are allowed. Two exact warnings are required for the intentionally invalid navigation fixtures (`unknown` and `invalid`); a missing or repeated warning also fails. The deprecated-header mini-site also requires its one expected deprecation warning and tests suppression. Other feature mini-sites allow no warnings.

HTML validation uses `html-validate:standard` for validity rather than formatting preferences. Hugo's built-in `page/1/` redirects omit an explicit body. The gate checks their redirect metadata, supplies the implied body with the DOM parser, and validates the resulting document. Other pages are validated as emitted.

Lychee checks local files and fragments offline. Absolute fixture URLs are mapped to files, so missing pages and assets fail without network access. External URLs are outside this gate. The contact form endpoint is a static test fixture and sends no messages.

## Visual baselines

Both CI generation and comparison use `mcr.microsoft.com/playwright:v1.65.1-noble`, matching the locked Playwright version. Update both when upgrading Playwright. The suite covers six page types at 375 and 1280 pixels. It fixes time and locale, reduces motion, disables animations, and waits for fonts.

1. Push the branch and run **Theme tests** with **Generate visual baselines for review as an artifact** enabled.
2. Download `browser-results` from that run and inspect every image.
3. Copy the generated `visual-baselines/` tree to `tests/visual-baselines/` and commit the reviewed images with the change.
4. Run CI normally to compare against those baselines.

Generate baselines in CI, not locally. Normal comparison uses `updateSnapshots: "none"`: missing baselines and pixel differences fail. Baseline generation uploads images for review; it does not commit or publish them. The initial CI-generated files and their source run are recorded in [the baseline provenance](visual-baselines/README.md). Human approval belongs in the pull request review. Dark palette coverage can be added when that feature is available.

## Lighthouse budgets

The proposed initial budgets in `lighthouserc.cjs` are performance ≥ 0.90, accessibility = 1.00, SEO ≥ 0.90, JavaScript ≤ 16 KiB, and CSS ≤ 32 KiB. Resource limits use Lighthouse's measured transfer bytes. The fixture server negotiates gzip for text responses, as a production static host normally does; it also supports uncompressed clients. The limits have not been lowered. Reports are saved locally and uploaded as CI artifacts. Uploads to a public Lighthouse server are disabled.

A local run with Hugo 0.170.0 and Playwright Chromium passed all nine runs: performance 1.00, accessibility 1.00, SEO 0.92–1.00, and CSS transfers of 15,478–15,921 bytes. Before the fixes, the server sent about 80–81 KB of uncompressed CSS, and mobile menu enhancement caused layout shifts near 0.45. Early mobile-menu styling reduced the measured shifts to about 0.03. The full Tachyons bundle is retained. These are local measurements; CI must establish its own results.

## Accessibility

Axe checks WCAG 2.2 AA rules across page types, but cannot establish full conformance. Use the [manual testing guide](manual-tests.md) as well. The contrast defects tracked in [#1015](https://github.com/gohugo-ananke/ananke/issues/1015) are fixed, and all page-type audits require zero violations. The suite includes the contact form and checks content links on hover and keyboard focus.

See [the issue status and remaining work](testing-status.md).

# Tests

This directory holds the theme's automated tests. It is the proof-of-concept
for the testing system tracked in the testing epic.

## Layout

```text
tests/
├── fixtures/site/      # a minimal Hugo site that uses the theme
├── e2e/                # Playwright specs (E2E, accessibility, no-JS)
├── support/            # build-the-fixture + static-server helpers
├── catalog.yaml        # feature -> test manifest for the coverage gate
└── coverage-gate.mjs   # fails CI when a param/shortcode has no test
```

The legacy build/HTML harness still lives at
`scripts/test-hugo-quickstart.ts` and is being migrated into this structure.

## Running

```bash
# Browser end-to-end, accessibility, and progressive-enhancement (no-JS) tests.
# Builds the fixture site against the local theme working tree, serves it, and
# runs Playwright. Requires browsers: `npx playwright install chromium`.
npm run test:e2e

# Feature -> test coverage gate: fails if an [ananke] param or a shortcode has
# no entry in tests/catalog.yaml.
npm run test:coverage-gate

# Legacy quickstart build/assertion harness.
npm test
```

## How the fixture is built

`tests/support/prepare-site.mjs` creates a temporary themes directory with a
symlink to the repository root and runs Hugo against `tests/fixtures/site`, so
the suite always exercises the **current** theme code (including uncommitted
changes) without committing an absolute-path symlink. The built site is served
by `tests/support/dev-server.mjs`, which Playwright launches via
`webServer` in `playwright.config.ts`.

## Adding a test for a feature

When you add or change a feature:

1. If it has a config parameter or shortcode, add fixture content that
   exercises it under `tests/fixtures/site/`.
2. Add a spec under `tests/e2e/` (interaction, output, or accessibility).
3. Register it in `tests/catalog.yaml` so the coverage gate is satisfied.

The coverage gate (`npm run test:coverage-gate`) fails if a new `[ananke]`
parameter or shortcode is not listed in the catalog with at least one test, so
tests stay in sync with features.

## Accessibility note

The axe suite catches roughly 30-40% of WCAG issues. It is a floor, not a
guarantee — pair it with manual keyboard and screen-reader checks.

# Development and contribution workflow

## Source map and prerequisites

Templates, partials, and shortcodes live in `layouts/`; processed assets live in `assets/ananke/`; unchanged public files live in `static/`. Translations live in `i18n/`, content templates in `archetypes/`, and automation in `scripts/`. User documentation lives in the separate `gohugo-ananke/documentation` repository.

Use Hugo compatible with `config/_default/module.toml`. Run `npm ci` for locked dependencies or `npm install` when updating dependencies; the prepare hook installs Git hooks. The pre-commit hook runs lint-staged, configured in `lint-staged.config.ts`, including Markdown, YAML, workflow, and lockfile checks.

## Commands

* `npm run check`: linting, quickstart tests, and the feature coverage gate; browser tests run separately.
* `npm run lint`: Biome, lockfile-lint, markdownlint, TypeScript, and yamllint checks. The `lint` job in `.github/workflows/tests.yml` runs it in CI. yamllint is a Python tool; install it locally, for example with `pipx install yamllint`.
* `npm run lint:yaml`: yamllint with `.yamllint.yml` on all YAML files that are not ignored.
* `npm run lint:code:fix`: Biome fixes; HTML templates, Tachyons source, and asset distribution files are excluded by `biome.json`.
* `npm run lint:markdown:fix`: Markdown fixes.
* `npm run lint:typescript`: TypeScript checks without emitting files.
* `npm test`: quickstart build and generated-HTML assertions against the local working tree.
* `npm run test:quickstart:submodule`: checks the published theme installation; it does not test local changes.
* `npm run test:coverage-gate`: feature registration checks, not percentage coverage.
* `npm run test:e2e`: Playwright browser, axe accessibility, and no-JavaScript checks. Install Chromium first with `npx playwright install chromium` if needed.
* `npx playwright test tests/e2e/copy-button.spec.ts`: run one spec; use `-g "test name"` to select a test.
* `node tests/support/prepare-site.mjs`: build the fixture against the current theme.
* `node tests/support/dev-server.mjs`: build and serve the fixture. `ANANKE_TEST_PORT` changes the default port, `4321`.

The fixture builder uses a temporary theme symlink; the quickstart harness copies the working tree into a fresh temporary Hugo site. Both include uncommitted theme changes in their default modes. Use `node scripts/test-hugo-quickstart.ts --help` for options, including `--keep-on-success` to inspect generated output.

Select checks relevant to the change. Exclude `scratch/` from searches and checks, including broad lint commands. Manually check keyboard access and visual changes where relevant. See `tests/README.md` for fixture and browser-suite details.

## Style and delivery

Follow neighbouring Hugo template and CSS conventions. Existing TypeScript uses two spaces; Biome uses space indentation. Keep Markdown paragraphs on one source line, and use descriptive filenames consistent with neighbouring files.

Use branches such as `feat/<topic>`, `fix/<topic>`, `docs/<topic>`, `chore/<topic>`, or `refactor/<topic>`. Regular pull requests target `development` for squash merging; promotion to `main` uses rebase merging. Do not introduce merge commits.

Use commit messages such as `fix(layouts): correct summary dates`. Pull requests need a summary, motivation, validation results, linked issues, and screenshots for visual changes. Complete `.github/pull_request_template.md` and update documentation for user-facing changes.

Stable releases (`npm run release`) require `main`; prereleases (`npm run release:pre`) require `development`. The release configuration commits, tags, pushes, and publishes a GitHub release. Running it requires authorisation for these actions; validation alone does not authorise publication.

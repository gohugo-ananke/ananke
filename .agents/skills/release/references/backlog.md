# Release preparation backlog

Draft reviewed against the current main branches on 20 November 2026: Ananke `8c18c8412c9e`, documentation `ce1d18c0b678`. This list records remaining work; it does not authorise implementing it during a release check.

## Release tooling and automation to add

* [ ] Add a machine-readable readiness record containing candidate refs, proposed version, note path, check results, and unresolved blockers. Refuse to use a stale record after candidate changes.
* [ ] Add an explicit requested-version and allowed-major guard around the real release script. The current Conventional Commit configuration can recommend a major release; dry-run review and human decisions are still manual.
* [ ] Protect long-lived development branches from automatic source deletion. Ananke currently enables repository-wide auto-deletion; v2.21 temporarily disabled and restored it. Prefer durable branch retention over a broad setting toggle.
* [ ] Automate the stable theme release to documentation hand-off: wait for module availability, pass the expected tag, update checked-in pins, run the guarded build, and only then promote documentation main.
* [ ] Pass the expected theme version into hosted production builds, not only the maintainer's local pre-publication check. The command-line guard exists; automatic pipelines do not yet receive the release's expected tag.
* [ ] Add release-record capture for commands, failures, versions, remote refs, deployment identities, and live checks. Keep temporary paths as observations rather than future defaults.
* [ ] Decide the maintained Hugo compatibility range and test it in the release gate. v2.21 used theme builds with 0.160.0, 0.161.1, and 0.170.1, and documentation with 0.170.1; this is historical evidence, not a permanent latest-version policy.
* [ ] Generalise documentation's test-release publication guide and reconcile its contributor instructions with the two retained branches. `content/help/development.md` records the correct publication order; `CONTRIBUTING.md` still describes main as its only long-lived branch.
* [ ] Make release-note preparation use candidate evidence and reusable editorial guidance. Remove or supersede the mandatory historical SASS breaking-change and fixed Hugo requirement in `ananke-release-notes/SKILL.md`; do not silently reuse them.
* [ ] Add a supported notes-file interface for release creation, with safe handling of file paths, and a synchronised correction path for the release and its copied discussion. v2.21 used release-it's command-valued `github.releaseNotes` option.
* [ ] Define recovery after partial publication: inspect tag/release state, avoid duplicate side effects, and resume documentation publication without recreating the theme tag.
* [ ] Avoid duplicate, empty integration records when a local squash has already been pushed before its PR is completed. v2.21 retained empty integration commits after promotion; their trees were verified.

## Existing validation work still open

* [ ] Theme: add a meaningful `edit-page` shortcode test and register it in `tests/catalog.yaml`. The current coverage gate was rerun for this review and still fails for that missing entry.
* [ ] Theme: scope TypeScript and aggregate checks so they cannot traverse `scratch/`. `tsconfig.json` still includes `**/*.ts` without a project-level scratch exclusion. Do not rerun the old scratch-directory compilation errors as a check.
* [ ] Documentation: resolve the previously reported LinkedIn recipe ordered-list lint issue. This is a baseline issue, not a v2.21 regression; rerun the focused Markdown check when taking it on.
* [ ] Isolate shared development launcher tests from an active preview on port 1313. v2.21 tested temporary copies with a free port; the maintained launcher-test solution remains to be added.
* [ ] Review the existing dependency advisory notices separately. The release push reported advisories, but neither their current severity nor remedies are established by this draft.

## Planned compatibility work

* [ ] At a separately approved v3 transition, handle [Ananke issue #1120](https://github.com/gohugo-ananke/ananke/issues/1120): remove override detection/markers, decide the internal role of the legacy header partials, and document the migration. Do not perform that removal in the current v2 release line or infer permission for a major release.

## Implemented capabilities to keep

* Header components, before/after hooks, configurable groups, class precedence, submenu modes, responsive mobile lists, and targeted override warnings are implemented and documented.
* The old unreleased `navigation-start` and `navigation-end` proposal was superseded by component hooks; adding those old names is not pending work.
* Documentation uses the theme navigation and a search component, with aliases for moved pages, responsive tables, and compact option references.
* Local development explicitly selects the sibling theme through an environment replacement. Production and remote previews resolve their own revisions in temporary source trees.
* Production resolves a stable release, prints the selected version, preserves source dependency files, supports `--expect-theme-version`, and builds Pagefind. Draft and production deployments are distinct.
* The stable theme script requires main and supports dry runs. Existing automation deploys documentation main to Netlify and GitHub Pages.

## Scratch-note disposition

All six reviewed notes can be removed after this draft and its historical reference are saved:

| Source note | Disposition and retained evidence |
| --- | --- |
| `scratch/header-rework/result-001.md` | Components and layout are on main and documented in the header guide. The test catalogue and check-scoping gaps are retained above. |
| `scratch/header-rework/result-002.md` | Branch integration and targeted deprecation are complete. The original hook/mobile proposals were superseded. Future removal remains in issue #1120 and the checklist above. |
| `scratch/release-notes/release-notes-1.21.md` | Published as [v2.21.0 release notes](https://github.com/gohugo-ananke/ananke/releases/tag/v2.21.0) and [discussion #1124](https://github.com/orgs/gohugo-ananke/discussions/1124). |
| `scratch/2026-11-19-multilevel-menu-docs.md` | Menu hierarchy, controls, labels, keyboard behaviour, current states, no-JavaScript behaviour, and upgrade advice are documented. Later four-mode/mobile requirements supersede the early proposal. |
| `scratch/2026-11-19-navigation-redesign-docs.md` | Theme navigation, the search hook, class scaffold, and responsive layout are integrated and documented. Component hooks supersede the proposed start/end hooks. |
| `scratch/2026-11-20-v2.21-release-run.md` | Historical record preserved in [the v2.21 release reference](v2.21-release-record.md); reusable steps are in SKILL.md, with pending automation above. |

Current source guides are `documentation/content/configuration/menus.md`, `documentation/content/customisation/header.md`, `documentation/content/customisation/hooks-and-filters/all.md`, and `documentation/content/help/development.md`. Refer to the exact main revisions above when comparing this audit with later work.

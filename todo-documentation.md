# Ananke Documentation — TODO

Generated 2026-06-05 from a full scan of the **theme** (`ananke/`) and the **documentation**
site (`../documentation/`, published to <https://ananke-documentation.netlify.app/>).

The documentation lives in a separate repo. This file is tracked **here** (alongside
[`todo.md`](todo.md)) but the actual content/display work is implemented in the documentation
repo. Branches already created for this effort:

* documentation repo → `docs/complete-feature-coverage` (off `main`)
* ananke repo → `docs/documentation-audit` (off `development`, holds this file)

**Goal:** document *every* feature the theme offers, in a beginner-safe ("dummy safe") way —
each page should have (1) a plain-language explanation of what the feature does, (2) a minimal
copy-paste example, (3) a deeper "how it works internally" section, and (4) links to related
pages and the relevant Hugo docs.

Legend: `[ ]` open · `[~]` partial/exists-but-thin · `[x]` done.
Priority tags: `prio:{critical,high,medium,low}`.

---

## 0. Cross-cutting principles ("dummy safe" house style)

* [ ] Adopt a **page template/skeleton** every feature page follows: _Summary → Quick start
  (copyable) → Options reference (table) → How it works → Gotchas → Related/See also_.
* [ ] Every config snippet must show the **full path context** (e.g. `[ananke.social.follow]`
  in `config/_default/params.toml`) — never a bare key.
* [ ] State **defaults** and whether each option is required/optional next to every parameter.
* [ ] Use the `{{</* since */>}}` shortcode consistently to mark the version a feature landed.
* [ ] Replace the hand-maintained bullet "table of contents" at the top of each page with the
  theme's automatic TOC (`toc: true` front matter) once the TOC feature is documented/working.
* [ ] Add a real **exampleSite**/recipe reference per feature so a new user can copy a working setup.

---

## 1. Coverage matrix — theme feature vs. current docs

| Theme feature | Source of truth | Current doc | State |
| --- | --- | --- | --- |
| Install as Hugo Module | `config/_default/module.toml` | `installation/gohugo-module.md` | `[~]` ok |
| Install as Git submodule | — | `installation/git-submodule.md` | `[~]` ok |
| General config (contact form, logo, date) | layouts, i18n | `configuration/general.md` | `[~]` thin |
| SEO / internal templates | `_partials/head-additions.html` | `configuration/seo.md` | `[ ]` stub (10 words) |
| Social follow/share/networks/particles | `_partials/social/*`, `params.toml` | `configuration/social-media-networks.md` | `[~]` strong |
| Hooks & filters — concept | `_partials/{hook,filter}.html` | `hooks-and-filters/introduction.md` | `[x]` done (path fixed, reconciled) |
| Hooks & filters — **list of hook points** | `layouts/**` (12 hook points) | `hooks-and-filters/all.md` + `examples.md` | `[x]` done |
| Front matter options (full list) | layouts + `archetypes/default.md` | `content/frontmatter.md` | `[~]` incomplete |
| Reading time / word count | `_partials/page-header.html` | `content/reading-time.md` | `[~]` ok |
| Content general | layouts | `content/general.md` | `[~]` thin |
| Colours / Tachyons | `assets/ananke/css/*` | `customisation/colours.md` | `[ ]` stub (23 words) |
| Comments (Disqus + Commento) | `_partials/commento.html`, Hugo internal | `customisation/comments.md` | `[~]` thin (32 words) |
| Hero / featured image | `_partials/func/GetFeaturedImage.html`, `page-header.html` | `customisation/hero-section.md` | `[~]` thin |
| Styles / custom CSS | `_partials/site-style.html`, `ananke.custom_css` | `customisation/styles.md` | `[~]` partial |
| **Shortcodes** (`form-contact`, `page-index`) | `layouts/_shortcodes/*` | — | `[ ]` **missing** (linked but no page) |
| **Templates/layouts overview** | `layouts/*.html` | — | `[ ]` **missing** |
| **i18n / translations / language switcher** | `i18n/*` (26 langs), `_partials/i18nlist.html` | — | `[ ]` **missing** |
| **TOC + related content** | `_partials/menu-contextual.html` | — | `[ ]` **missing** |
| **Author block** | `_partials/author.html` | — | `[ ]` **missing** |
| **Tags / taxonomy / terms display** | `_partials/tags.html`, `taxonomy.html`, `terms.html` | — | `[ ]` **missing** |
| **Site navigation / menus** | `_partials/site-navigation.html`, `menu-contextual.html` | — | `[ ]` **missing** |
| **robots.txt by environment** | `layouts/robots.txt` | — | `[ ]` **missing** |
| **404 page** | `layouts/404.html` | — | `[ ]` **missing** |
| **Recent posts on home** (`ananke.show_recent_posts`) | `layouts/home.html` | — | `[ ]` **missing** |
| **Home content alignment** (`ananke.home.content_alignment`) | `params.toml` | — | `[ ]` **missing** |
| **Hooks debug/verbosity** (`ananke.hooks.verbosity`, `disable_messages`) | `_partials/filter.html`, `func/debug-cli.html` | partially in intro | `[~]` |

---

## 2. New pages to add (`prio` noted)

### Templates & layouts
* [ ] `prio:high` **`content/templates/_index.md` + page per layout** — explain which template
  renders what: `home.html`, `list.html`, `single.html`, `taxonomy.html`, `terms.html`,
  `404.html`, `summary*.html`, `robots.txt`. Map Hugo page kinds → Ananke template, and show how
  to override each in a site project.
* [ ] `prio:medium` **Summary variants** — `summary.html` vs `summary-with-image.html` and how
  `featured_image`/`images` selects between them.

### Shortcodes (currently linked from getting-started but **no page exists**)
* [ ] `prio:high` **`content/content/shortcodes.md`** — document built-in shortcodes:
  * `form-contact` (params: `action`; i18n labels; Formspree example) — note: partly covered in
    `configuration/general.md`, move/duplicate into a proper Shortcodes page.
  * `page-index` (groups `site.RegularPages` by section, sorted by weight) — example + output.
  * Note the docs-only `since` shortcode is a documentation helper, not shipped by the theme.

### i18n / localization
* [ ] `prio:high` **`content/configuration/languages.md`** — list the 26 bundled languages,
  how to set site language, how to override/add translation strings, and the language switcher
  (`_partials/i18nlist.html`). Show a multilingual `hugo.toml` example. Link to each i18n key
  used by the theme (pull from `i18n/en.toml`).

### Content features
* [ ] `prio:high` **Featured images deep-dive** — document `GetFeaturedImage` resolution order:
  `featured_image` (front matter) → first of `images[]` → page-bundle resource matching
  `*feature*`/`*cover*` → empty. This is non-obvious and high-value. Merge with hero-section.
* [ ] `prio:medium` **TOC & related content** — `toc: true` front matter, related-content
  configuration (Hugo `[related]`), and how `menu-contextual.html` renders both.
* [ ] `prio:medium` **Author block** — `_partials/author.html` inputs (front matter / params).
* [ ] `prio:medium` **Tags & taxonomies** — `tags.html`, taxonomy/term pages, front matter.

### Configuration
* [ ] `prio:high` **Expand `configuration/seo.md`** (currently a stub) — Hugo internal templates
  used, Open Graph/Twitter cards, `head-additions.html`, favicons (`site-favicon.html`).
* [ ] `prio:medium` **Custom CSS / params** — `ananke.custom_css` (array, loaded by
  `site-style.html`), `ananke.pages.show_date`, `ananke.show_date`, `ananke.show_recent_posts`,
  `ananke.home.content_alignment`. **Note:** several of these are referenced in layouts but are
  **not present in the theme's default `config/_default/params.toml`** — see §4.

---

## 3. Hooks & filters — finish the system docs `prio:critical`

The concept page (`hooks-and-filters/introduction.md`) is good, but:

* [ ] **`hooks-and-filters/all.md` is an empty table.** Populate it. Today the theme wires
  **exactly one** real hook point:
  * `article/section-link` — called in `layouts/single.html:20` (extended call, passes page `.`).
* [ ] `prio:critical` **Reconcile docs vs. reality.** The introduction uses example hook names
  (`site-header`, `before-content`, `after-content`, `head-end`) that are **not actually wired
  into the theme**. Either (a) clearly label them as illustrative examples, or (b) better — open
  a theme task to add those hook points and then document them as real. Coordinate with
  [`todo.md`](todo.md) (the footer-hooks item #349 is related).
* [ ] Document the path quirk: hook name maps to `layouts/_partials/hooks/<name>.html` (note the
  `_partials` vs `partials` naming used by the new Hugo layout system).
* [ ] Document `ananke.hooks.verbosity` (`debug|info|warning|error`, default `error`) and
  `ananke.hooks.disable_messages = ["unused_hooks"]`, sourced from `_partials/filter.html` and
  `_partials/func/debug-cli.html`.
* [ ] Document the collector/dump debug helpers (`func/hooks/collector*.html`) for theme devs.

---

## 4. Theme-side follow-ups discovered during the scan (implement in **ananke** repo)

These are theme issues that block accurate docs — track here, fix on a theme branch:

* [ ] `prio:high` **Undocumented because undefined:** `ananke.custom_css`, `ananke.pages.show_date`,
  `ananke.show_date` are read by layouts but missing from `config/_default/params.toml`. Either
  add them with documented defaults or remove the reads. (We can't write "dummy safe" docs for
  params that aren't shipped as defaults.)
* [ ] `prio:medium` Add real hook points to match the documented examples (see §3) — or trim the
  examples. Pairs with `todo.md` footer-hooks work.
* [ ] `prio:low` Confirm `layouts/terms.html` status (already flagged as possibly-unused in
  `todo.md` #941) before documenting taxonomy/term rendering.

---

## 5. Documentation display / UX fixes (implement in **documentation** repo)

The docs site is itself built with Ananke, so these are added as site-level overrides
(`../documentation/layouts/`, `../documentation/assets/`). **No render hooks currently exist** in
either repo.

* [ ] `prio:high` **Copy-to-clipboard button on code blocks.** Add
  `layouts/_markup/render-codeblock.html` (Hugo code-block render hook) that wraps highlighted
  code with a copy button, plus a small JS in `assets/` and a button style in `highlighting.css`.
  Respect existing chroma/gruvbox-light styling.
* [ ] `prio:high` **Heading anchor links.** Add `layouts/_markup/render-heading.html` that emits
  `id`s plus a hover "#" anchor. Then the hand-written bullet TOCs at the top of pages can be
  replaced by real in-page links (and eventually `toc: true`).
* [ ] `prio:medium` **Auto TOC.** Once heading anchors exist, switch the manual top-of-page bullet
  lists (getting-started, social-media-networks, hooks intro, etc.) to the theme's TOC.
* [ ] `prio:medium` **External-link render hook** (optional) — the `cookbook/socials/external-links.md`
  recipe shows CSS for `target=_blank` indicators; consider shipping a `render-link.html` recipe.
* [ ] `prio:low` Verify `since` shortcode links resolve to real release tags.

---

## 6. Cookbook expansion `prio:medium`

`cookbook/` currently has only `socials/external-links.md`. Add recipes that show real,
copy-paste solutions:

* [ ] Add a hero image without a featured_image (cover-resource convention).
* [ ] Add a custom social network end-to-end (config + icon + share particles).
* [ ] Add a footer/analytics snippet via a hook.
* [ ] Override a single theme partial in a site project.
* [ ] Multilingual site quick recipe.
* [ ] Custom colour scheme via `custom_css`.

---

## 7. README & CONTRIBUTING for the documentation repo `prio:high`

* [ ] **`../documentation/README.md`** — currently just an All-Contributors badge. Write a proper
  README: what the repo is (the docs site for Ananke, built *with* Ananke), local dev setup
  (`hugo server --environment development` builds against the local `../ananke` via the module
  replacement in `config/development/module.toml`), how content is structured, link to the live
  site, and the contribution flow. Model the tone on the theme's own `README.md`.
* [ ] **`../documentation/CONTRIBUTING.md`** — does not exist. Create one covering: prerequisites
  (Hugo extended version per `module.toml`, Node for markdownlint), how to run locally, the
  branch/PR convention, the markdownlint/cspell rules already configured in `package.json`/
  `.vscode`, the "dummy safe" page skeleton (from §0), and how `since`/version tagging works.
  Reference the theme's `CONTRIBUTING.md` for shared conventions where sensible.

---

## 8. Quality / consistency pass `prio:medium`

* [ ] Fix broken/relative internal links (e.g. `getting-started.md` links to
  `content/shortcodes` which doesn't exist; several links point at the old GitHub **wiki**
  instead of the new docs pages — e.g. in `social-media-networks.md`).
* [ ] Normalise migration notes pointing at `theNewDynamic` → `gohugo-ananke` URLs.
* [ ] Ensure every page has `date`, `weight`, and (where relevant) `since` front matter so
  section ordering is deterministic.
* [ ] Run `npm run lint:markdown` and `lint:links` clean before each PR.

---

## Suggested order of attack

1. **§7 README + CONTRIBUTING** (small, unblocks contributors, quick win).
2. **§5 display fixes** (copy buttons + heading anchors) — improves *every* page immediately.
3. **§3 hooks `all.md` + reconciliation** (highest-value missing content; one real hook today).
4. **§2 missing high-prio pages**: shortcodes, languages, templates overview, featured images.
5. **§4 theme-side param cleanup** (so the remaining config pages can be written truthfully).
6. **§2/§6 medium pages + cookbook**, then **§8 quality pass**.

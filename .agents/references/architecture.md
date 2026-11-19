# Theme architecture

## Rendering and extension points

`layouts/baseof.html` defines the `title`, `favicon`, `head`, `header`, `main`, and `footer` blocks. It calls hooks at `body-start`, `header-before`, `header-after`, `main-before`, `main-after`, `footer-before`, `footer-after`, and `body-end`.

`partials.Include "hook.html" (dict "hook" "<name>" "context" .)` delegates to `layouts/_partials/filter.html`. The filter renders `layouts/_partials/hooks/<name>.html` when present, with caching when `cache` or `cached` is true. Otherwise it logs the unused hook. Prefer hook partials for site extensions where an appropriate hook exists, rather than overriding core partials.

`layouts/_partials/func/hooks/collector.html` records calls; a deferred template in `baseof.html` dumps them. `[ananke.hooks]` controls `disable_messages` and `verbosity`; `func/debug-cli.html` writes build-log messages.

Helper partials in `layouts/_partials/func/` often return values instead of markup, including `IsShown`, `ShowDate`, and `GetFeaturedImage`.

## Configuration and assets

Theme options use the `[ananke]` namespace in `config/_default/params.toml`. When migrating an option into this namespace, preserve the old top-level fallback and emit an `[ananke]` deprecation warning with `fmt.Warnf`; see `custom_css` in `layouts/_partials/site-style.html`.

`site-style.html` combines Tachyons, theme CSS in `assets/ananke/css/`, generated social hover colours, and `ananke.custom_css`. It uses `css.Build`, minifies outside development, and fingerprints production output. Custom CSS entries may resolve to assets, static or external URLs, or HTML partials returning CSS. Sass/SCSS is no longer compiled. Read `DESIGN.md` before changing visual styles or tokens; the theme uses Tachyons first.

JavaScript in `layouts/_partials/site-scripts.html` provides progressive enhancement. Controls that need JavaScript stay `hidden` until the script reveals them, so pages without JavaScript have no inert controls.

Social network definitions live under `[ananke.social.networks.*]`. Sites select networks with `ananke.social.follow.networks` and `ananke.social.share.networks`. SVG icons live in `assets/ananke/socials/`.

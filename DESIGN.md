---
version: "2.13.0"
name: "Ananke Hugo Theme"
description: "Tachyons-first visual system for the Ananke Hugo theme, with Ananke defaults, Hugo configuration hooks, and theme-specific components layered on top."
colors:
  primary: "#000000"
  secondary: "#555555"
  tertiary: "#357EDD"
  neutral: "#F4F4F4"
  on-primary: "#FFFFFF"
  on-secondary: "#FFFFFF"
  on-tertiary: "#FFFFFF"
  text: "#555555"
  text-strong: "#111111"
  text-muted: "#777777"
  link: "#00449E"
  link-hover: "#001B44"
  surface: "#FFFFFF"
  surface-subtle: "#F4F4F4"
  surface-raised: "#FFFFFF"
  border: "#CCCCCC"
  border-subtle: "#EEEEEE"
  overlay-dark: "#000000"
  code-background: "#222222"
  code-text: "#DDDDDD"
  social-icon: "#BABABA"
  social-icon-hover: "#6B7280"
  black: "#000000"
  near-black: "#111111"
  dark-gray: "#333333"
  mid-gray: "#555555"
  gray: "#777777"
  silver: "#999999"
  light-silver: "#AAAAAA"
  moon-gray: "#CCCCCC"
  light-gray: "#EEEEEE"
  near-white: "#F4F4F4"
  white: "#FFFFFF"
  dark-red: "#E7040F"
  red: "#FF4136"
  light-red: "#FF725C"
  orange: "#FF6300"
  gold: "#FFB700"
  yellow: "#FFD700"
  light-yellow: "#FBF1A9"
  purple: "#5E2CA5"
  light-purple: "#A463F2"
  dark-pink: "#D5008F"
  hot-pink: "#FF41B4"
  pink: "#FF80CC"
  light-pink: "#FFA3D7"
  dark-green: "#137752"
  green: "#19A974"
  light-green: "#9EEBCF"
  navy: "#001B44"
  dark-blue: "#00449E"
  blue: "#357EDD"
  light-blue: "#96CCFF"
  lightest-blue: "#CDECFF"
  washed-blue: "#F6FFFE"
  washed-green: "#E8FDF5"
  washed-yellow: "#FFFCEB"
  washed-red: "#FFDFDF"
  bluesky: "#1185FE"
  email: "#555555"
  facebook: "#3B5998"
  github: "#6CC644"
  gitlab: "#FC6D26"
  hackernews: "#FF4000"
  instagram: "#E1306C"
  keybase: "#3D76FF"
  linkedin: "#0077B5"
  medium: "#0077B5"
  mastodon: "#6364FF"
  pinterest: "#E60023"
  reddit: "#FF4500"
  rss: "#FF6F1A"
  slack: "#E01E5A"
  stackoverflow: "#F48024"
  telegram: "#0088CC"
  tiktok: "#FE2C55"
  tumblr: "#35465C"
  whatsapp: "#25D366"
  xing: "#026466"
  x-twitter: "#000000"
  youtube: "#CD201F"
typography:
  body:
    fontFamily: "Avenir, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.5"
  body-serif:
    fontFamily: "Georgia, Times, serif"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.5"
  display:
    fontFamily: "Athelas, Georgia, serif"
    fontSize: "3rem"
    fontWeight: "400"
    lineHeight: "1.25"
  hero-title:
    fontFamily: "Avenir, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: "200"
    lineHeight: "1.25"
  headline:
    fontFamily: "Athelas, Georgia, serif"
    fontSize: "3rem"
    fontWeight: "400"
    lineHeight: "1.25"
  subheadline:
    fontFamily: "Avenir, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: "100"
    lineHeight: "1.5"
  nav:
    fontFamily: "Avenir, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: "400"
    lineHeight: "1.5"
  label-caps:
    fontFamily: "Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: "700"
    lineHeight: "1.5"
    letterSpacing: "0.1em"
  code:
    fontFamily: "Menlo, Consolas, Monaco, monospace"
    fontSize: "0.875rem"
    fontWeight: "400"
    lineHeight: "2"
spacing:
  none: "0"
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "2rem"
  xl: "4rem"
  xxl: "8rem"
  xxxl: "16rem"
  content-gutter: "1rem"
  content-gutter-wide: "2rem"
  section-y: "2rem"
  section-y-large: "4rem"
rounded:
  none: "0px"
  sm: "0.125rem"
  md: "0.25rem"
  lg: "0.5rem"
  xl: "1rem"
  pill: "9999px"
components:
  body:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
  site-header-with-image:
    backgroundColor: "{colors.overlay-dark}"
    textColor: "{colors.on-primary}"
    typography: "{typography.hero-title}"
    padding: "{spacing.xl}"
  site-header-plain:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.light-silver}"
    typography: "{typography.hero-title}"
    padding: "{spacing.lg}"
  site-navigation:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.nav}"
    padding: "{spacing.md}"
  site-footer:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.light-silver}"
    typography: "{typography.nav}"
    padding: "{spacing.md}"
  content-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    padding: "{spacing.lg}"
  summary-card:
    backgroundColor: "{colors.surface-raised}"
    textColor: "{colors.text}"
    typography: "{typography.body}"
    padding: "{spacing.lg}"
  article-title:
    textColor: "{colors.text-strong}"
    typography: "{typography.headline}"
  article-body:
    backgroundColor: "{colors.surface-subtle}"
    textColor: "{colors.text}"
    typography: "{typography.body-serif}"
  read-more-button:
    backgroundColor: "{colors.light-gray}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  read-more-button-hover:
    backgroundColor: "{colors.moon-gray}"
    textColor: "{colors.text-strong}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm}"
  tag-pill:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.black}"
    rounded: "{rounded.pill}"
    padding: "{spacing.md}"
  contact-form:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.black}"
    typography: "{typography.body}"
  form-input:
    backgroundColor: "{colors.light-gray}"
    textColor: "{colors.black}"
    padding: "{spacing.md}"
  form-submit:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    padding: "{spacing.md}"
  code-block:
    backgroundColor: "{colors.code-background}"
    textColor: "{colors.code-text}"
    typography: "{typography.code}"
    padding: "{spacing.lg}"
  contextual-menu:
    backgroundColor: "{colors.light-gray}"
    textColor: "{colors.text}"
    padding: "{spacing.md}"
  social-link:
    textColor: "{colors.social-icon}"
    size: "32px"
  social-link-hover:
    textColor: "{colors.social-icon-hover}"
    size: "32px"
---

<!-- markdownlint-disable MD041 -->

## Overview

Ananke is a production-ready Hugo starter theme whose visual system is intentionally **Tachyons-first**. The default design language is fast, responsive, accessible, and utility-driven: templates compose Tachyons classes directly, while Hugo parameters let sites override key classes and append custom CSS.

Treat Tachyons v4 as the baseline. The theme ships the Tachyons bundle first, then code styles, Hugo internal-template styles, social icon styles, and finally Ananke's local overrides. Custom site CSS is appended after those layers, so project-specific decisions should build on the tokens and class hooks documented here rather than replacing the base system wholesale.

The default experience is neutral and editorial: an Avenir-like sans-serif shell, serif article bodies, Athelas headlines, black or image-backed headers, near-white page backgrounds, white content cards, and low-chrome links/buttons. Accessibility and performance are more important than decorative complexity.

## Colors

### Token hierarchy

* **Primary (`#000000`)** is the default structural color for headers, navigation, footers, and primary submit actions.
* **Secondary (`#555555`)** maps to Tachyons `mid-gray` and is the default reading color for most text via the `text_color` parameter.
* **Tertiary (`#357EDD`)** maps to Tachyons `blue` and is available for links and accent states, while content links use `dark-blue` and change to `navy` on hover or focus. Many structural links inherit black/gray and rely on `dim` or hover utilities.
* **Neutral (`#F4F4F4`)** maps to Tachyons `near-white` and is the default body background through `avenir bg-near-white`.
* **Surface (`#FFFFFF`)** is used by summary cards and content blocks.
* **Border (`#CCCCCC`)** maps to Tachyons `moon-gray`, used for low-contrast separators and bordered buttons.

### Tachyons defaults

Use the full Tachyons color vocabulary when adding template classes: grayscale (`black`, `near-black`, `dark-gray`, `mid-gray`, `gray`, `silver`, `light-silver`, `moon-gray`, `light-gray`, `near-white`, `white`), accent colors (`dark-red`, `red`, `light-red`, `orange`, `gold`, `yellow`, `purple`, `pink`, `green`, `navy`, `blue`), and washed backgrounds (`washed-blue`, `washed-green`, `washed-yellow`, `washed-red`). Prefer these named utilities over one-off hex values in templates.

Tachyons opacity colors such as `black-60`, `white-90`, and `white-70` are part of the operational design even though the machine-readable token schema stores solid sRGB hex values. Use them for overlays and text-on-image hierarchy: default cover dimming is `bg-black-60`, hero title text is `white-90`, and supporting hero text is `white-80`.

### Ananke additions

Ananke adds social-network brand colors through configuration. Follow-link hover colors are generated at build time from `params.ananke.social.networks.*.color`; use those configured colors instead of hard-coding social brand values in templates. Base social icons are `#BABABA`, with a neutral hover fallback of `rgb(107, 114, 128)`.

Site authors can override structural color classes with Hugo params such as `background_color_class`, `cover_dimming_class`, `text_color`, and `body_classes`. These params should contain Tachyons utility classes by default.

## Typography

Tachyons typography utilities define the scale and families. Ananke's defaults layer these choices on top:

* **Body shell:** `avenir` with `bg-near-white` on the `<body>`.
* **Article body:** `serif f4 lh-copy nested-links`, overridable with `post_content_classes`.
* **Headlines:** `athelas` for article and summary headings; site hero headings use lightweight sans-serif (`fw2`).
* **Navigation:** lightweight sans-serif with responsive sizes (`f5 f4-ns` for menu items and `f3 fw2` for the site title/logo text).
* **Metadata:** `helvetica tracked ttu` and small text sizes for section labels, dates, reading time, and word count.
* **Code:** dark preformatted blocks with `.875rem` code text and generous line height.

Keep typography sparse. Use Tachyons font-size utilities (`f1` through `f7`, `f-subheadline-l`), line-height utilities (`lh-title`, `lh-copy`), font-weight utilities (`fw1`, `fw2`, `fw4`, `b`), and tracking utilities (`tracked`, `ttu`) before adding custom CSS.

## Layout

Ananke uses Tachyons spacing, width, flexbox, and breakpoint suffixes as its layout language.

### Global shell

* Base layout: `<body class="ma0 avenir bg-near-white ...">`, a header block, `<main class="pb7">`, and a footer.
* The body receives state classes such as `production`, `development`, `is-page`, `is-section`, and `page-{content-base-name}` for targeted overrides.
* Main content leaves a large bottom padding (`pb7`) so pages breathe above the footer.

### Header and navigation

* Image headers use `cover bg-top` by default with a dark dimming layer (`bg-black-60`).
* Plain headers use `bg-black`, with medium/large breakpoint padding (`pb3-m pb6-l`).
* Hero copy is centered on large screens (`tc-l`) with responsive vertical and horizontal padding (`pv4 pv6-l ph3 ph4-ns`).
* Navigation uses `flex-l center items-center justify-between`, becoming a horizontal layout at large breakpoints.

### Content structures

* Lists and home content use centered measures (`measure-wide`, `measure-wide-l`) and responsive gutters (`ph3 ph5-l`, `pa3 pa4-ns`).
* Recent posts and list pages use flex wrapping (`flex-ns flex-wrap justify-around`) and responsive card widths (`w-100 w-30-l`).
* Single posts use a centered layout capped at `mw7` or `mw8`; pages with a table of contents or related content split into `w-two-thirds-l` content plus `w-30-l` aside.
* Summary-with-image layouts use a responsive row with a `w-40-ns` image column and `w-60-ns` text column.

### Responsive pattern

Prefer Tachyons responsive suffixes (`-ns`, `-m`, `-l`) rather than custom media queries. Start single-column and progressively enhance at `not-small`, `medium`, and `large` breakpoints.

## Elevation & depth

The theme is deliberately flat. Depth is created with contrast, spacing, and hover transitions rather than shadows.

* Cards sit on `bg-white` over `bg-near-white`.
* Separators use low-contrast borders such as `bb b--black-10` or `ba b--moon-gray`.
* Hover effects use Tachyons transitions such as `dim`, `grow`, `hover-bg-moon-gray`, `hover-bg-black`, and `hover-shadow` sparingly.
* Cover images gain depth through the dark overlay class, not through drop shadows.

Avoid adding heavy box shadows, gradients, or glass effects unless a site-specific custom CSS layer explicitly asks for them.

## Shapes

Tachyons border-radius classes are the default shape system:

* `br0` / `rounded.none` for the default square editorial surface.
* `br1`, `br2`, and `br3` for small interface elements; Ananke's read-more buttons use `br2`.
* `br-pill` for tags and pill-like metadata links.
* Images are normally square-cornered and responsive; use `cover`, `bg-top`, and width utilities rather than bespoke clipping.

The base visual language favours crisp rectangular layout with occasional soft controls.

## Components

### Site header

The site header has two states. With a featured image, the header becomes a cover image with a dimming overlay and white text. Without a featured image, it becomes a solid structural band using `background_color_class` or `bg-black`. Header title defaults to `f2 f-subheadline-l fw2` and supporting text defaults to lightweight responsive copy.

### Navigation

Navigation contains the home link or logo, optional i18n links, main menu items, and social follow links. Menu links use white text with `hover-white` and no underline. Keep navigation content concise so the large-screen flex layout remains balanced.

### Footer

The footer mirrors the structural background class, contains copyright text, and repeats social follow links. Footer text should remain subdued (`white-70`) to keep it secondary to page content.

### Article and page content

Single posts use Athelas headlines, tracked metadata, optional sharing links, optional dates, optional reading-time/word-count metadata, the article body, tags, comments, and an optional aside. The article body should keep `lh-copy`, `nested-copy-line-height`, and `nested-links` so prose remains readable and linked content inherits consistent styling.

Plain pages use a simpler centered article with `cf pv5 ph3 ph4-ns mw7` and `f4` copy.

### Lists, summaries, and cards

Summaries are white cards with gray metadata and black linked titles. Read-more controls are small bordered buttons with light-gray backgrounds and moon-gray hover states. List pages and recent-post sections arrange cards responsively with Tachyons width utilities.

### Contextual menus

Table-of-contents and related-content asides use `bg-light-gray pa3` with nested list resets and link styling. Keep them compact, secondary, and aligned with the article gutter.

### Forms

The contact shortcode uses a sans-serif black form, bold small labels, light-gray borderless inputs, a gray italic requirements note, and a full-width black submit control that animates to black hover/shadow treatment. Maintain visible labels and required attributes.

### Social links

Social links use inline SVG icons at `32px` by `32px`, inheriting `currentColor`. The base color is neutral gray; network-specific hover colors are generated from configuration when follow networks are enabled. The new-window icon appears only on hover via opacity.

### Code blocks

Preformatted blocks are dark (`#222222`) with light text (`#DDDDDD`), horizontal scrolling, `1.5em` padding, and a line height of `2`. Preserve overflow behavior so long code lines remain accessible.

## Do's and don'ts

### Do

* Use Tachyons utility classes as the first choice for layout, spacing, color, typography, and responsive behavior.
* Prefer existing Hugo params (`body_classes`, `background_color_class`, `cover_dimming_class`, `featured_image_class`, `text_color`, `post_content_classes`, `custom_css`) for site-level customization.
* Keep structural defaults accessible: high contrast in headers, readable prose measures, visible labels, and semantic landmarks.
* Add custom CSS after the base stack only when utility classes or params cannot express the requirement cleanly.
* Preserve responsive suffix patterns and RTL conditionals when modifying templates.

### Don't

* Don't replace Tachyons with a competing utility system inside theme templates.
* Don't hard-code social-network hover colors in CSS; use the configured network color generation.
* Don't add decorative depth, gradients, or animation that conflicts with the flat, fast starter-theme aesthetic.
* Don't remove `nested-links`, `nested-copy-line-height`, `lh-copy`, or measure utilities from prose layouts.
* Don't assume black/white overlays are optional on image headers; they are the contrast mechanism for hero text.

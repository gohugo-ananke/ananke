---
applyTo: "layouts/**/*.html"
---

# Template changes

* Put user-visible strings in `i18n/*.toml`, with English source strings in `i18n/en.toml`, and read them with `lang.Translate`.
* Preserve progressive enhancement: controls that require JavaScript must remain hidden until the script enables them.
* Read `.agents/references/architecture.md` before changing rendering, extension hooks, or asset integration.

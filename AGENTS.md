<!-- markdownlint-disable-next-line dnb-title-case-style -->
# Repository Guidelines

Ananke is a Hugo theme distributed as `github.com/gohugo-ananke/ananke/v2` and as a Git submodule. Theme defaults live in `config/_default/`; this repository is not a complete content site.

* Preserve unrelated changes. Understand, verify, and take responsibility for contributed material.
* Use npm and retain `package-lock.json`.
* Update `gohugo-ananke/documentation` for user-facing changes.
* Use Conventional Commits and focused branches targeting `development`. Only promotion from `development` targets `main`. Use rebase or squash merges only; keep history linear.
* Do not inspect, check, or commit `scratch/`. Read `.agents/instructions/scratch.instructions.md` before working there under explicit user instructions.

## Instruction discovery

`AGENTS.md` is the canonical entry point. Read files below `.agents/instructions/` whose `applyTo` patterns match the files involved in a task; these scoped rules form part of the canonical instructions.

* Before development, validation, local previews, pull requests, or releases, read `.agents/references/development.md` and the relevant sections of `CONTRIBUTING.md`.
* Before changing rendering, hooks, configuration behaviour, CSS processing, or social integrations, read `.agents/references/architecture.md`.
* When working on Netlify configuration, features, or deployment, read `.agents/references/netlify.md`.

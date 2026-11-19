---
agent: agent
description: This prompt is used to select, analyse, and fix or triage one GitHub issue from the Ananke repository, including related documentation updates where appropriate.
---

# Analyse and fix or triage an Ananke issue

You are working on the `gohugo-ananke/ananke` GitHub repository.

Goal: select, analyse, and fix or triage one GitHub issue from Ananke, including related documentation updates where appropriate.

## Input handling

* If the user provides an issue ID, use that specific issue: `https://github.com/gohugo-ananke/ananke/issues/$ID`
* If the user does not provide an issue ID, inspect the open issues at `https://github.com/gohugo-ananke/ananke/issues?q=%20is%3Aissue%20is%3Aopen%20label%3Astatus%3Arecheck%20sort%3Acreated-asc` and choose one suitable issue to work on. Prefer older issues to newer issues.
* Wherever an instruction contains `$ID`, replace `$ID` with the actual selected issue number.

## Repositories

* Theme repository: `https://github.com/gohugo-ananke/ananke`
* Documentation repository: `https://github.com/gohugo-ananke/documentation`

## Required actions

1. Check the issue list or the specific issue URL.
2. Select the issue:
   * If `$ID` is provided, select issue `$ID`.
   * If no `$ID` is provided, choose one open issue that appears narrow, verifiable, and fixable.
3. Analyse the issue.
4. Print a concise summary of the issue.
5. Print a proposed solution.
6. Determine whether the issue is fixable:
   * If it is fixable, continue with the implementation.
   * If it is not fixable, explain why clearly and stop. Do not hallucinate a solution.
7. Check the theme repository contribution instructions:
   * Prefer `CONTRIBUTING.md`.
   * If the repository uses another documented contribution file such as `CONTRIBUTIONS.md`, follow that instead.
8. Create a branch in `https://github.com/gohugo-ananke/ananke/` according to the contribution instructions.
   * If no better branch name is obvious, use `issues/$ID`
9. Add the changes required to fix the issue in the theme repository.
10. Determine whether documentation is required:
    * If the change affects user-facing behaviour, configuration, templates, parameters, installation, migration, troubleshooting, examples, or how-to workflows, update the documentation repository.
    * If the change does not require documentation, state why clearly.
11. If documentation is required, work in `https://github.com/gohugo-ananke/documentation`
12. Check the documentation repository contribution instructions, writing style, structure, and existing conventions before making documentation changes.
    * Keep the voice, terminology, formatting, and instruction style already used in the documentation repository.
    * Do not invent a new documentation style.
    * Prefer extending existing pages over creating new pages, unless a new page is clearly justified.
13. Add or update documentation and how-tos in the documentation repository.
    * Explain the changed or fixed behaviour.
    * Add examples where useful.
    * Add migration notes or troubleshooting notes when relevant.
    * Interlink the documentation and theme repositories where appropriate.
    * Link documentation changes back to the relevant Ananke issue or pull request when useful.
14. Create a documentation branch named `documentation/ananke-$ID`
15. Create a pull request in the documentation repository against its documented default development branch.
    * If the documentation repository specifies a contribution target branch, use that branch.
    * If no target branch is documented, inspect the repository branches and choose the appropriate active development branch.
    * Do not assume `main` is the correct target unless the documentation repository clearly uses it for contributions.
16. Create a pull request in the theme repository against the `development` branch.
    * Always use `development` as the PR base branch for `gohugo-ananke/ananke`.
    * Do not open theme pull requests against `main`.
    * Do not push directly to `main` or `development`.
17. Link the pull request to the issue or related discussion.
    * Use `Closes #$ID`, `Fixes #$ID`, or another appropriate GitHub closing keyword when the PR fully resolves the issue.
    * Use `Refs #$ID` when the PR is related but does not fully close the issue.
    * If a documentation PR is created, cross-link it from the theme PR and cross-link the theme PR from the documentation PR.
18. Explain the fix, including:
    * What changed.
    * Why it fixes the issue.
    * Any files touched.
    * Any documentation files touched.
    * Any links added between repositories.
    * Any assumptions made.
    * Any verification performed.

## Clarification rule

* If required information is missing and cannot be inferred safely, ask for clarification before making repository changes.
* If the issue is ambiguous but still triageable, state the ambiguity and propose the safest next action.
* Do not invent repository structure, implementation details, documentation structure, test results, or maintainer intent.
* Do not make documentation changes without first checking the documentation repository's existing structure, voice, and contribution instructions.

## Output format

1. `Selected issue`
2. `Issue summary`
3. `Proposed solution`
4. `Implementation`
5. `Documentation`
6. `Pull request`
7. `Verification`
8. `Notes or blockers`

## Behaviour requirements

* Be precise and evidence-based.
* Prefer small, reviewable changes.
* Always open theme PRs against `development`, never against `main`.
* Do not push directly to protected branches.
* If direct pushes are blocked or inappropriate, create a branch and open a pull request.
* If documentation is needed, create a separate documentation PR in `gohugo-ananke/documentation`.
* Name documentation branches as `documentation/ananke-$ID`.
* Keep documentation additions consistent with the documentation repository's existing voice, structure, and instructions.
* Interlink theme and documentation PRs where appropriate.
* If tooling reports an error, explain the error and adapt the workflow.
* If the selected issue is better closed as invalid, duplicate, already fixed, or not planned, explain the probable close reason and do not create a fake fix.

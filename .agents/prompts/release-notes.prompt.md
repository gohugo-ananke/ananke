---
title: Create Ananke release notes
description: Create release notes for the Ananke theme from repository changes
agent: agent
tools: ['changes', 'search/codebase', 'web/githubRepo', 'github']
---

Create release notes for the next Ananke release based on the current repository state, merged pull requests, commits, changed files, and existing changelog entries.

## Goal

Write clear, user-facing release notes for the Ananke theme.

The release notes must explain:

* what changed
* what users need to update
* whether the release contains breaking changes
* which Hugo version is required
* where users can read more
* which changelog entries belong to this release

The result must be suitable for publishing as a GitHub release note, documentation page, or changelog announcement.

The release title in GitHub will create the main H1 heading. Do not output an initial `# Release Notes` heading. Start with `## Breaking changes`.

## Required output structure

Use this exact structure:

```markdown
## Breaking changes

## Further notes

## Further reading

## Requirements

* Hugo v0.161+

## Changelog
```

Do not remove headings. If a section has no relevant content, write a short sentence stating that there are no additional notes for that section.

## Primary breaking change

The release notes must include this breaking change prominently:

```markdown
BREAKING CHANGE: Ananke is now using the latest css.Build functionality of Hugo. This means that the old SASS/SCSS pipeline is removed and you need to update your build process if you were relying on it.
```

Rewrite the wording only if it improves clarity, but keep the meaning intact.

The breaking change section must explain:

* the old SASS/SCSS pipeline has been removed
* Ananke now relies on Hugo's current `css.Build` functionality
* users with custom build scripts, asset pipelines, or theme overrides may need to update their setup
* users should check their Hugo version before upgrading
* users should review any custom SASS/SCSS overrides or imports

## Requirements

The requirements section must include:

```markdown
* Hugo v0.161+
```

If repository files indicate a more specific or newer requirement, report the conflict clearly instead of silently changing the version.

## Changelog

The changelog section must be generated from repository evidence.

First, identify the previous release tag and the new release target. If a previous release tag is not provided, use the latest reachable Git tag as the start point and `HEAD` as the end point.

Run this command from the repository root to generate the raw changelog entries:

```bash
previous_tag="${PREVIOUS_TAG:-$(git describe --tags --abbrev=0)}"
current_ref="${CURRENT_REF:-HEAD}"

repo_url="$(
  git config --get remote.origin.url |
    sed -E 's#^git@github.com:#https://github.com/#; s#\.git$##'
)"

git log "${previous_tag}..${current_ref}" \
  --date=format-local:'%Y-%m-%d %H:%M %z' \
  --pretty=format:'%H%x1f%h%x1f%s%x1f%ad%x1f%an%x1f%ae' |
  sort -r -t "$(printf '\037')" -k4,4 |
  awk -F "$(printf '\037')" -v repo_url="${repo_url}" '
    function github_user_from_email(email) {
      if (email ~ /@users\.noreply\.github\.com$/) {
        sub(/^.*\+/, "", email)
        sub(/@users\.noreply\.github\.com$/, "", email)
        return email
      }

      return ""
    }

    function escape_markdown(value) {
      gsub(/\[/, "\\[", value)
      gsub(/\]/, "\\]", value)
      return value
    }

    {
      full_hash = $1
      short_hash = $2
      title = $3
      date_time = $4
      author_name = escape_markdown($5)
      author_email = $6

      user = github_user_from_email(author_email)

      if (user != "") {
        author = "[" author_name "](https://github.com/" user ")"
      } else {
        author = author_name
      }

      printf "- [%s](%s/commit/%s) %s (%s by %s)\n", short_hash, repo_url, full_hash, title, date_time, author
    }
  '
```

The command must create one Markdown list item per commit in this format:

```markdown
* [HASH](commit-url) Title (yyyy-mm-dd HH:ii timezone by [authorname](author-profile-url))
```

Use the short commit hash as the link text and link it to the full commit URL.

Issue and pull request references in commit titles should remain in GitHub-autolinkable format, for example `#123`. Do not rewrite them into manual links unless the repository tooling provides reliable issue URLs.

Link the author name to the GitHub profile when the username can be derived reliably from a GitHub noreply email address. If no GitHub username can be derived, keep the author name as plain text.

Sort changelog entries by commit date descending.

After generating the raw commit list, review it and group or summarise items when appropriate, but preserve the raw commit list if the release note needs a complete audit trail.

Include concise bullet points grouped by type when possible:

* Breaking changes
* Features
* Fixes
* Documentation
* Internal changes
* Dependencies
* Removed or deprecated functionality

Each changelog item should be user-facing. Avoid low-level commit noise unless it affects users or maintainers.

## Further notes

Use this section to explain practical upgrade impact.

Include notes about:

* build configuration changes
* removed SASS/SCSS assumptions
* CSS processing changes
* compatibility concerns
* migration considerations
* theme customisation impact
* anything users should test after upgrading

Do not invent migration steps. If the repository does not contain enough information, add a clearly marked "Needs confirmation" bullet.

## Further reading

Add links or references to relevant documentation, for example:

* Ananke documentation pages
* Hugo `css.Build` documentation
* relevant pull requests
* relevant issues
* migration notes
* changelog files
* release comparison links

Use repository links when available. Do not invent URLs.

## Style rules

Write in clear British English.

Use direct, practical language.

Avoid marketing language.

Avoid vague phrases such as "various improvements" unless the repository evidence is also vague.

Avoid emojis.

Avoid typographic punctuation. Use plain apostrophes, quotes, hyphens, and normal punctuation.

Use Markdown only.

Use `*` for unordered list items.

Use inline code formatting for filenames, commands, config keys, function names, and Hugo features.

## Evidence rules

Base the release notes on repository evidence.

Check at least:

* recent commits
* merged pull requests
* changed files
* changelog files
* documentation updates
* configuration files
* asset pipeline files
* theme build files
* Hugo module or dependency configuration
* README or migration notes

If something is unclear, include it under a "Needs confirmation" bullet instead of guessing.

## Final output

Return only the completed release notes.

Do not include analysis, explanations, or implementation notes outside the release note document.

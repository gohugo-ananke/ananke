---
title: "Scratch directory"
applyTo: "scratch/**"
description: Rules for the scratch directory, which holds temporary files only.
---

The `scratch` directory is for temporary files only. It is not part of the project.

* Files in `scratch` MUST NEVER be committed.
* Agents MUST NEVER analyse files in `scratch` unless the user explicitly asks for it.
* Agents MUST NOT run linting, checks, or any other error checks on `scratch`. Do not report or fix problems in these files.
* Agents MAY create new files in `scratch`, either on their own or when the user asks for it.
* Agents MUST NOT change existing files in `scratch` without explicit instructions from the user.
* Agents MAY delete files that they created themselves, but only after the user confirms the deletion.

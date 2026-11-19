# AI guidelines

This policy is informed by the AI guidelines introduced in [Node.js PR #62105](https://github.com/nodejs/node/pull/62105) and the [Human Voice policy, version 1.0.0](https://ai-policy.dev/policies/human-voice/1.0.0). It is a project-specific policy and applies to this repository.

## Core principle

**Contributions are owned by people, not tools.**

AI may be used for any part of the contribution workflow, including exploring the project, producing code or other material, and submitting contributions. However, responsibility cannot be delegated.

When you submit or assume responsibility for a contribution, it becomes your work and your responsibility. An AI tool is not an author, reviewer, source, or excuse for an incorrect change.

Every contribution must be understood, verified, and owned by the person responsible for it. That person must be able to explain what changed, how it works, and why it improves the project.

The answer to "Why is this an improvement?" must never be "I'm not sure, the AI did it."

A contribution that the responsible person does not understand or cannot defend may be closed without further review.

## Using AI for contributions

AI may assist, but it must not replace judgement, understanding, or ownership.

When using AI as part of a contribution:

* **Understand the project first.** Do not skip familiarisation with the relevant parts of the project. Treat generated analysis as a hypothesis, not a fact, and verify it against the actual repository.
* **Own everything you submit.** You are responsible for every material part of the contribution, regardless of how it was produced. Do not include something that you do not understand.
* **Do not submit blind generation.** Review generated code, tests, documentation, configuration, data, translations, images, and other material critically. Remove anything unnecessary, incorrect, or unsupported.
* **Explain the improvement.** You must be able to explain the problem, the reasoning behind the proposed solution, and why the result is appropriate for this project.
* **Keep logical commits.** Structure commits clearly and coherently. Do not place unrelated generated changes into one commit. Follow the repository's commit-message and contribution guidelines.
* **Test thoroughly.** Run the relevant automated checks and personally verify the affected behaviour where manual verification is applicable. Do not assume that an output is correct because a tool produced it.
* **Protect existing tests.** Do not remove or alter tests without understanding what they verify and why the change is necessary. Check that generated tests validate the intended behaviour rather than merely reproduce the current implementation.
* **Verify claims and sources.** Check factual claims against the repository or relevant authoritative sources. Confirm that links exist and support the statements for which they are cited. An AI response is not an authoritative source.
* **Check provenance and licensing.** Do not submit generated material if you cannot reasonably establish that you have the right to contribute it. Investigate output that appears copied, unusually specific, or inconsistent with the surrounding work.
* **Protect sensitive information.** Do not provide secrets, personal data, private repository content, security reports, or other confidential information to an external tool unless the project and the applicable service explicitly permit it.
* **Stay accountable.** If you take responsibility for a contribution, you are expected to follow through. Respond to feedback using your own judgement, iterate as necessary, and either complete or close the contribution yourself.

Automated and agent-submitted contributions are permitted. Each such contribution must have an identifiable person who assumes responsibility for it and satisfies this policy. Automation does not transfer responsibility from that person to the tool.

## Scratch directory

The `scratch` directory holds temporary files only. Linting, checks, and any other error checks MUST NOT be done on the `scratch` directory. For the full rules, see [`.agents/instructions/scratch.instructions.md`](.agents/instructions/scratch.instructions.md).

## Speak for yourself

Communication must represent your own understanding and judgement.

AI may assist with drafting, editing, spelling, grammar, or translation. However, comments, issues, pull request descriptions, commit messages, and review replies must communicate what you understand and intend to say.

When using AI for communication:

* **Use your own voice.** Check, edit, and adopt the text as your own before submitting it. Clear and imperfect human communication is preferable to polished text that does not reflect the contributor's understanding.
* **Do not outsource your judgement.** Do not ask a tool to decide what you think or to conduct a discussion on your behalf.
* **Be concise and accurate.** Generated summaries are often verbose, repetitive, or incorrect. Keep only what is necessary and verified.
* **Complete templates properly.** Provide the information requested by issue and pull request templates. A generated summary is not a substitute for actual evidence and reasoning.
* **Respond to review yourself.** Base responses on your own understanding and judgement. Do not quote an AI as an authority or use it to avoid answering a reviewer's question.

## Disclosure

Routine disclosure of AI assistance is not required. The tools used do not reduce or transfer the contributor's responsibility.

Maintainers may ask how a result was produced, checked, or verified when that information is relevant to reviewing the contribution. The responsible contributor must answer such questions accurately.

Disclosure does not excuse a failure to understand, test, verify, or take responsibility for a contribution.

## Final note

AI can help explore options, produce material, and reduce friction. It does not replace responsibility, judgement, or human communication.

If your name is on a contribution, or you have assumed responsibility for it, you must understand it, verify it, and be prepared to defend it.

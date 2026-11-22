#!/usr/bin/env node
/**
 * Checks the documentation item of a pull request description.
 *
 * The pull request template asks for a checked "Documentation" item and a
 * value after "Documentation PR or reason:", on the same line or on the next
 * non-empty line. Reads the description from the PR_BODY environment variable
 * and exits with status 1 when either part is missing.
 */

/**
 * @param {string} body Pull request description.
 * @returns {string[]} Problems; empty when the item is complete.
 */
export function checkDocumentationItem(body) {
  const text = (body || "").replace(/<!--[\s\S]*?-->/g, "");
  const problems = [];
  if (!/^\s*[*-]\s+\[[xX]\]\s+Documentation\b/m.test(text)) {
    problems.push(
      'Check the "Documentation" item in the pull request template.',
    );
  }
  const lines = text.split(/\r?\n/);
  const index = lines.findIndex((line) =>
    /^\s*Documentation PR or reason:/i.test(line),
  );
  let value = "";
  if (index >= 0) {
    value = lines[index].replace(/^\s*Documentation PR or reason:/i, "").trim();
    for (let i = index + 1; !value && i < lines.length; i += 1) {
      if (lines[i].trim()) value = lines[i].trim();
    }
  }
  if (!value || /^#/.test(value)) {
    problems.push(
      'Add the documentation pull request or a reason after "Documentation PR or reason:".',
    );
  }
  return problems;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const problems = checkDocumentationItem(process.env.PR_BODY);
  for (const problem of problems) console.error(`::error::${problem}`);
  process.exit(problems.length ? 1 : 0);
}

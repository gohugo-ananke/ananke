import assert from "node:assert/strict";
import { test } from "node:test";
import { checkDocumentationItem } from "../../.github/scripts/check-documentation-item.mjs";

const item = (mark) => `* [${mark}] Documentation: linked the pull request.`;

test("a checked item with a pull request link passes", () => {
  const body = `${item("x")}\n\nDocumentation PR or reason: gohugo-ananke/documentation#95`;
  assert.deepEqual(checkDocumentationItem(body), []);
});

test("a reason on the next line passes", () => {
  const body = `${item("X")}\n\nDocumentation PR or reason:\n\nInternal refactoring only.`;
  assert.deepEqual(checkDocumentationItem(body), []);
});

test("an unchecked item fails", () => {
  const body = `${item(" ")}\n\nDocumentation PR or reason: none needed, tests only`;
  assert.equal(checkDocumentationItem(body).length, 1);
});

test("a missing reason fails", () => {
  const body = `${item("x")}\n\nDocumentation PR or reason:\n\n## Other heading`;
  assert.equal(checkDocumentationItem(body).length, 1);
});

test("a checked item inside a comment does not count", () => {
  const body = `<!-- ${item("x")} -->\n\nDocumentation PR or reason: docs#1`;
  assert.equal(checkDocumentationItem(body).length, 1);
});

test("an empty description fails twice", () => {
  assert.equal(checkDocumentationItem("").length, 2);
});

import assert from "node:assert/strict";
import { test } from "node:test";
import { checkDiagnostics } from "../support/prepare-site.mjs";

test("clean diagnostics pass", () => checkDiagnostics("Total in 20 ms\n"));
test("unexpected path warnings fail", () => {
  assert.throws(
    () => checkDiagnostics("WARN  Duplicate target path /posts/\n"),
    /Unexpected Hugo/,
  );
});
test("unexpected deprecations fail", () => {
  assert.throws(
    () => checkDiagnostics("WARN  Feature is deprecated\n"),
    /Unexpected Hugo/,
  );
});
test("expected diagnostics are required exactly once", () => {
  checkDiagnostics("WARN  Intentional warning\n", ["Intentional warning"]);
  assert.throws(
    () => checkDiagnostics("", ["Intentional warning"]),
    /exactly one/,
  );
  assert.throws(
    () =>
      checkDiagnostics(
        "WARN  Intentional warning\nWARN  Intentional warning\n",
        ["Intentional warning"],
      ),
    /exactly one/,
  );
});
test("expected diagnostics cannot hide another warning", () => {
  assert.throws(
    () =>
      checkDiagnostics("WARN  Intentional warning\nWARN  Unexpected\n", [
        "Intentional warning",
      ]),
    /Unexpected Hugo/,
  );
});

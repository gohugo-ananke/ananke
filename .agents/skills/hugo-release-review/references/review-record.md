# Review record and recovery

`../review-state.json` is a version-controlled review ledger, separate from Hugo support declarations. Paths in records are relative to the repository root. The checked-in empty ledger deliberately makes no claim about past reviews.

## State fields

* `schema_version`: `1`. Stop on an unknown schema; do not reset or reinterpret it silently.
* `coverage_start`: first stable release in the requested coverage, normalised as `vMAJOR.MINOR.PATCH`, or `null` before the first run.
* `last_reviewed_version`: last release in the contiguous completed prefix of the discovered stable releases from `coverage_start`, or `null` when the first release is incomplete. Contiguous means adjacent published releases, not every theoretically possible version number.
* `reviews`: one record per release, sorted numerically. Retain completed history and incomplete findings. Required record fields are shown below; use `null` only where the evidence is not yet available.

Example shape only; these sample results are not a review of a real release:

```json
{
  "version": "v0.150.0",
  "release_url": "https://github.com/gohugoio/hugo/releases/tag/v0.150.0",
  "reviewed_at": "2026-11-22T00:00:00Z",
  "theme_base_commit": "<full commit checked at the start of the review>",
  "status": "incomplete",
  "minimum_hugo": "v0.160.0",
  "summary": "Assessment awaits a required compatibility check.",
  "findings": [
    {
      "source": "<upstream release or change URL>",
      "affected_paths": ["layouts/example.html"],
      "decision": "fix",
      "reason": "<relevance and compatibility evidence>",
      "evidence": ["<changed paths, test record, or issue URL>"],
      "issue_url": null
    }
  ],
  "validation": [
    {
      "command_or_inspection": "<exact command or source/path inspection>",
      "hugo_version": null,
      "result": "unavailable",
      "evidence": "<log path or concise result and reason>"
    }
  ],
  "blockers": ["<required next action>"]
}
```

Use `status` values `complete` or `incomplete`, and finding decisions `no-impact`, `fix`, or `issue`. Use validation results `passed`, `failed`, `unavailable`, or `not-required`. Include an explicit `no-impact` finding and reason when nothing applies; an empty findings list cannot establish completion. Record relevant dirty paths as well as the base commit when reviewing uncommitted changes. Do not invent future commit hashes; replace local references with durable commit, pull request, or issue links when they become available. Log paths may remain local, but retain a concise result in the ledger.

## Completion and recovery rules

1. Parse and check the whole file before acting: known schema, valid versions, unique records, required fields, valid statuses/decisions/results, and consistent coverage/checkpoint. Complete records must contain dispositions and evidence, have no blockers, and have a verified issue URL for each `issue` finding. Applied fixes must have passed relevant validation. Stop and report invalid or conflicting state instead of repairing it by guessing.
2. Discover all stable releases and freeze the target before initialising a new coverage range. If discovery fails, leave the coverage and checkpoint unchanged. Retain the run's ordered release list, target, retrieval time, and sources in a dated report beside this ledger under `reports/` when a review actually runs. Do not create a placeholder report now.
3. Compute missing work by comparing that list with complete records. Recompute the checkpoint as the longest completed prefix from `coverage_start`; it is never just the highest version in `reviews`. The ledger alone cannot prove that release discovery was complete.
4. If an older patch release appears within coverage, mark the gap and recompute the checkpoint before proceeding. Complete later records remain available and need not be repeated. An explicit earlier start extends coverage only after validating that start against the discovered releases; lower the checkpoint as needed and review the new gap. Do not move `coverage_start` forward to hide work.
5. Persist incomplete findings, changed files, drafts, and blockers on interruption. Stop at the first unresolved release; do not advance past it. A rerun inspects existing local changes, tests, and both open and closed issues before repeating any external action. If interrupted after issue creation but before saving its URL, recover it by search marker and content.
6. Mark a release complete only when every finding is either a verified no-impact disposition, a tested compatible fix, or a verified created/reused issue. A no-impact or issue-only review can use source/repository inspections instead of runtime checks; explain why builds were not required. A deferred implementation with an actual issue is complete as a review, but must still be reported as outstanding work.
7. Write the updated JSON to a temporary sibling file, validate it, compare the original with the version read at the start, and rename the temporary file over it only if no other writer changed it. Use a single writer; if concurrent work is detected, stop and reconcile records. Preserve existing records. A local save survives interruptions, but it reaches other checkouts only when included in an authorised commit.
8. If a previously recorded release disappears, has unavailable evidence, or its disposition conflicts with current code, report the conflict and investigate before asserting complete coverage. An explicit re-review retains the old evidence in the dated report and replaces the current record only after reassessment.

## Validation scenarios

Use synthetic release lists and a temporary ledger outside the working tree to check workflow decisions. Do not open issues or change the real checkpoint during these checks.

| Scenario | Required outcome |
| --- | --- |
| Empty state, no start | Ask for a start; leave state unchanged. |
| Start supplied as `0.150.0` | Normalise to `v0.150.0`; include that published release. |
| Tags include `v0.99.0`, `v0.100.0`, and `v0.100.2` | Numeric order; do not invent `v0.100.1`. |
| Draft, RC, and later stable are returned on different pages | Exclude draft/RC, fetch all pages, and freeze the highest stable. |
| Complete first review, interrupted second, complete third | Checkpoint stays at the first; resume second and retain third. |
| New older patch appears between completed releases | Recompute the prefix and review the missing patch. |
| Explicit start is later than an existing gap | Resume the gap; do not skip it. |
| Earlier explicit start, or start absent from published releases | Extend coverage for a valid earlier start; reject a missing start without substitution. |
| Replacement introduced above the declared minimum | Issue; no immediate migration or minimum bump. |
| Compatible replacement at the minimum and target | Fix only after both builds and output checks pass. |
| Required binary absent, failed validation, or issue API denied | Incomplete fix/draft blocks progress, or remove the fix and verify a tracking issue. |
| Matching issue is closed or creation was interrupted | Inspect the resolution/search marker; do not create a duplicate automatically. |
| No new releases, and record/list agree | No-op; report the checkpoint without rewriting history. |
| Bad JSON, duplicate records, unsupported schema, or concurrent edit | Stop and preserve evidence; never reset to an empty ledger. |

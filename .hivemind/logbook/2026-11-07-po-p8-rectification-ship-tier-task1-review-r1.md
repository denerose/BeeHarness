# Review: P8 rectification + ship-tier — task 1 (plan-checks: exists satisfied + size note)

**Role:** project-orchestrator (dispatched stage agent, bee-review skill)
**Reviewer:** cold-dispatched reviewer, fresh context
**Plan section:** `.hivemind/plans/2026-11-07-po-p8-rectification-ship-tier.md` Task 1 (items 11, 14 + `--run` honesty + D7 dispositions), plan @ 3b54ae7 — worktree copy verified identical to main
**Verify record:** `.hivemind/logbook/2026-11-07-po-p8-rectification-ship-tier-task1-verify-r1.md` (PASS, checks-run 1)
**Scope reviewed:** `git diff 44eae33..HEAD` (4a25649 + e283ada) — `scripts/plan-checks.sh`, `tests/plan-checks.test.mjs`, 5 suggestion files, verify record. Nothing else changed; tree clean.

## Claim vs record (mechanical)

- Task 1 checkboxes: all unchecked; no checked box lacks its record (reverse — record ahead of boxes — is the loop's Record step, which runs after this review per bee-loop step 6; state-source is checkboxes and `bee task show` reads draft/0-of-8 consistently).
- Verify record exists with PASS for the plan's task-1 check (`node --test tests/plan-checks.test.mjs`, expect exit 0); reproduced independently — 13 tests, exit 0.
- Scope matches the machine header's `files:` for task-1 exactly; the suggestion-file changes and logbook entry are the plan's own named steps.

## Verdict

**Approve** — implementation matches the plan's intent on all four code steps and both disclosed deviations; one should-fix (suggestion-file residue) recommended before merge, no blocking findings.

## Blocking

None.

## Should fix

- `.hivemind/suggestions/planned/2026-11-01-po-p7-close-hindsight.md` (deleted in 4a25649; items at old lines 25 and 34) — the file carried FOUR suggestions; its own Outcome dispositioned only #2 (landed 79ba574) and #1 (routed to P8, item 11). #3 (design-drift mid-phase wants a standing re-pull step) and #4 (worker commit claims need git-log verification) are dispositioned nowhere — searched the P8 design note, `suggestions/` (live + planned), `inbox.toon`, parking lot, and logbook: no trace. D7's rule is "stamped + deleted **as their items land**" — two of this file's items never landed anywhere, and the deletion (riding this branch to main) removes their only live record. Suggested fix: in the fix round, re-file both items with their content (recoverable verbatim from git history at 44eae33) — as new suggestion files or `bee inbox add` entries awaiting keeper triage — so D7's disposition trail survives the deletion.

## Deviations judged (both hold to intent)

1. **Grep pattern matches both reporter forms** (`scripts/plan-checks.sh:135`, `^[#ℹ] tests 0$`). The plan's literal text names only the TAP form (`# tests 0`), but this repo runs node v24.20.0, whose default reporter prints `ℹ tests 0` — reproduced in an empty dir (`node --test tests/*.test.mjs` → `ℹ tests 0`, exit 0). The plan's own pinned test would fail against the single-form pattern; the dual form is load-bearing, not scope creep. Anchoring (`^…$`) is correct — `# tests 10` cannot false-match.
2. **`unset NODE_TEST_CONTEXT` before the suite run** (`scripts/plan-checks.sh:133`). Reproduced: with the marker inherited, a nested `node --test` prints *no summary at all* and exits 0 — exactly the silent pass the `--run` honesty step exists to prevent; the pinned test itself runs under `node --test`, so without the unset the note would never print. The convention is already established in `bin/bee.js:2895-2899` and `bin/bee.js:4992-4995` (same rationale, same comment shape).

## Notes

- **Dogfooded the script on the P8 plan itself** (882 lines): `note size: 882 lines — large plan; gate cost rises` fires, non-blocking, and the create-target handling is exercised by the new tests. The four prose findings that run emits are pre-existing (identical output from the 44eae33 version of the script): the ephemeral-prose checker's own pattern line (`scripts/plan-checks.sh:87`) and test fixture content (`tests/plan-checks.test.mjs:73`) self-match, as does bee-plan SKILL.md quoting the banned words. Not this task's regression — but any future plan targeting these files as modify-targets will show permanent self-referential prose findings; worth a dedicated small fix someday (e.g. skip the checker's own pattern line).
- **Stamp+delete mechanics**: a single-commit stamp-then-delete nets to pure deletion in git; the disposition record for the four deleted files lives in 4a25649's commit body (which carries it, naming items and 3d2f4ba). That is the only place it can live under the plan's "stamp first, delete in the same commit" wording — executed as written. Future tasks should know the commit body IS the stamp for planned/ deletions.
- **D4 pre-loop claim verified**: 3d2f4ba ("Land P8 pre-loop law clauses and kit consolidation") touches AGENTS.md (marker-surgery clause present in editing discipline; union-merge suite clause at AGENTS.md:119) and collapses the design note (−318 lines) — items 15/22/23 were in fact landed pre-loop, so their files were correctly deleted rather than awaiting this task.
- **`suite_out` is discarded on the failure path** (`scripts/plan-checks.sh:132-138`): on `finding suite: command failed` the captured output is deleted rather than quoted. The plan didn't ask for a tail; a one-line tail in the finding would make sandbox suite failures debuggable. Also, `grep -Eq '^[#ℹ]…'` depends on a UTF-8 locale for the `ℹ` form (C locale drops to the TAP form only); harmless here, worth knowing if the script ships to bare-env consumers.
- **Test coverage exceeds the plan's pins** (good): the missing-create-target no-note case and the non-directory-ancestor-still-a-finding case pin the "ancestor walk unchanged" clause the plan stated but didn't explicitly pin. The 501-line fixture (511 actual) and short-fixture pair pin the size boundary (`> 500`, spec-conformant).

# Review: P8 Task 2 — bee phase close: row flip, design stamps, flag split

<!-- machine
role: project-orchestrator
date: 2026-11-07T17:40:00+11:00
verdict: approve
task: task-2
plan: .hivemind/plans/2026-11-07-po-p8-rectification-ship-tier.md
diff: 44eae33..HEAD (71b4726 + ab408bf)
verify: .hivemind/logbook/2026-11-07-po-p8-rectification-ship-tier-task2-verify-r1.md
-->

**Role:** project-orchestrator (dispatching loop's role — dispatched reviewer)
**Reviewer:** cold-dispatched bee-review worker
**Plan section:** [Task 2, items 17/20; D5, D7](/home/saphron/BeeHarness/.hivemind/plans/2026-11-07-po-p8-rectification-ship-tier.md)
**Verify record:** [task2-verify-r1](/home/saphron/BeeHarness-task-phase-close/.hivemind/logbook/2026-11-07-po-p8-rectification-ship-tier-task2-verify-r1.md) — PASS, checks-run 1

## Verdict

Approve — no blocking findings; two should-fixes named below are worth a fix round before the phase's own close uses this path, and both are small.

## Claim vs record (mechanical, ran first)

- Verify record exists and matches the established `bee verify` shape (thin machine header, identical to the P6 records); its plan reference `@ 3b54ae7` is accurate — the plan file is unchanged since that commit.
- No task-2 boxes are ticked in the plan (main or worktree copy) — no state claims ahead of evidence. The review report (this file) is the missing half of task-2's evidence; the loop ticks and moves state from it.
- Reproduced both check commands: `node --test tests/bee-phase.test.mjs` → 31/31 pass; full suite `node --test tests/*.test.mjs` → 352/352 pass (bee.js is shared across test files — no cross-test fallout).
- D7 disposition verified: the LIVE suggestion file `2026-11-02-po-close-flag-counts-kickoff-separately.md` gained its Outcome stamp (accurate: split counts + in-phase-only rule) and was left in place; nothing under `suggestions/planned/` was touched by this task.

## Blocking

None.

## Should fix

- `bin/bee.js:5075` (`phaseRowFind`) — the row scan does not skip `TEMPLATE.md`, and `bee init` seeds **both** `.hivemind/phases/TEMPLATE.md` and `<project>.md` verbatim (bin/bee.js:531–545), each carrying the example row `| P1 | … | planned | …` (`.hivemind/phases/TEMPLATE.md:12`). Node's byte sort puts `TEMPLATE.md` before any lowercase-starting project file (`['BeeHarness.md','TEMPLATE.md','acme.md']`), so a consumer repo's first close — `bee phase close 1` — matches the TEMPLATE example row first and flips/note-edits the shipped template instead of the project's board (the harness repo itself is safe: `BeeHarness.md` sorts first and holds the real rows). Suggested fix: exclude template files from the scan — `names.filter((nm) => nm !== 'TEMPLATE.md')` before the sort-iterate loop.

- `bin/bee.js:5149–5158` + `bin/bee.js:5187` — crash-recovery drops the row annotations. If the atomic row write fails **after** design.sh stamped the docs (the `err` path at :5183–5189 promises "repair the write, then re-run — the row flip is idempotent"), the re-run finds the docs already `implemented`, design.sh refuses, `stamped` stays empty, and the row flips **without** its `(implemented @ sha)` annotations — exit 0, gap permanent (the done row no-ops every later run). The doc machine blocks keep the sha, but the board — the queue's source of truth, and the surface P4/P5/P6 rows annotate — silently loses the mirror. Suggested fix: when design.sh refuses, read the doc's machine block; if it reads `status: implemented` + `merge: <sha>`, push that entry into `stamped` with the recorded sha (recovery path), else keep the informational note as now.

## Notes

- D5 validated against real inventories, not just fixtures: over the actual P4/P5/P6 decision files the split yields P4 `0 front · 15 in-phase` → flag (correct — genuinely mid-phase-heavy), P5 `8 · 3` → no flag (exactly the false flag the suggestion complained about), P6 `10 · 9` → no flag (matches the P6 board's own note "front-loading held"). Real line shapes (`kickoff:`, `kickoff (via PP relay …)`, `plan-time:`, `review-driven (…)`, `dogfood (…)`) all classify as D5 intends; the `\b`-anchored prefix regex does not over-match.
- The upcoming real P8 close will exercise the refusal path, not the stamp path: all three P8-row designs are machine-`live` or blockless (`2026-11-01-pp-p8-rectification-inputs.md` live; `2026-11-01-pp-skill-authoring-kit.md` no block; `2026-11-02-pp-project-update-skill.md` live). Close will flip the row and print three informational refusals, landing no annotations — correct per spec, but the close ceremony should run `bee design pick-up` first if row annotations are wanted for P8.
- Annotation insertion lands before any existing non-stamp parenthetical: the P8 row's first design would read `` `…inputs.md` (implemented @ sha) (29-item inventory + close-step tidy pass)``. Functional (stamped-detection still reads it); cosmetic only.
- Idempotence holds as the plan demands: the re-close test pins board byte-identity through the already-merged + already-done interplay, and the uncommitted-flip case is unreachable (the clean-tree gate refuses it — the flip's "next: commit" instruction closes that loop). The escalations `—`-placeholder replacement (vs literal append) matches how the real board reads and is pinned by test.
- The three disclosed deviations all hold: (a) the stamped suggestion file is exactly the plan-named one; (b) the extra refusal test is additive and pins behavior the spec states; (c) the `cells.length < 9` non-template-row skip is a defensive informational, consistent with the plan's "never a failure" row handling.
- Escalations placeholder `none` (used once, by the done P0 row) would take the append path rather than replacement; unreachable today since done rows no-op. Only relevant if future rows adopt `none`.

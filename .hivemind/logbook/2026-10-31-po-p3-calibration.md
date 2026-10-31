# P3 calibration index — for PP's codification work

**Role:** project-orchestrator
**Date:** 2026-11-01

The observed-behavior input for P3's codification mandate (reviewer +
implementer formalization, orchestrator role) — pointers, not
contents:

- **First task-orc dispatch, end to end:**
  `/home/saphron/BeeHarness/.hivemind/logbook/2026-10-31-po-p3-dispatch-task-worktree-helper.md`
  — filled brief (all five contract bullets + safety lines worked),
  pass-back digest verbatim, two deviations + adjudications, boundary
  verdict HELD.
- **The shipped artifact's trail** (on `phase/3`, reaches main at
  merge): `…-task1-2-verify-r1.md` (task-orc's own merge-level
  verify), `…-task1-2-review-r1.md` (cold scout review, APPROVE,
  filed by task-orc — the no-worker-agent-type constraint is itself
  calibration data for reviewer dispatch).
- **Phase review:**
  `/home/saphron/BeeHarness/.hivemind/logbook/2026-10-31-po-p3-phase-review-r1.md`
  — including the premature-checkbox finding (repaired `7e8c0a4`):
  the loop's own dispatcher violated ADR-006 under batch-editing;
  countermeasure = per-task checkbox updates, already adopted.
- **What the boundary test showed:** the dispatcher ran one full plan
  cycle without opening a source file; context cost of the dispatch
  was one digest (~40 lines) vs. P2's in-session loop (827-line plan
  + fix rounds in context). The ADR-011 hypothesis held on first
  contact — formalization gate is met pending the keeper's word.
- **Tooling born here:** `scripts/task.sh` (ADR-012 task tier),
  `skills/bee-loop/assets/dispatch-brief-template.md` (ADR-011 brief
  contract) — both candidates for reference in the formalized role
  files.
- **Open calibration questions:** nested-dispatch agent-type limits
  (scout vs worker for reviews); the plan-reviewer empirical
  sandbox-run technique (two gates this phase caught real bugs with
  it — now a suggestion: `2026-10-31-po-size-verification-across-the-loop.md`).

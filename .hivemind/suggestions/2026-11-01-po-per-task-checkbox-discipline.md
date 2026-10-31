**Date:** 2026-11-01
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** Closing P3, the dispatcher batch-edited plan
checkboxes with a partition slice ("everything after `## Task 4`"),
which silently included Task 5 — five boxes got checked for work not
yet done (verify record, phase review, merge, calibration index,
phase close) and the false claims landed on main (commit `50aac74`).
The phase review caught it (`2026-10-31-po-p3-phase-review-r1.md`,
Blocking #1); repaired in `7e8c0a4`. The inverse also occurred: Tasks
1–3 stayed unchecked despite done work (batching deferred). No data
was lost and no gate was bypassed — but main is the governance tier;
a reader believed P3 closed when it wasn't.
**Suggestion:** Add one rule line to bee-loop's Record step (and
optionally bee-plan's format note): check off exactly the current
task's boxes at its commit — never batch-edit checkboxes across task
or section boundaries (partition slices are the trap: they sweep
everything downstream). Checked boxes are state claims (ADR-006);
each claim should land with its own evidence in the same commit.

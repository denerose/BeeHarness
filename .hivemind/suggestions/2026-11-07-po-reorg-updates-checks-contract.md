# Suggestion — reorg task left 5 stale check paths in the plan machine header

**Date:** 2026-11-07
**Project:** BeeHarness
**Role:** project-orchestrator — any role when the keeper asks
**Scope:** harness (bee-plan's format note or the reorg task class)

## What happened

Task 15 renamed `skills/session/` → `skills/thinking/` across the whole tree. The plan's machine header carries the `checks:` contract — cmd and files entries naming exact paths. Five task checks (8, 11, 12, 13, 14) still pointed at `skills/session/…`. Tasks 8-14 had already verified (their checks ran pre-reorg), so nothing caught the staleness until T12 ran late and its verify FAILed on a file-not-found. I fixed the paths at close as loop maintenance — but the fix itself broke task-15's rename check (it tests `! -e skills/session`, and my sweep converted that too), needing one more correction.

## Suggestion

The plan template or bee-plan's format section gains one line: "a task that renames or moves files named in the checks contract updates those entries in the same task." Alternative (script): plan-checks.sh or `bee verify` warns when a check's path resolves to a nonexistent file AND the plan has an un-dispatched task referencing it — the class is "tree changed after the contract was written."

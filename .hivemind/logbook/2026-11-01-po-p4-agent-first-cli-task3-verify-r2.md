# Verify r2 — P4 Task 3: fix round after review r1

**Role:** project-orchestrator (loop) · **Level:** phase (declared) ·
**Date:** 2026-11-01 · **Task branch:** task/4-park-store (fix round)

Review r1 (`.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task3-review-r1.md`)
verdict: fix first — 1 blocking, 1 should-fix, 7 notes. The blocking
finding is fixed on this branch; re-review r2 follows (blocking rule —
no waiver). The should-fix (PL-002 parked-by-section on main) is a
live-md hand-move the dispatcher performs BEFORE the live migration —
not a code change; recorded here so it is not lost.

## Fix (review BLOCKING): migration tests read the live md they stub out

tests/bee-park.test.mjs now reads a frozen snapshot
(tests/fixtures/parking-lot-v1.md — the branch-base lot) instead of
the repo's live parking-lot.md; a canary test pins the repo file's
shape (markdown lot OR pointer stub) so it stays honest before and
after the live migration.

Probe replicated (the reviewer's exact scenario): ran
`park migrate` against the worktree's repo md (stubbing it), then the
park battery — 32/32 green with the stub in place; md restored after.

| command | exit | note |
|---|---|---|
| `node --test tests/bee-park.test.mjs` | 0 | 32 pass, 0 fail (31 + canary) |
| `node --test tests/*.test.mjs` | 0 | 109 pass, 0 fail (full suite) |
| post-migration simulation (stub in repo md) | 0 | 32/32 green — the r1 failure mode is gone |
| `git status` after | clean | only the fix files |

## Dispatcher runbook item (review should-fix — NO code change)

Before the live migration: hand-move the PL-002 entry from the md's
Parked section to its Resolved section on main (keeper-resolved
2026-11-01 per fcba48a; the body already records the resolution —
the move makes the shape state-faithful so the migration stores it
resolved, not parked).

**Verdict:** PASS (fix round complete; re-review r2 dispatched per
the blocking rule)

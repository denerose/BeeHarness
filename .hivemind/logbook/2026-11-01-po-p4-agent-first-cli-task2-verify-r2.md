# Verify r2 — P4 Task 2: fix round after review r1

**Role:** project-orchestrator (loop) · **Level:** phase (declared) ·
**Date:** 2026-11-01 · **Task branch:** task/4-migrate-views (fix round)

Review r1 (`.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task2-review-r1.md`)
verdict: fix first — 1 blocking, 1 should-fix, 5 notes. Both fixed this
round. Blocking findings are always re-reviewed — review r2 follows
this record (no waiver claimed).

## Fix 1 (review BLOCKING): fallback trigger leaked non-keeper items into Needs the keeper

`bin/bee.js` cmdReport: `fromStore` now = store file EXISTS
(`fs.existsSync`), not "store yields ≥1 keeper ask". The store is the
source of truth whenever present; status-bullet fallback only when the
store is absent (pre-migration). The reviewer's probe scenario —
drained keeper queue, one open po item, rendered region in status —
now derives an EMPTY keeper list; the rendered region's view bullets
are never parsed as asks.

Regression test added (`drained keeper queue + rendered region → no
leak`): po item text absent from the zone, no IN-id lines. The
transition-safety test flipped to the corrected semantics (`store
exists with no open keeper items → derives empty from store` —
asserts bullets NOT parsed, Source = inbox.toon).

## Fix 2 (review should-fix): render marker embedded in item text

`bee inbox render` refuses (exit 1 + hand-fix instruction) when the
built view contains either render marker — mirrors the
unbalanced-marker refusal. Regression test added (`item text embedding
a render marker → refuse`).

| command | exit | note |
|---|---|---|
| `node --test tests/bee-render.test.mjs` | 0 | 18 pass, 0 fail (16 + 2 regression/flipped) |
| `node --test tests/*.test.mjs` | 0 | 77 pass, 0 fail (full suite, phase level) |
| `git status` after | clean | only intended files in this commit |

Notes 3-5 (duplicate regions, normItem tightening, suggestions-migration
coverage) stand as notes — no action this round.

**Verdict:** PASS (fix round complete; re-review r2 dispatched per the
blocking rule)

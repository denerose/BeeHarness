# Verify r2 — P4 Task 1: fix round after review r1

**Role:** project-orchestrator (loop) · **Level:** phase (declared) ·
**Date:** 2026-11-01 · **Task branch:** task/4-inbox-store (fix round)

Review r1 (`.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task1-review-r1.md`)
verdict: fix first — 0 blocking, 1 should-fix, 8 notes (all four named
deviations adjudicated accepted). Fix applied this round; re-review
WAIVED per the near-verbatim rule: the fix is the reviewer's suggested
change (mirror `inboxAddItem`'s single-line guard, bin/bee.js:530-532,
into `inboxDone`), and the regression test replicates the reviewer's
probe (newline note → exit 1, store byte-unchanged, still parseable).

## Fix (review SF1): `done --note` accepts embedded newlines → store corruption

`bin/bee.js` inboxDone: `--note` values containing `\n` now exit 1
with the house single-line error before any write. Regression test
added (`done --note rejects embedded newlines (store stays parseable)`)
asserting the reviewer's probe: exit 1, store byte-identical, list
still parses.

| command | exit | note |
|---|---|---|
| `node --test tests/bee-inbox.test.mjs` | 0 | 25 pass, 0 fail (24 + regression) |
| `node --test tests/*.test.mjs` | 0 | 59 pass, 0 fail (full suite, phase level) |
| `git status` after | clean | only intended files in this commit |

## Re-review waiver

Waived: reviewer's own suggested change applied near-verbatim; probe
replicated in the regression test above. No blocking findings existed.
Waiver recorded in the plan's task notes at checkbox-flip.

**Verdict:** PASS (fix round complete)

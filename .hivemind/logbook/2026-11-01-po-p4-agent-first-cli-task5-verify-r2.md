# Verify r2 — P4 Task 5: fix round after review r1

**Role:** project-orchestrator (loop) · **Level:** phase (declared) ·
**Date:** 2026-11-01 · **Task branch:** task/4-verify-cli (fix round)

Review r1 (`.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task5-review-r1.md`)
verdict: fix first — 0 blocking, 3 should-fix, 4 notes. All three fixed
this round; re-review WAIVED per the near-verbatim rule: each fix is the
reviewer's suggested change applied as suggested, and the regression
tests replicate the reviewer's probes. No blocking findings existed.

## Fix 1 (review SF1): timeout shadowed into the wrong fix line

`runCheckEntry` now checks timeout/signal FIRST (timeout = SIGTERM+error
or ETIMEDOUT code) — a hung command lands in "did not finish — repair or
shorten it", never the misleading "make it runnable". Timeout moved to a
call-time seam (`BEE_VERIFY_TIMEOUT_MS`, default 600000). Regression
test replicates the reviewer's probe: 300ms timeout + `sleep 5` →
`FAIL · timeout SIGTERM` + did-not-finish fix, no make-runnable line.

## Fix 2 (review SF2): no --full despite truncation

`bee verify --full` now untruncates the cmd/files field in TOON lines
(standing rule: --full wherever truncation exists; sibling subcommands
already carry it). Regression test: 120-char cmd truncated by default
(`… (+N chars)`), full with --full.

## Fix 3 (review SF3): unscoped full runs minted one entry per task

Unscoped runs now write NOTHING by default (output notes
`logbook: not written (unscoped run — pass --task <n> or --record to
evidence)`); `--record` fans out per-task entries (Task 10's phase-exit
dogfood uses --record); scoped `--task` runs write on success as the
loop's evidence, unchanged. Tests flipped: the old full-run-writes test
split into no-write-default + --record-fan-out; the --check-preview and
plan@hash tests scoped with --task (their contract paths).

| command | exit | note |
|---|---|---|
| `node --test tests/bee-verify.test.mjs` | 0 | 32 pass, 0 fail (29 + 3 regression) |
| `node --test tests/*.test.mjs` | 0 | 154 pass, 0 fail (full suite, phase level) |
| `git status` after | clean | only the fix files in this commit |

## Re-review waiver

Waived: all three fixes are the reviewer's suggested changes
near-verbatim; probes replicated in regression tests. No blocking
findings existed. Waiver recorded in the plan's task notes at
checkbox-flip.

**Verdict:** PASS (fix round complete)

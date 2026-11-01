# Verify r1 — P4 Task 6: `bee task` (work-item state moves)

**Role:** project-orchestrator (task-orc dispatch, verify round r1)
**Level:** phase (declared) · **Date:** 2026-11-01 ·
**Task branch:** task/4-task-cli (worktree
`/home/saphron/BeeHarness-task-task-cli`)

<!-- machine
role: project-orchestrator
date: 2026-11-01T14:40:44+11:00
verdict: FAIL
checks-run: 1
plan: .hivemind/plans/2026-11-01-po-p4-agent-first-cli.md @ be2c073
-->

| command | exit | note |
|---|---|---|
| node --check bin/bee.js | 0 | syntax |
| node --test tests/bee-task.test.mjs | 0 | 29 pass — AXI battery (bare-call fix line, unknown flag/subcommand, unknown state, non-numeric task, missing plan, headerless plan) + move semantics (unknown task + ids listed, declared-but-missing section, implemented move body byte-identical via hand-written expected literal, `task-1` form, forward chain last-wins, backwards refused + file unchanged, idempotent no-op, derived-done draft refusal) + done/record (no record refused + fix, nonexistent record refused, `--record` on non-done usage error, byte-exact tick with record stamped, repo-relative record display, idempotent done) + `--check` writes nothing + ledger robustness (malformed line, unknown ledger state) + parser compatibility (parsePlanHeader ignores ledger lines; plan-checks.sh clean over a ledger-carrying fixture) + show (aggregate, `0 tasks` definitive) |
| node bin/bee.js verify --plan .hivemind/plans/2026-11-01-po-p4-agent-first-cli.md --task 6 --record --role project-orchestrator | 1 | task-6 check itself **PASS** (`node --test tests/bee-task.test.mjs` · exit 0 · 1 file); links FAIL — see anomaly below (this entry's machine header + body are that run's emission, extended) |
| node bin/bee.js task show .hivemind/plans/2026-11-01-po-p4-agent-first-cli.md (read-only) | 0 | real-plan probe: `11 tasks · 6 done` — tasks 0–5 derived done from hand-ticked checkboxes (pre-Task-6 state, no ledger), tasks 6–10 draft; the live plan was never written from this worktree |

**Verdict:** FAIL (link-check rider; the task's own check passed)

## Anomaly (reproduced twice, deterministic)

```
links · 29 docs · FAIL · 3 links checked, 3 broken
.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task5-review-r1.md:105 → a
.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task5-review-r1.md:108 → y
.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task5-review-r1.md:109 → y.png
```

Root cause: the three "links" are the task-5 review record's OWN
inline-code examples — `` `[x](<a b.md>)` ``, `` `[x](y)` ``,
`` `![x](y.png)` `` — documenting the link matcher's latent edges
(a) and (c). Records ride task branches, so every P4 task branch's
`main..HEAD` diff carries that record, and every `bee verify` from
any P4 branch flags the review's own examples. The review note
prescribes the fix for exactly this trigger: "When any of these
bites: skip inline-code spans the way fences are skipped and give
`<...>` destinations their own capture branch."

Reproduction also surfaced a second latent edge in the same
family: `willWrite` counted only check-fails, so a scoped
link-FAIL (all checks passing) minted an unintended duplicate
entry (role `bee`) — contradicting the documented contract
"FAIL writes nothing unless --record".

## Disposition

Both are task-5 code, outside Task 6's letter; both block the
plan's own exit criteria (phase exit dogfoods `bee verify` → all
PASS; every later P4 dispatch verify hits the same three hits).
Repaired in this dispatch as a separate commit per the phase's
established deviation line (repairs to the plan's own exit
criteria — precedent: task-5's task3-record link repair), applying
the reviewer's prescribed fix + the willWrite contract fix, each
with probe-replicating regression tests. The duplicate uncommitted
entry the reproduction minted was removed (identical evidence
already recorded here; disclosed). Fix round → **r2 PASS**:
`.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task6-verify-r2.md`.

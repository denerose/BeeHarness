**Date:** 2026-11-02
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** Three of the P5 plan-gate's four rounds existed because corpus facts in the plan were hand-counted and partly wrong: the Role-line form counts (plan said plain-4; corpus is bold-61), the filename-regex coverage (17 of 70 files outside it), and plan-header coverage for compact membership (pre-convention plans carry no `phase:` header). Each round re-derived by census what a script could have derived at plan time — the gate earned its cost, but the same facts cost a round each.
**Suggestion:** A plan-time census helper the planner runs over the real corpus before writing claims: given a filename regex + a logbook dir, emit counts (task-tier matches, machine-block coverage, Role-form breakdown, verdict-line coverage) plus flags for referenced-but-headerless plans and `checks:` files-list entries that don't exist yet. Could be a `plan-checks.sh --census` mode or a `bee plan census` stub. Gate rounds then judge interpretation, not arithmetic.

## Outcome (2026-11-07)
Landed in P8 Task 7 as `scripts/plan-census.sh` per D13 —
scripts-over-skills (ADR-014): the skill names the step (bee-plan
Format now says run the census and quote its numbers before
corpus claims), the script does the counting. Emits per-plan
rows (lines, machine block, phase, tasks) and corpus counts
(headerless referenced plans, Role-form breakdown, verdict-line
coverage).

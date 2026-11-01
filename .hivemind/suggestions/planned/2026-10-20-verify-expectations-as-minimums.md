**Date:** 2026-10-20
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** In pilot bee-loop #1 the plan's verify step declared
an exact grep count (`project-orchestrator` → `2`) that was wrong on
first run (actual 3 — the drafter undercounted occurrences). The check
still proved its intent (replacement happened) but forced a disclosed
plan correction mid-loop.
**Suggestion:** In `skills/bee-plan/assets/plan-template.md` and/or
bee-plan rule 3, guide doc-task verification steps to state grep
expectations as minimums (`≥ 2`) unless the exact count IS the contract
(e.g. detecting a duplicate). One line in the template's verify-step
example plus one sentence in bee-plan rule 3 covers it.

## Outcome (2026-11-01)
Routed to the P8 skill pass — bee-plan rule 3 / plan template line
(state grep expectations as minimums unless the count IS the
contract). Design note: 2026-11-01-pp-p8-rectification-inputs.md.

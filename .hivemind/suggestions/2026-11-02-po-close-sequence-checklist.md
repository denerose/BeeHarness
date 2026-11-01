**Date:** 2026-11-02
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** P5's close needed steps no skill or template names: assembling the decisions-inventory file (format reverse-engineered from the P4 precedent file — and it still failed twice: bare `phase:` header lines are rejected, the parser wants `#` comments), then after `bee phase close` the phase-row flip and both design stamps (`design.sh pick-up` + `implement`) were done by chasing P4's close-commit trail (P4: merge 1a78a35 + stamp 4de5126 + row 828ff09). `bee phase close` gates, merges, rests, deletes, pushes — but leaves row + designs + (undocumented) inventory to memory of precedent.
**Suggestion:** Codify the full close sequence. Best: extend `bee phase close` to do all of it (validate/assemble the decisions inventory from the plan's decision records, flip the row, stamp designs). Minimum: bee-loop's completion step names the checklist in order — inventory file (with its format) → `bee phase close` → row flip → design stamps → status note → push — so no successor re-derives it from git archaeology.

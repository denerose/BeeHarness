**Date:** 2026-11-01
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** The P4 plan's gate review needed three rounds: r1 FAIL (2 blocking + 10 should-fix), r2 timed out at 600s before writing its report — but its partial work yielded the six realest findings of the arc (the timed-out reviewer independently found the structure-map miss, the root divergence, the fan-out problem). r3 with 900s + "write the report even if incomplete" passed cleanly. Every task's first work review was also "Fix first" (0 approve-first across 11 tasks) — the reviews were finding real things, but the round overhead was consistent.
**Suggestion:** Make 900s + explicit "write the report even if incomplete" the default for cold-dispatched gate reviews. The bee-plan-review skill or the dispatch-brief template should carry this. The evidence: the timed-out 600s round still produced the most impactful findings; a reviewer who dies with an unwritten report wastes the entire dispatch. A complete-but-partial report from the timed-out round would have been more useful than the timeout was.

## Outcome (2026-11-01)
Routed to the P8 pass — dispatch-brief template line (900s +
write-even-if-incomplete default for cold gate reviews). Design
note: 2026-11-01-pp-p8-rectification-inputs.md, item 13.

## Outcome (2026-11-07)
LANDED: the dispatch-brief template's Gate-dispatch block carries
the standing word (budget ≥ 900s; write the report even if
incomplete). Left live for the keeper's triage read per D7.

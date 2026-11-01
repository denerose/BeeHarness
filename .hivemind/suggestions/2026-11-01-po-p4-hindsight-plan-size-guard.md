**Date:** 2026-11-01
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** The P4 plan was 640+ lines / 11 tasks. The gate needed three rounds (one timed out); the review found 2 blocking + 10 should-fix on r1. The plan's size made a single-pass review expensive and pushed findings into fix rounds. P7's plan was similar (~600 lines). Both plans were for large phases with many tasks; the size is legitimate but the gate strain is real.
**Suggestion:** scripts/plan-checks.sh could add a plan-size note (e.g. "note: plan exceeds 500 lines — consider splitting or budget extra review time"). Not a blocking finding — a note in the core's output that the dispatcher sees. Alternative: bee-plan could flag the size at writing time and suggest splitting into plan + sub-plan. The signal doesn't prevent large plans; it makes the cost visible at the gate.

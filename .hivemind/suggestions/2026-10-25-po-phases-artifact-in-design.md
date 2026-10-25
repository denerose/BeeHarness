**Date:** 2026-10-25
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** The project's phase-level planning (build order;
P0, P1) predates the project-orchestrator role, so the phase list was
born as the pilot's tracking file, not as the standing top-level plan
a permanent orchestrator executes from. No defined step converts a
ratified design doc into forward phase rows — surfaced 2026-10-25 when
the orchestrator picked up with no "next" to follow (companion case:
`2026-10-25-po-orchestrator-what-next-gap.md`).
**Suggestion:** Make a top-level phases plan a required artifact of
early brainstorming and project design, maintained as phases complete:

1. **Design gate check** — bee-brainstorm's loop-back gate (and/or the
   design-doc template) gains a line: a ratified design carries, or
   immediately spawns, a phase decomposition the orchestrator can
   follow.
2. **Conversion step with an owner** — PP drafts the phase
   decomposition at design ratification; the orchestrator adopts it
   into `.hivemind/phases/<project>.md`; the keeper gates the first
   pick.
3. **Maintenance rule** — completing a phase (the loop's Record step)
   re-checks the decomposition against the design's ledger: new phases
   appended, spent ones marked done, drift escalated to the keeper.

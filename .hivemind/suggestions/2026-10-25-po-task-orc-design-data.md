**Date:** 2026-10-25
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** The P2 loop ran inside the project-orchestrator
session end-to-end. Consequence: task-level detail dominated the
session's context — 827-line verbatim-code plan carried in full, three
fix-round debug cycles (regex archaeology, fixture template-literal
bug, checkbox-edit fumbles) — while project-level duties were squeezed
to the margins (status/report maintenance deferred to phase end; PP's
concurrent ADR-009/010 digestion not engaged mid-loop). The
subagent-review pattern already isolated judgment well (three
reviewers worked cold from the plan with none of my context); what was
NOT isolated was implementation and loop bookkeeping.
**Suggestion:** Design data for the task-orc question (keeper + PP):
a task-level orchestrator subagent that runs one plan's loop so the
project-orchestrator keeps context for project decisions.

What the dispatcher needs to run it well:
1. A cold-readable plan — bee-plan rule 4 already guarantees this;
   P2 proved it (three separate subagents implemented/ran/reviewed
   from the plan cold).
2. A dispatch-brief template: plan path, phase id, validation level
   from the plan header, escalation envelope (what it decides vs.
   what it returns), safety lines (see the dispatch-brief-safety
   suggestion), Role trailer = dispatching role (stage-agent
   precedent from P2's reviewers).
3. A stop-and-return contract: two failed fix rounds → return an
   escalation package (question + context + recommendation) to the
   dispatcher; never card the keeper directly from a subagent.
4. Bounded scope: one plan per dispatch (not per task — per-task
   dispatch loses the cross-task continuity the cycle needs).

What it passes back at end of work:
1. Done-ness digest: tasks complete, verify/review verdicts with
   record paths, commit hashes, plan/phase-list state.
2. Deviations from plan, with reasons (intent judgment stays
   project-level).
3. Escalations + parking/suggestion candidates.
4. Digest form only — record paths, not contents; if the return
   carries what the records already carry, the context win is zero.

Alternatives to weigh: (a) formal task-orc role now; (b) cheapest
experiment — the project-orchestrator always dispatches an
implementer-loop subagent per plan under the current skills (new
brief template only, no new role); (c) task-orc only for code-heavy
phases. Recommendation: run (b) during P3 — P3's mandate already
includes "reviewer + implementer codification calibrated on the P2
run"; if the boundary holds (dispatcher never opens source files,
reads only records + deviations), formalize as a role then.
bee-loop's own bootstrap note anticipated this ("until an automated
orchestrator exists this skill runs inside a session") — task-orc is
that orchestrator in miniature.

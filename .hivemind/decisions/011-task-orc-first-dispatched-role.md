# ADR 011: task-orc — the first dispatched role

**Date:** 2026-10-25
**Status:** Accepted (keeper card, P2 post-mortem digestion session; PO's
design data: suggestions `2026-10-25-po-task-orc-design-data`,
`-size-verification-across-the-loop`, `-dispatch-brief-safety-rules`)

## Context

P2 ran its loop inside the project-orchestrator's session: an
827-line verbatim-code plan and three fix-round debug cycles dominated
context while project-level duties were squeezed to the margins.
Judgment was already well isolated — three reviewer subagents worked
cold from the plan with none of PO's context — but implementation and
loop bookkeeping were not. bee-loop's bootstrap note anticipated this
("until an automated orchestrator exists, this skill runs inside a
session"); the P2 data specifies the orchestrator in miniature.

## Decision

**task-orc is the first dispatched role (ADR-010), minted as a minimal
role file now** (`roles/task-orc.md`); it becomes the standard dispatch
pattern for P3. Heavier formalization — separate reviewer/implementer
files, any overrides — waits on the boundary test (below).

**The contract, from P2 evidence:**

- **Dispatch needs:** a cold-readable plan (bee-plan rule 4, proven in
  P2 by three cold readers); a brief carrying plan path, phase id,
  validation level from the plan header, the escalation envelope, and
  the three safety lines (GLOSSARY: dispatch brief, safety lines);
  **one plan per dispatch** — per-task dispatch would lose the
  cross-task continuity the cycle needs.
- **Stop-and-return:** two failed fix rounds → return an escalation
  package (question + context + recommendation) to the dispatcher.
  Never cards the keeper directly (one-hop escalation, ADR-010).
- **Pass-back:** a done-ness digest — tasks complete, verify/review
  verdicts with **record paths**, commit hashes, plan/phase-list
  state; deviations from plan with reasons (intent judgment stays
  project-level); escalation and parking/suggestion candidates.
  **Digest form only** — record paths, not contents; if the return
  carries what the records already carry, the context win is zero.
- **Boundary test — the formalization trigger and P3 exit criterion:**
  the dispatcher never opens source files; it reads only records and
  deviations.

**Expectations:** task-orc buys the dispatcher's context lifetime, not
autonomy — P2's blockers were policy gates (loop entry, explicit-yes),
already addressed by ADR-008/009. The keeper's long-running-PO goal is
what this enables.

## Consequences

- PO's context stays project-level; implementation detail lives and
  dies inside dispatches.
- Skills stay independent (decision 51): task-orc is a bundle of
  instruments with bee-loop first among equals — not a wrapper.
- Workspace: main checkout until the P3 git strategy lands; worktree
  mechanics thereafter (ADR-010 attribute 4).

## Alternatives considered

- **(a) formal task-orc role now** (full contract + separate
  reviewer/implementer files) — spends the schema before the boundary
  proves; rejected for P3, is the natural outcome if the test holds.
- **(c) task-orc for code-heavy phases only** — context bleed is not
  code-specific (any multi-fix-round plan bleeds); per-phase
  inconsistency complicates the dispatcher. Rejected.

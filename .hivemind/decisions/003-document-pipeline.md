# ADR 003: Document pipeline — design doc, phase list, phase plans

**Date:** 2026-10-18
**Status:** Accepted

## Context

Superpowers' spec→plan split doubles review ceremony and duplicates
content (see continuity workstream, where the spec was ~30% ADR
cross-references). But collapsing everything into plans loses something
real: the orchestrator needs a stable, human-ratified reference above the
churn of plans, and the human needs design authority that no agent can
overwrite. The prescriptiveness of plans was also conflated with their
format — it should be a dial, set by how many decisions are already
settled, not a fixed depth.

## Decision

1. **Design doc** — co-created by keeper + power-planner only; no agent
   creates one alone. **Read-only to everything below it** (orchestrator
   consults; never edits). References ADRs (the decision log) rather than
   restating them. Changed only via human-gated amendment ritual:
   pause → escalation → keeper + power-planner amend → new ADR records
   the change → doc edited, dated → work resumes. One design doc per
   governing concern (project-level, plus workstream-level when a concern
   spans multiple phase lists).
2. **Phase list** — the orchestrator's writable surface. One line per
   phase: `id · one-line description · status · plan link · escalation
   links`. Statuses: planned / in-progress / blocked / escalated / done.
   High-level only — never grows tasks; tasks live in phase plans.
3. **Phase plans** — written by planning agents under the orchestrator,
   near implementation time (anti-staleness). Prescriptive when many
   decisions are settled; lean otherwise — planning agents generate the
   detail. Plans cite the design doc that governs them.
4. **Contradiction rule** — a phase plan (or implementation) that
   conflicts with its design doc is an escalation to the keeper, never a
   silent local resolution. Enforced at the plan-review stage.
5. **Task loop shape** (internals belong to the orchestration design):
   plan → review plan → implement → review against plan → validate, with
   specialized subagent and/or skill per stage; same loop shape at task
   and phase altitude.
6. **Read-only enforcement ladder** — rules now; "keeper-ratified" marker
   convention checked by reviewers next; tool interception later if
   needed (precedent: subagents extension blocks screenshot calls).

## Alternatives Considered

### Always two documents (Superpowers spec+plan)
**Pros:** strongest failure isolation; familiar.
**Cons:** double review gates; duplication and drift; ceremony for 1:1
workstreams.

### Single merged document always
**Pros:** one artifact, one review.
**Cons:** big designs bloat plans; shape reviewed at task granularity;
long docs hard for executors.

### Chosen: cardinality rule
Design narrative lives in the plan when 1:1; standalone design doc when
one design governs many plans — which the orchestrator makes the norm.
**Pros:** no speculative docs; one human gate per workstream; authority
flow is mechanical. **Cons:** judgment needed on when to promote;
weaker pre-plan validation when conversation was thin (mitigated by
power-planner conversation-first mode).

## Consequences

### Positive
- Sovereignty is mechanical: goalposts cannot move silently.
- Detail is generated close to implementation; upstream docs can't drift
  into detail they never should have held.
- Orchestrator crash recovery = design doc + phase list + parking lot +
  decisions inbox + session state (continuity layer pays off at project
  altitude).

### Negative
- "Read-only" is convention until interception exists.
- Amendment ritual must stay cheap or loops will route around it.

## Affected Areas

- `docs/` structure going forward; future orchestrator skills; plan
  templates; review skills.

## Amendment (2026-10-20): the two pipeline roles — power-planner and project-orchestrator

The pipeline's agents are two named roles (mandates live in `roles/`,
assumed by direction — never inferred from the work's shape):

1. **power-planner — shapes.** Discussion, architecture, decisions,
   design docs. Co-creates design docs with the keeper and drafts ADRs;
   stops before implementation structure.
2. **project-orchestrator — builds.** Turns agreed designs into plans
   (bee-plan) and executes them (bee-loop): subagents, verify/review
   gates, phase-list tracking. Consumes design; makes no design
   decisions.
3. **The design doc is the handoff artifact between the roles.** It
   leaves the power-planner side keeper-ratified and enters the
   orchestrator side read-only (rule 1). Authority flows one way:
   keeper → power-planner → design doc → orchestrator → plans → loop.
4. **The roles run in parallel.** When the orchestrator hits a conflict
   between reality and the design, it escalates to the keeper, who
   resolves directly or routes to the power-planner (rule 4 unchanged —
   now with a named return path).
5. Each role keeps its own session memory
   (`.hivemind/sessions/<role>.md`); continuity protocols are per-role.
6. **Scribe exception (keeper, 2026-10-20):** the read-only rule holds
   by default; the keeper may explicitly consent to a specific scribe
   edit by the orchestrator (common while the harness itself is being
   designed). The orchestrator's standing duty: when an ADR or design
   doc disagrees with its instructions, raise the mismatch and ask
   what (if anything) changes — never edit around it.

## Amendment (2026-10-25): ownership extends to every shared artifact

Write ownership is no longer design-docs-only: the full table (ADRs,
AGENTS.md, GLOSSARY, plans/phases/records, parking lot, suggestions,
roles, skills) lives in ADR-007, with the keeper-consented scribe
exception and the flexibility principle (roles are defaults, not
walls). Design-doc rules here are unchanged.

## References

- ADR 001 (memory tiers — orchestrator wake-up), ADR 004 (right-sized
  validation), continuity spec/plan (the 1:1 case study)

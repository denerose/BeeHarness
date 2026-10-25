# ADR 009: Forward planning — the phase queue

**Date:** 2026-10-25
**Status:** Accepted (keeper's explicit yes, P3 brainstorm session
2026-10-25 — both ADR and the four seed rows)

## Context

The 2026-10-25 pickup stall (suggestions
`2026-10-25-po-orchestrator-what-next-gap` and
`2026-10-25-po-phases-artifact-in-design`): the phase list tracks
done/in-progress only; the design doc's ledger never converts into
forward rows; and with bee-loop entry gated on explicit direction, an
empty board left the orchestrator no legal move but an unrelated-option
menu — decision load snapped back to the keeper. The forward queue
lived in the keeper's head.

## Decision

1. **Forward rows live in the phase list** — one home; queue and
   tracking are one artifact. `planned` rows, one line each, never
   tasks. Rejected: a roadmap section in the design doc (splits the
   source of truth; the design doc holds what/why, not sequencing) and
   a keeper-report-only queue (derived views can't be the source).
2. **Conversion step with an owner:** at design ratification,
   power-planner drafts the phase decomposition from the design's
   ledger into planned rows. PP appends planned rows directly (small
   cross-role write, flexibility principle); PO owns transitions of
   its phases (planned → in-progress → done). The keeper gates each
   *pick* — starting a phase stays explicit direction (relay).
3. **Maintenance at phase close:** the loop's Record step re-checks
   the decomposition against the design's ledger — new phases
   appended, spent ones marked done, drift escalated to the keeper.
4. **Propose-next rule** (into PO's role file at codification;
   interim session practice now): when the orchestrator's board is
   empty — no open phase row, nothing assigned, nothing awaiting
   others — its move is ONE recommended proposal drawn from the
   planned rows; the keeper gates the pick. A menu of unrelated
   options is not a proposal.
5. **Ask hygiene** (line added to GLOSSARY's escalate/escalation
   envelope entries): a coherent ask offers one decision with a
   recommendation; option sets spanning different kinds of work
   return the decision load to the keeper, which the digest model
   exists to avoid.
6. **Planned rows are living** (plasticity): they change as phases
   complete and evidence arrives; revising a planned row costs
   nothing and needs no ceremony.

## Consequences

- The keeper's pick becomes cheap: yes/no on a recommended row.
- The orchestrator never stalls on an empty board; propose-next is
  its standing move.
- Design doc keeps what/why; the phase list gains when/next; the
  keeper report derives both.

## Alternatives considered

- **Design-doc roadmap section** — splits source of truth; doc bloat.
- **Keeper-report-only queue** — a view cannot be the queue's source.
- **Status quo (keeper as forward memory)** — proven to stall
  pickups; scales with keeper attention, which ADR-008 just removed
  from the critical path.

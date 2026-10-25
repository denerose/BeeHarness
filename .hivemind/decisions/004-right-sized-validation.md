# ADR 004: Right-sized validation

**Date:** 2026-10-18
**Status:** Accepted

## Context

Superpowers enforces strict per-task verification (TDD, evidence before
claims). Future BeeHarness agents won't inherit that instinct — whatever
we want, we must encode. Full strictness everywhere risks bogging loops
down; no validation risks silent breakage. The keeper wants: some
validation at every stage, no thrash, a strong final gate, and a
"PR review"-style code review with correction near the end.

## Decision

1. **Right-sized, not uniform.** Every stage/agent type gets *some*
   validation proportional to the blast radius of what it protects:
   - **Task implementation:** cheap and local — run what you changed
     (tests/typecheck as available); no "done" without executing.
   - **Task review:** deliverable matches task spec; may run the task's
     verify steps.
   - **Plan review:** plan vs governing design doc (contradiction rule,
     ADR-003) + executability/honesty check.
   - **Phase gate (heavy):** deterministic validation scripts (typecheck,
     lint, tests, build — whatever the project declares) **plus** a real
     code review with a correction loop.
2. **Validation is a dial, declared per project/phase plan** — a
   docs-only phase ratchets down; a payment-backend phase ratchets up.
   Superpowers' full TDD is one point on the dial, not the default.
3. **Correction loop is bounded.** Review → fix → re-review, max two
   rounds; unresolved findings escalate rather than thrash.
4. **Validation scripts are deterministic and runnable by anyone** —
   no judgment required, same result for any agent or the keeper.

## Alternatives Considered

### Full superpowers strictness everywhere
**Pros:** maximal safety.
**Cons:** loops bog down; ceremony on docs/config work; cost without
proportional risk reduction.

### Validation only at the phase gate
**Pros:** cheapest.
**Cons:** errors compound across tasks; late discovery makes correction
expensive.

## Consequences

### Positive
- Cost tracks risk; final gate is non-negotiable regardless of dial.
- Encoded explicitly — no inherited-instinct dependence.

### Negative
- "Right-sized" needs judgment per phase; under-dialing discovered late
  becomes a phase-gate failure (visible, but late).

## Affected Areas

- Phase plan templates (validation profile field), review skills,
  future validation-script conventions.

## References

- ADR 003 (document pipeline — where validation stages attach)

## Amendment 1 (2026-10-25): size verification across the loop

**Status:** Accepted (keeper, task-orc session; P2 evidence — PO
suggestions `2026-10-25-po-size-verification-across-the-loop`)

The dial applies across the loop, not just at task level:

1. **Plan-reviewer gate:** plans carrying verbatim runnable code get
   extract-and-sandbox-run as a standard External-reality step
   (mechanically extract the code blocks, assemble in a sandbox, run
   the suite). In P2 this improvised check caught two blockers
   pre-dispatch — it stops being an accident of a good brief.
2. **Fix-round waiver:** a post-fix confirmation pass may be waived
   when (a) the fix is the reviewer's own suggested change, applied
   verbatim, and (b) the fix-round verify record replicates the
   reviewer's probe method. Record a one-line reason in the verify
   record. Blocking-tier findings always get a real re-review.

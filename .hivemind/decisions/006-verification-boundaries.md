# ADR 006: Verification boundaries — states, evidence-gated transitions, one parameterized verify

**Date:** 2026-10-18
**Status:** Accepted

## Context

The v1 loop has `bee-review` and `bee-verify` with unclear boundaries
and ordering. Two candidate mechanisms were raised: separate verify
skills per boundary hop, or a state machine where transitions require
verification. Earlier discussion also left "continuous vs gate"
validation partially resolved.

## Decision

**Definitions:** *verify* is mechanical — deterministic checks (runs,
passes, exists, matches claims), rerunnable, cheap. *Review* is
judgment — meaning, coherence, quality a test cannot see; needs a
reader with taste; expensive.

**The layered model (both proposals, combined at the right layers):**

1. **States live in data, not skills.** Work-item statuses in the loop's
   tracking; phase statuses in the phase list:
   `draft → implemented → verified → reviewed → merged`.
2. **Transitions require evidence at the hop's level.** The loop refuses
   `implemented → verified` without verify output and `verified →
   reviewed` without reviewer signoff. Enforcement ladder: loop skill
   text (bootstrap) → extension hard-gate (harness build).
3. **One `bee-verify`, parameterized by hop** — levels `task | merge |
   phase | release`, mapped onto the ADR-004 validation dial. Hop
   differences are parameters, not separate skills.
4. **Ordering: verify before review, always.** Reviewer attention is
   never spent on things that don't run. After correction rounds:
   re-verify, then re-review (bounded rounds per ADR-004).

This resolves continuous-vs-gate precisely: **verification fires at
every transition** — continuity without ceremony.

Separate per-hop verify skills were rejected: fragmentation, duplicated
ritual; differences are parameters. A bare state machine was rejected:
right model, but it doesn't define *what* verifies at each hop —
without a shared ritual every hop invents its own checks.

## Consequences

### Positive
- One verify skill to maintain; hop checks explicit via parameters.
- State machine gives the extension a concrete thing to enforce later.
- Reviewer cost optimized (mechanical filters first).

### Negative
- The loop skill carries enforcement as text until the extension exists
  (soft gate during bootstrap).
- Level definitions must stay honest — a lazy `task` level at a `merge`
  hop is a rules violation the extension will later catch.

## Affected Areas

- `bee-verify` skill (v1 set, now parameterized), `bee-loop` (state
  tracking + transition rules), future extension (hard gates),
  `bee-hindsight` (see session temp memories — related, not governed here).

## References

- ADR 004 (right-sized validation — the dial this parameterizes),
  ADR 003 (document pipeline — phase list holds phase states)

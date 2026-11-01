# ADR 016: design-doc lifecycle — live, picked-up, implemented

**Date:** 2026-11-01
**Status:** Proposed (PP draft; keeper flips)

## Context

Design docs in `.hivemind/designs/` are consumed by phases as inputs.
Nothing in the artifact distinguishes a live design from one a phase
has picked up or already implemented. The P7 incident: PP edited a
design mid-implementation; the edits landed silently (whether PO had
seen them was unknown until its re-pull). The freeze-at-pickup rule
governs behavior; this ADR adds structure and mechanics so the rule
is checkable rather than remembered.

## Decision

1. **Status stamps.** Every design doc carries a Status line in its
   header: `live` · `picked-up (phase id + the design's git hash)` ·
   `implemented (phase id + merge hash)`. PP maintains `live`; PO
   stamps `picked-up` at the phase spine commit and `implemented` at
   the Record step — metadata scribe-edits, never content edits.
2. **Hash linkage.** The phase plan's machine header cites its
   design doc path + hash (extends P4's plan-header contract).
   bee-plan-review verifies the match at the gate; the phase close
   step re-verifies. Drift — the design changed after pickup — is
   mechanically detected and never silent: it routes to a
   rectification decision.
3. **Append-only after pickup.** A picked-up or implemented design
   takes no in-place content edits. Later changes land as dated
   addenda explicitly marked *pending rectification*; the
   rectification phase (or a between-phase direct task) consumes
   them. This is the rectification queue, self-maintaining.
4. **Planner discipline (role law).** Check the status stamp before
   editing any design doc; a non-live design changes only via the
   addendum path.

## Consequences

- Design state is visible in the artifact, to any reader, any time.
- Drift is detectable by script, not by memory.
- Rectification phases get their work list for free (flagged
  addenda).
- PO's existing kickoff-card practice (design state hash) becomes
  the formal mechanism.

## Alternatives considered

- **Physical archive moves** (implemented designs move to
  `designs/archive/`): same information as a stamp, plus link churn
  and path drift. Rejected.
- **Git-only detection, no stamps:** mechanically possible but
  invisible to a human or agent reading the doc — archaeology to
  learn what a Status line can say. Rejected.

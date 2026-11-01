# Four Pillars review — design note

<!-- machine
status: live
phase: -
hash: -
merge: -
-->

**Date:** 2026-11-01
**Status:** review lens, NOT law (keeper direction — unlike AXI,
which binds the `bee` CLI). Source: keeper-provided excerpt, "The
Four Pillars of a Harness" (article written for human audiences;
drawing on OpenAI's framework). Reference entry:
`docs/research/four-pillars-of-a-harness.md` (PL-PP-012,
2026-11-01).

## The pillars, one line each

1. **Context engineering** — the agent has the right information at
   the right time; the repo is the single source of truth; anything
   out-of-context effectively doesn't exist.
2. **Architectural constraints** — mechanical constraints (boundaries,
   linters, type checkers, dependency rules) make agents MORE
   productive, not less; enforced, not suggested.
3. **Verification systems** — separate evaluator agents; a stock
   model is too lenient on its own work; the maker/checker split is
   the cornerstone.
4. **Feedback loops** — fix the system, not the output; failures
   become harness improvements; self-improving loops.

## Our work against them (2026-11-01)

- **Pillar 1 — architecture strong, gaps parked:** the `.hivemind/`
  classes, ambient pickup, relay design docs, machine-readable
  state (ADR-014). Gaps owned: observability/dynamic context
  (PL-PP-008); the keeper's head as the biggest invisible store
  (`bee capture` P4; secretary role PL-PP-009).
- **Pillar 2 — philosophy adopted, mechanical coverage thin:** the
  real gap this lens exposes: almost no structural rules over our
  OWN repo yet. Adopted-in-principle, unbuilt: the "every new file
  in the predefined structure" rule over skills/ kits and
  .hivemind/ classes (guides-and-sensors review, pattern 4).
  Cheapest actionable finding of this review.
- **Pillar 3 — ahead of the article:** verify/review as separate
  cold evaluators; states move on records, not claims (ADR-006);
  the depth-2 review-freshness split addresses the
  lenient-on-own-work failure directly.
- **Pillar 4 — instantiated, with a deliberate difference:**
  hindsight → suggestions → adoption closes (evidence: recurring
  issues becoming law); P7 built its own authoring tools
  (self-improvement). Difference: every promotion is keeper-gated —
  the autonomous self-improving loop is intentionally not ours;
  ownership is the routing axis (SOUL).

## Feeds

Pillar-2 gap → the structure-rules action (own repo first, then
stack profiles); PL-PP-012 RESOLVED — references home landed
(`docs/research/` + design note `2026-11-01-pp-references-home.md`);
the guidance bundles model (guides-and-sensors note).

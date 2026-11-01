# Guides and sensors review — design note

**Date:** 2026-11-01
**Status:** live — conference-notes topic 1 (PL-PP-004) partially
landed; feeds the guidance system (PL-PP-003), P4 validation work,
and PL-PP-012 (references home).

**Source:** Böckeler, "Harness Engineering" (martinfowler.com,
2026-04-02) + its follow-up "Sensors for Coding Agents" (2026-05-27),
read in full by dispatched researcher. Terminology note: the field
says **guides and sensors** (feedforward / feedback controls), not
"signals and guides" — future searches must use the right term.

## What we confirmed

- The 2×2 — guides/sensors × computational/inferential — maps onto
  our architecture. We hold three quadrants (computational feedback:
  verify, plan-checks; inferential feedback: review; inferential
  feedforward: skills, AGENTS, mandates). The missing quadrant is
  **computational feedforward**: scaffold and code-mod tools —
  `bee design new`, `bee capture`, brief templates. P4 grows exactly
  this class.
- **Deterministic-first is right, with a ceiling:** computational
  controls own everything structure-expressible (imports, filenames,
  folders, metrics); semantics and cross-file concerns stay
  inferential. Grounding inferential work in computational output
  beats free-form analysis.

## Patterns to adopt

1. **Check output written for the agent** — every failing check
   emits self-correction instructions, not just findings ("positive
   prompt injection"). Applies to plan-checks.sh, `bee verify`
   output, future arch tests.
2. **Managed exceptions** — suppression-with-recorded-reason and
   ratcheted thresholds instead of binary fail; the exception log
   is the human's review queue (attention routing; our
   decisions-not-artifacts gates are the same move).
3. **Sensor state history** — log check state per run; failing-less
   over time = guides improving; never-firing = dead weight;
   always-failing = fix the guides there. Harness meta-evaluation.
4. **Structure rules over prose** — "every new file must sit in the
   predefined structure" catches agents inventing structure; we can
   point this at our own repo (skills/ kits, .hivemind/ classes)
   now, and shipped repos get it via stack profiles.
5. **Sensor contract** — each check wraps output in a normalized
   agent-facing shape (AXI-aligned); her sidecar CLI (config-defined
   checks, watch mode, snapshots, agent summaries) is a sibling of
   our `bee` CLI direction.

## Backpressure — our gap, the article's building blocks

No mechanism in the article slows/stops agent work on degraded
signals. Building blocks for ours: timing tiers (already ours —
validation levels), **snapshot ratchets** (gate advancement on
not-worse-than-snapshot rather than absolute green), git hooks as
the trusted forcing function (guides alone proved unreliable —
independent validation of strict entry wording), and state history
as the degradation signal. The failure mode to design against:
feedback overload spirals (agent over-refactors on noisy signals).

## Work types — conclusion for the guidance system

The article differentiates by regulation category, execution type,
timing, and topology — NOT by backend/frontend/planning. Machinery
is type-agnostic; **harness templates** = per-topology bundles of
guides+sensors over shared machinery. This confirms the keeper's
model: same stages, shared tooling, work type as a parameter — the
`bee guidance` topics are the bundles; validation levels are the
shared stages; per-type difference lives in rule text and patterns
(their own example: one no-console rule, different guidance text
backend vs frontend).

## Feeds

PL-PP-003 (guidance system design — the bundles model); P4
(validation output design, computational-feedforward commands);
PL-PP-012 (where guiding references live); PL-PP-004 remainder
(StackQL, Arazzo, auto-PR still parked).

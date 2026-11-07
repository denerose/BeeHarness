**Date:** 2026-11-02
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** P5 closed with 11 decisions and the close flag fired "under-asked kickoff — front-load harder next phase" — but all eight kickoff decisions WERE front-loaded at kickoff (the exact behavior the calibration signal asks for); the three beyond were review-driven rulings during the loop, which is the sign working as intended, not under-asking. P4's 15 (mostly mid-phase surprises) and P5's 11 (8 up front, 3 review-driven) trip the same flag.
**Suggestion:** `bee phase close` (or the decisions inventory schema) distinguishes kickoff-ruled decisions from in-phase rulings — e.g. a `k:`/`r:` marker or two count lines — and fires the under-asked flag only when in-phase rulings dominate. Keeps the signal honest as front-loading improves.

## Outcome (2026-11-07)
Landed in P8 Task 2 — `bee phase close` prints
`decisions: N (front-loaded K · in-phase R)` (kickoff:/plan-time:
one-lines count front-loaded) and fires the under-asked flag only
when in-phase > 8 AND in-phase > front-loaded (plan-time ruling D5,
no schema change).

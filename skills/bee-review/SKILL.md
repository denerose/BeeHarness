---
name: bee-review
description: Quality review of finished, verified work — does the implementation match the plan's intent, what would a careful developer flag. Runs after bee-verify at each stage. Reports findings; never fixes. Not for reviewing plans (global plan-reviewer does that).
---

# bee-review

Read work that has already passed verification and judge what the checks
could not: intent, coherence, quality. Read `skills/GLOSSARY.md` first.

## Input

A task or phase, its plan section, and the verify record. If there is no
verify record, send it back — do not review work that doesn't run.

## What to judge

- Does the work do what the plan meant, not just what it said?
- Would a careful developer flag anything here? (Wrong assumptions,
  fragile choices, missing cases the plan implied, dead code, confusing
  names.)
- Do the pieces fit the rest of the project?

## Report

Use `assets/review-report-template.md`. Three tiers, each finding with
file and line and a concrete suggested fix:

- **Blocking** — wrong, broken, or contradicts the plan's intent.
- **Should fix** — real problem, not fatal.
- **Note** — worth saying, not worth a round.

## After the report

You're done. Fixes are the implementer's job through the loop's fix
rounds; re-review happens after re-verification. Merge approval is not
yours to give — merge rules are the keeper's (currently: undecided, so
ask).

## Boundaries

- Only post-verify work.
- Findings, not fixes.
- Plans are out of scope (global `plan-reviewer`).
- No merge approval.

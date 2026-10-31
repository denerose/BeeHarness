---
kit: loop
name: bee-review
description: Quality review of finished, verified work — does the implementation match the plan's intent, what would a careful developer flag. Runs after bee-verify. Reports findings; never fixes. Not for reviewing plans (bee-plan-review does that).
---

# bee-review

Read work that has already passed verification and judge what the checks
could not: intent, coherence, quality. Read `../../GLOSSARY.md` (the shared bee glossary, sibling of this kit folder) first.

## Input

You need three things, normally in the dispatch brief: the plan path and
task id, the changed files (a list or a git ref range), and the verify
record path. If any is missing, return the review to whoever dispatched
you — do not guess scope. If there is no verify record, same: do not
review work that doesn't run.

## First check: claim vs record

Before judging quality, run the mechanical claim-vs-record check:
every checked task box in the plan has its logbook entries behind it
(a verify record, a review report), and every claimed state is backed
by its evidence — checked boxes vs logbook entries, states vs
evidence. A checked box with no record, or a state ahead of its
evidence, is a **blocking** finding: this check runs before quality
judgment, and its findings block on their own.

## What to judge

- Does the work do what the plan meant, not just what it said?
- Would a careful developer flag anything in the changed files? (Wrong
  assumptions, fragile choices, missing cases the plan implied, dead
  code, confusing names.)
- Do the pieces fit the rest of the project?

## Report

Save to `.hivemind/logbook/<plan-slug>-task<N>-review-r<N>.md` (round
suffix per GLOSSARY: record versioning; review rounds count
independently of verify rounds — your first report is `-r1`, and
re-reviews after fixes increment it) using
`assets/review-report-template.md`, stating your producing role in the
header (GLOSSARY: Role trailer) — dispatched as a stage agent, that is
the dispatching loop's role (e.g. `project-orchestrator`). Three
tiers, each finding with file
and line and a concrete suggested fix:

- **Blocking** — wrong, broken, or contradicts the plan's intent.
- **Should fix** — real problem, not fatal; fixing before merge is the
  right call but blocking is not yours. Time-sensitive content in a
  durable doc (status prose in a README, "currently running…") is
  always this tier, never a note — it will go stale and mislead.
- **Note** — worth saying, not worth a round.

Review etiquette, every finding: cite the evidence — the file and
line where the problem lives; no re-design essays — name the problem
and a concrete fix, not the design you would have preferred; tiered
findings only — everything lands in one of the three tiers, and
commentary outside them is not a finding.

If your reading of the plan's *intent* conflicts with its literal text,
that's an escalation, not a finding — return it to whoever dispatched
you; the loop takes it to the keeper and records the answer.

## After the report

You produce the report; the loop flips the work-item state from it and
runs fix rounds. Fixes are not yours. Re-review (if asked after fixes)
is a fresh dispatch against a new verify record. Merge approval is the
keeper's — the keeper decides this; if asked, escalate.

## Boundaries

- Only post-verify work; only the changed files you were given.
- Findings, not fixes.
- Plans are out of scope (`bee-plan-review`).
- No merge approval; no state changes.

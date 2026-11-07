# Project-update skill — design note

<!-- machine
status: live
phase: -
hash: -
merge: -
-->

**Date:** 2026-11-02
**Status (prose mirror):** live — shape directed by the keeper,
2026-11-02; sufficiency analysis included.

## The problem

"Where are we?" gets answered three ways by three roles — design
altitude (are we building toward the right thing?), execution
altitude (is the work on track?), and a lightweight keeper digest —
with no shared instrument. Each improvises; the keeper gets
inconsistent answers at inconsistent cost.

## The design

**One skill, three altitudes.** Shared core: a lean gather from the
stores that already exist, then a comparison at the role's altitude,
a GAP HUNT, then a short report. Role files route to their altitude
(skills stay role-agnostic; routing lives in mandates).

**The gap hunt (the skill's main purpose — not optional):** the
target-state aims are a floor, not a ceiling. Every run reviews
the artifacts (phase rows, designs, parking lot) and the recent
conversation for aims that are planned or implied but NOT captured
in the target section — and proposes additions on keeper approval.
A run that only compares against the six bullets and skips the
hunt has not run the skill.

**The gather (identical for all altitudes — token-effective by
construction):**

- `bee design status` — every design's lifecycle stamp + drift in
  one line each
- the phase list — row states + the designs each phase consumes
- `bee task show <active-plan>` — checkbox truth, script-owned
- `bee inbox list` + `bee park list` — open asks and deferrals,
  counted

That is the whole read: a handful of commands, no prose archaeology.

**The three altitudes:**

- **Design (PP):** compare the gather against the TARGET STATE and
  PP's knowledge of intended outcomes — are the built and planned
  phases still aimed at what the project is for? Divergence,
  staleness, and unowned gaps are the findings.
- **Execution (PO):** compare against phases, tasks, and goals —
  on-track or drifting, blocked or starved, evidence-backed (the
  logbook's recent entries when a claim needs grounding).
- **Keeper digest (KS):** the gather rendered to a few plain lines —
  in flight, done since, needs-the-keeper, next — no analysis beyond
  naming what moved.

**The one new mechanic (the gap):** PP's comparator needs a target
state that is ONE artifact, not archaeology across the governing
doc, ADRs, and memory. Proposal: a **Target state** section in the
governing design doc — a screenful at most: the end-state bullets
and current stance lines, PP-maintained on keeper-approved design
milestones. It rides the design doc's existing lifecycle (stamps,
addenda discipline) — no new store, no new tool.

**Sufficiency verdict:** everything else exists. The phase list is
the source of truth; `bee design status`, `bee task`, `bee inbox`,
`bee park`, `bee memory` supply the rest; the logbook's machine
headers make grounding cheap. No new state, no new memories, one
skill + one section.

**Determinism split:** the gather rides existing scripts; the
comparison and the findings are judgment (the skill's kept value);
the target-state section is PP judgment, keeper-approved.

**Trigger:** on demand (the keeper asks any role for an update);
optionally a session-start line for PP and a phase-gate line for
PO — role-file routing decides.

## Open questions

The target-state section's exact shape settles when PP first writes
it (this note only fixes its home and discipline).

## Feeds

P8 skill pass (the build — session kit, one skill, three
altitudes); the governing design doc (gains the Target state
section, PP-maintained); role files (routing lines at codification
touches); KS's report-walk (P9) shares the gather.

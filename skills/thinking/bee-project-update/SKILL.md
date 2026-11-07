---
kit: thinking
name: bee-project-update
description: Answers "where are we?" at one of three altitudes — design (compare the build against the target state), execution (on-track, blocked, starved), or a keeper digest (the gather in a few plain lines) — from one scripted gather, plus a mandatory hunt for aims not yet captured in the target state. Externally gated; the keeper asks any role for an update, or a role-file routing line fires. Not for working a task or writing records.
---

# bee-project-update

Read `../../GLOSSARY.md` (the shared bee glossary, sibling of this kit
folder) first if any term below is unclear.

"Where are we?" — one question, three altitudes. Every run shares
one core: a scripted gather from the stores that already exist, a
comparison at the caller's altitude, a hunt for uncaptured aims,
and a short report. Role files route each role to its altitude;
this skill carries all three and belongs to none.

## The gather (all altitudes, identical)

Run the commands; together they are the whole read:

- `bee design status` — every design's lifecycle stamp and drift,
  one line each.
- `bee phase list` — the phase list: row states, and the plan and
  design docs each phase consumes.
- `bee task show <active-plan>` — checkbox truth for the active
  plan, script-owned.
- `bee inbox list` and `bee park list` — open asks and deferrals,
  counted.

No prose archaeology: no re-reading whole plans, designs, or
session logs for context. The gather, plus the one artifact an
altitude names below, is the input. If that is not enough, say
what is missing and ask — do not dig.

## The altitudes

Which altitude runs is role-file law, not this skill's. If the ask
names an altitude, that one runs; if no routing line answers and
the ask does not say, ask one line, with a recommendation.

### Design — are we building toward the right thing?

Compare the gather against the target state: the governing design
doc's Target state section — a screenful of end-state aims and
current stance, keeper-approved — and the intended outcomes it
captures. Findings come in three kinds: divergence (a built or
planned phase points away from an aim), staleness (an aim that
time or later decisions have passed by), unowned gaps (an aim with
no phase, no row, no owner). No target section in the governing
doc yet: the absence is the first finding — name it and propose
writing one.

### Execution — is the work on track?

Compare against the phases, tasks, and goals the gather shows:
which rows are on-track and which are drifting; what is blocked
(waiting on something you can name) or starved (a goal with no
work aimed at it). Ground a claim that needs it in the logbook's
recent entries — the gather shows state, the logbook shows motion,
and a claim about what happened cites its entry.

### Keeper digest — a few plain lines

The gather rendered to the four lines a keeper reads: in flight
now, done since last time, waiting on the keeper, next. No
analysis beyond naming what moved. Each line stands alone —
readable days later without this conversation — and anything the
keeper may open carries its absolute path.

## The gap hunt (mandatory — this skill's main purpose)

The target state is a floor, not a ceiling. Every run, at every
altitude, sweeps four places for aims that are planned or implied
but NOT captured in the target section:

- the phase rows — aims a row names that no target aim carries
- the designs — aims a live design commits to that the section
  has not absorbed
- the parking lot — deferrals that imply an aim no one wrote down
- the recent conversation — what the keeper has asked for or
  agreed to that implies an aim

Findings are proposed to the keeper, never written: additions to
the target section land only on approval, as design-doc
amendments. A run that compares and skips the hunt has not run
this skill; a hunt that finds nothing says so out loud — a clean
hunt is a finding, not a failure.

## Should you use this skill?

EXTERNALLY-GATED. Trigger = the keeper asks any role for an
update, or a role-file routing line fires. A keeper ask for an
update IS the entry decision — recognition, not evaluation;
improvising an answer instead of running this skill is the failure
mode. This skill never runs self-initiated: no agent's own sense
that an update is due triggers it.

## Judgment kept

The comparison and the findings are judgment — what diverged,
what drifted, what the digest names, what counts as an aim. The
gather is scripted: the four commands above, run as written. What
enters the target state is the keeper's call; the hunt only
proposes.

## Boundaries

- Delivers the update to whoever asked. Writes no stores and moves
  no states — records and their instruments do that.
- Target-section additions are proposals; they land on keeper
  approval only.
- The gather is the whole read. The one sanctioned follow-up is
  the logbook's recent entries, when an execution claim needs
  grounding; anything beyond that gets named and asked for, never
  dug.

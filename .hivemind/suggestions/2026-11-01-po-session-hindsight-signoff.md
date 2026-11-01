# Suggestion — session hindsight: sign-off shape, escalation hygiene, two standing checkpoints

**Filed:** project-orchestrator, post-P7 session retrospective ·
**Status:** awaiting keeper read (keeper-directed retrospective;
doubles as codification input for PP)

## The sign-off arc, honestly

Three cards to find the working shape. Card 1 bundled sign-off +
post-close pipeline + PP track + propose-next — four decision
threads on one card; dismissed. Card 2 applied "one at a time" but
stayed artifact-shaped ("sign off on the five texts — read them
at …"); dismissed. Card 3 landed the model the keeper taught:
**ask the decisions made** — six cards, each one judgment call with
its live alternatives and a recommendation; six clean rulings and
the phase closed in minutes.

The lesson is not new law — it was already recorded (keeper
oversight model: authority-not-attention, digests-not-files). The
sign-off gate not reflecting it was a gap in applying recorded law,
not missing law. Codification should capture the SHAPE: sign-off
cards present decision inventories, never document pointers.

## What the run got right (calibration data, both directions)

- Zero stops between the correction and the sign-off gate: five
  tasks dispatched, gated on digests, two mid-flight design changes
  absorbed via re-pull + delta re-gate, parallel file-disjoint
  tasks. Delegation as context management worked.
- Mid-stream keeper directives (dispute escalation) applied live
  and recorded, not queued.
- The P3 closure audit found a real defect (checked-but-never-run
  merge) by verifying mechanics (ancestry), not just content.

## What the run got wrong, beyond the cards

1. The relay miss: the keeper's relay request was acknowledged,
   claimed "prepared" on the status surface, and not delivered
   until the keeper asked again two phases of work later.
   Deliverables to the keeper ship IN the reply that claims them;
   status claims about my own output need the output attached.
2. One dispatch's commit claims went unverified (caught at merge
  by git-log check — now hindsight #4 from the close batch, but it
  should have been standing practice from dispatch one).

## Proposal: two standing checkpoints (keeper-directed)

**Phase-start card (kickoff)** — before the loop opens a phase.
One self-contained card: phase id, what it builds (one line),
design state (commit hash), plan gate status; then the
front-loaded decision list — every open question from the design
or plan that would otherwise surface mid-phase, each with
alternatives and a recommendation. The keeper rules them up
front. Rule: no mid-phase question a kickoff card could have
asked. (Aligns with PP's phase-kickoff design item and the
front-load-at-kickoff philosophy note.)

**Phase-end cards (sign-off by decisions)** — after review and
verify pass, before merge. NEVER "approve the work." The decision
inventory first: every judgment call the phase made that has a
live alternative (placements, tier rules, consequential wording,
routing), one card each — context, options, recommendation.
Rulings apply as fix rounds before the merge. A final mechanical
close card (merge + close summary) ends it — the only
approval-shaped ask, and by then it approves mechanics, not
judgment. Calibration signal: an inventory much over ~8 decisions
means the phase was under-asked at kickoff.

**Escalation rules (standing):** escalate a decision when it has a
live alternative the keeper owns (direction, law, tiering), or two
failed fix rounds, or a genuine conflict. Never escalate as
artifact-reading, bundled mega-questions, or approval-without-
alternatives. Mid-stream directives apply live and get recorded.

## Feeds

PP codification (role file: mandate boundary, continuity, the two
checkpoints, escalation section); the phase-kickoff design item;
GLOSSARY/codification of "decision inventory" if PP wants the term.

## Outcome (2026-11-01)
Landed 79ba574: both role files carry the two standing checkpoints
in full; GLOSSARY escalate entry carries the decision-card shape;
PL-PP-010 annotated with the escalation decision table.

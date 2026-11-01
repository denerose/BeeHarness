# Suggestion — consolidation cadence for long-lived design notes

**Date:** 2026-11-01
**Role:** power-planner (retiring instance), end-of-session hindsight
**Scope:** design-doc hygiene (extends ADR-016; feeds P8, PL-PP-005)

**What happened:** the skill-authoring-kit note grew ten-plus sections
across one day — decided, proposed, session decisions, shipping test,
scope guard, bootstrap order, hardcode inventory, loop-skill updates,
two glossaries, entry discipline, sequencing, skill organization,
keeper-rulings supersessions, phase-kickoff input. Sections arrived
out of order and some supersede others via annotations. It worked —
readers could follow — but it is nearly a wiki, and every new reader
pays the archaeology cost of which section is current.

**Suggestion:** long-lived design notes get a consolidation pass at
tidy-up/rectification boundaries (P8 and phase closes): superseded
sections collapse into their successor, the note's spine reads in
order (problem → decisions → open), and history stays in git rather
than in struck-through sections. Pairs with ADR-016's addendum
discipline: addenda accumulate freely while live; rectification is
when they fold in.

## Outcome (2026-11-01)
Routed to P8 as design input — consolidation at rectification
boundaries extends ADR-016's addendum discipline; P8 is its first
user. Design note: 2026-11-01-pp-p8-rectification-inputs.md.

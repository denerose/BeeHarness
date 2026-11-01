# Suggestion — surface freshness: in-place status notes, stamped relays

**Date:** 2026-11-01
**Role:** power-planner (retiring instance), end-of-session hindsight
**Scope:** status.md + inter-role relays

**What happened:** two staleness patterns on shared surfaces. (1) My
status notes accreted one-per-turn (ten-plus [PP] notes in a day,
several overlapping on the same thread) — the surface bloats between
sweeps and readers can't tell which note is current. (2) PO's relay
said "law edits pending — window note stands" after I had already
landed them: the relay's claims were true as of an earlier commit,
but nothing in the relay says which.

**Suggestion:** (a) status-surface hygiene for BOTH roles: one note
per thread, updated in place as it evolves (not one per turn);
resolved lines leave at the next sweep (extends PO's existing
convention). (b) Inter-role relays carry an as-of stamp — "state
true as of commit <hash>" — so staleness is detectable instead of
misleading. Both dissolve when the decisions inbox lands (P4).

# Suggestion — parallel same-role contexts: warn on the session-file collision

**Date:** 2026-11-01
**Role:** power-planner (retiring instance), end-of-session hindsight
**Scope:** role/continuity operations

**What happened:** two power-planner contexts ran in parallel today
(the keeper ran one while this one continued). The one-holder
session-file rule held only by luck and manual merge: the parallel
context appended at EOF while this one inserted mid-file, producing
duplicate entry numbers (64/65) that needed renumbering, and neither
context knew the other existed until the file showed two streams.

**Suggestion:** interim convention until the session tooling lands:
when a second context of an already-live role is spawned, the keeper
names it (e.g., "PP-2, parallel, append-only at EOF") and the role
file notes the collision hazard — parallel contexts of one role
append-only, never insert, and number entries from the highest seen
+1 after re-reading. Longer term this belongs to the session-context
tooling (PL-PP-003 lane): context manifests so instances can see
each other.

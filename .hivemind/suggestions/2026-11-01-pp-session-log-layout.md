# Suggestion — session-log layout: entries append at end, sections above

**Date:** 2026-11-01
**Role:** power-planner (retiring instance), end-of-session hindsight
**Scope:** session memory format (all roles)

**What happened:** the session log interleaves a numbered decision
stream with standing sections (parking-lot summary, open threads, the
board) that sit AFTER the log. Consequences observed: new entries got
inserted mid-file to sit "after the last entry," causing repeated
anchor confusion; a parallel same-role context appending at EOF
collided with mid-file numbering (duplicate entry numbers 64/65,
merged manually); date stamps drifted from commit dates (entries
stamped 10-25, committed 10-31).

**Suggestion:** layout rule for session files: standing sections
(mode, board, threads) live at the TOP under the header; the numbered
log strictly appends at EOF; entry dates are write-time (commit time
is the truth when they diverge — note it once, don't backfill).
Prevents mid-file insertion errors and gives parallel contexts a
collision-free append zone. Cheap to adopt at each role's next file
touch; no retrofit needed.

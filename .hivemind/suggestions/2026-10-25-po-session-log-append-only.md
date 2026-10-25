**Date:** 2026-10-25
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** The 2026-10-20 role split left the session log with
two runs of entry numbers 20–24 (the splitter inserted new entries
between existing ones). Repair required hand-renumbering, which then
broke a cross-reference ("Sharpens 20–22" → "24–26") and — during the
fix — an edit misfire duplicated a whole entry's text. Numbered-entry
logs are treated as ordered lists but function as IDs; renumbering
breaks both.
**Suggestion:** In the per-role continuity protocols (roles/ files and/
or AGENTS.md session-memory rule), state: session-log entries are
append-only IDs — never renumber, never insert between; cite entries
as number + date; duplicates from a split stay (note the collision in
prose) rather than being renumbered. Removes the whole repair class.

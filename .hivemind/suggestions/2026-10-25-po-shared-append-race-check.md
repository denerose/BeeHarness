**Date:** 2026-10-25
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** Commit 8501118 removed a duplicated parked PL-003
entry created when both roles appended to the parking lot across
interleaved rebases in the same window. ADR-007's role-prefixed IDs
fixed the numbering-collision class, but the append race on
shared-write files (parking lot, status.md) remains: two roles can
append between each other's pull and push, and a rebase replays both
appends in overlapping form.
**Suggestion:** Extend the ADR-007 commit-discipline block: "Before
committing an append to a shared-write file (parking lot, status.md),
pull --rebase once more and verify your entry appears exactly once."
Cheap habit; catches the replay-duplication class the 8501118 incident
proved live.

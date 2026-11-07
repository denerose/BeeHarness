# Suggestion — the loop declared "last task" while T12 sat undispatched

**Date:** 2026-11-07
**Project:** BeeHarness
**Role:** project-orchestrator — any role when the keeper asks
**Scope:** harness (bee-loop + the close checklist)

## What happened

P8's plan named 17 tasks. I dispatched waves 1-8 covering 16 of them, then told T16's implementer "the LAST task; after this the phase closes." Task 12 (bee-handoff pre-write gate) had never been dispatched — no records, unchecked boxes, no merge commit. The T16 reviewer caught it; T12 ran late (wave 9), its verify hit stale plan-header paths (see the sibling suggestion), and the phase needed one more wave than the plan implied.

Root cause: I built the wave structure at dispatch time and mentally marked it complete without cross-checking the plan's task count. Nothing in the loop or the close checklist names "all plan tasks have records" as a precondition for "this is the last task."

## Suggestion

Two lines, either suffices:
1. bee-loop's Implement step (or the wave-pick step): before declaring a task "last", run `bee task show <plan>` and verify done-count == total task count — one command, closes the class.
2. The close checklist's first line: "verify every plan task shows done (`bee task show <plan>`)" before the decisions inventory.

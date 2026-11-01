# Suggestion — no parallel machinery: check an existing artifact first

**Date:** 2026-11-01
**Project:** BeeHarness
**Role:** power-planner (session hindsight)
**Scope:** repo (roles/power-planner.md Working style)

## What happened

The session produced the same correction three times in different
costumes: a `docs/templates/` folder when the templates belonged
with their consumers; a power-planner role *template* when the role
file itself is the shipped artifact (deleted, unfixed); a retired-pp
mandate loaded with defensive rules the role should never need.
Each time the keeper stripped the extra machinery — "YAGNI", "don't
waste bytes", "why can't consumers just use the same role file?".

## Suggestion

One Working-style line in `roles/power-planner.md`:

> **No parallel machinery.** Before creating a new artifact, check
> whether an existing one already serves (a file that duplicates
> another will drift from it). Prefer deleting the duplicate to
> maintaining both.

With the plan-vs-action ask rule (landed this session) this covers
the whole correction family: when uncertain between building and
reusing, the move is ask-or-reuse, never build-a-second-copy.

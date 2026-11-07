# Commit-record map — design note

<!-- machine
status: live
phase: -
hash: -
merge: -
-->

**Date:** 2026-11-07
**Status (prose mirror):** live — ruled by the keeper after a
bee-argue run (two dispatched cases, summarized with
recommendations); binary per class, no commit-timing rules.

## The decision

Git holds what needs **history/backup** or needs to **ride task
branches**. Everything else lives on disk only (gitignored files
stay readable by every local reader — ambient pickup reads the
filesystem, not history). Binary per class; "when to commit" rules
are banned — a class is in or it is out.

## IN (with the case, one line each)

- **Product, law, ADRs, designs, plans, phases** — the record
  itself; consolidation deletes superseded text with git as the
  only archive; phase rows cite plans/designs as source of truth.
- **TOON stores** (inbox, parking, memory, glossary) — durable
  state, not ephemera: deferred decisions, durable lessons; git is
  the only backup on one machine.
- **The logbook** — the one ephemeral-flavored IN: the task-branch
  diff is the review artifact (ADR-012) and the dispatcher boundary
  reads evidence through git, never through worktree disk
  (ADR-011); mid-flight reviews `git show` branches from the main
  checkout. Compaction (phase close) keeps the steady state lean —
  the volume fix is what final-round entries contain, never where
  they live.

## OUT (gitignore; files stay on disk)

- **keeper-report.md** — derived view; regenerable; its durable
  content lives in the stores.
- **status.md** — transient cross-role notes; durable content lands
  in real homes. PREREQUISITE (ruled): becomes a CLI-protected
  structured store (single-writer discipline via `bee`; renders
  derive) before leaving git — that controls concurrent cross-tab
  writes. Untracked files are immune to the sweep hazard.
- **suggestions/ including planned/** — scaffolding by design
  (file → outcome lands in law/notes → file deletes); inventory
  notes carry the content summaries.
- **.pi/handoff-*** — each rewrite supersedes; successors read
  disk.

Accepted costs: last-write-wins on concurrent status writes
(transitional — the structured store replaces the hand-edited
file); machine loss takes routed-suggestion origin text
(summaries survive in inventories); handoff history gone (nothing
reads it).

## Feeds

P8 items 30–32 (the gitignore sweep; the status store build; the
optional task-commit batching — tool behavior, not a rule).

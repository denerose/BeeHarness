# BeeHarness (name TBC)

The front door: what this project is, in durable terms only. **Not a
work log** — live state has homes: `.hivemind/phases/BeeHarness.md`
(the queue: what's done, running, next), `.hivemind/keeper-report.md`
(the keeper's digest), `.hivemind/status.md` (cross-role surface). If
a sentence can go stale next week, it doesn't belong here (GLOSSARY:
README). Amendments need the keeper's sign-off (ADR-007 amendment 1).

## What this is

The **pi plugin** for one human and a swarm of agents — an agent
harness layered on [Pi](https://github.com/earendil-works/pi-coding-agent)
and Paseo:

- **`skills/`** — all bee-* workflow skills. Single source of truth:
  registered machine-wide via `~/.pi/agent/settings.json`
  (`"skills": ["~/BeeHarness/skills"]`); every harnessed repo uses
  them; edits here go live everywhere. Git here is the drift defense.
- **`roles/`** — agent specs, one concept graded by attributes
  (ADR-010): **power-planner** (shapes: discussion, architecture,
  decisions, design docs), **project-orchestrator** (builds: bee-plan,
  bee-loop, dispatches, gates, the phase queue), and dispatched roles
  led by **task-orc** (ADR-011: one plan's loop per dispatch, in a
  worktree). Roles are assumed by direction, never inferred from the
  work's shape.
- **pi extension + agent-first CLI** (when built) — memory tooling,
  decisions inbox, status surface, `bee report`. Deterministic-first
  (ADR-014): scripts own state and checks; every command follows the
  ten AXI principles (`AXI.md`).
- **`.hivemind/` per repo** — each harnessed project's working space,
  one purpose per class: decisions (why it's this way), designs (what
  to build), plans (how), phases (when/next), logbook (what
  happened), suggestions (the inbox), memory (deferred), sessions
  (live).

Custom-fit to its human. Built by learning from real work on this
machine. See `SOUL.md`.

## Foundations

| Foundation | Relationship |
|---|---|
| Pi | base harness — coupled, embraced |
| Paseo | human↔agent surface + dispatch — coupled, embraced |
| subagents extension | we may extend it; it must never depend on us |
| Superpowers | workflow inspiration only, during bootstrap — to be replaced by bee-native equivalents; zero new coupling |

## Documents

- `SOUL.md` — identity & values (planner-facing; implementers may skim)
- `AGENTS.md` — always-applicable rules for any agent in this repo
- `AXI.md` — the ten agent-first CLI principles, binding for `bee`
- `roles/` — role specs (power-planner, project-orchestrator, task-orc)
- `.hivemind/` — the hive's working space; purposes per class live in
  the design doc's artifacts map

Name is a placeholder. Everything here is a work in progress — and
its current state lives in the queue, not here.

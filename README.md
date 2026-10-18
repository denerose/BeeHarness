# BeeHarness (name TBC)

Status: **early design** — we are building the harness that will build
this project (and every project after it). Design first; code comes
later, under approved plans.

## What this is

The **pi plugin** for one human and a swarm of agents — an agent harness
layered on [Pi](https://github.com/earendil-works/pi-coding-agent) and
Paseo:

- **`skills/`** — all bee-* workflow skills. Single source of truth:
  registered machine-wide via `~/.pi/agent/settings.json`
  (`"skills": ["~/BeeHarness/skills"]`); every harnessed repo uses them;
  edits here go live everywhere. Git here is the drift defense.
- **pi extension + lightweight CLI** (when built) — memory tooling,
  decisions inbox, status surface.
- **`.hivemind/` per repo** — each harnessed project keeps its own
  working docs and ephemera (decisions, designs, plans, phases,
  suggestions, memory, sessions).

Custom-fit to its human. Built by learning from real work on this
machine. See `SOUL.md`.

## Foundations

| Foundation | Relationship |
|---|---|
| Pi | base harness — coupled, embraced |
| Paseo | human↔agent surface + dispatch — coupled, embraced |
| subagents extension | we may extend it; it must never depend on us |
| Superpowers | workflow inspiration only, during bootstrap — will be removed; zero new coupling |

## Documents

- `SOUL.md` — identity & values (planner-facing; implementers may skim)
- `AGENTS.md` — always-applicable rules for any agent in this repo
- `.hivemind/` — ADRs (`decisions/`), designs, plans, phase lists,
  suggestions, memory, session state — the hive's working space

Name is a placeholder. Everything here is a work in progress.

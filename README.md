# BeeHarness (name TBC)

Status: **early design** — we are building the harness that will build this
project (and every project after it). Design first; code comes later, under
approved plans.

## What this is

An agent harness for one human and a swarm of agents, layered on
[Pi](https://github.com/earendil-works/pi-coding-agent) and Paseo:

- a **pi extension** + **lightweight CLI** (tooling layer)
- a set of **skills and rules** (workflow layer) — planning, orchestration,
  implementation loops, review
- **memory, handoff, and decision records** (continuity layer) so work
  survives context limits and session boundaries

Custom-fit to its human. Built by learning from real work on this machine,
not designed in the abstract. See `SOUL.md`.

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
- `docs/` — ADRs, specs, plans as they land (structure grows with the work)

Name is a placeholder. Everything here is a work in progress.

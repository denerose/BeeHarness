# Plan: README roles refresh (pilot bee-loop #1)

**Date:** 2026-10-20
**Design doc:** none — bounded task (README is stale by one event: the
roles split of 2026-10-18/20, recorded in ADR-003 amendment)
**Validation level:** task (doc change; checks = claims-vs-reality file
existence + content greps — no build suite exists in this repo)
**Detail:** full — the whole new README is verbatim below; implementation
is mechanical replacement
**Reviewed:** plan-reviewer passed 2026-10-20 (accuracy verified against
live files; one 🟡 fixed: content-replacement checks added so the old
README cannot pass)

> Loop run 2026-10-20: expected grep count for `project-orchestrator`
> corrected 2 → 3 after implementation (actual: status line + roles
> bullet + Documents line). Disclosed in the task 1 verify record.

## Task 1: Update README.md for the roles split and build-track start

**Files:** modify `README.md`
**Depends on:** nothing
**Provides:** a README whose every claim resolves to something real

- [x] Step: replace the full content of `README.md` with:

```markdown
# BeeHarness (name TBC)

Status: **design and build in parallel** — two roles carry the project:
the power-planner shapes (discussion, architecture, decisions, design
docs); the project-orchestrator builds (plans, the bee-loop,
subagents, gates, phase lists). Bee skills v1 are written,
comprehension-tested, and registered machine-wide; the first pilot
bee-loop is running.

## What this is

The **pi plugin** for one human and a swarm of agents — an agent
harness layered on [Pi](https://github.com/earendil-works/pi-coding-agent)
and Paseo:

- **`skills/`** — all bee-* workflow skills. Single source of truth:
  registered machine-wide via `~/.pi/agent/settings.json`
  (`"skills": ["~/BeeHarness/skills"]`); every harnessed repo uses
  them; edits here go live everywhere. Git here is the drift defense.
- **`roles/`** — named mandates for agent sessions: **power-planner**
  (shapes: discussion, architecture, decisions, design docs) and
  **project-orchestrator** (builds: bee-plan, bee-loop, subagents,
  verify/review gates, phase lists). The design doc is the handoff
  artifact between them (ADR-003). Roles are assumed by direction,
  never inferred from the work's shape.
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
- `roles/` — role mandates (power-planner, project-orchestrator)
- `.hivemind/` — ADRs (`decisions/`), designs, plans, phase lists,
  suggestions, memory, session state — the hive's working space

Name is a placeholder. Everything here is a work in progress.
```

- [x] Step: verify claims-vs-reality (all must pass):
  - `grep -c 'project-orchestrator' README.md` → `3` (status line +
    roles bullet)
  - `grep -c 'roles/' README.md` → `2` (What-this-is bullet +
    Documents line)
  - `grep -c '"~/BeeHarness/skills"' ~/.pi/agent/settings.json` → `1`
  - `ls roles/` → `power-planner.md`, `project-orchestrator.md`,
    `README.md` all present
  - `grep -c "power-planner — shapes" .hivemind/decisions/003-document-pipeline.md` → `1`
  - `ls .hivemind/decisions .hivemind/designs .hivemind/plans .hivemind/phases .hivemind/suggestions .hivemind/memory` → all exist
  - `ls SOUL.md AGENTS.md README.md` → all exist
- [x] Commit: `refresh README for roles split`

## Phase exit

- Verify record written to
  `.hivemind/records/readme-roles-refresh-task1-verify.md` with PASS
- Review report written to
  `.hivemind/records/readme-roles-refresh-task1-review.md`
- Work-item state: done (via the two records)
- Keeper reads the new README — the pilot's real acceptance test

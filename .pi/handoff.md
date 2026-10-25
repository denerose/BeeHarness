# Handoff

> **SUPERSEDED (2026-10-25):** handoffs are per-role now (ADR-007
> rule 8). Use `.pi/handoff-power-planner.md` and
> `.pi/handoff-project-orchestrator.md`. This generic file remains for
> history until deleted.

**Updated:** 2026-10-18 21:40
**Previous:** 2026-10-18 21:05

## Working mode — read this before the task state

Two roles now run in parallel; session memory is split per role
(`.hivemind/sessions/<role>.md`):

- **power-planner** (full mandate: `roles/power-planner.md`) —
  discussion and architecture only. Conversation first, prose
  exploration, no question cards while exploring; draft early; park
  rather than press; plain language. First action: announce the
  resumed role, continue the conversation — don't re-interview.
- **project-orchestrator** (`roles/project-orchestrator.md`, forming)
  — the build: bee-plan, bee-loop, subagents, gates, phases. Design
  decisions escalate to the keeper; never resolved silently.

## What We're Building

BeeHarness — a personal agent harness as a **pi plugin** (this repo):
`skills/` (all bee-* workflow skills, single source of truth),
`.hivemind/` per repo for working docs/ephemera, plus a future extension
+ CLI. Built bootstrap-style by the keeper + power-planner; superpowers
is reference-only and will be removed.

## Current State

Workflow-capture phase essentially complete; skills await keeper review;
registration + pilot run not started.

### Completed This Session
- SOUL.md, README.md, AGENTS.md (identity, human face, repo law)
- ADRs 001–006 + amendments (`.hivemind/decisions/`): three-tier memory,
  git identity, document pipeline, right-sized validation, work modes +
  plugin model + .hivemind layout, verification boundaries
- Repo migrated to final layout: `.hivemind/{decisions,designs,plans,
  phases,suggestions,memory,records,sessions}`
- Git identity live: commits as `denerose-pi`; origin
  github.com/denerose/BeeHarness (https + gh token); PL-001 resolved
- **Seven skills in `skills/`**: bee-brainstorm, bee-plan, bee-loop,
  bee-review, bee-verify, bee-hindsight + bee-skill-tester (aux), with
  templates in each `assets/` and shared `skills/GLOSSARY.md`
- Skills comprehension-tested by six scout subagents; all findings fixed
- One suggestion filed: `.hivemind/suggestions/2026-10-18-waiting-state-
  must-be-honest.md` (approved)

### In Progress
- Keeper review of skills — recommendation: read `skills/bee-loop/SKILL.md`
  + `skills/GLOSSARY.md` first; the rest follow from those

### Not Yet Started
- Register skills machine-wide: add `"skills": ["~/BeeHarness/skills"]`
  to `~/.pi/agent/settings.json` (verify exact merge shape first)
- First pilot bee-loop run on a small real task
- Orchestration design (phase 3), memory tooling (PL-002), power-planner
  role codification, name TBC

## Key Decisions

All in `.hivemind/decisions/` (ADRs) + temp memories 13–19 in
`.hivemind/sessions/<role>.md`. Highlights: work modes are opt-in
(ADR-005); states move only on records (ADR-006); plugin model with no
per-repo skill layer (ADR-005 amendment); writing standard: plain
language, define-or-link via GLOSSARY (scout-validated).

## Known Issues

- Paseo UI showed stale "working" agents: zombie `6c9aa42e`/`6c545cf7`
  (pdf-reader session parked on an unanswered ask_user card, running
  since earlier) + idle/closed-never-archived entries. True state:
  nothing working but this session. UI cleanup pending on keeper side.
- Unexplained: user `kim` ran `/home/kim/.local/bin/paseo start
  --foreground` — not from this session; keeper aware.
- Some successful scout entries weren't reaped by the subagents
  extension (policy says delete-on-success).

## Important Files

- `skills/` — the seven skills + GLOSSARY (the product, so far)
- `.hivemind/sessions/<role>.md` (yours) — full decision log incl. temp
  memories 13–19 (gitignored but on disk; read it first)
- `.hivemind/memory/parking-lot.md` — PL-002 parked
- `.hivemind/plans/2026-10-18-continuity-layer.md` — SHELVED design
  input for the future memory build
- `SOUL.md`, `AGENTS.md` — identity + law

## Plans

- Only the shelved continuity plan above; skills were built directly
  (bootstrap exception).

## Environment Notes

- `paseo` CLI at `/home/saphron/.local/bin/paseo` (not on bash PATH)
- Push works over https via gh credential helper (denerose-pi, workflow
  scope); ssh host key for github.com absent from known_hosts
- Next session boot: run `pickup-handoff`, then read
  `.hivemind/sessions/<role>.md` (your role file)

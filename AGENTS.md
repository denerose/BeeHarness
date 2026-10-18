# BeeHarness — AGENTS.md (work in progress)

Always-applicable rules for any agent working in this repo. Identity and
values live in `SOUL.md` — planners should read it fully; implementers may
skim it. This file is the operational layer: what applies on every task.

## Current mode: DESIGN

We are designing the harness before building it. Right now:

- Discussions produce **documents** (specs, ADRs, plans) — not code.
  Implementation requires an approved plan (focus discipline).
- Every design decision worth keeping becomes an **ADR** once agreed
  (use the `adr` skill). Unrecorded decisions are lost decisions.
- Drafts are cheap: when context is sufficient, produce a concrete draft
  to react to instead of asking more questions. Refine together.

## Bootstrap conventions (until the harness MVP)

- Continuity runs scrappy by design (ADR-001 amendment):
  `.bee/session.md` = live session state; `memory/parking-lot.md` =
  deferred decisions (keeper alone unparks); decisions → ADRs.
- Session memory may hold project knowledge until the harness lands;
  promote on landing. Pain valve: rough `memory/` shards ad hoc if debt
  hurts. Nothing gets built with the harness before MVP.

## Rules of engagement

- Ask one question at a time, and **always recommend** — never present a
  bare menu. Use the `ask_user` tool (Paseo question card) for decisions.
- Verify every factual claim (call sites, tool names, paths) before
  dispatching subagents — brief prose is cheap to check, expensive to retrofit.
- Evidence over assertion: no "done" or "works" claim without verification
  output. Reproduce bugs before fixing them.
- Commit messages: short imperative commands, ≤10 words.
- When context runs short, run a handoff (`handoff` skill) rather than
  guess; resume with `pickup-handoff`.
- Until the memory system exists: durable design knowledge lives in ADRs
  and specs under `docs/`; session state lives in handoffs.

## Document hierarchy

| Layer | Document | Audience |
|---|---|---|
| Identity & values | `SOUL.md` | human + planners primarily |
| Repo rules | `AGENTS.md` (this file) | all agents, always |
| Decisions | `docs/adr/NNN-*.md` | anyone asking "why" |
| Work | `docs/specs/`, `docs/plans/` | whoever executes |

Charter (scope/success) and collaboration contract (mandates, escalation)
are planned documents — see backlog.

## Tooling constraints

- We may extend the subagents extension (`~/.pi/agent/extensions/subagents`)
  but must never make it depend on BeeHarness.
- Pi and Paseo coupling is welcome everywhere.
- Superpowers skills are reference material during bootstrap: learn the
  patterns, write our own — do not import or depend on them.

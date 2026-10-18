# BeeHarness — AGENTS.md (work in progress)

Always-applicable rules for any agent working in this repo. Identity and
values live in `SOUL.md` — planners should read it fully; implementers
may skim it. This file is the operational layer: what applies on every
task.

This repo IS the pi plugin: top-level `skills/` is the single source of
truth for all bee-* skills (registered machine-wide via
`~/.pi/agent/settings.json`). Edit skills here; never copy them
elsewhere.

## Current mode: DESIGN

We are designing the harness before building it. Right now:

- Discussions produce **documents** — never implementation without an
  approved plan (focus discipline).
- Every design decision worth keeping becomes an **ADR** once agreed
  (use the `adr` skill). Unrecorded decisions are lost decisions.
- Drafts are cheap: when context is sufficient, produce a concrete
  draft to react to instead of asking more questions. Refine together.

## Work modes (all opt-in — never auto-escalate ceremony)

- **Direct work** — talk/ask/small changes; normal norms; no gates.
- **Design mode** — interactive, human-gated shaping; ends with a
  parking-lot loop-back gate.
- **Bee-loop** — the orchestrated pipeline; entered ONLY by explicit
  direction.

## Rules of engagement

- Ask one question at a time, and **always recommend** — never a bare
  menu. Use the `ask_user` tool (Paseo card) for decisions.
- Verify every factual claim (call sites, tool names, paths) before
  dispatching subagents.
- Evidence over assertion: no "done"/"works" claim without verification
  output. Reproduce bugs before fixing them.
- Commit messages: short imperative, ≤10 words.
- When context runs short, run a handoff (`handoff` skill); resume with
  `pickup-handoff`. Every handoff ends with a memory sync and
  parking-lot sweep.

## Layout & continuity (bootstrap conventions until the harness MVP)

<!-- adr-path: .hivemind/decisions -->

- `.hivemind/` holds all hive working docs and ephemera:
  `decisions/` (ADRs) · `designs/` · `plans/` · `phases/` (orchestrator
  phase lists) · `suggestions/` (hindsight inbox) · `memory/` (parking
  lot + future shards) · `sessions/` (gitignored live session state).
- Session memory: `.hivemind/sessions/session.md` — update at each
  decision point; re-read after compaction/fork/new session.
- Parking lot: `.hivemind/memory/parking-lot.md` — any agent may
  propose parking; ONLY the keeper unparks or resolves. Brainstorms end
  with a loop-back gate over it.
- Scrappy continuity is sanctioned (ADR-001 amendment): session memory
  may hold project knowledge until the harness lands. Nothing gets built
  with the harness before MVP.

## Tooling constraints

- Pi and Paseo coupling is welcome everywhere.
- The subagents extension may be extended but must never depend on us.
- Superpowers skills are reference material during bootstrap: learn the
  patterns, write our own — never import or depend on them.

# ADR 005: Work modes are opt-in; bee- namespace; hivemind/ for AI docs

**Date:** 2026-10-18
**Status:** Accepted

## Context

Superpowers' mandatory-invocation model ("use this before ANY creative
work") hijacks small tasks with big-task energy — a two-line fix gets
ratcheted toward a spec. Real work has three distinct modes, and the
harness must not blur them. Separately: harness workflow skills will
collide by name with installed superpowers skills during coexistence,
and with the keeper's personal global skills. And `docs/` as the home
for plans/specs is itself a superpowers-ism.

## Decision

1. **Work modes (all opt-in, never auto-escalated):**
   - **Direct work** — talk/ask/small changes; normal norms (recommend
     always, evidence, short commits); no gates. Most work lives here.
   - **Design mode** — interactive, human-gated shaping (power-planner);
     entered deliberately; ends with parking-lot loop-back.
   - **Bee-loop** — the orchestrated pipeline (plan → review plan →
     implement → review against plan → validate); entered ONLY by
     explicit direction from the keeper or a directed role. No skill
     infers loop entry from task size or type.
2. **bee- namespace.** All harness workflow skills are prefixed `bee-`
   (bee-brainstorm, bee-plan, bee-loop, …). The keeper's global skills
   (plan, plan-reviewer, triage, …) remain unprefixed and **untouched** —
   they are the personal general toolkit, used across all projects
   including non-BeeHarness ones. Bee- skills may borrow their content;
   they never modify, move, or replace them.
3. **hivemind/ directory** in-repo for AI working docs (plans, phase
   lists, decisions, session state as needed). Structure to be proposed
   and finessed *before anything is placed in it*; the current `docs/`
   tree (adr/specs/plans) migrates at that point. `docs/` is thereafter
   reserved for human-facing documentation.

## Alternatives Considered

### Keep superpowers' mandatory invocation
**Pros:** nothing small ever slips through unreviewed.
**Cons:** hijacks direct work; ceremony cost on the 90% case; the
keeper explicitly rejects it (primary removal driver).

### One adaptive mode (agent picks ceremony by size)
**Pros:** no explicit entry, less friction.
**Cons:** mode inference IS the hijack problem wearing a smarter hat;
boundary judgment drifts; the keeper stays the mode authority.

### Rename at superpowers-removal time instead of prefixing
**Pros:** unprefixed names post-removal.
**Cons:** shadowing risk during coexistence; a permanent namespace is
clearer anyway — prefix says "this is harness machinery, not personal
toolkit."

## Consequences

### Positive
- Direct work stays direct; the loop carries its own visible marker.
- Collision-proof naming; personal toolkit provably untouched.
- AI docs get their own home, not borrowed product-doc conventions.

### Negative
- Two planning skills exist (global `plan` personal, `bee-plan` loop)
  with borrowed-but-diverging content — duplication accepted knowingly.
- `docs/` → `hivemind/` migration owed before the bee- skills land.

## Affected Areas

- All future bee- skills; harness AGENTS.md rules; repo layout
  (hivemind/ pending); global skills (explicitly NOT affected).

## Amendment (2026-10-18): final layout — the plugin model

Simplification after further discussion (drift avoidance + personal-use
scope beat per-repo flexibility):

1. **This repo IS the pi plugin.** All bee-* skills live in top-level
   `skills/`, registered once machine-wide:
   `~/.pi/agent/settings.json` → `"skills": ["~/BeeHarness/skills"]`.
   Every harnessed repo gets them; edits here go live everywhere on
   next session start; git here is the drift defense.
2. **No per-repo skill layer.** The `.bee/skills/` host-override layer
   was considered and dropped: same-name shadowing risk + flexibility
   without a consumer. `.bee/` does not exist.
3. **Every harnessed repo (including this one) keeps its own
   `.hivemind/`** (dot-container) for working docs + ephemera:
   `decisions/` · `designs/` · `plans/` · `phases/` · `suggestions/` ·
   `memory/` · `sessions/` (gitignored, seeded by init).
4. **`bee init` (future)** scaffolds `.hivemind/`, seeds the parking
   lot, gitignores sessions, merges an AGENTS.md bee-block behind
   markers (never clobbers), optional SOUL stub, offers git init.
   Identity-neutral about accounts (ADR-002 is a policy instance).
5. Supersedes the original decision 3 in part: `hivemind/` →
   `.hivemind/`; `docs/` reservation stands (created when a human-facing
   doc first exists). ADR-001 tier locations finalize as
   `.hivemind/sessions/` (session) and `.hivemind/memory/` (project).

## References

- ADR 003 (document pipeline — bee-plan targets), ADR 004 (right-sized
  validation — same scaling principle), SOUL (lightweight & decoupled)

# Continuity Layer — Design Spec

**Date:** 2026-10-18
**Status:** Design input for the harness build — near-term implementation
shelved 2026-10-18 (ADR-001 amendment: bootstrap exception). Discovery
model superseded by headers-as-index; timing now "with the harness".
**ADRs:** [001](../adr/001-three-tier-memory.md) (memory), [002](../adr/002-git-identity-model.md) (git)

## Purpose

Work must survive context death (compaction, model switch, session end,
forking) without clogging future work. This layer adds memory, a parking
lot, and handoff conventions **on top of** Pi's native compaction and
session features — never replacing them.

## Scope of this phase

Content and conventions only — markdown files, rules, one skill. No
extension code, no CLI. Enforcement is by rules; automation is a later
phase if the discipline proves insufficient.

## Components

### 1. Session memory — `<repo>/.bee/session.md`

Live, continuously updated, gitignored. Sections: Mode, Where we are,
Decisions landed, Threads, Immediate thread. Agents update it at each
decision point and **re-read it after compaction, model switch, fork, or
new session**. Retired at session end via promotion (below).

### 2. Project memory — `<repo>/memory/`

Committed. `INDEX.md` (the shelf card: one line per shard) + topic
shards (`kebab-case.md`). Holds project state and knowledge; **decisions
live in ADRs** — memory points at them, never restates them. The parking
lot lives here.

### 3. Harness memory — `~/.pi/agent/memory/`

Machine-local, outside git (accepted risk, see ADR 001). Same
INDEX+shard shape. Seed shards: `machine.md` (accounts, paths, tools —
verified facts only), `user.md` (working-style lessons), `workflow.md`
(cross-project conventions like mandates, the brainstorm modes).

### 4. Parking lot — `<repo>/memory/parking-lot.md`

Already exists (PL-001). Deferred decisions, session-independent. Any
agent may propose parking; **only the human unparks/resolves**. Format
stays as currently written. The brainstorm process ends with a loop-back
gate over it.

### 5. Loading chain

- Global `~/.pi/agent/AGENTS.md` gains one pointer line →
  `~/.pi/agent/memory/INDEX.md`
- Project `AGENTS.md` gains one pointer line → `memory/INDEX.md`
- Indices are small; shards load on demand. No auto-injection of shard
  contents.

### 6. Memory skill — `~/.pi/agent/skills/memory/`

Encodes the rituals for all agents in all projects:
- **Read:** consult the relevant INDEX before planning/execution work.
- **Write (planners):** add/update shards and INDEX lines directly.
- **Propose (implementers):** memory candidates go in the completion
  report; never write memory directly.
- **Promote (at handoff/session end):** session → project/harness memory;
  deferred items → parking lot; discard the rest; then clear session file.
- **Park:** move an item to the parking lot with context + recommendation
  + unpark condition.

### 7. Handoff integration

The existing `handoff` / `pickup-handoff` skills remain generic and
untouched. BeeHarness adds one rule (in AGENTS.md files): **every
handoff ends with a memory sync and a parking-lot sweep** — i.e. run the
memory skill's promote step as the last handoff action.

## File formats

**INDEX.md** — table: `| shard | one-line summary |` plus a header line
stating the rule ("planners write, implementers propose, keeper prunes").

**Shard** — `# Topic` + dated bullet entries, newest last. Each entry
short enough to scan.

**session.md** — as currently dogfooded in this repo (`.bee/session.md`).

## Verification approach

No unit tests (no code). Each plan task verifies by: files exist at
stated paths; pointer lines resolve to existing files; a fresh `pi -p`
session in a test repo sees the global chain (AGENTS.md is
auto-loaded — the pointer's presence is checkable via `pi --print`/json
mode system-context inspection); git history shows agent authorship.

## Out of scope (parked or later phases)

- Extension-based injection/enforcement; memory pruning automation;
  cross-machine sync or backup of harness memory; compaction hooks;
  power-planner role codification (validating first); project naming.

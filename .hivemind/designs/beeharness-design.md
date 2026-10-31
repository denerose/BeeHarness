# BeeHarness — design (governing document)

**Status:** living document — ratified by keeper direction 2026-10-25;
changes via ADR-003's amendment ritual.

## What BeeHarness is

A personal agent harness for one keeper and a swarm of agents, built as
a **pi plugin** (this repo): `skills/` (single source of truth,
registered machine-wide via `~/.pi/agent/settings.json`),
`roles/` (named mandates), `.hivemind/` per repo (working docs and
ephemera), and — not yet built — a pi extension + `bee` CLI (memory
tooling, decisions inbox, status). Coupled deliberately to Pi + Paseo;
decoupled from everything else. Superpowers was inspiration only.

## The two-role model (parallel by default)

| | power-planner | project-orchestrator |
|---|---|---|
| does | discussion, architecture, decisions, design docs | implementation plans, bee-loop, subagents, gates, phase tracking |
| entry | keeper opens design work; by direction | by direction, handed approved designs |
| authority | proposes everything, decides nothing alone | runs freely inside mandate; escalates design conflicts |
| memory | `.hivemind/sessions/power-planner.md` | `.hivemind/sessions/project-orchestrator.md` |
| handoff | `.pi/handoff-power-planner.md` | `.pi/handoff-project-orchestrator.md` |

The design doc (this class of artifact) is the relay artifact between
them.
Implementer/reviewer roles arrive with the orchestration build. Roles
are defaults, not walls (ADR-007 rule 11).

## Decision and memory model

- **Ownership is the routing axis** (keeper reframe, 2026-10-20):
  durable records (ADRs, project memory, parking-lot entries) carry the
  *keeper's* decisions — created only on the keeper's word or accepted
  offer; session memory is the *agent's* live voice, written freely.
- ADR-worthiness test: did the keeper actually decide, about long-term
  direction? Proportionality ladder: conversation → session → commit
  message → parking lot → ADR.
- Memory tiers (target architecture, ADR-001): session / project /
  harness, implemented with the harness build; bootstrap runs scrappy
  by sanctioned exception.

## Workflow

Three opt-in modes (ADR-005): **direct work** (no ceremony — most
work), **design mode** (power-planner, conversation-first), **bee-loop**
(explicit direction only). The loop: plan (bee-plan) → review plan
(global plan-reviewer gate) → implement → verify (bee-verify, levels =
the validation dial, ADR-004 + amendment) → review (bee-review) →
record; states
`draft → implemented → verified → reviewed → done` move only on
evidence in `.hivemind/logbook/` (ADR-006). Fix rounds bounded at two,
then escalate. Git topology (ADR-012): main = governance + surfaces;
`phase/<n>` = PO's integration spine in a worktree; `task/…` worktrees
per dispatch; dispatches run task-orc (ADR-011), the first dispatched
role under the one-role schema (ADR-010).

## Determinism & agent-first surfaces (ADR-014)

Scripts before skills: if two careful people following the same rules
produce the same result, it is a script — scripts own state, checks,
structure, and derived views; agents own drafting, judgment, dispatch,
conversation. Storage follows the primary reader: agent-primary stores
(inbox, memory, parking lot, suggestions, dispatch briefs and digests)
go TOON; mixed documents (logbook entries, plans, ADRs, role files)
carry a machine header with a prose body; keeper-facing views render
to prose; relay prompts stay readable (the keeper gates them). The
`bee` CLI is bound to the ten AXI principles (`AXI.md`). No store
converts by hand ahead of the tool that owns it.

## Concurrency (ADR-007)

Parallel roles share one repo safely by **partition + ownership**, not
locks: role-prefixed IDs (PL-PP/PL-PO), a write-ownership table per
artifact, commit discipline (stage owned files only, never `add -A`;
pull --rebase, push promptly), `Role:` trailers for attribution,
escalation envelopes on every ask_user card, per-role sessions and
handoffs, versioned records that always land in the main checkout, and
an owner column on the phase list.

## Cross-role visibility (interim)

`.hivemind/status.md` — open escalations, ADRs awaiting the keeper's
flip, cross-role notes. Both roles read at session start. Replaced by
the decisions inbox when built. Validated 2026-10-25 (keeper-valued):
**ambient pickup** — the orchestrator's build-track asks reached the
power-planner through these surfaces and the keeper report, with no
keeper relaying. The keeper gates direction, not context; whatever
replaces these surfaces must preserve that.

## Artifacts map

`.hivemind/` — one purpose per class: `decisions/` (ADRs — *why it's
this way*; keeper's voice) · `designs/` (*what to build*; this doc and
event designs) · `plans/` (*how*; step-by-step, loop-executed) ·
`phases/` (*when/next* — the queue and tracking) · `logbook/` (*what
actually happened* — verify/review accounts; states move on these,
ADR-006/013) · `suggestions/` (the hive's inbox — any role + keeper) ·
`memory/` (parking lot; shards later) · `sessions/` (per-role live
memory, gitignored) · `status.md` (cross-role surface) ·
`keeper-report.md` (the keeper's zoned digest, ADR-008). Root:
`SOUL.md`, `README.md`, `AGENTS.md`, `roles/`, `skills/`. Write
ownership per ADR-007's table (+ amendments: root files, branch
scope).

## Not built yet (bootstrap honest ledger)

Extension + `bee` CLI (memory tooling, decisions inbox, status surface,
`bee init`, `bee suggest`); memory system implementation (PL-002);
orchestrator/reviewer role codification + git strategy (phase-3
brainstorm); power-planner codification is done, orchestrator is
forming (model session running); harness name TBC.

## Open threads

See `.hivemind/memory/parking-lot.md` (PL-002, PL-003, PL-004) and the
session files' thread lists. Standing rule: while the harness is being
designed, nothing is sacrosanct (plasticity); once built, firm.

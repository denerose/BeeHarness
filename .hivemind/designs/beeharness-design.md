# BeeHarness — design (governing document)

**Status:** drafted by power-planner 2026-10-25, consolidating agreed
decisions (ADRs 001–007 + keeper-directed sessions 2026-10-18..25).
Keeper ratifies by read; changes via ADR-003's amendment ritual.
**Living document** (undated filename on purpose — event docs carry
dates, governing docs don't).

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
the validation dial, ADR-004) → review (bee-review) → record; states
`draft → implemented → verified → reviewed → done` move only on
evidence in `.hivemind/records/` (ADR-006). Fix rounds bounded at two,
then escalate.

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
the decisions inbox when built.

## Artifacts map

`.hivemind/`: `decisions/` (ADRs) · `designs/` (this doc and event
designs) · `plans/` · `phases/` (phase lists) · `records/` (verify/
review evidence) · `suggestions/` (hindsight inbox, any role) ·
`memory/` (parking lot now; shards later) · `sessions/` (per-role,
gitignored) · `status.md` (cross-role surface) · `keeper-report.md`
(the keeper's zoned digest, ADR-008). Root: `SOUL.md`, `README.md`,
`AGENTS.md`, `roles/`, `skills/`. Write ownership per ADR-007's table
(+ Amendment 1: SOUL.md and README.md).

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

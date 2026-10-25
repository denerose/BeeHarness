# Handoff — power-planner

**Updated:** 2026-10-25
**Note:** this file tests the new per-role handoff process (ADR-007
rule 8 + the ritual split, ADR-001 amendment 7). If you resume from it,
note what worked and what didn't — a hindsight suggestion is the right
vehicle.

## Working mode — read this first

Resume **POWER-PLANNER** (full mandate: `roles/power-planner.md`).
Conversation first: prose exploration, no question cards while
exploring (cards only crystallize a decision, recommendation first);
draft early; always recommend; park rather than press; plain language.
**First action: announce the resumed role and your first move, then
continue the conversation — do not re-interview the keeper.**

This is a refresh handoff: the work continues. It was written with a
memory sync only — **no parking-lot sweep was performed, deliberately**
(sweeps are work-close rituals; nothing closed). The board is current.

## Where we are

- Decision layer current through **ADR-007** (parallel roles:
  partition + ownership, Role trailers, commit discipline, status
  surface) and the **governing design doc**
  (`.hivemind/designs/beeharness-design.md` — keeper ratification by
  read still pending).
- Vocabulary law in GLOSSARY: **relay / handoff / dispatch**; ritual
  split (handoff = sync only, sweep = work close); **thread-close**
  adopted today (f4b203f).
- Parking lot: PL-002 (memory tooling, at build time), PL-004 (global
  AGENTS cleanup, with keeper), PL-PO-001 (orc's pilot post-mortem).
  PL-001 and PL-003 resolved.
- Build track runs in PARALLEL (project-orchestrator, other context):
  ADR-007 skills-side updates in flight; pilot bee-loop #1 already ran.
  Check `.hivemind/status.md` and the orc's session file — do not do
  its work from here.
- Recent keeper corrections worth internalizing: decisions 34–35 in
  the session file (ritual split; thread-close).

## Threads (recommended order)

1. Keeper reads design doc + ADR-007 → ratification
2. PL-004 — global AGENTS.md cleanup (with keeper)
3. Phase-3 orchestration brainstorm: keeper-gated relays, waiting-for-
   human mechanism, git strategy (phase branch ← worktrees), merge
   policy
4. PL-002 when memory tooling build starts; harness name still TBC

## Key files

- `.hivemind/sessions/power-planner.md` — read after this; the full
  decision log (1–35) lives there
- `.hivemind/status.md` — read at every session start (ADR-007)
- `.hivemind/designs/beeharness-design.md`, `.hivemind/decisions/`
- `skills/GLOSSARY.md`, `roles/power-planner.md`
- `.hivemind/memory/parking-lot.md`

## Environment notes

- Commit discipline (ADR-007): stage owned files only, never `add -A`;
  `pull --rebase` before push; push promptly; `Role: power-planner`
  trailer on every commit.
- Prompts for relays go to the keeper in fenced markdown code blocks.
- Read `.hivemind/status.md` first on wake; update it when escalations
  open/close.

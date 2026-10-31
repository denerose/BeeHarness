# P4 inbox — design note (feeds the P4 bee-plan)

**Date:** 2026-10-25
**Status:** shape blessed by the keeper in session; this note is the
design input P4's bee-plan consumes. Not yet built — P4 is in the
phase queue.

## The problem

The hive's waiting states are scattered across five homes, each grown
as the need arose: ADRs awaiting the keeper's flip (status surface),
escalations (cards), cross-role tasks (status notes), the keeper's
come-back items (report), suggestions awaiting read. Nothing shows
"what is waiting on whom" in one place; directives can drown in a long
notice board; routing operational follow-ups through the keeper makes
the keeper a courier.

## The design

**The inbox is the single waiting-state home.** An item = addressee
(keeper or role) + origin + one line of what + optional recommendation
+ state (`open → taken → done`) + age. It is a queue, not a document.

**Views, not copies** (same architecture as the keeper report):
- the keeper's view = the report's *Needs the keeper* section,
  derived;
- the roles' view = what `status.md` becomes — the ambient notice
  board renders from the inbox instead of accumulating hand-written
  notes;
- the raw view = the CLI: `bee inbox` / `bee task add <role>
  "<text>"` / `bee task list --for <role>` / `bee task done <id>` —
  one line each, any role, any session, no keeper courier.

**Standing requirements (design invariants):**
1. Ambient pickup survives — roles read the inbox (or its status
   view) at wake; the validated property is an invariant, not an
   accident.
2. Altitude routing stays — the inbox carries operational follow-ups
   inside already-agreed direction. Direction itself travels by
   keeper-gated relay; the queue never becomes a way for roles to
   hand each other new mandates.

**Absorbs:** the status surface's awaiting-keeper queue; cross-role
note traffic; the suggestions' awaiting-read state.
**Does not touch:** ask_user cards (in-conversation interrupts); the
phase queue (work already shaped); the report's *Keeper's list* (the
keeper's persistent list — a queue is not a list).

## Interim stance (recorded so nobody extends it)

Until P4, the interim is **exactly** the status-surface notice board —
no new interim structures bolted onto it (keeper direction
2026-10-25). Open cross-role items ride ambient pickup; a sunk item is
cheap evidence for the inbox.

## Open questions for the P4 session

- Storage shape: one file vs a directory; whether suggestions merge
  into the inbox as keeper-addressed items or stay a sibling.
- Aging and staleness: does an unacknowledged item escalate, expire,
  or just age visibly?
- What `bee init` scaffolds in a fresh repo: an empty inbox from day
  one.

# P4 inbox — design note (feeds the P4 bee-plan)

**Date:** 2026-10-25
**Status:** shape blessed by the keeper in session; amended 2026-11-01
(ADR-014 addendum below); this note is the design input P4's bee-plan
consumes. Not yet built — P4 is in the phase queue.

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

## Addendum — 2026-11-01 (ADR-014: determinism + AXI session)

Open questions resolved by the keeper this session:

- **Storage shape:** the inbox is born-TOON — an agent-primary store;
  storage follows the primary reader.
- **Suggestions:** they merge in — the awaiting-read state absorbs
  into the inbox (one lean store of everything waiting on anyone).

Scope grows with ADR-014: `bee verify` and script-owned work-item
state moves land here; every new subcommand is AXI-compliant from
birth (`docs/AXI.md`); CLI-writing and AXI skills/rules are drafted in
this phase. Human-facing surfaces unaffected: the report and status
board stay rendered prose; relay prompts stay readable.

Still open for the P4 session:

- Aging and staleness: does an unacknowledged item escalate, expire,
  or just age visibly?
- What `bee init` scaffolds in a fresh repo: an empty inbox from day
  one.

## Task-orc codification (retired-PO feedback, 2026-11-01)

Evidence-first correction to the queued shape: the role file stays
MINIMAL — the plan is the real interface (a cold, self-contained
plan did the whole job; the dispatched agent needed nothing beyond
plan + minimal role file + GLOSSARY). Keeper direction: keep
everything minimal until proven useful. Codification is surgical,
and the real investment goes to plan-quality standards, not role
prose.
PP recommendations (pending the keeper's word; raw material: the
calibration index and its dispatch record):

- **Write in — deviation envelope:** deviations that repair the
  plan's own exit criteria are in-envelope; the pass-back carries
  them. (Inferred correctly once; now authorized.)
- **Write in — boundary reading:** running the shipped tooling (the
  task worktree helper) is dispatch mechanics, not source-reading;
  the boundary test holds on that reading.
- **Mark provisional:** stop-and-return never fired in contact —
  the one-hop escalation design is untested-in-use.
- **Nested reviews — split by level.** task-orc is exactly a
  subagent with a role file running bee-loop (no special machinery);
  the depth issue is one level down — bee-loop's review stage itself
  dispatches a cold reviewer, and a subagent-dispatching-a-subagent
  found no worker-type agent on its surface (P3 observation), so the
  review fell back to a cold scout analysis filed by task-orc
  (disclosed). Split: task-level reviews inside the dispatch may
  use that fallback, disclosed (the loop-runner's merge review
  backstops them); merge- and phase-level reviews are dispatched by
  the loop-runner at depth 1, where worker types exist — fresh,
  worker-typed. Codifies the de facto P3 arrangement.
- **Brief template:** gains one line stating what the dispatcher
  does while the dispatch runs (disciplines against peeking at the
  worktree mid-flight).
- **Plan quality:** bee-plan's self-contained-task standard (rule 4)
  is the interface that made cold dispatch work — codification
  attention lands there.

## Determinism build-out in P4 (ADR-014)

The addendum names `bee verify` and `bee task`; the shape, so the
P4 plan has real input:

- **`bee verify`** runs the checks a plan's header names (commands,
  file existence, output-vs-claim) and emits the structured logbook
  entry — machine header (role, date, verdict, record links), prose
  account only for anomalies. Agent judgment: "is this output sane."
  Structured output = counts and failures, never raw terminal dumps.
- **`bee task`** owns work-item state moves and plan task-state
  updates: the loop reads state, decides, and calls the script to
  move it. No hand-edited checkboxes in script-owned territory — an
  agent can still misstate, but it can no longer accidentally mark
  done what has no record.
- **Landing order:** inbox first (born-TOON, absorbs suggestions),
  then `bee verify` (its entries use the mixed-document header),
  then task state moves (reuses the inbox's store patterns).
- **Invariant (ADR-006):** claims still move states only via logbook
  records — the scripts write the records; they never bypass them.
- Every new subcommand is AXI-compliant from birth (`docs/AXI.md`).

# Automation levels — design note

<!-- machine
status: live
phase: -
hash: -
merge: -
-->

**Date:** 2026-11-01
**Status (prose mirror):** live — frame and rulings from the keeper,
2026-11-01 (three levels; keeper-only level changes; judge later).

## The problem

BeeHarness is taste- and workflow-heavy, so it is hands-on. Other
repos — a notetaking app, a blogsite — do not need the keeper at
every gate after the initial brainstorms. What they need is a per-
repo dial over how much flows to the keeper and how much is handled
agent-side, with a safety valve for the hard calls.

## The design

**Three levels, set per repo at init. Level changes are keeper-only
— never agent-triggered, no self-firing ratchet (keeper ruling
2026-11-01).**

- **L0 — hands-on** (this repo; anything taste-heavy): current law.
  Keeper gates direction; relays are keeper-passed; decisions are
  cards.
- **L1 — assisted** (safe default for new projects): PO and PP
  converse directly for questions inside the ratified design — PO's
  forks land in a relay queue, PP answers from the design and its
  mandate or escalates on judgment. The keeper becomes the appeals
  court plus the gate list, not the switchboard.
- **L2 — autonomous**: the full agent-to-agent loop. PP↔PO free
  converse, digests to the keeper, the judge slot available.

**The irreducible keeper gates (every level):** SOUL/identity
changes; irreversible acts (deletion, publishing, spending);
direction changes beyond the ratified design; anything the repo's
config explicitly names. Everything else compresses per level.

**Where the dial lives:** the repo's config, scaffolded by init
(machine-readable; the P6 init contract).

**Role-law amendment, scoped to automated repos:** PP gains an entry
path via the relay queue (L0's never-a-subagent, keeper-opened-only
stands unchanged). At L1/L2 the relay is role-gated at design
altitude, not keeper-gated.

**Relay mechanics (researched 2026-11-01 — see
`docs/research/paseo-session-messaging.md`):** the Paseo daemon
owns the standing tabs; `paseo send <peer-id> --prompt-file <msg>
--no-wait` delivers into a live session, `paseo ls --json`
resolves peers, `paseo wait` + `paseo logs --filter text` read
replies. The L1 relay builds on this: a thin `bee ping <role>`
(name/label resolution, status check, self-identifying message).
CAVEATS this install: send to a busy agent interrupts its running
turn (0.11.4 has no steer flag) — always check status first; no
sender attribution (self-identify in the message); poll-based
replies. When pi gains MCP support, the daemon's send_agent_prompt
(finish-notifications, steer-default) becomes the native upgrade.
A pi-extension file-inbox watcher is the Paseo-free alternative.

**Handoff variants (keeper ruling, 2026-11-01):** the handoff
pair is SPECIFIC to same-agent-role sessions — one mechanic
(compact → file → boot), three possible gate-sets, and the gates
are policy: (1) keeper-triggered (the bee pair as built — prompt
delivered in-chat, keeper pastes); (2) subagent spin-up is NOT a
handoff case — dispatched contexts boot from the dispatch brief
(ADR-011); any subagent refinement lands as separate DISPATCH
guidance, never as a pair retrofit; (3) self-triggered (P11
variant): same-role refresh without the keeper pass — delivery
via `paseo run` of the wake prompt, entry declared by the handoff
file; law gaps: the role exception (delegate harder first;
self-handoff only when delegation cannot save the context,
  disclosed, once) and a spiral guard. The global kit's ungated
pair is the reminder that the core mechanic is scenario-agnostic
— the gates are ours to layer.

**The stop-and-ask behavior (keeper ruling 2026-11-01 — NOT a
consulted instrument):** "do I need to stop and ask" is EMBEDDED IN
THE LOOPS — a **skill + hook pattern**: the reasoning lives in a
skill; hooks at the loop's decision points call it. It is an
ongoing tweak, never one-and-done, and it serves every level — the
levels govern what happens *after* the check, not whether it runs.
(The escalation rules in both role files are its decision table's
first draft.)

**The judge:** a named slot — a cold consult, automated repos only,
invoked by PP when uncertain above a risk threshold; returns
keep-going or stop-and-wait with reasons; PP stays the decider.
Fully designed when the first L2 repo exists (keeper ruling:
later).

**Determinism split:** level read/write and gate-list checks are
scripted (init scaffolds, config validates); ping-vs-answer is the
skill's judgment; level changes are the keeper's alone.

## Open questions

The judge's full shape (deliberately deferred to the first L2
repo). The hook points in the loop (consume with the loop skills'
next pass — P8+). The relay-queue mechanics beyond the P4 inbox's
existing shape.

## Feeds

P6 (pre-scaffolding ONLY: init scaffolds the level + gate list —
nothing else before P11); the P11 build (the relay mechanics, the
skill + hook pattern in the loop skills, L2 mode, judge, level
tooling — keeper ruling 2026-11-01: its own phase, must not block
getting to P8; the P4 inbox provides the queue shape); PL-PP-010
(the do-I-need-the-keeper half
is re-scoped to this skill+hook pattern; rubber-duck unchanged).

---
kit: session
name: bee-relay
description: Carries context between roles as a final artifact — gated (keeper-passed) or ambient (shared surfaces). One topic per relay, self-contained, correctly sized; keeper-facing blocks are final — deltas arrive as standalone addenda.
---

# bee-relay

Move context from one role to another as a finished artifact: the
recipient acts on the relay block (GLOSSARY: relay block) alone. Read
`../../GLOSSARY.md` (the shared bee glossary, sibling of this kit
folder) first — especially its relay and handoff entries: a relay
crosses roles, a handoff refreshes one; they never substitute.

## The contract

Every relay block, gated or ambient, carries:

1. **One topic.** One relay moves exactly one topic; a second topic
   is a second relay.
2. **Numbered items.** The substance comes as a numbered list the
   recipient can quote back item by item.
3. **Self-contained context.** The recipient reads nothing else —
   not the drafting conversation, not source files, not earlier
   relays. What the block needs, the block states.
4. **An as-of commit stamp.** State drifts; the block names the
   commit it describes (`git rev-parse --short HEAD` at writing
   time).
5. **Absolute paths.** Every path the recipient might open is
   absolute — a relative path is broken for a reader who lands
   elsewhere.
6. **A "what the recipient should do" line.** One explicit line:
   the block names its ask, not just its topic.
7. **No duplicated content.** Never re-relay what an earlier relay
   already carried — point at the first relay's home and stop.

## Final artifacts

A keeper-facing relay block is a final artifact: correct and
complete on first hand-off. The keeper reads and passes it; the
writer never asks the keeper to edit, merge, splice, or proofread
a block — that finishing labor stays with the writer.

- A block the keeper has not passed, found wanting: issue one
  clean full replacement.
- A block the keeper has passed, needing a change: issue a
  standalone self-contained addendum covering exactly the delta —
  sized to the ask, never a superset. The addendum stands alone:
  it names the passed block, states the change, carries its own
  context.

## Two modes

- **Gated** — the keeper passes the prompt. Direction is theirs:
  the relay names its recipient and its ask, and the keeper gates
  whether it moves.
- **Ambient** — shared surfaces carry state. Roles pick up each
  other's context from the surfaces without the keeper relaying;
  the block lands where the recipient role already reads, and no
  one is asked to forward it.

## Should you use this skill?

EXTERNALLY-GATED. The trigger: cross-role context must move and a
relay is the instrument — a direction to relay enters the skill,
whatever keeper prompt or role-file routing carries the direction.
A same-role context refresh is a handoff, not a relay. In-repo
notes are the status surface's job, not a relay's.

## Judgment kept

The checklist above is the skill; the judgment it keeps is what
to include — what the recipient actually needs, sized to the ask —
and, when a passed block needs a change, what the delta is.

## Boundaries

- Cross-role context only; a same-role refresh runs the
  bee-handoff / bee-pickup-handoff pair, siblings in this folder.
- Relay blocks carry context, not work products — relaying itself
  writes no files and runs no commands.
- Standing state belongs on the shared surfaces; a relay moves a
  topic once, it is not where roles publish queues or notes.

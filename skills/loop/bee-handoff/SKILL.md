---
kit: loop
name: bee-handoff
description: Compacts a role's session into its handoff file so the same role can resume in a fresh context — working mode first, then task state, boot sequence, environment notes, and a fenced wake prompt for the keeper to paste; ends with a memory sync. Use when a role's context runs short or its session ends with work in flight. Picking a handoff up is bee-pickup-handoff's. Never a parking-lot sweep.
---

# bee-handoff

Compact this session into a document the next context can resume
from: same role, fresh context. The handoff file carries the
content; the wake prompt is the pointer. Read `../../GLOSSARY.md`
(the shared bee glossary, sibling of this kit folder) first —
especially its handoff entry.

## When to use

A handoff is due when the role's context is running short, or the
session is ending — wrapping up, switching context — with work in
flight. Either means run the skill; skipping means naming, in
your reply, which condition fails. A session whose work is all
closed cleanly needs no handoff — closing work has its own
rituals.

## The handoff file

One file per role, named for the role:
`<repo-root>/.pi/handoff-<role>.md` (find the repo root with
`git rev-parse --show-toplevel`). The role is whoever this session
runs as — read it from the session memory or the role file, never
guess it from the work's shape — and read the role file before
writing: where it pins the handoff's path or adds sections, the
role file wins.

If a previous handoff exists, read it whole before writing: keep
what still matters, update what changed, drop what closed — when
everything in it has closed, start fresh. The file is a brief,
not an archive.

## Absorb the session

Assemble the state before writing it, from three places: the
session memory, if the role keeps one (the role's live memory
file — GLOSSARY: hivemind), this session's own work —
files touched, commands run, decisions made and why, errors and
how they resolved — and the repo itself (`git status`,
`git log --oneline`). The handoff is written from absorbed state,
not from recall of the last hour.

## Write the handoff

Sections in this order; the order is the successor's reading
order.

1. **Working mode, read first** — which role the successor
   resumes, its working-style rules in brief, and the first
   action: continue the work; do not re-interview the keeper.
   This section precedes task state on purpose — style shapes
   how the state gets read.
2. **Task state** — the goal in a sentence or two; done (with
   file paths); in flight, and how far; next, the known upcoming
   work. Honest states only: half-finished work is named
   half-finished.
3. **Boot sequence** — what the successor reads, in order: this
   handoff, then the memory and status surfaces the repo's rules
   name, then the rules files themselves (root rules, role files,
   glossary). A cold reader follows this list and nothing else.
4. **Environment notes** — anything non-obvious about the setup:
   odd tool behavior, flags that matter, work the repo shows that
   the conversation never mentioned. Nothing to say means say
   nothing.
5. **Wake prompt** — a fenced markdown block, paste-ready for the
   keeper to hand the successor: who it is (the role), how to pick
   up — the boot sequence as one pointer line, files first,
   announce role and first move last. Short — the files carry the
   content; the prompt is the pointer.

Concise throughout: a reader absorbs it in minutes or it fails.
File paths over prose wherever a path will do.

## Memory sync, then hand over the prompt

Two steps end the ritual, in order:

1. **Memory sync** — bring the session memory current with what
   the handoff says (the role's rules name the file; a role
   without one skips this step). The ritual is not done until
   this is done.
2. **Hand over the wake prompt** — give the keeper the fenced
   block from the handoff, paste-ready, with where the handoff was
   saved and a one-line state summary. This is the ritual's last
   act.

## Judgment kept

Locating the file and checking repo state are named inline
commands; the judgment this skill keeps is everything between
them: what to keep, update, or drop from the old handoff; how
much session becomes brief; what earns a line in environment
notes. Nothing here is deterministic enough to script — the file
is written once, from state only this session has.

## Boundaries

- No parking-lot sweep and no promotion offers — those belong to
  closing work (design loop-backs, session close, phase gates),
  when something actually ended. A handoff is a refresh.
- Continuity surfaces only: this skill reads and writes the
  handoff file and session memory; no implementation rides along.
- Same role, fresh context. Cross-role context moves by relay
  (GLOSSARY: relay), never by handoff.
- The reading half of the pair is bee-pickup-handoff's, sibling in
  this folder.

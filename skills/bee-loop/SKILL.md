---
name: bee-loop
description: Executes an approved plan through implement → verify → review cycles, tracking states and escalating to the keeper when needed. Use only when explicitly directed ("run the bee-loop on <plan>"). Never infer loop entry from task size or type.
---

# bee-loop

Execute a plan. You run this skill only when the keeper (or a role
directed by the keeper) says to. Read `../GLOSSARY.md` (the shared bee glossary, sibling of this skill folder) first.

## Setup

1. Read the plan and its design doc (if it has one). If anything in the
   plan conflicts with the design doc, escalate before starting.
2. Create or update the phase list (`.hivemind/phases/<project>.md`,
   project = repo name unless the keeper says otherwise;
   `assets/phase-list-template.md`) — your one tracking file, with an
   `owner` column for claims (GLOSSARY: claim). If the plan header
   carries a phase id, record it there.
3. Confirm the validation level from the plan header. No level stated?
   Ask before starting.

## The cycle, per task

1. **Pick and claim.** Pick the next task whose dependencies are done.
   Before a phase's first dispatch, claim the phase: write your role +
   timestamp in the phase list's `owner` column (GLOSSARY: claim), and
   re-read the phase list before writing again. Tasks are tracked by
   the plan's checkboxes, not the phase list.
2. **Implement** — yourself for small tasks; a subagent when the task is
   self-contained or benefits from isolation (fresh context, parallel
   safety). Independent tasks may run in parallel as subagents; verify
   each result before using it.
3. **Verify** — run the **bee-verify skill** (sibling skill, see
   GLOSSARY) at the task level. Its logbook entry lands in
   `.hivemind/logbook/`. State the round in the dispatch brief (first
   run is `r1`).
4. **Review** — dispatch the **bee-review skill** on the finished work
   (fresh subagent when available; hand it the plan path, task id,
   changed files, and logbook entry path). Review rounds count
   independently of verify rounds — the first review is `r1`. In a
   solo session with no separate reviewer, review the work yourself
   and say so in the review report — the evidence trail matters more
   than who wrote it.
5. **Fix rounds** — if review or verify fails: fix, re-verify,
   re-review. A round is one fix attempt plus its re-runs; the initial
   failure is not a round. Maximum two rounds. Still failing?
   Escalate. Re-runs write versioned logbook entries — the round suffix
   increments (`-r2`, GLOSSARY: logbook versioning).
6. **Record** — check off the task in the plan, update the phase list,
   commit. Stage only the files this task touched — its code changes,
   its logbook entries, the plan and phase-list updates; never `git add -A`.
   Carry a `Role:` trailer (GLOSSARY). Records always land in the main
   checkout's `.hivemind/logbook/`, even when work happened in a
   worktree.
7. Repeat until the plan is done, then run **bee-verify at the phase
   level** (GLOSSARY: validation level — the full suite the plan lists)
   and report to the keeper.

## States

Every task moves `draft → implemented → verified → reviewed → done`.
You (the loop) move items between states, and each move needs its
record in `.hivemind/logbook/`: a verify entry to leave *implemented*,
a review report to leave *verified*. If you catch yourself advancing a
state without the entry, stop and go back.

## Escalate when

- The plan conflicts with the design doc, or reality conflicts with
  both.
- Two fix rounds didn't clear a failure.
- A decision needs authority you don't have.
- The task is done but a follow-on decision appeared (park it or ask).

Escalating = ask_user card with a recommendation, record the answer
where it applies — in the plan (task-scoped) or the phase list
(phase-scoped) — then continue. Asking is cheap; guessing is not.

## Bootstrap note

Until an automated orchestrator exists this skill runs inside a
session — today, the project-orchestrator's. Same rules, no exceptions
— the manual version is the pilot for the automated one.

## Boundaries

- No designing, no silent edits to plans or design docs.
- Never both implementer and reviewer for the same task when a separate
  reviewer is available.
- Never enters itself.

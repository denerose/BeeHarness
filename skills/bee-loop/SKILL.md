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
   `assets/phase-list-template.md`) — your one tracking file. If the
   plan header carries a phase id, record it there.
3. Confirm the validation level from the plan header. No level stated?
   Ask before starting.

## The cycle, per task

1. **Pick** the next task whose dependencies are done.
2. **Implement** — yourself for small tasks; a subagent when the task is
   self-contained or benefits from isolation (fresh context, parallel
   safety). Independent tasks may run in parallel as subagents; verify
   each result before using it.
3. **Verify** — run the **bee-verify skill** (sibling skill, see
   GLOSSARY) at the task level. Its record lands in
   `.hivemind/records/`.
4. **Review** — dispatch the **bee-review skill** on the finished work
   (fresh subagent when available; hand it the plan path, task id,
   changed files, and verify record path). In a solo session with no
   separate reviewer, review the work yourself and say so in the
   review report — the evidence trail matters more than who wrote it.
5. **Fix rounds** — if review or verify fails: fix, re-verify,
   re-review. Maximum two rounds. Still failing? Escalate.
6. **Record** — check off the task in the plan, update the phase list,
   commit.
7. Repeat until the plan is done, then run phase-level verification and
   report.

## States

Every task moves `draft → implemented → verified → reviewed → done`.
You (the loop) move items between states, and each move needs its
record in `.hivemind/records/`: a verify record to leave *implemented*,
a review report to leave *verified*. If you catch yourself advancing a
state without the record, stop and go back.

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

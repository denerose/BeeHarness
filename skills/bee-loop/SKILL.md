---
name: bee-loop
description: Executes an approved plan through implement → verify → review cycles, tracking states and escalating to the keeper when needed. Use only when explicitly directed ("run the bee-loop on <plan>"). Never infer loop entry from task size or type.
---

# bee-loop

Execute a plan. You run this skill only when the keeper (or a role
directed by the keeper) says to. Read `skills/GLOSSARY.md` first.

## Setup

1. Read the plan and its design doc (if it has one). If anything in the
   plan conflicts with the design doc, escalate before starting.
2. Create or update the phase list (`.hivemind/phases/`,
   `assets/phase-list-template.md`) — your one tracking file.
3. Confirm the validation level with the plan header.

## The cycle, per task

1. **Pick** the next task whose dependencies are done.
2. **Implement** — yourself for small tasks; a subagent when the task is
   self-contained or benefits from isolation (fresh context, parallel
   safety). Independent tasks may run in parallel as subagents; verify
   each result before using it.
3. **Verify** — run `bee-verify` at the task level. No exceptions.
4. **Review** — dispatch `bee-review` (or the review stage) on the
   finished work. Don't review your own work when a separate reviewer is
   available.
5. **Fix rounds** — if review or verify fails: fix, re-verify,
   re-review. Maximum two rounds. Still failing? Escalate.
6. **Record** — check off the task in the plan, update the phase list,
   commit.
7. Repeat until the plan is done, then run phase-level verification and
   report.

## States

Every task moves `draft → implemented → verified → reviewed → done` and
each move needs its evidence: verify output to leave *implemented*,
review signoff to leave *verified*. If you catch yourself advancing a
state without evidence, stop and go back.

## Escalate when

- The plan conflicts with the design doc, or reality conflicts with
  both.
- Two fix rounds didn't clear a failure.
- A decision needs authority you don't have.
- The task is done but a follow-on decision appeared (park it or ask).

Escalating = ask_user card with a recommendation, record the answer in
the plan or phase list, continue. Asking is cheap; guessing is not.

## Bootstrap note

Until the orchestrator exists this skill runs inside the current
session. Same rules, no exceptions — the manual version is the pilot for
the automated one.

## Boundaries

- No designing, no silent edits to plans or design docs.
- Never both implementer and reviewer for the same task when a separate
  reviewer is available.
- Never enters itself.

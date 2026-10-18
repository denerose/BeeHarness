---
name: bee-plan
description: Writes executable plans for the bee-loop, from an approved design or a bounded task. Use when the keeper says to plan implementation work that the loop (or subagents) will execute. Not for personal quick planning (that's the global plan skill).
---

# bee-plan

Write the plan a loop will execute. Input: an agreed design doc, or a
small task the keeper wants planned. Output: one file in
`.hivemind/plans/`. Read `skills/GLOSSARY.md` first if needed.

## Rules

1. **Follow the design doc.** If the plan you're writing conflicts with
   it, stop and escalate. Never quietly change the plan or the design.
2. **Say how much detail this plan has.** Short plans are fine when the
   detail will be worked out close to the implementation. Long plans
   with full file contents are right when subagents will implement
   cold. State which kind you're writing at the top.
3. **No placeholders.** "TBD", "add error handling", "write tests for
   the above" are plan failures. Write the real content, or mark a code
   block **shape-only** and include a step where the implementer checks
   the real API before using it.
4. **Each task stands alone.** Anyone implementing task 4 should learn
   everything they need from task 4 plus the plan header: exact file
   paths, what earlier tasks provide (names, paths, signatures), the
   verification command.
5. **Declare the validation level** (GLOSSARY) in the header. Tasks
   inherit it unless they say otherwise.
6. **Every task ends with a commit step** (short imperative message).

## Format

Use `assets/plan-template.md`. The plan is done when the global
`plan-reviewer` skill passes it — that gate is not optional; run it
before any implementation starts.

## Boundaries

- No design decisions. The design doc (or the keeper) decides; you
  structure.
- No implementation. Writing the plan is the last thing you do.
- Not the keeper's personal planner. The global `plan` skill stays
  available for quick, non-loop planning.

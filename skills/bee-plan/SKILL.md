---
name: bee-plan
description: Writes executable plans for the bee-loop, from an approved design or a bounded task. Use when the keeper or project-orchestrator says to plan implementation work that the loop (or subagents) will execute. Not for personal quick planning (that's the global plan skill).
---

# bee-plan

Write the plan a loop will execute. Input: an agreed design doc, or a
small task the keeper wants planned. Output: one file in
`.hivemind/plans/`. Read `../GLOSSARY.md` (the shared bee glossary, sibling of this skill folder) first if needed.

## Rules

0. **Missing or vague inputs** (no design doc, scope unclear) —
   escalate before drafting: ask_user with a recommendation.
1. **Follow the design doc.** If following the design forces a
   contradiction while you plan, stop and escalate. Never quietly
   change the plan or the design.
2. **Say how much detail this plan has.** Short plans are fine when the
   detail will be worked out close to the implementation; long plans
   with full file contents are right when subagents will implement
   cold. State which kind you're writing at the top, and for a short
   plan, name what covers the missing detail (e.g. "implementer works
   in-repo with the design doc; the review gate checks the result").
3. **No placeholders.** "TBD", "add error handling", "write tests for
   the above" are plan failures. Write the real content, or mark a code
   block **shape-only** and include a step where the implementer checks
   the real API before using it.
4. **Each task stands alone.** Anyone implementing task 4 should learn
   everything they need from task 4 plus the plan header: exact file
   paths, what earlier tasks provide (names, paths, signatures), the
   verification command. Repeat what matters; don't make anyone hunt.
5. **Declare the validation level** (GLOSSARY) in the header. It comes
   from the design doc if it declares one; otherwise you recommend a
   level with a one-line reason, and the keeper or plan-reviewer
   confirms at review. Tasks inherit it unless they say otherwise.
6. **Every task ends with a commit step** (short imperative message).
7. **No ephemeral status prose in durable docs.** Plans must not
   embed sentences that go stale ("X is running", "currently…",
   "as of today…") in durable documents — README, SOUL.md, design
   docs, GLOSSARY. Live state has homes: the phase queue, the keeper
   report, the status surface. Plans describe work, not the state of
   the world while it runs.

## Format

Use `assets/plan-template.md`. Save as
`.hivemind/plans/YYYY-MM-DD-<pp|po>-<slug>.md` — your role's initials
in the slug (ADR-007; pp = power-planner, po = project-orchestrator) —
with `**Reviewed:** PENDING`.
Then run the global `plan-reviewer` skill on it — the gate is not
optional. Fix the findings (the keeper may waive should-fix items —
plan-reviewer's 🟡 tier — with a one-line recorded reason), re-run
until it passes, then stamp the date. A plan that never passes never
gets implemented.

## Boundaries

- No design decisions. The design doc (or the keeper) decides; you
  structure.
- No implementation. Writing the plan is the last thing you do.
- Not the keeper's personal planner. The global `plan` skill stays
  available for quick, non-loop planning.

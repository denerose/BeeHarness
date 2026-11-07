---
kit: loop
name: bee-plan
description: Writes executable plans for the bee-loop, from an approved design or a bounded task. Use when the keeper or project-orchestrator says to plan implementation work that the loop (or subagents) will execute. Not for personal quick planning (that's the global plan skill).
---

# bee-plan

Write the plan a loop will execute. Input: an agreed design doc, or a
small task the keeper wants planned. Output: one file in
`.hivemind/plans/`. Read `../../GLOSSARY.md` (the shared bee glossary, sibling of this kit folder) first if needed.

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
4. **Each task stands alone — the self-contained-task standard.**
   Every task carries **Files** (exact paths, create or modify),
   **Depends on**, **Provides** (the names, paths, signatures later
   tasks rely on), and a verification command. The test is
   cold-dispatchability: a dispatched implementer holding only the
   plan, the references it names, and a minimal role file can
   execute the task cold — without asking the dispatcher anything
   the plan could have said. Repeat what matters; don't make
   anyone hunt. State grep expectations as minimums (`≥ N`)
   unless the exact count IS the contract (duplicate detection);
   a wrong exact count forced a mid-loop plan correction once —
   minimums keep the check honest when the corpus moves.
5. **Declare the validation level** (GLOSSARY) in the header. It comes
   from the design doc if it declares one; otherwise you recommend a
   level with a one-line reason, and the keeper or bee-plan-review
   confirms at review. Tasks inherit it unless they say otherwise.
6. **Every task ends with a commit step** (short imperative message).
7. **No ephemeral status prose in durable docs.** Plans must not
   embed sentences that go stale ("X is running", "currently…",
   "as of today…") in durable documents — README, SOUL.md, design
   docs, GLOSSARY. Live state has homes: the phase queue, the keeper
   report, the status surface. Plans describe work, not the state of
   the world while it runs.
8. **Determinism at plan time** (GLOSSARY: determinism test).
   Deterministic work goes to scripts: any step two careful executors
   would run identically is assigned to a script the plan names, not
   written as prose steps. Every agent step the plan keeps names the
   judgment it keeps — what that step decides that a script could
   not.

## Format

Use `assets/plan-template.md`. Fill its machine header — phase,
validation, state-source, targets, `checks:` (one entry per task:
id, cmd and/or files, `expect: exit 0`; `bee verify` runs these as
the loop's evidence at verify time), suite — and path-tag every
verbatim code block (`path=exact/target.ext`) so blocks extract
mechanically. The task's verification command (rule 4) is its
`checks:` entry's `cmd` — one command, both homes. Save as
`.hivemind/plans/YYYY-MM-DD-<pp|po>-<slug>.md` — your role's initials
in the slug (pp = power-planner, po = project-orchestrator) —
with `**Reviewed:** PENDING`. Before writing corpus claims
(counts, coverage, form-breakdowns), run `scripts/plan-census.sh`
over the plans and logbook dirs and quote its numbers — the
gate judges interpretation, not arithmetic.
Then run the `bee-plan-review` skill on it — the gate is not
optional. Fix the findings (the keeper may waive should-fix items —
bee-plan-review's should-fix tier — with a one-line recorded reason), re-run
until it passes, then stamp the date. A plan that never passes never
gets implemented.

## Boundaries

- No design decisions. The design doc (or the keeper) decides; you
  structure.
- No implementation. Writing the plan is the last thing you do.
- Not the keeper's personal planner. The global `plan` skill stays
  available for quick, non-loop planning.

---
name: bee-skill-tester
description: Cold-reader comprehension tests for skill documents. Dispatches one cheap subagent per skill with a realistic scenario and asks how it would actually use the skill, then the parent fixes the gaps. Use when drafting or revising skills; not part of the bee-loop.
---

# bee-skill-tester

Find out whether a skill actually drives behavior before the keeper
reads it. A cold model reading only the skill files sees what the
author can no longer see. Read `skills/GLOSSARY.md` first if needed.

## When to run it

- After drafting a new skill or making a big revision.
- After changing a shared file skills depend on (GLOSSARY, a template).
- When a skill misbehaved in real use and the fix wasn't obvious.
- Not after every small edit — that's what the edit was for.

## How to run it

1. **One subagent per skill**, cheap and fast (scout is the precedent).
   Each gets the brief from `assets/tester-brief-template.md`, filled
   in with:
   - the SKILL.md path, plus "read every file it references"
   - a realistic scenario in first person, including the trigger the
     skill expects (e.g. "the keeper says: run the bee-loop on X")
   - at least one pressure element: a missing input, an empty repo, a
     failure mid-flow. The gaps hide under pressure, not on the happy
     path.
2. **Keep the four questions in every brief** — they earn their keep:
   walk through concretely what you'd do step by step; what's unclear,
   contradictory, or missing; quote lines that could be read two ways;
   how would you know when NOT to use this skill.
3. Dispatch in parallel when testing several skills.
4. **Synthesize across skills before fixing.** Shared findings (a term
   nobody could find, a record with no home) matter more than any
   single nit, and shared fixes usually belong in GLOSSARY or a
   template, not in each skill.
5. **Fix the documents yourself.** Testers only report. Never let a
   tester edit the skill it tested.
6. **Report to the keeper**: a findings → fixes table, and a
   recommendation on whether a second round is worth it (usually only
   when fixes were structural).

## Reading the results

Testers can't see the whole system, so they flag some things that are
fine and occasionally suggest design changes. Comprehension is the
question, not taste. Fix what would stop or mislead a real agent with
no context; note the rest and move on.

## Boundaries

- Tests skill documents. Code and plans have their own reviewers
  (bee-review, plan-reviewer).
- Testers report; the parent fixes.
- Not part of the bee-loop states or gates. This is an authoring tool
  kept for skill work.

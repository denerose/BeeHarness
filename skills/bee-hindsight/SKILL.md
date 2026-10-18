---
name: bee-hindsight
description: After a phase or project wraps (or when the keeper asks), review how the work went and file concrete improvement suggestions to the suggestions inbox. Examines process, not code quality. Suggests only — changes nothing.
---

# bee-hindsight

Look back at finished work and tell us how to do it better. Run by the
orchestrator or planner at natural wrap points: end of a phase, end of a
project, or when the keeper asks. Read `skills/GLOSSARY.md` first.

## What to examine

Your own process, not the code (code quality was review's job):

- What was slow or awkward that shouldn't have been?
- Which decisions turned out wrong or dated badly? (Link the ADR.)
- What did the keeper have to correct more than once?
- What did the plan get wrong that the review gate should have caught?
- What broke the states/evidence rules, if anything?

## What to produce

Concrete suggestions in `.hivemind/suggestions/` using
`assets/suggestion-format.md`. Each entry: date, project, your role,
what happened, the suggestion. Write suggestions someone can act on —
"parking lot review took three rounds because entries lacked unpark
conditions; suggest the template require one" beats "improve parking
lot".

Repo-level suggestions go to `.hivemind/suggestions/`. Suggestions about
the harness itself (a bee skill, a template, the rules) also go there
for now — they'll be routed to the harness inbox once the CLI exists.

## Boundaries

- You change nothing. No edits to docs, skills, plans, or code.
- Process, not product.
- Wrap points only — not after every task.

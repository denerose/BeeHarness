---
name: bee-hindsight
description: After a phase or project wraps (or when the keeper asks), review how the work went and file concrete improvement suggestions to the suggestions inbox. Examines process, not code quality. Adds new files only — edits nothing.
---

# bee-hindsight

Look back at finished work and tell us how to do it better. Any role may
run it when the keeper asks; the project-orchestrator or power-planner
may also self-schedule it at wrap points (end of a phase, end of a
project). Read `../GLOSSARY.md` (the shared bee glossary, sibling of this skill folder) first.

## Inputs — re-read before judging

Don't trust recall over the record. Re-read, in this order:

1. session memory `.hivemind/sessions/<role>.md` (what actually happened)
2. the phase list (`.hivemind/phases/`)
3. the plan and its check-boxes
4. verify records and review reports in `.hivemind/records/`
5. keeper corrections in the conversation you still have in context

## What to examine

Your own process, not the code (code quality was review's job):

- What was slow or awkward that shouldn't have been?
- Which decisions turned out wrong or dated badly? (Link the ADR.)
- What did the keeper have to correct more than once?
- What did the plan get wrong that the plan-reviewer gate should have
  caught?
- Did anything skip the states/evidence rules?

## What to produce

One file per suggestion in `.hivemind/suggestions/`, named
`YYYY-MM-DD-<pp|po>-<slug>.md` (your role's initials, ADR-007), using
`assets/suggestion-format.md` — including the **Scope** field: `repo` (this project's docs/templates) or `harness`
(a bee skill, a template, the rules — routed to the harness inbox once
the CLI exists). Write suggestions someone can act on: "parking-lot
entries lacked unpark conditions in 3 of 4 cases; make the template
require one" beats "improve the parking lot".

If nothing deserves a suggestion, say exactly that in your summary and
write no files.

## Done means

You added suggestion files (or declared none needed) **and** gave the
keeper a short summary: what you examined, what you filed, what you'd
most like acted on. You edit nothing that already exists.

## Boundaries

- Adds new files only; edits no docs, skills, plans, or code.
- Process, not product.
- Never self-schedules outside wrap points.

---
kit: thinking
name: bee-hindsight
description: After a phase or project wraps (or when the keeper asks), review how the work went and file concrete improvement suggestions to the suggestions inbox. Examines process, not code quality. Adds new files only — edits nothing.
---

# bee-hindsight

Look back at finished work and tell us how to do it better. Any role may
run it when the keeper asks; the project-orchestrator or power-planner
may also self-schedule it at wrap points (end of a phase, end of a
project). Read `../../GLOSSARY.md` (the shared bee glossary, sibling of this kit folder) first.

## Inputs — re-read whatever state your role produced

Don't trust recall over the record. Re-read, in a fixed order, the
state your role produced. What that state is depends on how the work
ran — two examples:

- Loop work: session memory `.hivemind/sessions/<role>.md` (what
  actually happened), the phase list (`.hivemind/phases/`), the plan
  and its check-boxes, the verify records and review reports in
  `.hivemind/logbook/`.
- A planner or session role: its session memory, the ADRs and design
  docs it wrote, the status surface, the conversation's keeper
  corrections you still have in context.

## What to examine

Your own process, not the code (code quality was review's job):

- What was slow or awkward that shouldn't have been?
- Which decisions turned out wrong or dated badly? (Link the ADR.)
- What did the keeper have to correct more than once?
- What did the plan get wrong that the bee-plan-review gate should have
  caught?
- Did anything skip the states/evidence rules?
- Did any work embed task-specific examples, dated stories, or
  current-work narratives into behavior documents (skills, rules,
  role files, GLOSSARY)? Flag each one — behavior documents stay
  generic (docs/WRITING-STANDARD.md); specifics belong to the
  records.
- What worked that we should keep doing? Positive findings earn
  summary lines (not files).

## What to produce

One file per suggestion in `.hivemind/suggestions/`, named
`YYYY-MM-DD-<pp|po>-<slug>.md` (your role's initials; pp =
power-planner, po = project-orchestrator), using
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
most like acted on. The summary REPORTS what was filed — it never
offers to file, asks permission, or tees up "want this one too?".
Borderline items get filed (filing is adds-only, any-role work; the
keeper's gate is at promotion, not filing). Final step: surface
new suggestions to the keeper — as inbox items (`bee inbox add`,
addressee keeper; they render into the status surface's
script-owned region) or as a prose note outside that region; never
hand-edit the render region itself. You edit nothing that
already exists.

## Boundaries

- Adds new files only; edits no docs, skills, plans, or code.
- Process, not product.
- Never self-schedules outside wrap points.
- Files you add land in the main checkout's `.hivemind/suggestions/`,
  even when running from a worktree.

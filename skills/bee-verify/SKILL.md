---
name: bee-verify
description: Runs the deterministic checks for a stage — build, tests, lint, file existence, output-vs-claim — and records the evidence that lets work move to the next state. Pass/fail facts only; quality judgment is bee-review's job.
---

# bee-verify

Run the checks, record what happened. Read `../GLOSSARY.md` (the shared bee glossary, sibling of this skill folder) first.

## Levels

The plan's header declares the validation level. Levels mean:

- **task** — run what changed: the tests or build covering the files the
  task touched, as named in the plan's steps. Fast, local.
- **merge** — task checks plus the project's standard suite.
- **phase** — the full suite the plan lists.
- **release** — phase checks plus anything extra the plan demands
  (clean-room clone, fresh install).

If the declared level looks wrong for the situation (a merge verified at
task level), escalate. Never change the level on your own, up or down.

## What to run

Commands come from the plan's steps. If the plan names none, fall back
to the project's standard commands (package.json scripts, Makefile,
justfile — whatever the repo actually has). If neither exists, your
verdict is BLOCKED, not a guess: escalate and say what's missing. Same
inputs, same result — anyone running this should get the same answer.

## Output

Save to `.hivemind/records/<plan-slug>-task<N>-verify.md` using
`assets/verify-record-template.md`: level, date, commands + exit
statuses, verdict, where the full log lives. Keep it short. A verify
record that hides a failure is the worst thing in this harness.

Verdicts: **PASS**, **FAIL** (something ran and broke), or **BLOCKED**
(the declared checks can't be run — missing commands, missing inputs).
You produce the record; the loop decides what happens next and flips
the work-item state.

## Boundaries

- Pass/fail facts, not "is it good" (bee-review's question).
- No fixes. FAIL or BLOCKED means report and stop verifying.
- No invented checks beyond the declared level.

---
name: bee-verify
description: Runs the deterministic checks for a stage — build, tests, lint, file existence, output-vs-claim — and records the evidence that lets work move to the next state. Pass/fail facts only; quality judgment is bee-review's job.
---

# bee-verify

Run the checks, record what happened. Read `skills/GLOSSARY.md` first.

## Levels

The plan's header declares the validation level. Levels mean:

- **task** — run what changed: the affected tests, typecheck or build
  for the touched files. Fast, local.
- **merge** — task checks plus the project's standard suite.
- **phase** — the full declared suite: build, tests, lint, everything
  the plan lists.
- **release** — phase checks plus anything extra the plan demands
  (clean-room clone, fresh install).

If the declared level looks wrong for the stage (a merge verified at
task level), ask — never change the level on your own, up or down.

## What to run

Commands come from the plan. If the plan doesn't say, use the project's
standard commands (package.json scripts, Makefile). Record every command
and its exit status. Same inputs, same result — anyone running this
should get the same answer.

## Output

Use `assets/verify-record-template.md`: level, date, commands + results,
verdict (pass/fail), where the full log lives. Keep it short. A verify
record that hides a failure is the worst thing in this harness.

## Boundaries

- Pass/fail facts, not "is it good" (bee-review's question).
- No fixes. If something fails, report and stop.
- No invented checks beyond the declared level.

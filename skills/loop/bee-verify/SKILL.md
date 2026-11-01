---
kit: loop
name: bee-verify
description: Runs the deterministic checks for a stage — build, tests, lint, file existence, output-vs-claim — and records the evidence that lets work move to the next state. Pass/fail facts only; quality judgment is bee-review's job.
---

# bee-verify

Run the checks, record what happened. Read `../../GLOSSARY.md` (the shared bee glossary, sibling of this kit folder) first.

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
The level lives in the plan's header; `bee verify` runs the checks the
header declares and does not re-derive the level — level judgment is
the escalation line above, yours.

## Run the command

The mechanics are the `bee verify` CLI: it parses the plan's
machine-header checks (the `checks:` contract in
`../bee-plan/assets/plan-template.md`), runs each check,
link-checks changed docs (base ref defaults to `main`; `--base`
overrides), and writes the logbook entry — machine header (role,
date, verdict, checks-run, plan path + hash), prose body only for
anomalies; an empty body is a clean run.

Run `bee verify --plan <path> [--task <n>]` where the code is (a
worktree if dispatched there). Stamp the producing role with
`--role` (GLOSSARY: Role trailer) — dispatched as a stage agent,
that is the dispatching loop's role. A scoped `--task` run writes
its entry on success; a failing round writes only with `--record` —
pass it so a fix round has its evidence. Then read the entry back:
it is the evidence a state move needs, and reading it is where your
judgment applies.

If the declared checks cannot run — missing command, missing
inputs — the run is BLOCKED, not a guess: report what is missing
and escalate. BLOCKED is your verdict in the report, not an entry
the command mints: `bee verify` emits a FAIL (with its fix line)
or writes nothing when nothing ran (`0 checks`). Same inputs, same
result — anyone running this should get the same answer.

## Judgment you keep

Pass/fail is mechanical, but you keep one judgment: is this output
sane? A green run of the wrong thing, or output that cannot be right
— results empty where results belong, the same numbers on every run —
is not a PASS. Record what looks wrong: the entry's prose body is
the anomaly slot — append your note there and say it in your report;
the machine header stays script territory, never hand-edited. When a
check fails or the output looks wrong, the anomaly gets reproduced —
run it again, see it fail again — before any fix is proposed.

The determinism split holds in both directions: the command owns
the mechanics (run commands, capture statuses, write the entry);
the judgment (is this output sane; anomalies reproduced) stays
agent text — yours.

You produce the verdict; the loop decides what happens next and
moves the work-item state (`bee task move`, on the entry's
evidence).

## Boundaries

- Pass/fail facts, not "is it good" (bee-review's question).
- No fixes. FAIL or BLOCKED means report and stop verifying.
- No invented checks beyond the declared level.

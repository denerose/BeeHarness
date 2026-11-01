# TDD — test-first for script and CLI work

Test-first discipline for scripts and CLI commands: the failing test
is written before the fix, and every fix round leaves a regression
test behind that plants the probe which caught the bug.

## When to use

On every script or CLI change: a new subcommand, a fix round, a
store-format change. Also whenever a bug surfaces in shipped tooling
— the reproduction test comes before any repair.

## Core rules

- **Reproduce before repair.** A bug is not understood until a test
  shows it failing. Write the failing test, watch it fail, then fix
  — and only what the test covers.
- **Regression tests replicate probes.** When a review finding
  prescribes a probe, the fix's test plants that exact scenario —
  the finding cannot silently return.
- **The battery ships with the command.** The compliance tests
  (see the cli-writing topic) join the standard suite in the same
  task the command lands in.
- **House pattern.** One test file per command family
  (`tests/<family>.test.mjs`), `node --test`, stdlib asserts only,
  the CLI exercised in-process through its `run(argv)` entry — a
  function, not a subprocess, unless the test targets subprocess
  behavior.
- **Temp dirs, never live stores.** Tests write to `mkdtemp`
  scratch through the command's path seams (`--store`, `--dir`, or
  equivalent); a test touching a live shared surface is a bug in
  the test.

## Pointers

- `docs/guidance/cli-writing.md` — the compliance battery each
  family's tests assert.
- `tests/` — the existing batteries are the pattern to follow.

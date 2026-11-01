# Triage — reproduce-then-fix vs feature work

Two kinds of work reach a bee: something broken (a bug, a failing
check, output that cannot be right) and something new (a feature, a
command, a document). They take different disciplines, and mixing
them is how bad fixes happen.

## When to use

At task intake: before planning or touching code, classify the work
— broken takes reproduce-then-fix, new takes the design/plan path.
Re-classify whenever the work shows its other face: a "small
feature" that turns out to hide a bug, a "bug" that is really a
request for new behavior.

## Core rules

- **Broken work: reproduce first.** Run it, see it fail, run it
  again — an anomaly reproduced is a bug you may diagnose and fix;
  an anomaly reported but never seen is a story, not a bug. Only
  after reproduction does diagnosis start; only after diagnosis
  does a fix get proposed.
- **Fix the cause, not the report.** The reproduction is the
  contract: the fix makes the reproducing test pass and changes
  nothing the test does not cover.
- **Feature work: shape before build.** New behavior is designed
  (a design doc or a bounded task), planned, then built — never
  improvised inside a bug fix.
- **Debugging applies when output contradicts intent** — a failing
  check, a wrong number, a crash. "Make it better" is not
  debugging; it is feature work and takes feature work's path.

## Pointers

- `docs/guidance/tdd.md` — the test-first half of
  reproduce-then-fix.
- `docs/research/boeckeler-guides-and-sensors.md` — the
  guides-and-sensors lens: checks that point at their own repair.

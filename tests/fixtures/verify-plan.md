# Plan: demo — verify fixture (machine header mirrors the P4 plan's shape)

**Date:** 2026-11-02
**Design doc:** none — bounded task
**Validation level:** task
**Detail:** full
**Reviewed:** PENDING

<!-- machine
phase: P9
validation: task
state-source: checkboxes below
design: none — bounded task
targets:
  - docs/alpha.md (create)
  - docs/beta.md (create)
checks:
  - id: task-1
    cmd: node -e "console.log('fixture ok')"
    expect: exit 0
    files: [docs/alpha.md]
  - id: task-2
    files: [docs/beta.md]
suite: node --test tests/*.test.mjs
-->

## Task 1: run a command

**Files:** create docs/alpha.md
**Depends on:** nothing
**Provides:** the cmd + files check form

- [ ] Step: place docs/alpha.md and run the named command.

## Task 2: prove files exist

**Files:** create docs/beta.md
**Depends on:** nothing
**Provides:** the files-only check form

- [ ] Step: place docs/beta.md (no cmd — files-only entry).

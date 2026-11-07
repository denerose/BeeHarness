# Plan: [name]

**Date:** YYYY-MM-DD
**Design doc:** [path, or "none — bounded task"]
**Validation level:** task | merge | phase | release
**Detail:** full (verbatim file contents — subagents implement cold) |
lean (detail worked out at implementation — name what covers the
missing detail)
**Reviewed:** bee-plan-review passed YYYY-MM-DD / PENDING

<!-- machine
phase: <phase id, e.g. P1>
validation: task | merge | phase | release
state-source: checkboxes below
targets:
  - exact/path/file.ext (create)
  - exact/path/file.ext (modify)
checks:
  - id: task-<n>
    cmd: <command proving the task's step>
    expect: exit 0
    files: [<path>, <path>]
suite: <the command that proves the plan's work, e.g. node --test tests/*.test.mjs>
-->

## Task N: [name]

**Files:** create/modify `exact/paths`
**Depends on:** task ids (or nothing)
**Provides:** exact names/paths/signatures later tasks rely on

- [ ] Step: what to do (verbatim content or shape-only + spike step)
- [ ] Step: run `verification command` — expected result (grep expectations as minimums, ≥ N, unless the exact count is the contract)
- [ ] Commit: `short imperative message`

Verbatim file content goes in a path-tagged block — the tag says
where the block extracts to in the reviewer's sandbox:

```<lang> path=exact/path/file.ext
…verbatim content…
```

## Task N+1: …

## Phase exit

What "done" means for the whole plan: which commands pass, what the
keeper reviews.

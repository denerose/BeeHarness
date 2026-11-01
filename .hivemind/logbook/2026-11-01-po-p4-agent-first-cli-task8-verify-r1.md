<!-- machine
role: project-orchestrator
date: 2026-11-01T15:36:18+11:00
verdict: PASS
checks-run: 1
plan: .hivemind/plans/2026-11-01-po-p4-agent-first-cli.md @ 5a22d47
-->

## Anomalies and evidence (r1, task-orc)

Clean run — the body carries the sweep evidence and the recorded
decisions the machine header cannot.

**Reference sweep (rename, keeper-directed).**

- `grep -rn "task\.sh" bin scripts tests skills AGENTS.md docs
  README.md` → zero hits (exit 1).
- `grep -rn "task-sh" bin scripts tests skills AGENTS.md docs
  README.md` → zero hits (old test filename gone, including the
  renamed test file's own header comment).
- The plan's unescaped form `grep -rn "task.sh" …` still lists
  four `bee task show` lines in bin/bee.js — regex any-dot
  matching "task show", not references to the old file; no file
  reference survives.
- `ls scripts/` → design.sh, plan-checks.sh, structure-check.sh,
  structure.map, worktree.sh (rename confirmed on the branch; the
  dispatch note's possibility that Task 6 had already renamed it
  did not hold — task.sh was present at dispatch).

**Map extension (the map edit IS the recorded decision).** The
verbatim seed left 16 tracked files missing, all in two trees:

- `docs/research/<file>.md` added to the docs line — 3 research
  notes tracked before the seed.
- `hivemind: .hivemind/suggestions/planned/<file>` added as its
  own line — 13 tracked suggestion drafts under a second level
  the class-dir pattern (one wildcard, never crossing "/") does
  not and should not cover; the extension is scoped to that tree
  only, not a general second level.

After extension: `bash scripts/structure-check.sh .` → `0
findings`, exit 0 (also the task-8 check above).

**Deviations (accepted, with reasons).**

1. `tests/fixtures/parking-lot-v1.md:217` — `scripts/task.sh` →
   `scripts/worktree.sh` inside the frozen park-migrate fixture.
   The plan's sweep demands zero hits under tests/; the fixture's
   job is parse-test input (task-3 review froze it for test
   stability, and the true historical body lives in git), so the
   one-string edit costs nothing and keeps the sweep honest.
   Disclosed here because it touches a frozen artifact.
2. `bee verify` runs the check script from bee's own home
   (`REPO_ROOT/scripts/structure-check.sh`) against the plan
   root, gated on `<plan-root>/scripts/structure.map`. This keeps
   the matcher single-sourced in the script (determinism split)
   and honors the adoption note: other repos adopt by adding a
   map only.
3. Structure findings are global fail state in `bee verify`,
   mirroring link findings exactly (fail the run, feed every
   written entry's verdict and anomalies).
4. `.pi/handoff-project-orchestrator.md` still mentions task.sh —
   `.pi` is outside the plan's sweep path list (ephemeral
   role-memory surface, not this dispatch's to edit).

**Suite.** `node --test tests/*.test.mjs` → 210 tests, 210 pass,
0 fail (includes the new structure-check battery and the renamed
worktree-sh tests).

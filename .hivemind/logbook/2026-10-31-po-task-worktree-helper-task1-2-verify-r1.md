# Verify record: task worktree helper (Tasks 1–2)

**Role:** task-orc (dispatched loop role)
**Level:** merge (per plan header — task checks + `npm test`)
**Date/time:** 2026-10-31 23:45
**Work item state after this record:** implemented → verified

| command | exit | note |
|---|---|---|
| smoke: scratch-repo create → merge → create → abandon cycles (4 scratch repos) | 0 | exit codes 1–5 exercised incl. collision, ambiguity, unmerged abandon, dirty-worktree merge propagation (128, git msg carries path); root resolution verified from main checkout AND phase worktree |
| `npm test` (repo root of task worktree `/home/saphron/BeeHarness-task-task-worktree-helper`) | 0 | 27 tests, 27 pass, 0 fail (19 pre-existing + 8 new `tests/task-sh.test.mjs`) |
| `npm test` (main checkout, read-only cross-check of the bee.test.mjs fix) | 0 | green there too — fix is location-neutral |

**Verdict:** PASS
**Log:** inline above; smoke transcripts in session (bash traces), not retained as files.

Notes for reviewers:

- Phase-exit criterion "every exit code 1–5 covered by a case" holds:
  1 = unknown subcommand/slug validation, 2 = non-phase checkout,
  3 = collision, 4 = ambiguous-or-absent slug, 5 = unmerged abandon.
- **Deviation (recorded):** plan names only `tests/task-sh.test.mjs` as
  a touched file, but three pre-existing `init` tests in
  `tests/bee.test.mjs` hardcoded `~/BeeHarness/skills` and failed in
  every worktree (16/19 on the unmodified `phase/3` branch —
  pre-existing, not introduced here). The plan's exit criterion
  ("npm test green from THIS worktree") is unmeetable without fixing
  them; assertions now derive the path the same way `bin/bee.js`
  does. No behavior change in `bin/bee.js`.
- Implementation fix during smoke (pre-commit): `die` inside command
  substitution exited only the subshell — phase-branch check passed
  its message but created the worktree anyway. Fixed by moving
  `repo_root`/`require_phase_branch` to global-out functions.

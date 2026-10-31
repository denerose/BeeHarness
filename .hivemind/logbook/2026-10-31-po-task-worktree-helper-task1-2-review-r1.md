# Review report: task-worktree helper (Tasks 1–2)

**Plan section:** Tasks 1–2 of `.hivemind/plans/2026-10-31-po-task-worktree-helper.md`
**Verify record:** `.hivemind/logbook/2026-10-31-po-task-worktree-helper-task1-2-verify-r1.md` (PASS, 27/27)
**Role:** task-orc (dispatching loop role)
**Reviewer:** scout subagent (cold context), filed by task-orc

**Artifacts reviewed:** `git show 6f627ac` (`scripts/task.sh`), `git show 7043726` (`tests/task-sh.test.mjs`, `tests/bee.test.mjs`)

## Verdict

**Approve** — the implementation matches the plan's exact CLI contract in every tested dimension (commands, exit codes 1–5, stdout/stderr routing, cleanup ordering, failure propagation), the tests are faithful to the prescribed cases, and the one deviation is documented and necessary. All behavior claims validated empirically by the reviewer in /tmp scratch repos (create/merge/abandon cycles, dirty-worktree merge propagation → exit 128 with git's message carrying the worktree path, ambiguity → exit 4, slug validation, non-phase → exit 2); full suite re-run green 27/27.

## Blocking

None.

## Should fix

None.

## Notes

1. **`tests/bee.test.mjs` deviation is correct and adequately recorded.** The three init assertions hardcoded `~/BeeHarness/skills`; the plan's own exit criterion ("npm test green from THIS worktree") is unsatisfiable without the fix, and the new derivation (`tests/bee.test.mjs:88-93`) mirrors `tildeForm` in `bin/bee.js:63-67` exactly. Documented in both the commit message and the verify record. No conflict with plan intent — no escalation needed.
2. **Empty-slug edge in `create`** — `scripts/task.sh:118-122`: arg `9-` passes `check_slug` and the `*-*` guard, creating branch `task/9-` and worktree suffix `-task-` (trailing dash). Cosmetic and unlikely in practice; a length check on `${arg#*-}` would close it.
3. **`merge` reports "merged" even for fast-forward or already-up-to-date merges** (`scripts/task.sh:158`) — the word is a slight overstatement for those cases, but exit 0 and cleanup are correct; not worth a round.
4. **Verify record's dirty-worktree claim independently reproduced** — clean merge then `git worktree remove` on a dirty task worktree fails with git's message including the full worktree path, exit 128, branch and worktree both left intact (no partial cleanup). Matches plan intent exactly.
5. **The pre-commit `die`-in-substitution fix** (noted in verify record) is correctly applied: `repo_root`/`require_phase_branch` set globals and are never called inside `$( )` — verified at `scripts/task.sh:41-53`, `:68-79`.
6. **Test style fits the repo** — same `node:test` + `assert/strict` + mkdtemp pattern as `tests/bee.test.mjs`; the `task()` wrapper's never-throw exit-code capture is clean and the per-case `finally { s.cleanup() }` discipline is consistent.
7. **Exit code 1–5 coverage confirmed both by tests and by independent smoke runs** (unknown subcommand / bad slug = 1, non-phase = 2, collision = 3, ambiguous/absent slug = 4, unmerged abandon = 5 with the `git branch -D` suggestion).

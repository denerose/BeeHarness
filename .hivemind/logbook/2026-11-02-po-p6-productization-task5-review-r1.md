# Review r1 — P6 Task 5: `bee worktree` (fold script into CLI)

**Role:** project-orchestrator (dispatching loop) — reviewer: cold-review stage agent
**Plan section:** Task 5, `.hivemind/plans/2026-11-02-po-p6-productization.md` (worktree copy @ cf47c52)
**Verify record:** `.hivemind/logbook/2026-11-02-po-p6-productization-task5-verify-r1.md`
**Work under review:** commit 75ef775 (implementation + deletions + sweep) · verify commit 3bfddbb

## Verdict

**FIX-FIRST** — one should-fix: `worktreeOfBranch` matches porcelain
branch lines by prefix where the script matched exactly, so a branch
whose full name extends the resolved one can be mis-attributed and the
wrong worktree removed. Everything else the port does is faithful —
including all three disclosed deviations, each judged
faithful-to-intent below.

## First check: claim vs record

- Verify record present: machine block `verdict: PASS · checks-run: 1 ·
  plan: … @ cf47c52 · task: task-5`. Header-only shape is `bee verify`'s
  normal no-anomaly output (`verifyEntryText` in `bin/bee.js` appends a
  body only for anomalies) — valid record, not a missing one.
- Reviewer re-ran the checks: `node --test tests/bee-worktree.test.mjs`
  → 8/8 pass; full suite `node --test tests/*.test.mjs` → 307/307 pass.
- Sweep grep re-run:
  `grep -rn "worktree.sh" skills/ roles/ docs/ README.md AGENTS.md SOUL.md scripts/ bin/ tests/`
  → exactly ONE hit: `tests/fixtures/parking-lot-v1.md:217` — the
  historical fixture, as the plan expects (carve-out, review r2 J2).
  No `worktree-sh` residuals either; `scripts/structure.map` never
  listed the script, so no stale map line.
- No checked task boxes without records (task-5 boxes remain unticked
  in the worktree's plan copy — evidence ahead of state, the loop's
  move after this report, not a finding).

## Blocking

None.

## Should fix

- `bin/bee.js:4602` (`worktreeOfBranch`) — the porcelain walk matches
  `line.startsWith(`branch refs/heads/${branch}`)`, but the script
  (`worktree_of`, `git show 75ef775^:scripts/worktree.sh`) used a case
  pattern `"branch refs/heads/$branch")` — **exact whole-line match**.
  Divergence: when the resolved branch's full name is a strict prefix
  of another branch currently checked out in a worktree (e.g. merging
  slug `ax` → `task/9-ax` while `task/9-axx` holds a worktree and
  `task/9-ax` holds none), `worktreeOfBranch('task/9-ax')` returns
  `task/9-axx`'s worktree — `merge`/`abandon` then removes that
  innocent worktree, prints `removed worktree <wrong path>` on
  success, and leaves the real one registered on a deleted branch.
  The plan's rule is "the script IS the spec — semantics". Suggested
  fix: exact match — `line === \`branch refs/heads/${branch}\``. (A
  regression test for the prefix case is trivial to add but not
  required by the port rule — the deleted suite had no such case
  either, so coverage parity stands.)

## Notes

- **Disclosed deviation (1) — `spawnSync` vs the plan's
  `execFileSync`**: faithful-to-intent. Every other git call in
  `bin/bee.js` uses `spawnSync` (`phaseGit` at 3975, verify's runners);
  `execFileSync` is a wrapper over the same machinery, and with
  `{ cwd: process.cwd(), encoding: 'utf8' }` (4528–4530) the semantics
  are identical. No action.
- **Disclosed deviation (2) — merge's `branch -d` failure exit code**:
  faithful-to-intent. Reviewer verified the bash accident by direct
  simulation: the script's `[[ -n "$wt" ]] && echo …; exit $?` tail
  exits **0** when a worktree existed (the echo's status — a false
  success after a failed branch deletion) and 1 when it didn't; the
  script's uniform `|| exit $?` pattern elsewhere propagates git's
  code, so the if-block's `exit $?` was an accident. The port
  (`bin/bee.js:4676`) returns git's `del.status`. The five named exit
  classes (usage 1 / not-phase 2 / exists 3 / no-match·ambiguous 4 /
  unmerged abandon 5) are untouched — this path sits outside them, and
  abandon's explicit exit 5 (4713) is preserved. No action.
- **Disclosed deviation (3) — `bee worktree help` → usage, exit 0**:
  faithful-to-intent. Every other family does the same (inbox 655,
  park 1113, memory 1613, design 1880, logbook 2644, glossary 3157,
  task 3560, guidance 3835, phase 4077), and Task 6's principle 10
  mandates help reachable the same way everywhere. No action.
- **Usage-block restructure** (title line added at 4509; trailer
  "never from this script's location" → "never from the harness
  checkout"): in-convention (`PHASE_USAGE` 3917 et al. carry the same
  title-line shape); the mandated `worktree.sh` → `bee worktree`
  substitution is applied throughout, and the subcommand description
  lines are verbatim from the script. No action.
- **Incidental-output drop, degenerate path**: outside a git repo, the
  script's merge/abandon let `for-each-ref`'s "fatal: not a git
  repository" chatter hit stderr before dying "no branch matches…"
  exit 4; the port captures and drops that chatter (message and exit 4
  identical, `bin/bee.js:4585`). Record only.
- **Test port completeness**: all 8 scenarios and assertions carried
  over 1:1 — including the stream-discipline assertion
  (`r.out.trim() === wt`, create's stdout = path only), the
  ambiguous-slug candidate listings, and abandon's exit-5 branch-kept
  case. In-process `run()` invocation is the plan's stated rule and
  the house pattern for every other command suite; the process-boundary
  entry shim was never under test for any family, so nothing is lost
  specific to this port.
- **Sibling edge, out of scope**: `phaseWorktreeOf` (`bin/bee.js:4059`,
  pre-existing — only its comment changed in this commit) carries the
  same prefix-match shape. Not a finding against this task; worth
  aligning in a later sweep if the should-fix lands.
- **Faithfulness audit summary**: validation order (slug → separator →
  phase-branch → repo-root in create; slug → resolve → phase-branch in
  merge), all message strings (verbatim with the `bee worktree:`
  prefix, including the merge-"remains" vs abandon-"still present"
  distinction and the em-dash glyphs), worktree-path derivation
  (`${arg#*-}` → `arg.slice(arg.indexOf('-') + 1)`), resolve
  match-set, git-failure propagation (`|| exit $?` → `r.status`), and
  stream discipline (git chatter to err on every path) all match the
  script. `spawnSync` git failures in resolve/repo-root degrade
  exactly as the script's did.

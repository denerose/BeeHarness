# Plan: P3 — orchestration build-out

**Date:** 2026-10-31
**Design doc:** `.hivemind/designs/beeharness-design.md` (ratified) +
ADR-011 (task-orc contract; its boundary test is this phase's exit
criterion) + ADR-012 (git topology) + ADR-013 (logbook naming) +
ADR-007 amendment 2 (records ride task branches)
**Validation level:** merge for implementation tasks (task checks +
`npm test`); phase exit runs phase-level (full suite + boundary-test
evidence + phase diff review). Reason: first branch-topology work —
integration mistakes must surface before main.
**Detail:** lean — mechanics are specified exactly (names, commands,
contracts); implementation detail is covered by the named ADRs,
`roles/task-orc.md`, and `skills/GLOSSARY.md`. The payload plan
(Task 3) is likewise lean: its implementer (task-orc, cold) works
from it plus the ADRs.
**Reviewed:** plan-reviewer passed 2026-10-31 — independent review
(all external-reality claims verified empirically on git 2.47.3 in a
scratch repo): 2 🔴 (spine ordering; payload plan never reaching the
task worktree) + 5 🟡 — all fixed in-plan, none waived.

## Boundary discipline (this phase's special rule — ADR-011)

From Task 4's dispatch onward, the dispatcher (project-orchestrator)
**never opens source files**: it reads logbook entries
(`git show <branch>:.hivemind/logbook/…` or after merge, the files),
the pass-back digest, and `git log`/`git diff --stat` only. The phase
exits only if this holds (violations recorded, not hidden).

## Task 1: phase spine — branch, worktree, straddle

**Files:** create branch `phase/3`; worktree `../BeeHarness-phase3`;
no repo files changed beyond this plan + phase list
**Depends on:** nothing
**Provides:** `phase/3` branch; `../BeeHarness-phase3` worktree (PO's
persistent integration worktree for P3+)

- [x] Commit this plan + the phase-list claim on main FIRST (stage
  only these two files — the tree carries sibling-role edits; never
  `git add -A`, ADR-007 rule 2). The phase branch must start from
  this commit.
- [x] Then, from the main checkout: `git worktree add -b phase/3
  ../BeeHarness-phase3` — verify with `git worktree list`.
- [x] The straddle rule, recorded here (this checklist item), not in
  a new doc: shared surfaces (`status.md`, `keeper-report.md`, phase
  list, plans) are edited ONLY from the main checkout, atomic-commit
  rule per ADR-007 amendment 1; build work happens in the phase
  worktree.

## Task 2: dispatch-brief template (skill asset)

**Files:** create `skills/bee-loop/assets/dispatch-brief-template.md`
**Depends on:** Task 1
**Provides:** the filled-in brief format every task-orc dispatch uses

- [x] Implement the template from ADR-011's dispatch-brief contract:
  plan path · phase id · validation level (from plan header) ·
  escalation envelope (decides-alone vs returns) · the three GLOSSARY
  safety lines · workspace facts (task worktree path, branch name,
  `logbook/` rides the branch, records reach main at merge) · pass-back
  reminder (done-ness digest, paths not contents). Shape-only here;
  the template is short prose, no code.
- [x] Verify: the template covers every bullet of `roles/task-orc.md`'s
  "Dispatch brief" section — the only permitted additions are the
  workspace facts and the pass-back reminder named above.
- [x] Commit: `add task-orc dispatch brief template`

## Task 3: payload plan — task-worktree helper

**Files:** create `.hivemind/plans/2026-10-31-po-task-worktree-helper.md`
**Depends on:** Task 2
**Provides:** a gate-passed, cold-readable plan for the first dispatch

- [x] bee-plan (lean) for `scripts/task.sh` — a deterministic helper
  implementing ADR-012's task tier: `create <phase>-<slug>` (worktree
  `../BeeHarness-task-<slug>` + branch `task/<phase>-<slug>` off the
  current phase branch), `merge <slug>` (merge into the phase branch
  in the phase worktree, then remove worktree + branch), `abandon
  <slug>` (remove worktree + branch, non-event). Exit non-zero with a
  clear message on: unmerged work at abandon, missing phase branch,
  name collisions. Zero dependencies (bash + git). Tests: a
  `.test.mjs` wrapper that exercises the script via `child_process`
  (so `node --test` stays the single suite entry — `npm test`
  unchanged).
- [x] Run the global plan-reviewer gate on it; fix findings; stamp.
  If findings resist two fix rounds: card the keeper with the
  findings + recommendation (escalation envelope) — never dispatch an
  ungated plan.
- [x] The payload plan's tests sandbox in temp git repos
  (`fs.mkdtempSync` + `git init` — the in-repo convention) so `npm
  test` is safe from any worktree.
- [x] Commit on main (stage only the payload plan): `plan task
  worktree helper through gate`

## Task 4: first task-orc dispatch (the boundary test)

**Files:** none touched by the dispatcher; the dispatch works in its
task worktree (Task 3's plan governs its files)
**Depends on:** Task 3
**Provides:** task-orc's first real run; helper shipped; pass-back
digest; boundary-test evidence

- [x] Sync the phase branch with main first (the payload plan landed
  on main after the spine was cut): `git -C ../BeeHarness-phase3
  merge --ff-only main` — valid while `phase/3` has no local commits.
- [x] Create the task worktree (raw git for this first one — the
  helper doesn't exist yet): branch `task/3-task-worktree-helper` off
  `phase/3`.
- [x] Fill the dispatch brief from the Task-2 template. The brief's
  plan path is the ABSOLUTE main-checkout path
  (`/home/saphron/BeeHarness/.hivemind/plans/2026-10-31-po-task-worktree-helper.md`)
  — readable from any worktree. Launch the subagent with its cwd =
  the task worktree.
- [x] Receive the pass-back digest. Do NOT open the dispatch's source
  files. Read: digest + logbook entries (`git show
  task/3-task-worktree-helper:.hivemind/logbook/…`) + `git
  log`/`--stat`.
- [x] If stop-and-return arrives (escalation package): adjudicate
  within dispatcher authority or card the keeper — record either way.
- [x] If the dispatch dies or its output is unusable: task reset per
  ADR-012 (remove worktree + branch, PO's call, non-event), re-dispatch
  or card the keeper; logbook entry either way.
- [x] Merge the task branch into `phase/3` in the phase worktree (the
  payload plan's `merge` step), at the plan-header validation level
  (`merge`). Conflicts at merge are the dispatcher's to resolve or
  bounce back as a stop-and-return (ADR-012).
- [x] Commit on main (main checkout, logbook/phase-list updates
  only): `record first task-orc dispatch` — the logbook entry quotes
  the filled brief and the pass-back digest verbatim (they are the
  phase's calibration evidence and the keeper's sample).

## Task 5: phase close — merge, review, calibration material

**Files:** `.hivemind/phases/BeeHarness.md`; logbook entries;
calibration index
**Depends on:** Task 4
**Provides:** P3 done; material for PP's codification (reviewer/
implementer formalization, orchestrator role)

- [x] Phase-level verify in the phase worktree: full suite (`npm test`)
  + boundary-test verdict (held/violated, with evidence pointer).
- [x] Dispatch a phase-diff review (bee-review on `main..phase/3`).
- [x] Merge `phase/3` → main (ADR-004 phase tier). If main moved
  during the phase (PP lands an ADR), this is a merge commit —
  expected, not a conflict: the straddle keeps file sets disjoint.
  Verify shared surfaces were never touched on the phase branch.
- [x] Cleanup ritual: `git worktree list` shows only the phase
  worktree; task worktrees and branches gone.
- [x] Calibration index: logbook entry
  `2026-10-31-po-p3-calibration.md` pointing PP at the P3 evidence
  (dispatch brief, pass-back digest, deviations, boundary verdict) —
  the observed-behavior input for codification.
- [x] Update phase list: P3 done. Commit: `close P3 orchestration
  build-out`

## Phase exit

Done means: `npm test` green on `phase/3`; the boundary test held
(dispatcher never opened source files — violations, if any, recorded);
task-orc completed one full dispatch with stop-and-return unused OR
used and adjudicated; `phase/3` merged to main after phase review;
calibration index filed for PP. The keeper samples per ADR-008 (e.g.
the pass-back digest + boundary verdict).

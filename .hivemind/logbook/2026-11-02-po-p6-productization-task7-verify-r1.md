<!-- machine
role: project-orchestrator
date: 2026-11-07T12:06:41+11:00
verdict: PASS
checks-run: 1
plan: .hivemind/plans/2026-11-02-po-p6-productization.md @ c6686e5
task: task-7
links: -
-->

## Dogfood anomalies + fix round 1 (review r1 should-fixes)

- run-1 `init --check` from THIS worktree: skills NOT registered +
  exit 1 — the plan assumed main-checkout execution (REPO_ROOT/skills
  = worktree path ≠ the registered ~/BeeHarness/skills). Workspace-
  caused, not a code defect; harness-skip + common-dir keying held.
- two real-machine writes (sanctioned, disclosed): settings gained
  `~/BeeHarness-task-docs/skills` (DANGLES once this worktree is
  removed); ~/.bee/registry.toon created keyed /home/saphron/BeeHarness
  @ c6686e5 (pin = HEAD at registration; post-merge drift is
  informational and self-heals on the next init from main).
- structure-check literal path validated the MAIN tree (self-consistent,
  0 findings); the meaningful assertion is the worktree-root run —
  0 findings with config.toon tracked (reproduced by review r1).
- MERGE-CLOSE OBLIGATION (review r1 sf-1): after this task's merge
  and worktree removal, delete the `~/BeeHarness-task-docs/skills`
  entry from ~/.pi/agent/settings.json (init only appends), then run
  `bee init` from the main checkout to re-register at the merged
  commit.

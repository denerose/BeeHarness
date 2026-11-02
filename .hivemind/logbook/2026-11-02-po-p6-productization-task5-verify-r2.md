<!-- machine
role: project-orchestrator
date: 2026-11-02T17:08:01+11:00
verdict: PASS
checks-run: 1
plan: .hivemind/plans/2026-11-02-po-p6-productization.md @ cf47c52
task: task-5
links: -
-->

fix round 1 (review r1 should-fix — worktreeOfBranch prefix match):

- finding: worktreeOfBranch matched porcelain `branch refs/heads/<b>`
  lines by prefix; merging task/9-ax while task/9-axx held a worktree
  resolved to the WRONG worktree and removed it.
- reproduced pre-fix in a throwaway repo: `bee worktree merge ax`
  printed "removed worktree /tmp/.../…-axx" — the axx worktree (wrong
  one), observed live.
- fix: exact line match (`line === \`branch refs/heads/${branch}\``) —
  the reviewer's one-token suggestion applied near-verbatim; comment
  added at the matcher.
- probe (replicates the reviewer's scenario, now permanent):
  tests/bee-worktree.test.mjs "merge never removes a longer-named
  branch's worktree (review r1)" — asserts merge exits 0, claims NO
  worktree removal, reports "no worktree registered for task/9-ax",
  and the axx worktree + branch survive.
- suites: task-5 9/9 · full 308/308 · structure 0 findings.
- re-review waived (loop rule: near-verbatim reviewer fix + probe
  replicated in this record).

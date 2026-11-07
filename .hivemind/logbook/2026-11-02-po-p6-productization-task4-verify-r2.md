<!-- machine
role: project-orchestrator
date: 2026-11-07T11:05:20+11:00
verdict: PASS
checks-run: 1
plan: .hivemind/plans/2026-11-02-po-p6-productization.md @ df10db3
task: task-4
links: -
-->

fix round 1 (review r1 blocking — local default was not project-local):

- finding: cmdSuggest's local branch used storePathOf, whose default
  targets REPO_ROOT/.hivemind/inbox.toon — from any consumer repo,
  `bee suggest "<text>"` silently filed into the HARNESS repo's inbox.
- reproduced live: `bee suggest "probe: where does this land"` run
  from /tmp (no --store) wrote IN-003 into this repo's live inbox;
  inbox restored immediately, porcelain clean (probe pattern).
- fix: new suggestStorePath — --store override kept; default resolves
  the repo root of the CURRENT directory (git common-dir aware, same
  basis as the --harness branch), falling back to cwd when not in a
  repo. storePathOf untouched (inbox/capture keep their semantics).
- probe (permanent): "local default is project-local" test — a
  subprocess bee run with cwd at a tmp git repo asserts the item
  lands in THAT repo's .hivemind/inbox.toon.
- suites: task-4 5/5 · full 318/318.
- blocking finding → re-review follows (no waiver).

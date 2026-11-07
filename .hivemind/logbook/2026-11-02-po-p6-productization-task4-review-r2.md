# Review: P6 task 4 — `bee suggest` (round 2: fix re-review)

**Role:** project-orchestrator
**Reviewer:** bee-review cold dispatch r2 (workspace `task/6-suggest` @ 5042652; did not write the code, did not run round 1)
**Plan section:** /home/saphron/BeeHarness-task-suggest/.hivemind/plans/2026-11-02-po-p6-productization.md — Task 4 (pinned @ df10db3 per verify-r2)
**Verify record:** /home/saphron/BeeHarness-task-suggest/.hivemind/logbook/2026-11-02-po-p6-productization-task4-verify-r2.md (PASS, checks-run 1 — independently reproduced this round: `node --test tests/bee-suggest.test.mjs` 5/5; full suite 318/318)

## Verdict

APPROVE — the r1 blocking finding is resolved and verified live; one
new should-fix (confirmation hint mis-points from consumer repos) rides
along, non-blocking.

## Blocking

None. The round-1 blocking finding — local default routing consumer-repo
feedback into the harness repo's inbox — is resolved by `suggestStorePath`
(`bin/bee.js:1151–1161`, called at `:1258`): `--store` override kept
(identical `path.resolve(p)` semantics to `storePathOf`), default resolves
the repo root of the CURRENT directory via `git rev-parse
--path-format=absolute --git-common-dir`, cwd fallback outside a repo;
`storePathOf` (`:657–660`) untouched, so `bee inbox`/`capture` keep their
semantics (confirmed in the 5042652 diff: only the new function, the one
call-site change, the regression test, and the round's two logbook
records). Exercised independently this round, every write into tmp dirs:

- tmp git repo, subprocess, no `--store` → item in THAT repo's
  `.hivemind/inbox.toon` (IN-001).
- tmp repo SUBDIR, no `--store` → lands at the repo root, not the subdir
  (no stray `.hivemind`) — an improvement over r1's literal
  `process.cwd()` suggestion, which would have filed from subdirs into
  the subdir.
- non-repo tmp dir → lands under that dir's `.hivemind/inbox.toon`.
- `--store` override from inside a git repo → lands at the given path;
  the repo's own inbox untouched.
- control from this harness worktree with `--store` → lands at the
  store; the main checkout's live inbox showed 0 modifications after all
  probes. In-repo default behavior is unchanged by resolution identity:
  from the main checkout, common-dir dirname = REPO_ROOT, byte-equal to
  the pre-fix default (resolution probed via git itself, no live write).
- git absent entirely (PATH without git, node by absolute path) →
  `spawnSync` error/status-null feeds the same cwd fallback; item landed
  under cwd. Verified live.

The regression test (`tests/bee-suggest.test.mjs:66–89`) is a real
subprocess probe with `cwd` at a tmp git repo asserting the item lands in
that repo's inbox — permanent, in the suite, and safe from any checkout
(it never touches a live store). Suites re-run this round: task-4 5/5,
full 318/318, tree clean.

## Should fix

- `bin/bee.js:806` (with `bin/bee.js:1151`, `:657–660`, `:850`) — the
  fix splits the defaults and orphans its own confirmation hint. From a
  consumer repo, `bee suggest "x"` writes `<consumer>/.hivemind/inbox.toon`
  and prints `IN-001 suggested · keeper — bee inbox show IN-001` — but
  `bee inbox show/list` default through `storePathOf` → the REPO_ROOT of
  the running bee.js (the harness checkout), not the store just written.
  Verified live from a tmp consumer repo holding IN-001/IN-002:
  `bee inbox list` (no flags) printed `0 items`; the same command with
  `--store <consumer>/.hivemind/inbox.toon` showed both. The hint is
  only actionable in the harness repo itself — in the command's
  flagship case it invites a command that returns an empty list, which
  reads as "it never filed". Not blocking: the write (the contract) is
  correct, and the plan literally specifies reusing `inboxAddItem`'s
  confirmation; the mismatch is a quality wart of the now-split
  defaults, and r1 adjudicated the hint text only when both commands
  shared one default. Suggested fix: when the resolved store differs
  from `storePathOf`'s default, print the hint with the store made
  explicit — e.g. `IN-001 suggested · keeper — bee inbox show IN-001
  --store <path>` — or name the store in the confirmation line.

## Notes

- Worktree edge, judged acceptable: from a linked worktree (this very
  workspace), the default resolves to the MAIN checkout's inbox —
  resolution probed: worktree default → `/home/saphron/BeeHarness/
  .hivemind/inbox.toon`, so a worktree agent's bare `bee suggest`
  leaves an uncommitted append in the main checkout's tracked inbox,
  invisible to the worktree's own git status. Acceptable because the
  basis matches the project's settled repo-root convention — plan task
  6 (PL-PO-002 ruling) defines the common-dir dirname as the repo root
  and treats worktree cwd as an edge `bee init` refuses outright;
  suggest's gentler policy (a keeper-directed inbox append to the live
  surface the keeper renders) is defensible where init's scaffold is
  not. One precision on the dispatch brief's parenthetical: the
  machine-store family's basis is raw `process.cwd()`
  (`bin/bee.js:219` — machine registry keys raw `process.cwd()`) and the
  design/phase family uses `--show-toplevel` (worktree-LOCAL:
  `bin/bee.js:2102`, `:4248`), so the exact match is to PL-PO-002's
  resolution order, not to those — recorded so the loop knows worktree
  suggests land main-checkout-side and ride no task branch.
- Ancient-git degradation: `--path-format` needs git ≥ 2.31 (here
  2.47.3); older git exits non-zero → cwd fallback, which from a repo
  SUBDIR files into `<subdir>/.hivemind` instead of the repo root —
  graceful (it degrades to r1's literally-suggested behavior), and the
  same vintage requirement the PL-PO-002 ruling already imposes on
  task 6. Recorded only.
- Claim vs record: task-4 plan boxes unchecked (plan lines 610–698)
  with verify-r1, verify-r2, review-r1 behind them and this report as
  r2; tasks 1/5 boxes checked and backed (r1 confirmed; commit log
  shows the done states). Clean.
- Round-1 notes stand, not re-litigated; nothing in 5042652 touches
  the paths they cover (wrap, numbering, slug, error paths) — the
  diff is exactly the two code hunks, the test, and the records.

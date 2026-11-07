<!-- machine
role: project-orchestrator
date: 2026-11-07T11:13:47+11:00
verdict: PASS
checks-run: 1
plan: .hivemind/plans/2026-11-02-po-p6-productization.md @ df10db3
task: task-4
links: -
-->

fix round 2 (review r2 should-fix — follow-up hint mis-pointed):

- finding: from a consumer repo, the confirmation's follow-up hint
  (`bee inbox show IN-001`) reads `bee inbox`'s default store (the
  harness checkout's inbox) — live-verified by r2: 0 items listed
  from the consumer cwd while the suggestion sat in the consumer
  store.
- fix (r2 reviewer's own suggestion, near-verbatim): when the
  resolved store differs from storePathOf's default, cmdSuggest
  extends the printed hint with `--store <resolved path>`. Scoped to
  suggest; inboxAddItem and inbox/capture untouched.
- probe: the subprocess consumer-repo test now asserts the hint
  carries `--store <consumer inbox path>` (permanent).
- suites: task-4 5/5 · full 318/318.
- re-review waived (should-fix; near-verbatim reviewer fix + probe
  replicated in this record).

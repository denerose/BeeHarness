<!-- machine
role: project-orchestrator
date: 2026-11-07T11:29:15+11:00
verdict: PASS
checks-run: 1
plan: .hivemind/plans/2026-11-02-po-p6-productization.md @ 3405180
task: task-3
links: -
-->

fix round 1 (review r1 should-fix — raw stack on unreadable AGENTS.md):

- finding: non-ENOENT read failures rethrew raw (AGENTS.md as a
  directory → uncaught EISDIR stack trace, stdout swallowed).
- fix (reviewer's concrete suggestion): structured
  `bee init: cannot read <path>: <message>` error, exit 1 — matches
  the house convention (inbox/report/render readers).
- probe (permanent): "AGENTS.md as a directory" test — code 1,
  structured err, no stack frames. task-3 6/6 · full 330/330.
- re-review waived (should-fix; reviewer's own fix applied + probe).

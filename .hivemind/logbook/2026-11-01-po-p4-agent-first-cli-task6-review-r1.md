# Review: P4 Task 6 — `bee task` (work-item state moves, script-owned)

**Role:** project-orchestrator
**Reviewer:** bee-review, cold dispatch, round 1
**Plan section:** /home/saphron/BeeHarness/.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md (Task 6 + Standing rules)
**Verify record:** `.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task6-verify-r1.md` (FAIL, link-check rider) → `-task6-verify-r2.md` (PASS)
**Scope:** `git diff be2c073..d65bc98` — 78c782e (bee task family + tests), c5f3336 (link-family fixes + 3 regressions), d65bc98 (r2 record)

## Verdict

**fix first** — 0 blocking, 2 should-fix. The state machine, ledger, provenance,
done-needs-record gate, and the task-5 link-family deviation all match the
plan's intent and their evidence; the two should-fixes are latent edges in
`bee task`'s section scan, small and fixable without re-design.

## Claim vs record (first check — pass)

- Task 6 boxes in the live plan remain unchecked (`bee task show` probe:
  `task-6 · draft · 0/5 steps`); the loop flips them after this review — no
  state ahead of evidence.
- r1 FAIL honestly recorded (the task's own check passing, the link-check
  rider failing, reproduced twice); r2 PASS behind it. Both ride the branch.
- Claimed numbers replicated here: 29/29 task tests, 35/35 verify tests,
  186/186 full suite, all green; tree clean after every command; the live
  plan and logbook untouched by this review (probes were read-only or
  `--check`; fixtures in /tmp only).
- r2's machine header `plan: … @ be2c073` matches the plan's last-touch
  commit.

## Blocking

None.

## Should fix

1. `bin/bee.js:2242` (`taskCheckboxStats`) and `bin/bee.js:2446-2453` (the
   rewrite loop) — the task-section scan is fence-unaware: any `- [ ]` line
   inside a fenced block in the task's section is counted as a step and
   ticked by `move … done`. Reproduced on a temp fixture: a task whose
   section carries a `path=`-tagged verbatim example with checkbox lines had
   the example's boxes ticked by the done move — silent corruption of the
   plan's verbatim contract content, which `plan-checks.sh` extracts as an
   artifact. It also blocks derived-done: an unticked example box keeps the
   task `draft` forever (or forces the corrupting move to reach done). Does
   not bite on the real P4 plan today (no task section carries fenced
   checkbox lines — checked). Suggested fix: toggle a fence flag on
   `/^\s*(```|~~~)/` in both the stats scan and the rewrite loop, exactly as
   `docLinkFindings` does at `bin/bee.js:1852-1855`, plus a fixture test
   asserting a fenced `- [ ]` example is untouched by a done move.
2. `bin/bee.js:2326-2329` — `show` truncates the task title at 48 cols
   unconditionally; `--full` (bin/bee.js:2338) only adds the `last:` ledger
   line and never relieves the truncation (real-plan probe shows
   `… (+31 chars)` with no escape). The plan's standing AXI rule is
   "`--full` wherever truncation exists". Suggested fix:
   `f.values.full ? title : truncText(title, 48)` (keeping the existing
   `--full` ledger behavior), with a test asserting the untruncated title.

## Notes

- **Deviation 1 (task-5 link-family fixes) — accepted.** The implementation
  matches the task-5 review's prescription verbatim
  (`.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task5-review-r1.md:110-112`:
  skip inline-code spans the way fences are skipped; own capture branch for
  `<...>` destinations) — see `bin/bee.js:1856-1867`. The trigger was real
  (r1's FAIL evidence: the review record's own three examples, on every P4
  branch verify), own commit, disclosed, in the twice-preceded
  repairs-to-exit-criteria envelope. Regressions replicate the probes
  exactly: the three biting examples verbatim, the angle whole-capture in
  both passing and failing forms, and the willWrite incident.
- **Deviation 2 (`show` implemented) — accepted.** The plan's Provides line
  names `bee task move|show`; bare `bee task` = exit 1 + fix mirrors
  `bee verify`'s required-input pattern.
- **Deviation 3 (ledger lines after `suite:` in the machine block) —
  accepted.** `parsePlanHeader` ignores them structurally (the digit in
  `task-N:` defeats the key regex; tested in-suite) and `plan-checks.sh`
  tolerance is tested on a ledger-carrying fixture.
- **Deviation 5 (`--record` on non-done = usage error) — accepted.**
  Consistent with "it evidences done moves"; the no-op check correctly
  precedes it, so re-running a done move without `--record` is still the
  idempotent no-op (probed).
- **Deviation 6 (two uncommitted duplicate entries removed) — accepted.**
  Accident recovery per the safety lines (restore, verify clean, disclose);
  only r1 and r2 exist in the logbook now.
- **Deviation 4 (dead draft-untick branch, `bin/bee.js:2450-2451`) —
  accepted as disclosed.** Unreachable through legal moves (draft is the
  floor, backwards refused, same-state no-ops), but it is the plan's stated
  `⇄` inverse; keep or drop at the loop's discretion. If kept alongside
  fix 1, it needs the same fence guard.
- `machineRange` (`bin/bee.js:2186`) re-implements `parsePlanHeader`'s
  first-block scan. Consistent today; two copies of the block-finding rule
  can drift. If touched again, have `parsePlanHeader` return its range.
- Scoped verify re-runs mint an entry every time (`bin/bee.js:2069-2071`,
  pre-existing task-5 behavior deliberately kept): a casual re-run of a
  scoped PASS mints rN+1 with role `bee` (a `--check` probe here showed it
  would write r3). Loop discipline — one scoped run per round — is the real
  control; re-probe with `--check`.
- Careful-developer checks that came back clean: `TASK_LEDGER_RE` robustness
  (malformed line and unknown state → hand-fix finding, both tested; write
  side enforces single-token fields), section-end at the next `## ` heading
  (sub-headings stay inside), derived-done from hand-ticked boxes (probe:
  tasks 0–5), `taskRecordShown` git-root fallback (non-git dirs → absolute),
  and the plan's AXI battery is fully covered (all six named tests present,
  plus byte-exact full-file literals with a timestamp sentinel).

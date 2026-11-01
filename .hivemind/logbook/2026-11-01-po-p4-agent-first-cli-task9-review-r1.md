# Review: Task 9 — phase close + decision-count calibration (r1)

**Role:** project-orchestrator (dispatching loop's role; GLOSSARY: Role trailer)
**Reviewer:** bee-review, cold-dispatched (worktree task/4-phase-close @ 75503dd)
**Plan section:** [.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md](/home/saphron/BeeHarness/.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md) — Task 9 + Standing rules
**Verify record:** `task/4-phase-close:.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task9-verify-r1.md`

## Verdict

Fix first — the work is faithful to the plan's six steps and every
recorded claim reproduces, but three real issues (one latent
silent-PASS hazard in `bee verify`, one unrecorded deviation from the
plan's `--check` text, one next-phase trap) belong in a fix round
before the phase merge, since this command *is* the merge.

## Claim vs record

Clean. Task 9 boxes in the plan remain unchecked (loop's to flip);
the verify record exists on the branch, command-minted with prose
body. All record claims re-run and reproduced in the worktree:
27/27 in `tests/bee-phase.test.mjs`, 237/237 full suite,
`structure-check.sh` 0 findings. A live read-only probe
(`bee phase close 4 --check --root <main repo>`) ran the gate at the
clean persistent phase/4 worktree, refused at the missing inventory
with its fix line, exit 1, zero git residue.

## Blocking

None.

## Should fix

- `bin/bee.js:1797` (`runCheckEntry`, bee verify) — the
  escalation candidate is a should-fix now, not a deferral. Same
  silent-false-PASS class the task just fixed in `phaseSuiteGate`:
  `spawnSync('sh', ['-c', ch.cmd])` inherits `process.env`
  untouched, and this repo's flagship plan carries
  `cmd: node --test tests/*.test.mjs` checks (P4 plan lines 58–74),
  so any future `bee verify` invoked from inside a Node test runner
  (the harness tests every other command via `run()`; verify is the
  obvious next one) reports red suites as PASS. Verified live: a red
  `node --test` child exits 0 under inherited
  `NODE_TEST_CONTEXT=child-v8`. Suggested fix: the same three-line
  strip as `bin/bee.js:3038` (`const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT;` passed to the spawn), plus one
  regression test (a plan whose check cmd is `node --test <red
  fixture>` asserted to FAIL from inside the runner). Deferral is
  acceptable only as a recorded suggestion-box entry — dropping it
  is not.
- `bin/bee.js:3125` + `3027` — `--check` runs the suite gate via
  `git worktree add --detach <tmp>` + `remove` when no clean
  persistent worktree holds the branch. The plan's letter is
  "`--check` prints the plan without touching git"; worktree
  registration (and its `--force` fallback removal) touches git,
  and this is not among the five recorded deviations — it is
  documented only in `PHASE_USAGE` (line ~2740). Tested
  residue-free, but the deviation is unadjudicated. Suggested fix,
  minimal: in `--check`, when the persistent worktree is absent or
  dirty, print `1 · gate · would run suite '<suite>' at the
  phase/<n> tree` instead of materializing the temp worktree (keep
  the real run's temp worktree); or keep the behavior and record it
  as deviation 6 with the loop's call.
- `bin/bee.js:3151`–`3155` — the inventory exemption lets a real
  close succeed with the decisions `.toon` still untracked, and
  nothing on the happy path says so; the next phase's close then
  refuses on it (its exemption list covers only its own slug's
  `.toon`). The trap fires for real: P4's close is this command's
  first run and P5's close will trip on the leftover. Suggested
  fix, minimal: when the card is emitted and the inventory is
  untracked, add a card note (`note: <decRel> untracked — git add
  it`) so the happy path surfaces the residue; committing it inside
  step 5 is the fuller option.

## Notes

- Deviations 1, 2, 4, 5 adjudicated sound, no action:
  NODE_TEST_CONTEXT strip is real (independently reproduced; the
  suite-gate test inside the runner is its regression cover) and
  placed where the phase family spawns suites; `-uall` is required
  for the exemption to match exactly one path; bare `bee phase` =
  list is the standing AXI-8 rule; branch-existence before plan
  lookup preserves the plan's step numbering in output.
- The decisions counting rule (`bin/bee.js:2912`, `phaseDecisionLines`)
  is sound: the `.toon` header lines carry no ` · `, comments are
  skipped, and the inventory writer validates the three-part shape
  before anything is counted.
- `bin/bee.js:3240`/`3271` — the `already merged` (no-op re-merge)
  branches are untested; the re-run-after-failed-rest/push path
  relies on them. A fixture test would close the gap.
- A fully-closed re-run fails at step 1 with `no branch phase/<n>`
  and fix "create it, or close from the repo that holds it" —
  misleading for the already-closed case; checking for the merge on
  main first would let it say "already closed".
- `bin/bee.js:52` — top-level USAGE omits `[--check]` on
  `inventory` (PHASE_USAGE at :2715 has it).
- `bin/bee.js:3285` — the push-failure fix line ("push by hand") is
  incomplete when origin/main diverged; the by-hand push fails the
  same way. One clause naming the divergence case would do.
- Verify-record nit: the test breakdown says "refusals 6, misc 2";
  the file's sections are refusals 8, misc 0 — totals (27) are
  right, only the labels drift.

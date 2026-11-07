# Review: P8 Task 5 — merge-level worktree suite + test convention (D9, item 12)

**Role:** task-orc (dispatching loop)
**Reviewer:** bee-review, cold-dispatched, 900s budget
**Plan section:** `.hivemind/plans/2026-11-07-po-p8-rectification-ship-tier.md` Task 5 + D9
**Verify record:** `.hivemind/logbook/2026-11-07-po-p8-rectification-ship-tier-task5-verify-r1.md` (FAIL — links, the T8-record defect) → `-task5-verify-r2.md` (PASS)
**Diff reviewed:** `git diff 1b65e91..HEAD` on `task/8-verify-worktree` (172d673, 99f2bd6, 8b0a130) — bin/bee.js (`isMainCheckout` + D9 suite in `cmdVerify`), skills/loop/bee-verify/SKILL.md, tests/bee-verify.test.mjs, one-line link repair in task8-review-r1.md (disclosed deviation), suggestion file deleted per D7

## Claim-vs-record (first check)

Consistent. Task 5's boxes are unchecked on the branch (verified/reviewed
not yet claimed); behind them stand verify r1 (FAIL) and r2 (PASS), and
this report is the pending review evidence. Checked tasks T1–T4, T7, T8
each have verify + review records on the branch. No checked box without
a record; no state ahead of its evidence in scope.

## Verdict

**Approve** — the implementation matches D9's intent on every judgment
axis probed, live-reproduced end-to-end; two should-fix findings, neither
fatal, both cheap.

Reproduction run: `node --test tests/bee-verify.test.mjs` 39/39 pass;
full suite `node --test tests/*.test.mjs` 383 pass; hand-probes below.

## Blocking

None.

## Should fix

- `bin/bee.js:3382` — a plan validated at `release` level silently skips
  the D9 worktree suite: the gate condition reads `merge` or `phase`
  only. Live evidence: the same probe plan with a failing suite FAILs
  at `validation: merge` (suite line + exit 1) but at `validation:
  release` prints no suite line and exits 0. Release is the top of the
  level ladder (GLOSSARY: "more risk, more checking") — the highest
  checking level getting less than merge level contradicts the feature's
  intent. Latent today (every plan in the corpus is `phase` or `task`).
  Suggested fix: add `header.validation === 'release'` to the condition.
- `tests/bee-verify.test.mjs:586-625` — the two new tests pin the
  suite-PASS path (main checkout, probe proves execution in the temp
  worktree) and the linked-worktree skip, but nothing pins the FAIL
  wiring (suite failure → run FAIL, exit 1, fix line, FAIL verdict in
  the entry) — the safety-critical half of the gate. Hand-probe shows
  the wiring works today (exit 1 + `fix: the suite fails in a fresh
  worktree of HEAD` observed), so this is a coverage gap, not a live
  defect. Suggested fix: a third test — suite `node -e
  "process.exit(1)"` → verify exits 1, stdout matches the suite FAIL
  line and its fix line.

## Notes

- Gate conditions match D9 as written: fires only at merge/phase, only
  after the declared checks pass, only with a `suite:` line, only from
  the MAIN checkout (`--git-common-dir` vs the checkout's own `.git`,
  both sides realpath-normalized — probed on this repo: main compares
  equal, this worktree compares unequal and printed `suite · skipped ·
  already inside a linked worktree (D9)`). Silent skips extend one step
  beyond the plan's sanctioned case (`bin/bee.js:3381,3385-3391`): a
  no-git plan root and a plan with `suite:` but zero declared checks
  both skip with no note, while the links check skips visibly in the
  same output. Defensible; saying it so the silence is on record.
- `phaseSuiteGate(planRoot, 'HEAD', suiteCmd, null, false)` is sound:
  null pwt forces the throwaway path (mkdtemp worktree, `--detach` at
  HEAD of the checkout being verified), same `NODE_TEST_CONTEXT` strip,
  same `verifyTimeoutMs()`, remove-then-force cleanup. The phase-close
  call site (bin/bee.js:5516) is untouched. The probe test genuinely
  proves worktree execution: the suite script reports its own
  `import.meta.url` dirname — asserted under `os.tmpdir()`, not the
  checkout, gone after the run, and `git worktree list` count back to 1.
- A suite PASS leaves no durable trace in the logbook entry (anomalies
  carry failures only — consistent with links/structure PASS handling;
  clean entries are machine-block-only by house shape). Both r1 and r2
  for this task were minted inside a linked worktree, so the skip note
  (stdout-only) appears in neither. If the loop wants durable evidence
  that the merge-level re-ran from main, record the suite line on
  PASS-from-main too.
- The link-repair deviation (99f2bd6) is correct and complete:
  `.hivemind/logbook/` is depth two, so `../plans/` resolves and
  `../../plans/` did not; the only remaining `../../plans/` hits in the
  logbook are plain-text quoted findings inside verify records, not
  live links. T8's own verify trail ends FAIL (r2, this defect) while
  T8's boxes are checked and it merged — T5's repair + r2 PASS closed
  the defect; the loop may want to acknowledge that closure when moving
  states (its call, not a finding against this task).
- D7 disposition matches house precedent: the deleted suggestion kept
  its 2026-11-01 routing Outcome (no re-stamp), as T1's deletions did
  (4a25649); the landing is recorded in the commit message. Sweep-audit
  clean — the one exempt comment now sits at `tests/bee.test.mjs:97`
  (plan cited :93; drift disclosed in 172d673's message).
- Reviewer footprint, disclosed: a hand-probe `bee verify --task 5` from
  this worktree minted `task5-verify-r3.md` (scoped passes write by
  design — pre-existing behavior, not this task's change). Removed
  before this report; worktree verified clean (`git status` empty). The
  dispatched trail stands r1 FAIL → r2 PASS → this review.

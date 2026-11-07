# Review: P8 rectification + ship-tier — task 7 (bee-plan minimums + census helper)

**Role:** project-orchestrator (dispatched stage agent, bee-review skill)
**Reviewer:** cold-dispatched reviewer, fresh context
**Plan section:** `.hivemind/plans/2026-11-07-po-p8-rectification-ship-tier.md` Task 7 (items 8, 18 + D7 dispositions; D13 = helper home) @ fab7a0f — read in the task worktree
**Verify record:** `.hivemind/logbook/2026-11-07-po-p8-rectification-ship-tier-task7-verify-r1.md` (PASS, checks-run 1)
**Scope reviewed:** commits e99dc73 + 6dbdd13 on `task/8-plan-minimums` — `scripts/plan-census.sh` (new), `tests/plan-census.test.mjs` (new, 5 tests), `skills/loop/bee-plan/SKILL.md`, `skills/loop/bee-plan/assets/plan-template.md`, LIVE census suggestion stamp, planned verify-expectations deletion, verify record. Nothing else changed; tree clean.

## Claim vs record (mechanical)

- Task 7 checkboxes: all unchecked — no checked box lacks its record (box-ticking is the loop's Record step at merge, per this phase's convention: fab7a0f ticked T1/T2 at merge). Verify record exists on the branch with PASS for the plan's task-7 check (`node --test tests/plan-census.test.mjs`, expect exit 0).
- Scope matches the machine header's task-7 `files:` list exactly; the suggestion changes and logbook entry are the plan's own named steps.
- D7 dispositions verified: `suggestions/planned/2026-10-20-verify-expectations-as-minimums.md` deleted (0 hits under `planned/`; carried a 2026-11-01 routed Outcome before deletion — stamp-then-delete honored); LIVE `.hivemind/suggestions/2026-11-02-po-plan-time-corpus-census.md` stamped (Outcome names the script, the skill step, and D13 — accurate) and left for triage. D13's deviation from the design's "bee-plan's assets" is recorded in the plan itself (plan-time decisions block), closing plan-review r1's S5.

## Verdict

**Approve** — the work matches the plan's intent verbatim, the census is semantically right against the real corpus (independently reproduced), and everything cross-checks; one should-fix on an output-key name, nothing blocking.

## Judgment areas (dispatch brief)

- **Census semantics vs real corpus.** Ran `bash scripts/plan-census.sh .hivemind/plans .hivemind/logbook` from the worktree: plans 10, headerless 4, logbook-files 119, role forms 26/9/77/7, verdict-line 87 / missing 32. The headerless=4 exclusion of `2026-10-18-continuity-layer.md` is **right**: the file carries an explicit "SHELVED — design input only, not for execution" banner, and zero plans/logbook records reference it. Its same-stem *design* doc is cited by the phase list and ADR-001, but that is a different file — the shelved plan file is dead weight exactly as the script's rationale defines it. Note the scope boundary below.
- **Role-form precedence (bold > plain > machine > none).** Sensible and load-bearing: one class per file, counts sum to the file total (26+9+77+7 = 119), body form outranks the machine block (6 corpus files carry both — precedence decides real cases, not hypotheticals), and bold > plain tracks template form over legacy form.
- **Verdict-line definition.** Machine `verdict:` + bold `**Verdict:**`, not `## Verdict` headings — matches the plan's "verdict-line coverage" ask exactly, and the bee-plan skill text does not overpromise (it says run and quote, nothing about verdict semantics). Arithmetic verified: 83 machine + 6 bold − 2 both = 87. The wobble is the negative key's name (should-fix below).
- **Rule-4 anchor.** Coherent. Rule 4's own text carries "and a verification command", so the minimums sentence refines the standard that lives there; the mid-loop-correction clause reads as the failure-mode rationale, not a story. Matches the plan's gate-fixed anchor and its renumbering note.
- **Template line.** `plan-template.md` verify-step line is byte-identical to the plan's mandated text; reads cleanly in place.
- **D13.** Helper in `scripts/` beside `plan-checks.sh`, structure-check clean (0 findings, `scripts/<file>.sh` pattern covers it), skill references it by repo-relative path — bee-native, no global dependency.

## Reproduction evidence

- `node --test tests/plan-census.test.mjs` — 5 tests, 5 pass (worktree).
- Full suite `node --test tests/*.test.mjs` — 365 pass, 0 fail.
- `bash scripts/structure-check.sh .` — 0 findings.
- Census on real corpus (output above) and on the test fixtures (via the suite) both clean; role-form sum equals file count; verdict counts cross-check.
- Test fixtures mirror the real corpus mechanisms: the headerless plan is referenced via a machine-block `plan:` line, exactly how real verify records reference plans.

## Blocking

None.

## Should fix

- `scripts/plan-census.sh:73` — the negative verdict key `verdict-missing` invites misquotation. In the real corpus 21 of the 32 "missing" files carry `## Verdict` section headings (verdicts exist — only the line form is absent); 11 have no verdict at all. The positive key says `verdict-line`, so the honest negative is `verdict-line-missing`. A planner who quotes "verdict-missing: 32" as "32 files lack verdicts" is wrong for two-thirds of the count — and the census exists precisely so planners quote numbers without re-deriving them. Suggested fix: rename the echo key to `verdict-line-missing` and update the two assertions (`tests/plan-census.test.mjs:109`, plus the count it derives from). The skill text needs no change.

## Notes

- `scripts/plan-census.sh:27-33` — the "referenced" test for the headerless count searches only the two dirs passed as args. Correct for the shelved plan today, but a future plan referenced only from `.hivemind/phases/` or a design doc would also read as unreferenced dead weight. Acceptable for a two-dir census; callers quoting the headerless number should know the boundary.
- The census's verdict-line definition and the bee-review template disagree on the canonical verdict form: `skills/loop/bee-review/assets/review-report-template.md` uses a `## Verdict` heading, so every template-faithful review report counts as verdict-missing (21 files today, including this phase's own task1/task2 reviews). The script comment says that drift is the fact the census exists to surface — true, and out of this task's scope — but at some point the keeper may want the template to carry a line-form verdict so the two instruments agree on one canonical form.
- The test suite exceeds the plan's minimum fixture spec (adds empty-dirs, missing-dir, and unreferenced-exclusion cases over the required two-plan/three-log corpus) — good coverage of the exit-code contract (0/1/2) and the headerless semantics without new dependencies.

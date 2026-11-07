# Plan review — P8 rectification + ship-tier (r2, re-review)

**Role:** cold-dispatched plan reviewer (bee-plan-review), round 2
**Plan:** `/home/saphron/BeeHarness/.hivemind/plans/2026-11-07-po-p8-rectification-ship-tier.md` (882 lines, 0/105 boxes; r1 was 839 lines / 0/102)
**Scope:** fix round `b957c47` ("P8 plan r1 fixes: 4 blockers, 8 should-fixes") diffed `73ab7b9..HEAD`; every r1 finding located in the fixed text and verified against the repo; six dimensions re-judged over the changed regions only (decisions list, Tasks 1, 2, 5, 6, 7, 10, 16, 17, machine checks 3/5/16).
**Safety:** the only write is this report; `git status --porcelain` clean before writing it; no sandboxes needed this round (no new verbatim blocks; changed check commands exercised against the live repo where meaningful).

## Core (mechanical) results

`scripts/plan-checks.sh` plain mode: `boxes: 0/105` · `blocks: 1/1 tagged, 0 untagged` · exit 1.

Four prose findings, same set r1 carried — **waived by the receiver in the r1 record; carried, not re-litigated**:

1. `scripts/plan-checks.sh:77` — the script's own marker regex. *(Waived r1: tool definition text.)*
2. `tests/plan-checks.test.mjs:55` — fixture built to carry a marker. *(Waived r1: fixture content.)*
3. `skills/loop/bee-plan/SKILL.md:45-46` — rule 7 quoting the marker examples. *(Waived r1: rule-definition text.)*

(The trailing `checks: findings` line is the script's pass/fail summary for those same findings — no new core output vs r1.)

## r1 findings — fix verification

| Finding | Status | Evidence |
|---|---|---|
| **B1** item-14 disposition | **Addressed** | Plan:213-217 now stamps the LIVE path and LEAVES it per D7; verified `.hivemind/suggestions/2026-11-01-po-p4-hindsight-plan-size-guard.md` exists (live, Outcome section at line 8); the wrong `planned/` path is gone from the plan (grep: no hits); item-11's `planned/2026-11-01-po-p7-close-hindsight.md` exists for the stamp+delete that remains. |
| **B2** bee-plan "rule 3" anchor | **Addressed** | Plan:464-466 re-anchors to rule 4 with an honest note that the design's "rule 3" predates a renumbering. Verified `skills/loop/bee-plan/SKILL.md:30-33`: rule 4 is "Each task stands alone — the self-contained-task standard" and owns "a verification command" — the anchor is accurate. |
| **B3** Task 5 sweep claim | **Addressed** | Plan:379-389 scopes the sweep `--include='*.test.mjs'` and pre-declares the three fixture hits as exempt. Re-ran the exact command: exactly one hit (`tests/bee.test.mjs:93`, the comment) — "known clean (one comment, bee.test.mjs:93)" is now true; fixture hits confirmed at `tests/fixtures/parking-lot-v1.md:1,92,254`, matching the plan's line numbers exactly. |
| **B4** Task 16 stale path | **Addressed** | Machine check files (plan:108) and Task 16 Files (plan:781-783) now read `skills/thinking/bee-brainstorm/SKILL.md` with the "(skills/session/ until Task 15's rename)" note. Verified the file exists pre-rename at `skills/session/bee-brainstorm/SKILL.md`; Task 8's own refs (plan:74,76,493,505) correctly stay `session/` — Task 8 runs before Task 15. |
| **S1** undispositioned suggestion files | **Addressed** | All five now have homes: item 13 → Task 10 stamp (plan:589-593; live file exists, Outcome present); item 20 → Task 2 stamp (plan:274-278; live file exists, no Outcome yet — the stamp adds one); items 15/22/23 → Task 1 stamp+delete per D4 (plan:219-224; all three exist in `planned/`; commit `3d2f4ba` verified). Cross-check: `suggestions/` holds exactly 7 live files and all 7 have stamp homes (T1, T2, T7-census, T9-close-sequence + inventory-format, T10, T12) — D7's "seven LIVE files" is exact. |
| **S2** Task 17 phantom repo file | **Addressed** | Plan:826-830: "The fenced block is the constant's payload, INLINED into bin/bee.js as TEMPLATE_GLOSSARY_SEED — the path= label is its sandbox home for review, not a repo file to create." Verified `scripts/structure.map` allows only `bin/<file>.js` — the note prevents the violation it was meant to prevent. |
| **S3** design.sh invocation | **Addressed** | Plan:258-260 quotes `implement <doc> --phase ${n} --merge ${mergeSha}` and notes `--phase` is required. Verified `scripts/design.sh` usage line 8: `implement <doc> --phase <n> --merge <hash> [--check]` — flag, order, and requirement all match. |
| **S4** Task 10 phantom sections | **Addressed** | Plan:573-583 rephrases as explicit ADDs with placement. Verified the template: no Gate-dispatch section exists ("no such section exists yet" — true), Safety lines number exactly 1-3 (the 4th is a genuine add), Pass-back exists, so "immediately above Pass-back" anchors to a real section. |
| **S5** census-helper home deviation | **Addressed** | D13 recorded (plan:165-171): the deviation from the design's "bee-plan's assets", the ADR-014 rationale, "Accepted deviation, recorded here; the keeper sees it at sign-off." — but see **B5** below: the sign-off enumeration was not widened to include D13. |
| **S6** checks-contract nits | **Addressed** | (a) task-3 cmd now `node --test tests/bee-render.test.mjs tests/bee-inbox.test.mjs` — ran it live: 0 fail, exit 0 (runnable and green pre-task). (b) task-5 cmd chains `grep -q "derive paths from the test's own location" skills/loop/bee-verify/SKILL.md` — the target string is a byte-exact substring of what Task 5's step (plan:373) tells the implementer to write; currently absent from the skill (verified: 0 matches), so the check is meaningful, and the command shell-parses. (c) task-16 cmd prepends `test -f .hivemind/memory/retired-pp-role.md` — parses (`sh -n` ok). |
| **S7** vacuous `--run` pass | **Addressed** (as plan fix) | Task 1 gains the `--run` honesty step (plan:206-211): output to a temp file, `# tests 0` → non-blocking note, with a pinned fixture test. Premise verified: current `scripts/plan-checks.sh:113` runs `eval "$suite" >/dev/null 2>&1` — "not /dev/null" describes a real change. |
| **S8** Task 6 stamp parenthetical | **Addressed** | Plan:437-440 now claims only the slug-format half as already-landed. Verified: slug format present (`suggestion-format.md:3-4`); role vocabulary NOT present — line 9 still reads the old enumerated `power-planner | project-orchestrator | …` form, exactly as the plan now says. |

**12/12 r1 findings addressed.** No partial or not-addressed.

## Judgment — changed regions re-reviewed

The widened greps and new check commands were the main mislead risk; all verified honest:

- **Task 5 sweep** — re-run as written: exactly the one declared hit; fixture exemption carries exact, verified line numbers. No implementer will be sent into historical fixture data.
- **Task 5 chained grep** — target string matches the step's verbatim text byte-for-byte; pre-task absence confirmed (the check cannot pass vacuously today).
- **Task 3 widened cmd** — both test files exist; the command runs green against the current repo.
- **Task 16 chained test** — syntactically valid sh; its three legs each correspond to a Task-16 step (create the file, strip roles/, strip SKILL.md citations). Task 16's census claim re-spot-checked: still exactly 10 role-file hit lines (3+2+1+4) and GLOSSARY-only in skills/.
- **Task 1 `--run` step** — premise (output currently to /dev/null) and detection string (`# tests 0`, per r1's node v24 reproduction) both match reality.
- **Stamp steps** — every named path exists on disk (15 planned/ + 7 live files all verified); D4's commit `3d2f4ba` exists and lands the law clauses as claimed.
- **D13** — accurately worded and consistent with `scripts/` reality — but its addition exposed a stale range (below).

### Blocking (new, introduced by the fix round)

- **B5 · Accuracy · plan:881 (Phase exit — Close ceremony).** "keeper sign-off by decisions (one card per judgment call; this plan's **D5-D12** + in-phase rulings)". The fix round added **D13** (S5's fix) but the sign-off card enumeration still ends at D12. D13 is precisely a judgment call — an accepted plan/design deviation — whose own text promises "the keeper sees it at sign-off"; and by the plan's own D5 vocabulary, D13 is a plan-time (front-loaded) decision, so "+ in-phase rulings" does not cover it. An executor following the line literally assembles cards for D5-D12 only and silently skips the D13 card — the deviation's keeper ratification, half the point of S5's fix. Same class as r1's B2: a range that predates an addition. **Fix:** one word — "D5-D13".

### Should fix

None.

## Dimensions — changed regions

- **Accuracy** — B5 above; every other changed-region claim verified true (table above).
- **External reality** — task-3 cmd executed (green); design.sh usage, structure.map, template sections, current `/dev/null` behavior all checked against the files. Pass except B5.
- **Sandbox-run** — no new verbatim blocks this round; Task 17's block is unchanged in content and its S2 fix removes the repo-file ambiguity while keeping the sandbox label honest. The vacuous-suite observation is now Task 1's scripted fix. Pass.
- **Ephemeral prose** — the four core findings are the carried waivers; the fix text adds no stale-able status sentences (the new `note suite:` text is runtime output, not durable-doc prose). Pass.
- **Determinism/AXI** — fixes keep the pattern: S7 becomes a scripted check with a pinned test; S6 tightens per-task check commands; census stays a script (D13). Pass.
- **No-globals boundary** — fixes add only bee-native/repo operations (stamps, greps, design.sh). Pass.

## Verdict

**FAIL** — one blocking finding: **B5** (plan:881 sign-off scope "D5-D12" excludes the fix round's own D13; fix is one word). All 12 r1 findings verified addressed; the single blocker is the fix round's only new defect. Recommend the one-word planner fix, then execute — a full third review round is not warranted for this change alone; a dispatcher spot-check of the edited line suffices.

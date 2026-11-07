# Plan review — P8 rectification + ship-tier (r1)

**Role:** cold-dispatched plan reviewer (bee-plan-review)
**Plan:** `/home/saphron/BeeHarness/.hivemind/plans/2026-11-07-po-p8-rectification-ship-tier.md` (839 lines, 0/102 boxes)
**Mode:** core (`scripts/plan-checks.sh`, plain + `--run` + `--extract`) then six-dimension judgment against the repo.
**Safety:** the only write is this report; both sandboxes were `/tmp` dirs, removed after use; `git status` shows no modifications (untracked: this file only).

## Core (mechanical) results — triaged

Counts: `boxes: 0/102` · `blocks: 1/1 tagged, 0 untagged` · `suite (--run): pass` (vacuous — see S7) · exit 1 on four prose findings. All four are pre-existing modify-target text that quotes the marker list as law/fixture/regex — rule-definition text, not status residue (the skill's carve-out). Tier: **should-fix, waiver recommended** on each; the receiver writes the one-line waiver beside the finding.

1. `scripts/plan-checks.sh:77` — the script's own marker regex. *Waiver reason: this IS the marker list — tool definition text.*
2. `tests/plan-checks.test.mjs:55` — fixture string built to contain a marker (tests the detection). *Waiver: fixture content, definitionally present.*
3. `skills/loop/bee-plan/SKILL.md:45-46` — rule 7 quoting the marker examples. *Waiver: quoted example inside the rule is the rule's definition text.*

**Waivers (receiver, project-orchestrator, 2026-11-07):** all
three core prose findings WAIVED — each is pre-existing
definition text (the tool's own marker list, a fixture built to
carry a marker, a rule quoting its own markers); the plan adds
no stale prose, and "fixing" these would damage the tool or the
rule text. Fix round: B1-B4 and S1-S8 all addressed in the plan
(5fc-style edit round, see plan git history); no judgment
finding disputed.

## Judgment findings

### Blocking

- **B1 · Accuracy · plan:202 (Task 1).** Stamp+delete names `.hivemind/suggestions/planned/2026-11-01-po-p4-hindsight-plan-size-guard.md` — no such file in `planned/`. The file is **live** at `.hivemind/suggestions/2026-11-01-po-p4-hindsight-plan-size-guard.md` (Outcome reads "Routed to the P8 pass … item 14"). The plan's own D7 says live files get Outcome stamps and **STAY** — deletion is the keeper's. As written the step 404s or, path-"fixed" naively, deletes a keeper-triage file. **Fix:** rewrite to stamp-Outcome-only at the live path (misfiling, if the keeper so rules, is their call to move).
- **B2 · Accuracy · plan:433 (Task 7; design item 8 inherits).** "bee-plan SKILL.md rule 3 gains: 'State grep expectations as minimums…'" — current rule 3 is **"No placeholders"** (`skills/loop/bee-plan/SKILL.md:26`); rules 0–8 contain no grep-expectations rule (the anchor predates a renumbering). An implementer grafts minimums text into the placeholders rule. **Fix:** re-anchor to the current list — rule 4 (self-contained-task standard, which owns the verification-command standard), rule 8, or a new rule; planner picks, but the anchor must name the current rule.
- **B3 · Accuracy · plan:357 (Task 5).** "`grep -rn 'BeeHarness\|/home/' tests/` — known clean (one comment)". Reality: **4 hits** — the comment (`tests/bee.test.mjs:93`) plus three fixture-data hits (`tests/fixtures/parking-lot-v1.md:1,92,254`). The follow-on "any live hit becomes a derive-from-location fix" could send an implementer editing historical fixture data. **Fix:** pre-declare the three fixture hits as historical data (exempt), or scope the sweep `--include='*.test.mjs'`.
- **B4 · Accuracy · plan:741-743 (Task 16 Files).** Names `skills/session/bee-brainstorm/SKILL.md`, but Task 16 depends on Task 15, whose own check asserts `! -e skills/session` (renamed to `skills/thinking/`). At execution time the binding Files path cannot exist. **Fix:** Files line and step text read `skills/thinking/bee-brainstorm/SKILL.md` (optionally noting "session/ until Task 15").

### Should fix

- **S1 · Consistency/disposition · Tasks 2, 10, phase exit.** The phase-exit criterion claims suggestion files "dispositioned per D7", but five checklist-item files have no dispositioning step: item 13 live `suggestions/2026-11-01-po-p4-hindsight-gate-budget.md` (Outcome still "Routed"; Task 10 lands its line, no stamp); item 20 live `suggestions/2026-11-02-po-close-flag-counts-kickoff-separately.md` (no Outcome section at all; Task 2 lands item 20, no stamp); items 15/22/23 `planned/2026-11-01-pp-design-note-consolidation.md`, `planned/2026-11-02-po-union-merge-suite-gate.md`, `planned/2026-11-02-po-marker-surgery-edit-tool.md` — landed pre-loop per D4 (both law clauses verified present in AGENTS.md) yet still in `planned/` with routed/planned-not-landed Outcomes; D7 says stamp+delete at land time. **Fix:** add stamp (+delete, for the planned three) steps — natural homes: Task 10 (13), Task 2 (20), one close-time step for 15/22/23.
- **S2 · Accuracy/convention · plan:789 (Task 17).** The verbatim block is tagged `path=bin/template-glossary-seed.toon`, but no task creates that file (Files: `bin/bee.js`, `tests/bee-init.test.mjs`) and `scripts/structure.map` allows only `bin/<file>.js` — a convention-following implementer creates a structure-check violation. The task text itself is unambiguous (inline as `TEMPLATE_GLOSSARY_SEED`). **Fix:** one sentence in Task 17 — "the fenced block is the constant's payload, inlined into bin/bee.js; the path= label is its sandbox home, not a repo file."
- **S3 · Accuracy (minor) · plan:238 (Task 2).** Quotes `scripts/design.sh implement <doc> --merge ${mergeSha}`; actual usage requires `--phase <n>` (`scripts/design.sh:7,44`). Low impact (the step says to read the script). **Fix:** quote the real invocation or note `--phase` is required.
- **S4 · Accuracy (anchors) · plan:539,544 (Task 10).** "GATE dispatches … gain a marked block" and "Brief-writing (dispatcher-side) line above Pass-back" name sections that don't exist in `skills/loop/bee-loop/assets/dispatch-brief-template.md` (current: Safety lines — exactly 3, so the 4th is a genuine add matching GLOSSARY — and Pass-back). **Fix:** phrase as adds with explicit placement ("add a marked Gate-dispatch block to the template body; add the relayed-claims line to the dispatcher preamble immediately above Pass-back").
- **S5 · Design/plan deviation · Task 7.** Creates `scripts/plan-census.sh`; design item 18 places the helper "in bee-plan's assets". `scripts/` fits ADR-014's scripts-over-skills better, but the deviation is unrecorded and plan/design conflicts go to the keeper. **Fix:** record a D13 line noting the deviation (recommend accepting `scripts/`), or escalate.
- **S6 · Checks-contract nits.** (a) plan:54 — task-3's check runs only `tests/bee-render.test.mjs` though the task also modifies `tests/bee-inbox.test.mjs` and pin (c) writes inbox tests; its own gate never runs them. **Fix:** `node --test tests/bee-render.test.mjs tests/bee-inbox.test.mjs`. (b) task-5's files include `skills/loop/bee-verify/SKILL.md` but no check covers the skill line (peers get greps — tasks 8-12). **Fix:** add a grep on the convention line. (c) task-16 creates `.hivemind/memory/retired-pp-role.md`; its check doesn't `test -f` it. **Fix:** extend the check.
- **S7 · Sandbox-run (observation, harness-level).** `--run` printed `suite: pass` — **vacuously**: the sandbox holds only `bin/template-glossary-seed.toon`; `node --test` on the unexpanded `tests/*.test.mjs` glob runs 0 tests and exits 0 (reproduced on node v24.20.0: tests 0, pass 0, exit 0). Not a plan defect (the suite targets the live repo), but the pass line is a false green for repo-wide suites. **Fix options:** fold into Task 1's plan-checks edits (note when the sandbox ran zero tests) or park it. Dispatcher's call.
- **S8 · Accuracy (minor) · Task 6 stamp parenthetical.** "(Slug-format and role-vocabulary fixes already verified present in the current asset…)". Verified: slug format present (`suggestion-format.md:4`); role vocabulary **not** present — line 9 still reads the old enumerated form, and the task's own step edits it. **Fix:** the parenthetical names only the slug-format half as already-landed.

## Dimensions — summary of what held

- **Accuracy** — findings B1-B4, S2, S3, S4, S8 above. Everything else checked held: `phaseClose`'s two flag blocks (bee.js:5168 `--check`, 5230 step 5), `phaseDecisionLines`, `PHASE_FLAG_THRESHOLD = 8`, `normItem`/`mergeNeeds`/`queueBullets` (fence-skip present — D12's "appears already fixed" is honest check-then-apply), `fromStore` Source logic present, `cmdInit` settings exact-match (bee.js:713), step-6 guard seeding exactly `GLOSSARY_HEADER + '\n'` (bee.js:558-560), `SUGGEST_USAGE`, `phaseSuiteGate`'s NODE_TEST_CONTEXT strip, `bee glossary add --see` (bee.js:3752), `bee phase inventory` (4826), `bee design status`/`task show`/`inbox list`/`park list`; P6-handoff mechanics all present (`.pi/handoff-project-orchestrator.md:73-83`); Task 16's census expectation exactly true (10 role-file hits: 3+2+1+4; skills/ = GLOSSARY only); `skills/session` holds exactly the five named skills (+2 new = 7); brainstorm step-4 first sentence, argue Notes bullet, handoff sections + wake-prompt step, plan-template verify line all match verbatim; checklist item→task mapping complete (all 29 items dispositioned across Tasks 1-17 + D4).
- **External reality** — suite `node --test tests/*.test.mjs`: **348 pass / 0 fail**, exactly the plan's "348 + new tests"; `git worktree add --detach` valid; `--git-common-dir` main-vs-linked detection sound; design.sh exists (S3 nit).
- **Sandbox-run** — the one verbatim block extracted and validated: exactly 21 lines, every line `term :: gist :: -`, no duplicate terms, `bee-loop` and `keeper` lines verbatim (Task 17's test assertions will hold). Suite coverage is S7's vacuous pass.
- **Ephemeral prose** — no judgment findings beyond the core's three; the plan's durable-doc edits carry no stale-able status sentences (the gate-budget "effective 2026-11-07" is a permanent effective-date, not status prose).
- **Determinism/AXI** — pass. Census scripted; CLI changes land in bee.js with pinned tests; Task 3 pins first (D12); authoring tasks name their judgment; census output TOON-ish with 0/1/2 exit discipline; per-task checks contract present.
- **No-globals boundary** — pass. No step depends on a global skill or rules file; checks are node/grep/test. Task 8's transient "(global `adr` skill)" insertion is explicitly scoped to Task 16's removal before the phase merge — main never sees the intermediate.

Note for the dispatcher: the plan is 839 lines — Task 1's own size note (fires >500) will flag this plan once landed; non-blocking by design.

## Verdict

**FAIL** — blocking findings B1 (item-14 suggestion file: wrong folder, disposition contradicts D7), B2 (bee-plan "rule 3" anchor stale — current rule 3 is "No placeholders"), B3 (Task 5 sweep claim "known clean (one comment)" — actually 4 hits), B4 (Task 16 Files path `skills/session/bee-brainstorm` is stale after Task 15's rename). All four are small text fixes; recommend one fix round, then a fresh re-review dispatch.

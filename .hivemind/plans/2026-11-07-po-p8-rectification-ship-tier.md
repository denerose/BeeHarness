# Plan: P8 — rectification + ship-tier cleanup

**Date:** 2026-11-07
**Design doc:** `.hivemind/designs/2026-11-01-pp-p8-rectification-inputs.md` (29-item checklist + close step) · `.hivemind/designs/2026-11-01-pp-skill-authoring-kit.md` · `.hivemind/designs/2026-11-02-pp-project-update-skill.md`
**Validation level:** phase
**Detail:** mixed — verbatim content for new files and one-line skill edits; behavior specs + pinned tests for CLI changes; check-then-apply instructions where items may already be partially landed (P8 discipline: verify what landed, apply idempotently)
**Reviewed:** bee-plan-review passed 2026-11-07 (3 rounds: r1 4🔴/8🟡 → fixed; r2 1🔴 B5 → fixed; r3 PASS; 3 core prose waivers recorded in r1)

<!-- machine
phase: P8
validation: phase
state-source: checkboxes below
targets:
  - scripts/plan-checks.sh (modify)
  - scripts/plan-census.sh (create)
  - bin/bee.js (modify)
  - tests/plan-checks.test.mjs (modify)
  - tests/plan-census.test.mjs (create)
  - tests/bee-phase.test.mjs (modify)
  - tests/bee-render.test.mjs (modify)
  - tests/bee-inbox.test.mjs (modify)
  - tests/bee-init.test.mjs (modify)
  - tests/bee-verify.test.mjs (modify)
  - tests/bee-suggest.test.mjs (modify)
  - skills/session/bee-hindsight/SKILL.md (modify)
  - skills/session/bee-hindsight/assets/suggestion-format.md (modify)
  - skills/session/bee-brainstorm/SKILL.md (modify)
  - skills/session/bee-argue/SKILL.md (modify)
  - skills/session/bee-handoff/SKILL.md (modify)
  - skills/loop/bee-loop/SKILL.md (modify)
  - skills/loop/bee-loop/assets/dispatch-brief-template.md (modify)
  - skills/loop/bee-plan/SKILL.md (modify)
  - skills/loop/bee-plan/assets/plan-template.md (modify)
  - skills/loop/bee-verify/SKILL.md (modify)
  - skills/skilldev/bee-skill-write/SKILL.md (modify)
  - skills/session/bee-relay/SKILL.md (create)
  - skills/session/bee-project-update/SKILL.md (create)
  - skills/thinking/ (create)
  - skills/GLOSSARY.md (modify)
  - roles/power-planner.md (modify)
  - roles/project-orchestrator.md (modify)
  - roles/task-orc.md (modify)
  - .hivemind/memory/retired-pp-role.md (create)
checks:
  - id: task-1
    cmd: node --test tests/plan-checks.test.mjs
    expect: exit 0
    files: [scripts/plan-checks.sh, tests/plan-checks.test.mjs]
  - id: task-2
    cmd: node --test tests/bee-phase.test.mjs
    expect: exit 0
    files: [bin/bee.js, tests/bee-phase.test.mjs]
  - id: task-3
    cmd: node --test tests/bee-render.test.mjs tests/bee-inbox.test.mjs
    expect: exit 0
    files: [bin/bee.js, tests/bee-render.test.mjs, tests/bee-inbox.test.mjs]
  - id: task-4
    cmd: node --test tests/bee-init.test.mjs
    expect: exit 0
    files: [bin/bee.js, tests/bee-init.test.mjs]
  - id: task-5
    cmd: node --test tests/bee-verify.test.mjs && grep -q "derive paths from the test's own location" skills/loop/bee-verify/SKILL.md
    expect: exit 0
    files: [bin/bee.js, skills/loop/bee-verify/SKILL.md, tests/bee-verify.test.mjs]
  - id: task-6
    cmd: node --test tests/bee-suggest.test.mjs
    expect: exit 0
    files: [skills/session/bee-hindsight/SKILL.md, skills/session/bee-hindsight/assets/suggestion-format.md, bin/bee.js, tests/bee-suggest.test.mjs]
  - id: task-7
    cmd: node --test tests/plan-census.test.mjs
    expect: exit 0
    files: [scripts/plan-census.sh, skills/loop/bee-plan/SKILL.md, skills/loop/bee-plan/assets/plan-template.md, tests/plan-census.test.mjs]
  - id: task-8
    cmd: grep -q 'a decision is what the keeper decided' skills/session/bee-brainstorm/SKILL.md
    expect: exit 0
    files: [skills/session/bee-brainstorm/SKILL.md]
  - id: task-9
    cmd: grep -q 'exactly the current task' skills/loop/bee-loop/SKILL.md
    expect: exit 0
    files: [skills/loop/bee-loop/SKILL.md]
  - id: task-10
    cmd: grep -q 'FINISHED brief only' skills/loop/bee-loop/assets/dispatch-brief-template.md
    expect: exit 0
    files: [skills/loop/bee-loop/assets/dispatch-brief-template.md]
  - id: task-11
    cmd: grep -q 'Should you use this skill' skills/session/bee-argue/SKILL.md
    expect: exit 0
    files: [skills/session/bee-argue/SKILL.md, skills/skilldev/bee-skill-write/SKILL.md]
  - id: task-12
    cmd: grep -q 'continuity-law check' skills/session/bee-handoff/SKILL.md
    expect: exit 0
    files: [skills/session/bee-handoff/SKILL.md]
  - id: task-13
    cmd: test -f skills/session/bee-relay/SKILL.md && grep -q 'relay block' skills/GLOSSARY.md
    expect: exit 0
    files: [skills/session/bee-relay/SKILL.md, skills/GLOSSARY.md]
  - id: task-14
    cmd: test -f skills/session/bee-project-update/SKILL.md
    expect: exit 0
    files: [skills/session/bee-project-update/SKILL.md]
  - id: task-15
    cmd: test -d skills/thinking -a ! -e skills/session
    expect: exit 0
    files: [skills/thinking/]
  - id: task-16
    cmd: test -f .hivemind/memory/retired-pp-role.md && ! grep -rq 'ADR-[0-9]' roles/ && ! grep -rq --include='SKILL.md' 'ADR-[0-9]' skills/
    expect: exit 0
    files: [roles/power-planner.md, roles/project-orchestrator.md, roles/task-orc.md, .hivemind/memory/retired-pp-role.md, skills/thinking/bee-brainstorm/SKILL.md]
  - id: task-17
    cmd: node --test tests/bee-init.test.mjs
    expect: exit 0
    files: [bin/bee.js, tests/bee-init.test.mjs]
suite: node --test tests/*.test.mjs
-->

## Kickoff rulings (2026-11-07, keeper)

- **D1** PL-PP-006 distillation DEFERRED — P8 runs the checklist as
  it stands; the managed AGENTS.md block ships pointer-only; the
  park holds until the keeper wants the distillation session.
- **D2** ONE phase, ONE plan, waves by artifact type; the reorg +
  ship-tier sweep runs LAST.
- **D3** All session instruments live in `skills/thinking/` after
  the reorg — no session folder survives it.
- **D4** PP landed items 13/15/22/23 pre-loop (commit `3d2f4ba`);
  this plan cites that law as landed.

## Plan-time decisions (PO, reviewed as decisions)

- **D5** Close-flag split (item 20): the inventory's one-line text
  already encodes provenance (`kickoff:` / `plan-time:` /
  `review-driven:` / `dogfood:` prefixes). `bee phase close`
  counts front-loaded = lines starting `kickoff` or `plan-time`,
  in-phase = the rest; the under-asked flag fires only when
  in-phase > 8 AND in-phase > front-loaded. No schema change.
- **D6** Settings prune (item 28): check-and-do in every init run —
  entries whose resolved path no longer exists drop, with an
  informational note; exit 0 both modes (drift-line semantics,
  P6 D3). `--check` names would-prune entries without writing.
- **D7** Suggestion-file disposition: `suggestions/planned/` files
  are stamped + deleted as their items land (keeper ruling
  2026-11-01). The seven LIVE files (P4/P5 hindsight) get Outcome
  stamps when their items land but STAY for the keeper's triage
  read — deletion of those is the keeper's.
- **D8** `roles/retired-pp.md` relocates to
  `.hivemind/memory/retired-pp-role.md` in the ship-tier sweep —
  `roles/` ships living specs only; records live in the records.
- **D9** Merge-level worktree suite (item 12): `bee verify` at
  merge level re-runs the plan's suite from a temporary
  `--detach` worktree of HEAD, but ONLY when the verify cwd is the
  main checkout — verifies already running in a worktree skip it
  with a note (the class is checkout-derived path assumptions).
- **D10** Template glossary term set (item 4): the 21 terms
  verbatim in Task 17 — core bee vocabulary, self-contained, no
  ADR anchors, `see: -`.
- **D11** New session skills (Tasks 13/14) land in
  `skills/session/` under the tree as it stands; Task 15's reorg
  renames the folder and retags every `kit:` field at once (D3
  applied mechanically, one sweep).
- **D12** Item 24 is check-then-apply: defects (b) and (d) appear
  already fixed by P4 review rounds (the marker-skip in
  `queueBullets`; the `fromStore` Source logic). Task 3 pins each
  with a test FIRST; where a pinned test already passes, the item
  closes as already-landed and no code changes.
- **D13** Census helper home (item 18): the design named
  "bee-plan's assets"; the plan builds `scripts/plan-census.sh`
  per ADR-014's scripts-over-skills — deterministic corpus
  counting is script work; the skill names the step, the script
  does the counting. Accepted deviation, recorded here; the
  keeper sees it at sign-off.

## Wave structure (D2)

bin/bee.js is the contention point — Tasks 2, 3, 4, 5, 6, 17
touch it and dispatch SEQUENTIALLY in that order. Everything else
parallelizes around that chain; Task 15 starts only after Tasks
1–14 have merged (reorg moves files the other tasks edit); Task 16
after 15; Task 17 rides the bee.js chain whenever its predecessors
are done.

## Task 1: plan-checks — exists satisfied + size note (items 11, 14)

**Files:** modify `scripts/plan-checks.sh`, `tests/plan-checks.test.mjs`
**Depends on:** nothing
**Provides:** `exists` reporting for create-targets; the
non-blocking size note — consumed by every future gate run.

- [ ] Step: In check 1 (files), before the ancestor walk for a
      `(create)` target: if the exact target path exists, report
      `note files: <path> exists (create-target satisfied)` via
      plain echo — NOT via `note()` (non-blocking) — and skip the
      walk. The ancestor walk (non-directory ancestor detection)
      still applies to missing paths, unchanged.
- [ ] Step: After check 2 (boxes), add a size note:
      `n=$(wc -l < "$PLAN")`; if `n > 500`, echo
      `note size: ${n} lines — large plan; gate cost rises`
      (plain echo, never sets fail).
- [ ] Step: Extend `tests/plan-checks.test.mjs`: (a) a plan
      fixture whose create-target exists as a file → run exits 0
      and stdout contains `exists (create-target satisfied)`, with
      no `non-directory ancestor` finding; (b) a fixture of 501+
      lines → exit 0, stdout contains `note size:`; a short
      fixture → stdout does NOT contain `note size:`.
- [ ] Step: `--run` honesty (gate r1 S7): the suite run's output
      goes to a temp file, not /dev/null; when node's summary
      reads `# tests 0`, print `note suite: 0 tests ran in
      sandbox — repo-wide suite, not block-reachable` (plain
      echo, non-blocking). Pin: a fixture plan whose suite is
      `node --test tests/*.test.mjs` → `--run` prints the note,
      exit 0.
- [ ] Step: run `node --test tests/plan-checks.test.mjs` — pass
- [ ] Step: Stamp + delete
      `.hivemind/suggestions/planned/2026-11-01-po-p7-close-hindsight.md`
      (item 11) per D7 (stamp first, delete in the same commit).
      The item-14 suggestion is a LIVE file — stamp its Outcome
      (`.hivemind/suggestions/2026-11-01-po-p4-hindsight-plan-size-guard.md`,
      landed: size note) and LEAVE it for the keeper's triage
      read per D7.
- [ ] Step: Items 15/22/23 landed pre-loop (D4, commit 3d2f4ba):
      stamp their Outcomes (landed pre-loop) and delete, per D7 —
      `.hivemind/suggestions/planned/2026-11-01-pp-design-note-consolidation.md`,
      `.hivemind/suggestions/planned/2026-11-02-po-union-merge-suite-gate.md`,
      `.hivemind/suggestions/planned/2026-11-02-po-marker-surgery-edit-tool.md`.
- [ ] Commit: `plan-checks: exists satisfied + size note`

**Task 1 notes:** review r1 APPROVE (0 blocking, 1 should-fix, 3
notes). Should-fix fixed in-round, re-review WAIVED: the deleted
p7-close-hindsight file carried undispositioned items #3/#4 — re-filed
verbatim from history at 44eae33 as
`2026-11-07-po-design-drift-repull-step.md` and
`2026-11-07-po-worker-claims-gitlog-verify.md` (near-verbatim reviewer
fix; probe = the files' origin headers cite the deleted file). Both
implementer deviations adjudicated by the reviewer as load-bearing
(both-reporter grep pattern; NODE_TEST_CONTEXT hygiene).

## Task 2: bee phase close — mechanical row flip, design stamps, flag split (items 17, 20)

**Files:** modify `bin/bee.js`, `tests/bee-phase.test.mjs`
**Depends on:** nothing (bee.js chain head)
**Provides:** close now flips the phase row, stamps designs, and
counts the flag split — Task 9's close checklist names these steps
as mechanical.

- [ ] Step: Flag split (D5): in `phaseClose`, replace the single
      `decisions: ${decCount}` + threshold block (both the
      `--check` preview and step 5) with:
      `const dl = phaseDecisionLines(decText)`; classify each
      line's one-line segment (between the first and last ` · `)
      by prefix: `kickoff` or `plan-time` → front-loaded;
      everything else → in-phase. Output
      `decisions: ${decCount} (front-loaded ${k} · in-phase ${r})`.
      Flag text `flag: under-asked kickoff` prints only when
      `r > PHASE_FLAG_THRESHOLD && r > k`.
- [ ] Step: Row flip: after the merge step succeeds (and after the
      `--check` preview names it as a would-step), locate the phase
      row: scan every file in `.hivemind/phases/` for a table row
      starting `| P${n} |` — first match wins. Change the row's
      status cell `in-progress|blocked|escalated|planned` →
      `done`, and append to the row's escalations cell:
      ` · close via bee phase close ${n} (merge ${mergeSha})`.
      No phases file or no matching row: informational line, never
      a failure (the row may live in a consumer layout); status
      already `done`: no-op line. When close writes the row, its
      output ends with `next: commit the phase-row flip`.
- [ ] Step: Design stamps: parse the SAME row's designs cell for
      backticked `designs/<file>.md` paths; for each NOT already
      carrying `(implemented @`, after the merge run the existing
      `scripts/design.sh implement <doc> --phase ${n} --merge
      ${mergeSha}` mechanics (the --phase flag is required by the
      script's usage; inline the same edit design.sh performs —
      read the script and reuse its function/steps verbatim in
      behavior; if design.sh is importable from bee.js, call it).
      Zero designs or all stamped → informational line, exit 0.
- [ ] Step: Extend `tests/bee-phase.test.mjs`: (a) flag-split —
      an inventory with 9 `kickoff:`/`plan-time:` lines + 3 others
      → no flag; 3 front-loaded + 9 in-phase → flag present, and
      the counts line reads `(front-loaded 3 · in-phase 9)`;
      (b) row flip — a fixture phases file flips to `done` with
      the close note appended, and a second close run on the
      flipped row is a no-op (idempotence); (c) design stamps — a
      fixture row with two designs, one already stamped → only the
      other gains `(implemented @ <sha>)`.
- [ ] Step: run `node --test tests/bee-phase.test.mjs` — pass
- [ ] Step: Close-flag-calibration is a LIVE suggestion file —
      stamp its Outcome
      (`.hivemind/suggestions/2026-11-02-po-close-flag-counts-kickoff-separately.md`,
      landed: split counts + in-phase-only flag rule) and LEAVE
      it for the keeper's triage read per D7.
- [ ] Commit: `phase close: row flip, design stamps, flag split`

## Task 3: report-regen defect batch (item 24, check-then-apply per D12)

**Files:** modify `bin/bee.js`, `tests/bee-render.test.mjs`, `tests/bee-inbox.test.mjs`
**Depends on:** task 2 (bee.js chain)
**Provides:** dedupe that survives tail drift; render fences never
  leak into ask text; ages never frozen; Source line truthful —
  pinned by tests either way.

- [ ] Step: Pin FIRST (D12): write tests for all four defects
      against current code — (a) two asks differing only in tail
      (id/path/date wrappers: `[PO] 2026-11-07 — confirm X (IN-001
      · /abs/ref)` vs `confirm X · ref: .hivemind/status.md`)
      must dedupe in `mergeNeeds`; (b) a status fixture whose
      Awaiting-keeper section contains fenced
      `<!-- inbox:render -->` regions → `queueBullets` output
      contains no fence text; (c) `bee inbox add` + `bee inbox
      done` (with `--status` pointing at a status fixture carrying
      a render region) leave the region re-rendered — ages in the
      file match a fresh render, not the pre-mutation render;
      (d) `bee report` with a store present stamps
      `**Source:** \`…inbox.toon\``. Run; record which pass
      already — those sub-items close as already-landed, no code
      change.
- [ ] Step: Fix (a) where failing: extend `normItem` to strip a
      trailing parenthetical group `\s*\([^)]*\)$` and any
      ` · ref: …` / `— …` tail separators before comparison —
      compare on the ask's core text.
- [ ] Step: Fix (b) where failing: in `queueBullets`, stop
      absorbing continuation lines into an open bullet once a
      render-fence line (`<!-- inbox:render` /
      `<!-- /inbox:render` prefix) is seen; fences never join
      bullet text.
- [ ] Step: Fix (c) where failing: after a successful store
      mutation in `cmdInbox` add/done, `cmdCapture`, and
      `cmdPark` add/resolve — when a status file with a balanced
      render region exists at the default/derived status path —
      re-render via the `renderIntoStatus` + `inboxRenderView`
      path (same invocation; ages compute at render time).
      Failure to re-render (missing status file, unbalanced
      region) is an informational stderr note, never a nonzero
      exit.
- [ ] Step: Fix (d) where failing: the merge-regen header replace
      must always end with the true `source` value.
- [ ] Step: run `node --test tests/bee-render.test.mjs` — pass
- [ ] Commit: `report regen: dedupe tails, fences, live ages, source`

## Task 4: init settings prune (item 28)

**Files:** modify `bin/bee.js`, `tests/bee-init.test.mjs`
**Depends on:** task 3 (bee.js chain)
**Provides:** self-healing settings registration — dead entries
  drop on the next init run.

- [ ] Step: In `cmdInit`'s settings step (D6): before the
      exact-match check, filter `entries` — any entry whose
      resolved path (after `expandTilde`) does not exist drops.
      If any dropped AND not `--check`: write the pruned settings,
      and the step's stdout gains
      `pruned ${n} dead entry(ies): <paths>` (informational, exit
      0). In `--check`: name them as `would prune: <paths>`,
      write nothing. Prune runs in both hit and miss paths.
- [ ] Step: Extend `tests/bee-init.test.mjs`: a settings fixture
      with one live entry (the target) + one dead path → init
      (non-check) drops the dead entry, keeps the live, exit 0,
      note names the pruned path; `--check` writes nothing and
      prints `would prune`; a settings file with only live entries
      is byte-unchanged.
- [ ] Step: run `node --test tests/bee-init.test.mjs` — pass
- [ ] Step: Stamp + delete
      `.hivemind/suggestions/planned/2026-11-07-po-settings-skills-lifecycle.md`
      per D7.
- [ ] Commit: `init: prune dead settings entries (self-healing)`

## Task 5: merge-level worktree suite + test convention (item 12)

**Files:** modify `bin/bee.js`, `skills/loop/bee-verify/SKILL.md`, `tests/bee-verify.test.mjs`
**Depends on:** task 4 (bee.js chain)
**Provides:** the checkout-assumption class caught at merge level;
  the convention line in the verifier's skill.

- [ ] Step: CLI (D9): in `cmdVerify`, after the declared checks
      pass at validation level `merge` or `phase`, when the
      current checkout is the repo's MAIN checkout (cwd's
      `git rev-parse --git-common-dir` equals the checkout's own
      `.git` — i.e. not a linked worktree): create a temporary
      `git worktree add --detach <tmp> HEAD`, run the plan's
      `suite:` command there (same env hygiene as phaseSuiteGate:
      strip `NODE_TEST_CONTEXT`; same timeout), remove the
      worktree. Suite failure = verify FAIL with the worktree
      note. Already in a linked worktree → skip with an
      informational note line. Suite line absent → skip silently.
- [ ] Step: Skill line: `skills/loop/bee-verify/SKILL.md` gains,
      in "Run the command": "Tests derive paths from the test's
      own location (`import.meta.url`) or fixtures — never a
      hardcoded checkout path; the merge-level worktree re-run
      exists to catch that class."
- [ ] Step: Extend `tests/bee-verify.test.mjs`: at merge level
      from the main checkout, a plan whose suite echoes a path
      derived from the test's location runs in the temp worktree
      (assert the note line); a verify invoked from inside a
      linked worktree skips (note line, exit 0).
- [ ] Step: Sweep-audit: `grep -rn --include='*.test.mjs'
      'BeeHarness\|/home/' tests/` — known clean (one comment,
      bee.test.mjs:93); any live hit becomes a derive-from-
      location fix in this task. Fixture files are historical
      data and exempt — three 'BeeHarness' prose hits exist there
      today (tests/fixtures/parking-lot-v1.md:1,92,254) and are
      not path assumptions.
- [ ] Step: run `node --test tests/bee-verify.test.mjs` — pass
- [ ] Step: Stamp + delete
      `.hivemind/suggestions/planned/2026-10-31-po-no-hardcoded-checkout-paths-in-tests.md`
      per D7.
- [ ] Commit: `verify: merge-level worktree suite + path convention`

## Task 6: bee-hindsight pass (items 6, 29)

**Files:** modify `skills/session/bee-hindsight/SKILL.md`,
  `skills/session/bee-hindsight/assets/suggestion-format.md`,
  `bin/bee.js`, `tests/bee-suggest.test.mjs`
**Depends on:** task 5 (bee.js chain — SUGGEST_USAGE line)
**Provides:** generalized inputs, the sixth question, the
  never-asks rule, observation-type line, status listing step.

- [ ] Step: SKILL.md Inputs section — retitle to "Inputs — re-read
      whatever state your role produced" and generalize: keep the
      ordered re-read discipline; the loop's surfaces (session
      memory, phase list, plan, logbook records) as one example
      list; add the non-loop example (a planner or session role:
      its session memory, the ADRs and design docs it wrote,
      status surface, the conversation's keeper corrections).
      Don't trust recall over the record stays the rule.
- [ ] Step: Examination gains the sixth question after the
      deficit list: "What worked that we should keep doing?
      Positive findings earn summary lines (not files)."
- [ ] Step: Done-means gains the never-asks rule: "The summary
      REPORTS what was filed — it never offers to file, asks
      permission, or tees up 'want this one too?'. Borderline
      items get filed (filing is adds-only, any-role work; the
      keeper's gate is at promotion, not filing)." And the final
      step: "List new suggestions in the status surface's prose,
      under Awaiting keeper — never inside the script-owned render
      region."
- [ ] Step: `assets/suggestion-format.md`: Role line vocabulary →
      `<role name> — any role when the keeper asks`; add the
      observation-type line: "A problem with no proposed solution
      is a legitimate suggestion file — state the problem
      concretely; graduation treats it as a design input."
- [ ] Step: `bin/bee.js` SUGGEST_USAGE: one help line — "A
      suggestion may be a problem with no proposed solution
      (observation-type); it routes as a design input." Pin with a
      `tests/bee-suggest.test.mjs` assertion on the usage text.
- [ ] Step: run `node --test tests/bee-suggest.test.mjs` — pass
- [ ] Step: Stamp + delete
      `.hivemind/suggestions/planned/2026-10-25-pp-hindsight-skill-fixes.md`
      and
      `.hivemind/suggestions/planned/2026-11-02-po-hindsight-summary-never-asks-to-file.md`
      per D7. (Slug-format fix already verified present in the
      current asset — record as the already-landed half in the
      Outcome stamp; the role-vocabulary fix is NOT yet present
      and lands in this task's edit.)
- [ ] Commit: `hindsight: generalized inputs, sixth question, never-asks`

## Task 7: bee-plan minimums + census helper (items 8, 18)

**Files:** create `scripts/plan-census.sh`, modify
  `skills/loop/bee-plan/SKILL.md`,
  `skills/loop/bee-plan/assets/plan-template.md`; create
  `tests/plan-census.test.mjs`
**Depends on:** nothing (independent of the bee.js chain)
**Provides:** census helper `scripts/plan-census.sh`; the
  minimums rule in bee-plan + the template's verify-step line.

- [ ] Step: `scripts/plan-census.sh` (bash, TOON-ish output like
      plan-checks.sh): usage `plan-census.sh <plans-dir>
      <logbook-dir>`; emits (a) per-plan-file: lines, has-machine
      block (y/n), `phase:` value, task count; (b) corpus counts:
      total plans, headerless-plan count (referenced by others but
      no `phase:` header), Role-trailer form breakdown across
      logbook files (`Role: <x>` vs bold/other forms — count each
      form), verify/review verdict-line coverage (files with a
      verdict line vs without); (c) exit 0 always except usage
      (2) / missing dir (1). No findings — it is a census, not a
      gate.
- [ ] Step: bee-plan SKILL.md rule 4 (self-contained-task
      standard — it owns the verification-command standard; the
      design doc's "rule 3" anchor predates a renumbering) gains:
      "State grep
      expectations as minimums (`≥ N`) unless the exact count IS
      the contract (duplicate detection); a wrong exact count
      forced a mid-loop plan correction once — minimums keep the
      check honest when the corpus moves."
- [ ] Step: plan-template.md verify-step example line becomes:
      `- [ ] Step: run \`verification command\` — expected result
      (grep expectations as minimums, ≥ N, unless the exact count
      is the contract)`.
- [ ] Step: bee-plan SKILL.md Format section gains the census
      step: "Before writing corpus claims (counts, coverage,
      form-breakdowns), run `scripts/plan-census.sh` over the
      plans and logbook dirs and quote its numbers — the gate
      judges interpretation, not arithmetic."
- [ ] Step: `tests/plan-census.test.mjs`: fixtures (two plans,
      one headerless; three logbook files mixing Role forms and
      verdict lines) → assert emitted counts; usage error exits 2.
- [ ] Step: run `node --test tests/plan-census.test.mjs` — pass
- [ ] Step: Stamp + delete
      `.hivemind/suggestions/planned/2026-10-20-verify-expectations-as-minimums.md`
      per D7. (The census suggestion is a LIVE file — stamp
      Outcome only, leave for triage per D7.)
- [ ] Commit: `plan: grep minimums + corpus census helper`

## Task 8: bee-brainstorm ownership filter (item 7)

**Files:** modify `skills/session/bee-brainstorm/SKILL.md`
**Depends on:** nothing
**Provides:** step 4 carries the ownership filter.

- [ ] Step: Replace step 4's first sentence with:
      "4. **Record keeper decisions as ADRs** (global `adr` skill)
      as they are agreed — a decision is what the keeper decided,
      not what the conversation concluded; when unsure, offer
      first (GLOSSARY: memory ownership). Every decision worth
      remembering gets an ADR. Don't batch them to the end."
      (The global-skill reference itself is Task 16's scope, not
      this edit's.)
- [ ] Step: run `grep -q 'a decision is what the keeper decided' skills/session/bee-brainstorm/SKILL.md` — exit 0
- [ ] Step: Stamp + delete
      `.hivemind/suggestions/planned/2026-10-25-po-brainstorm-ownership-filter.md`
      per D7.
- [ ] Commit: `brainstorm: ownership filter in step 4`

## Task 9: bee-loop Record rule + close checklist + tidy authority (items 9, 17, 16)

**Files:** modify `skills/loop/bee-loop/SKILL.md`
**Depends on:** task 2 (names the now-mechanical close steps)
**Provides:** the interim checkbox rule; the ordered close
  checklist; the scoped tidy-authority line.

- [ ] Step: Record step (6) gains after the hand-edit rule:
      "Check off exactly the current task's boxes at its commit —
      never batch checkbox edits across task or section
      boundaries (a partition slice sweeps everything downstream);
      checked boxes are state claims and land with their own
      evidence. Where `bee task` owns a state line, the state line
      is authoritative; the script's box-ticking is cosmetic."
- [ ] Step: New close section after step 7, in order: "8.
      **Close** — the checklist, in order: assemble the decisions
      inventory (`#`-comment header lines only, `id · one-line ·
      source-record-path` entries, middle-dot separators) → `bee
      phase inventory <n> --decisions <file>` → `bee phase close
      <n>` (gates, merges, flips the phase row, stamps designs,
      counts front-loaded vs in-phase decisions) → the status
      note for the phase → the tidy pass where the keeper's word
      directs one (bootstrap-noise paydown with the P5 tooling —
      standing authority, no per-step ask; disclose after) →
      report to the keeper."
- [ ] Step: Mechanics sweep (item 21): the dispatch mechanics the
      P6 handoff carried but no skill or script names — a handoff
      is not a durable home; any mechanic that appears in a
      handoff but in no skill or script is a codification gap.
      Sweep into bee-loop's dispatch/verify mechanics (grep the
      skill first; add only what is missing): (a) SPINE SYNC —
      the persistent spine worktree rests detached at main; cut
      `phase/<n>` there from main (`git switch -c phase/<n>
      main`) and UNSET UPSTREAM immediately — a tracking spine
      could push to main; (b) VERIFY INVOCATION — `bee verify
      --plan <relative plan path> --task <n> --role <role>
      --record` runs from the TASK worktree; absolute plan paths
      resolve to the main checkout and fail files: checks; (c)
      WORKTREE ARGS — `bee worktree create <phase>-<slug>`, merge
      takes SLUG ONLY.
- [ ] Step: run `grep -q 'exactly the current task' skills/loop/bee-loop/SKILL.md` — exit 0
- [ ] Step: Stamp + delete
      `.hivemind/suggestions/planned/2026-11-01-po-per-task-checkbox-discipline.md`
      per D7. (The close-sequence and inventory-format suggestions
      are LIVE files — stamp Outcomes only, leave for triage per
      D7.)
- [ ] Commit: `loop: record rule, close checklist, tidy authority`

## Task 10: dispatch-brief template lines (items 10, 13-line, 26)

**Files:** modify `skills/loop/bee-loop/assets/dispatch-brief-template.md`
**Depends on:** nothing
**Provides:** the fourth safety line; return-contract line;
  gate-budget line; relayed-claims line.

- [ ] Step: Safety lines gain: "4. Work from the pinned absolute
      working directory named in this brief (`cwd` / `-C`) —
      never a look-alike path (a worktree of the same repo is a
      different checkout)."
- [ ] Step: Pass-back section gains: "Return the FINISHED brief
      only — omit working notes, transcripts, and process
      narration."
- [ ] Step: ADD a marked Gate-dispatch block to the template
      body (no such section exists yet): "Gate dispatch: budget
      ≥ 900s; write the report even if incomplete — an incomplete
      report reaches the dispatcher, silence does not (standing
      default, effective 2026-11-07)."
- [ ] Step: ADD to the dispatcher preamble, immediately above
      Pass-back: "Relayed claims: none | verified list. A
      pass-back claim is a factual claim — verify it against the
      repo before it enters a brief, or mark it 'claimed,
      unverified — confirm' so the reader treats it as a
      question, not a premise."
- [ ] Step: run `grep -q 'FINISHED brief only' skills/loop/bee-loop/assets/dispatch-brief-template.md` — exit 0
- [ ] Step: Stamp + delete
      `.hivemind/suggestions/planned/2026-11-01-pp-researcher-briefs-final-only.md`
      and
      `.hivemind/suggestions/planned/2026-11-02-po-relayed-claims-verified.md`
      per D7. Gate-budget is a LIVE suggestion file — stamp its
      Outcome
      (`.hivemind/suggestions/2026-11-01-po-p4-hindsight-gate-budget.md`,
      landed: template line, keeper standing word at kickoff D4)
      and LEAVE it for the keeper's triage read per D7.
- [ ] Commit: `brief template: cwd pin, final-only, gate budget, claims`

## Task 11: entry discipline — authoring standard + bee-argue (item 2)

**Files:** modify `skills/skilldev/bee-skill-write/SKILL.md`,
  `skills/session/bee-argue/SKILL.md`
**Depends on:** nothing
**Provides:** the entry-discipline authoring standard (consumed
  by Tasks 13/14 and every future skill edit).

- [ ] Step: bee-skill-write gains a section after Style:
      "## Entry discipline (when a skill should run)\n\nA skill
      that never gets called isn't worth its storage cost; agents
      bias toward acting directly, and permissive wording licenses
      silent skipping. State entry conditions in the skill:\n\n-
      DISCRETIONARY skills (use is a judgment call; the answer can
      legitimately be no) carry a 'should you use this skill?'
      gate — criteria meeting them means USE IT; skipping requires
      naming, out loud, which entry condition fails. Never a
      silent default.\n- PIPELINE stages (trigger = position in
      the loop) and EXTERNALLY-GATED skills (trigger = explicit
      direction or a declared mode) carry their trigger conditions
      instead — a gate there is noise.\n- The entry check governs
      SELF-initiated use. A KEEPER invocation (their verb — the
      skill's name, or direct direction) IS the entry decision,
      already made: recognition, not evaluation. Not using a skill
      the keeper explicitly called is the failure mode."
- [ ] Step: bee-argue: replace the Notes bullet "A tool available
      to any agentic user of the harness, not a rule. The common
      right move is still a plain recommendation from the agent
      closest to the work — but when the decision-maker asks for
      something better than one opinion, that ask settles it: use
      this." with a gate section before Notes: "## Should you use
      this skill?\n\nUSE IT when the decision-maker asks for
      something better than one opinion, or when a fork is few,
      genuinely distinct, and worth the dispatch cost. SKIP by
      naming the failed condition out loud — 'cheap fork: a plain
      recommendation carries it' or 'options not genuinely
      distinct' — never silently. A plain recommendation remains
      the common right move; this skill is entered on purpose."
- [ ] Step: bee-argue Notes gains: "Dispatched workers return the
      FINISHED case only — no working notes, transcripts, or
      process narration."
- [ ] Step: run `grep -q 'Should you use this skill' skills/session/bee-argue/SKILL.md` — exit 0
- [ ] Commit: `entry discipline: authoring standard + argue gate`

## Task 12: bee-handoff pre-write gate + scoped authority (items 5-verify, 19, 16)

**Files:** modify `skills/session/bee-handoff/SKILL.md`
**Depends on:** nothing
**Provides:** the continuity-law gate; the scoped supersede/write
  authority line.

- [ ] Step: Verify item 5 already landed: the skill's "Hand over
      the wake prompt" step delivers the fenced block in-chat as
      the last act — confirm present (it is, as of this plan's
      writing); record in the commit body "verified present, no
      edit". Stamp + delete
      `.hivemind/suggestions/planned/2026-11-01-po-wake-prompt-must-be-delivered-in-chat.md`.
- [ ] Step: New section before "## The handoff file": "## Before
      writing: the continuity-law check\n\nConfirm this is a
      same-role refresh the role file's continuity law permits.
      Where the role's law says delegate-harder or
      crash-recovery-only, that law wins over this skill: say so
      and stop — a handoff the role's law forbids is not this
      skill's to write."
- [ ] Step: "Write the handoff" section gains the authority line:
      "This skill supersedes the previous handoff wholesale and
      refreshes the session memory's standing sections without
      per-step keeper asks — scoped tidy authority. Surfaces the
      keeper gates (parking resolves, decision records, the
      report's keeper zone) stay gated."
- [ ] Step: run `grep -q 'continuity-law check' skills/session/bee-handoff/SKILL.md` — exit 0
- [ ] Step: Handoff-scheduling-guard is a LIVE suggestion file —
      stamp its Outcome (landed: pre-write gate) and LEAVE it for
      the keeper's triage read per D7.
- [ ] Commit: `handoff: pre-write gate + scoped tidy authority`

## Task 13: relay skill (item 25)

**Files:** create `skills/session/bee-relay/SKILL.md` (lands in
  session/ per D11; Task 15 renames)
**Depends on:** task 11 (authored under the entry-discipline
  standard)
**Provides:** the relay contract as a shipped instrument.

- [ ] Step: Create `skills/session/bee-relay/SKILL.md` with
      front-matter `kit: session`, `name: bee-relay`, description:
      "Carries context between roles as a final artifact — gated
      (keeper-passed) or ambient (shared surfaces). One topic per
      relay, self-contained, correctly sized; keeper-facing blocks
      are final — deltas arrive as standalone addenda." Body
      sections: The contract (one topic per relay; numbered items;
      self-contained context — the recipient reads nothing else;
      as-of commit stamp; absolute paths; an explicit "what the
      recipient should do" line; never duplicate content across
      relays — point at the first relay's home). Final artifacts
      (keeper-facing relay blocks are FINAL: never ask the keeper
      to edit, merge, splice, or proofread; a passed block needing
      change gets a standalone self-contained addendum covering
      exactly the delta — sized to the ask, never a superset; an
      unpassed one gets a clean full replacement). Two modes
      (gated: the keeper passes the prompt — direction is theirs;
      ambient: shared surfaces carry state, roles pick up each
      other's context without the keeper relaying). Should you use
      this skill? (EXTERNALLY-GATED: trigger = cross-role context
      must move and a relay is the instrument — a same-role
      refresh is a handoff, not a relay; in-repo notes are the
      status surface's job). Judgment kept (what to include, what
      the delta is; the checklist is the skill).
- [ ] Step: `skills/GLOSSARY.md` relay entry gains (via `bee
      glossary add`? No — supply-not-update applies to the store;
      the rendered view regenerates): add a NEW entry
      `relay block` :: "a relay's deliverable: self-contained,
      final on first hand-off; deltas arrive as standalone
      addenda, never splice requests" :: `-`. (Store op: `bee
      glossary add 'relay block' '<gist>' --see -`.)
- [ ] Step: run `test -f skills/session/bee-relay/SKILL.md` — exit 0
- [ ] Step: Stamp + delete
      `.hivemind/suggestions/planned/2026-11-02-po-relays-are-final-artifacts.md`
      per D7.
- [ ] Commit: `relay skill: the contract as an instrument`

## Task 14: project-update skill (item 27)

**Files:** create `skills/session/bee-project-update/SKILL.md`
**Depends on:** task 11 (authored under the standard)
**Provides:** one skill, three altitudes, per its design note.

- [ ] Step: Create `skills/session/bee-project-update/SKILL.md`
      (`kit: session`, `name: bee-project-update`), from the
      design note `2026-11-02-pp-project-update-skill.md`:
      The gather (identical all altitudes): `bee design status`;
      the phase list; `bee task show <active-plan>`; `bee inbox
      list` + `bee park list` — the whole read, no prose
      archaeology. Three altitudes (design: compare against the
      target state and intended outcomes — divergence, staleness,
      unowned gaps; execution: phases/tasks/goals — on-track,
      blocked, starved, evidence-backed via logbook when a claim
      needs grounding; keeper digest: the gather rendered to a few
      plain lines — in flight, done since, needs-the-keeper,
      next). The gap hunt (MANDATORY — the skill's main purpose):
      every run reviews phase rows, designs, the parking lot, and
      the recent conversation for aims planned or implied but NOT
      captured in the target section, and proposes additions on
      keeper approval; a run that skips the hunt has not run the
      skill. Should you use this skill? (EXTERNALLY-GATED:
      trigger = the keeper asks any role for an update, or a
      role-file routing line fires). Judgment kept: the comparison
      and the findings; the gather is scripted.
- [ ] Step: run `test -f skills/session/bee-project-update/SKILL.md` — exit 0
- [ ] Commit: `project-update skill: one skill, three altitudes`

## Task 15: reorg sweep — session/ → thinking/ (item 1, D3)

**Files:** create `skills/thinking/` (rename of `skills/session/`);
  modify `skills/GLOSSARY.md` + any living file referencing
  `skills/session`
**Depends on:** tasks 1–14 ALL merged (moves every file the other
  tasks edit)
**Provides:** the D3 layout; every `kit:` field reads `thinking`.

- [ ] Step: `git mv skills/session skills/thinking` — all seven
      skills (argue, brainstorm, handoff, hindsight,
      pickup-handoff, relay, project-update) move in one rename.
- [ ] Step: Retag: every moved SKILL.md's front matter
      `kit: session` → `kit: thinking`.
- [ ] Step: Pointer sweep: in every moved SKILL.md, the GLOSSARY
      pointer must read `../../GLOSSARY.md` (correct at depth two
      — verify each file; fix any wrong-depth pointer found, in
      moved AND unmoved skills: `grep -rn 'GLOSSARY.md' skills/
      --include='SKILL.md'`).
- [ ] Step: Reference sweep (living files only — history in
      plans/logbook stays as written): `grep -rn 'skills/session'
      AGENTS.md docs/ roles/ skills/ bin/ tests/ scripts/` — every
      hit updates to `skills/thinking`. Expect: skills'
      cross-references, tests (structure tests may name paths),
      docs. `scripts/structure.map` is kit-generic — verify no
      change needed. The GLOSSARY `bee- namespace` entry names no
      folders and stays accurate — no store edit.
- [ ] Step: Full suite + structure check before commit (union
      discipline): `node --test tests/*.test.mjs` — pass.
- [ ] Step: run `test -d skills/thinking -a ! -e skills/session` — exit 0
- [ ] Commit: `reorg: session/ → thinking/ (D3), kit retags, refs`

## Task 16: ship-tier citation strip (item 3, D8)

**Files:** modify `roles/power-planner.md`, `roles/project-orchestrator.md`,
  `roles/task-orc.md`, `skills/thinking/bee-brainstorm/SKILL.md`
  (skills/session/ until Task 15's rename); delete
  `roles/retired-pp.md`; create
  `.hivemind/memory/retired-pp-role.md`
**Depends on:** task 15 (the tree is final)
**Provides:** shipped components carry self-contained rule text;
  no authority citations in shipped skills or living role specs.

- [ ] Step: Census first:
      `grep -rn 'ADR-[0-9]' roles/ skills/ --include='*.md'` —
      expected: 10 role-file hits, GLOSSARY only in skills/.
      GLOSSARY keeps its anchors (ours, keeper direction:
      two-glossaries rule) — NOT this task's target.
- [ ] Step: Role files: each ADR citation either drops (the rule
      text already stands alone) or the ruling inlines as plain
      text where the ADR was the carrier (e.g. "ADR-012" beside
      worktree law → the law sentence itself). Keep functional
      references (paths the role operates on). Same treatment for
      citations naming designs/plans/logbook paths.
- [ ] Step: `git mv roles/retired-pp.md
      .hivemind/memory/retired-pp-role.md` (D8).
- [ ] Step: bee-brainstorm step 4: "(global `adr` skill)" →
      "(the project's own decision-record practice)" — shipped
      skills name no global instrument (ADR-015 face;
      user-side). Check the other shipped skills for global-kit
      references: `grep -rn 'global' skills/ --include='SKILL.md'`
      — bee-plan's two "not the global plan skill" notes stay
      (harmless disambiguation, per the kit note); anything that
      DEPENDS on a global gets self-contained wording.
- [ ] Step: Full suite + structure check: `node --test tests/*.test.mjs` — pass.
- [ ] Step: run `! grep -rq 'ADR-[0-9]' roles/ && ! grep -rq --include='SKILL.md' 'ADR-[0-9]' skills/` — exit 0
- [ ] Commit: `ship-tier: self-contained rule text, records out of roles/`

## Task 17: template glossary seed (item 4, D10)

**Files:** modify `bin/bee.js`, `tests/bee-init.test.mjs`
**Depends on:** task 6 (bee.js chain; sequencing only)
**Provides:** init seeds the project's own glossary with the core
  bee terms, self-contained, user-extendable.

- [ ] Step: In `bin/bee.js`, replace the glossary seed constant's
      use in scaffold step 6: seed `.hivemind/glossary.toon` with
      `TEMPLATE_GLOSSARY_SEED` (new constant) instead of
      `GLOSSARY_HEADER + '\n'` — the header line followed by the
      21 term lines below, format `term :: gist :: see` with
      `see: -` throughout. The fenced block is the constant's
      payload, INLINED into bin/bee.js as TEMPLATE_GLOSSARY_SEED
      — the path= label is its sandbox home for review, not a
      repo file to create:

```toon path=bin/template-glossary-seed.toon
bee :: the harness CLI; its commands operate on the project's .hivemind/ stores :: -
bee- kit :: the shipped skills; the bee- prefix marks what ships with the harness :: -
bee-loop :: the plan → implement → verify → review cycle; entered only by explicit direction :: -
plan :: the step-by-step document a loop executes; lives in .hivemind/plans/ :: -
phase list :: one line per phase in .hivemind/phases/; the queue's source of truth :: -
dispatch :: a role sending work to a subagent within its own mandate :: -
dispatch brief :: the contract sent with a dispatch: plan path, phase, escalation envelope, workspace, pass-back shape :: -
keeper :: the human owner; final authority on every decision that matters :: -
escalate :: stop and ask the keeper: one decision per card, options, a recommendation :: -
logbook :: the loop's written account in .hivemind/logbook/; claims don't move states — records do :: -
work-item states :: draft → implemented → verified → reviewed → done; each move needs its evidence :: -
claim :: the phase list's owner column: role + timestamp, written before dispatch :: -
validation level :: how much checking a stage gets: task · merge · phase · release :: -
parking lot :: deferred decisions with unpark conditions; only the keeper resolves one :: -
status surface :: the cross-role notes file; both roles read it at session start :: -
inbox :: the store of items waiting on someone: add · list · show · done :: -
TOON :: token-oriented notation: the token-lean, line-oriented store format agents read :: -
handoff :: same role, fresh context: handoff file plus a wake prompt for the keeper :: -
relay :: context between different roles: gated (keeper-passed) or ambient (shared surfaces) :: -
role :: a named agent spec in roles/: mandate plus attributes; assumed by direction, never inferred :: -
skill :: a procedure: how a class of work gets done; skills stay role-agnostic :: -
```

- [ ] Step: The seed rides the existing step-6 idempotence: a repo
      whose glossary.toon exists is never overwritten (verify the
      existing `step()` guard covers it — it does).
- [ ] Step: Extend `tests/bee-init.test.mjs`: green-fields init
      produces a glossary.toon whose term-line count is ≥ 21 and
      which contains the `bee-loop` and `keeper` lines verbatim;
      re-run init on the seeded repo changes nothing.
- [ ] Step: run `node --test tests/bee-init.test.mjs` — pass
- [ ] Commit: `init: seed template glossary (core terms)`

## Phase exit

- All 17 checks pass; full suite green (`node --test
  tests/*.test.mjs`, 348 + new tests); `scripts/structure-check.sh`
  clean (runs via `bee verify`).
- The 29-item checklist dispositioned: every item landed, verified
  already-landed, or closed-by-record; suggestion files
  dispositioned per D7 (planned/ stamped+deleted; live stamped,
  awaiting keeper triage).
- **Tidy pass at close** (keeper's standing word, 2026-11-07):
  bootstrap-noise paydown with the P5 tooling after rectification
  lands — status sweep, logbook compact, store hygiene; standing
  authority, disclosed after.
- Close ceremony: decisions inventory (new split counts) →
  mechanical `bee phase close 8` → keeper sign-off by decisions
  (one card per judgment call; this plan's D5-D13 + in-phase
  rulings) → final close card.

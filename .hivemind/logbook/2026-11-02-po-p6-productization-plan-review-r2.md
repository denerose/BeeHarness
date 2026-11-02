# Plan review r2 — P6 productization plan

**Plan:** `/home/saphron/BeeHarness/.hivemind/plans/2026-11-02-po-p6-productization.md`
**Reviewer:** cold dispatch (bee-plan-review; reviewer wrote neither the plan nor r1)
**Core:** `bash scripts/plan-checks.sh --run .hivemind/plans/2026-11-02-po-p6-productization.md` → exit 1 (findings; core itself healthy)
**Prior round:** r1 report + Disposition read first; waived findings (C2, C4, J5) not re-litigated — every claimed FIX re-verified against the current text and the repo (see below).

## Mechanical core — counts and findings (each triaged)

```
boxes: 0/40
blocks: 10/15 tagged, 5 untagged
finding blocks: 5 untagged code block(s) — every verbatim block needs a path= tag
suite: node --test tests/*.test.mjs
finding suite: command failed in sandbox: node --test tests/*.test.mjs
```

No target findings (r1 C1's `(delete)` markers are gone — the deletes now live
in task 5's prose at plan line 700); no extraction mismatch (r1 C3 fixed — the
task-2 config block is retagged a constant; task 7's is the sole
`path=.hivemind/config.toon`); no ephemeral-prose marker findings. Boxes 0/40:
unstarted plan, consistent.

- **[R2-C1] Should fix — waived class (r1 C2 waiver, standing).** The 5
  untagged blocks, enumerated: plan line 142 (registry shape), 162 (init
  output lines), 290 (worktree refusal line), 340 (consumer-default config
  constant), 618 (suggest document shape). All five are constants/shapes to
  be baked into `bin/bee.js` — a modify-target no truthful `path=` tag can
  name. The count went 4→5 as the direct, intended consequence of the C3
  fix (the retagged config block joined the waived class). Standing waiver
  covers them; recorded here because the core finding stands until waived.
- **[R2-C2] Should fix — waived (r1 C4 waiver, standing).** Suite failed in
  sandbox: the sandbox holds only extracted blocks; `bin/bee.js` is a
  modify-target built by insertion specs, so the test blocks'
  `import { run } from '../bin/bee.js'` cannot resolve there. Structural for
  this plan shape. The reviewer's cold-run with the real CLI present (below)
  shows every failure feature-missing — the blocks are sound.

## r1 fix-claims — verification of the Disposition (all checked against current text)

- **C1 FIXED ✓** — no `(delete)` markers in the machine header; core reports
  no target findings; deletes recorded in task 5 prose (line 700).
- **C2/C4/J5 WAIVED ✓ standing** — not re-litigated; current-state evidence
  above (R2-C1, R2-C2).
- **C3 FIXED ✓** — sole `path=.hivemind/config.toon` is task 7's; no
  extraction-mismatch finding.
- **J1 FIXED ✓** — the verbatim `tests/bee-init.test.mjs` now uses
  `fileURLToPath(import.meta.url)` + `TESTS_DIR` (the repo's own
  convention); proven by cold-run — no `__dirname` failure anywhere.
- **J2 FIXED ✓** — plan's exit-class summary matches `scripts/worktree.sh`
  exactly (full script read): usage exit 1; not-a-phase-branch exit 2
  (`require_phase_branch`); branch/worktree already-exists exit 3
  (`cmd_create`); no-match and ambiguous slug exit 4 (`resolve`);
  unmerged abandon exit 5 (`cmd_abandon`). Message prefix (`worktree.sh:`),
  stdout-carries-only-the-path, and cwd/common-dir resolution all match too.
- **J3 FIXED ✓** — adoption doc now says "Node 20+ … (the repo's declared
  floor — `package.json` engines)"; `engines: { "node": ">=20" }` confirmed.
- **J4 FIXED ✓** — consumer seed headers byte-match the canonical constants:
  `INBOX_HEADER` (bin/bee.js:481) and `GLOSSARY_HEADER` (bin/bee.js:2984);
  plan line 152 names the invariant for future seeds.
- **J6 FIXED ✓** — hygiene step present (plan line 172): every write-mode
  init in the existing `tests/bee.test.mjs` gains `--machine <tmp>`.
- **J7 FIXED as claimed, but incomplete** — the three swept references all
  exist exactly as the plan says (dispatch-brief template line 20,
  `bin/bee.js:4045`, `tests/bee-logbook.test.mjs:3`) and the grep now
  covers `bin/ tests/` — but that widened scope exposes a fourth live
  reference the plan does not disposition (finding J2-r2 below).

## Judgment findings

### Blocking

- **[J1-r2] Accuracy / checks-contract — plan line 47 (machine header,
  task-5 `files:`): the check names the two files task 5 deletes.**
  Task 5 deletes `scripts/worktree.sh` and `tests/worktree-sh.test.mjs`,
  yet its check entry lists both under `files:`. `bee verify`
  existence-checks every `files:` entry — a missing file sets
  `pass = false` with "fix: <path> — place it or fix the path"
  (bin/bee.js:2187–2195). After a perfect implementation of task 5, its
  own declared check is guaranteed to FAIL on the deleted files. The plan's
  checks contract is the same one `bee verify` runs, so this is not
  cosmetic. **Fix:** remove `tests/worktree-sh.test.mjs` and
  `scripts/worktree.sh` from the task-5 `files:` list (the deletes are
  already recorded in the task prose; `files:` is for artifacts the check
  vouches for).
- **[J2-r2] Accuracy — plan line 731: the "zero hits" claim is false; a
  fourth live reference sits inside the grep's scope.**
  `tests/fixtures/parking-lot-v1.md:217` contains `` `scripts/worktree.sh` ``
  (inside parked item PL-PO-002's text) — a live fixture loaded by
  `tests/bee-park.test.mjs:23`. The plan's verification grep
  (`grep -rn "worktree.sh" skills/ roles/ docs/ README.md AGENTS.md SOUL.md
  scripts/ bin/ tests/`) includes `tests/` and will therefore hit the
  fixture after the three-reference sweep: "zero hits" cannot hold, and the
  executor is left adjudicating a reference the plan never dispositioned
  (the sweep says three; there are four in scope). **Fix:** add the fixture
  line to the plan's carve-out alongside `.pi/handoff-*` (historical record
  data quoting a parked question — the same class as the
  `.hivemind/plans|logbook|sessions` carve-out on the very next line), or
  deliberately sweep/exclude it; then the expected-hits statement is true.

### Should fix

- **[J3-r2] Accuracy — plan lines 825–826 (task 7 dogfood expectations)
  contradict the plan's own contracts.** The step expects from the FIRST
  `node bin/bee.js init --check`: "skills registered ✓, registry drift
  line, scaffold `exists:` everywhere, harness repo — … skipped".
  (a) That first `--check` runs BEFORE the first real-machine write, so per
  task 1's own contract the machine-store line is "machine store: not
  registered (run without --check to add …)", not a drift line — the drift
  line belongs to the post-write check in the task-check command.
  (b) Task 2's harness-skip rule skips scaffold items 1–10, so no per-item
  `exists:` lines can print — "scaffold `exists:` everywhere" is impossible
  alongside the skip line the same expectation lists. An executor dogfooding
  against this line will read correct output as a bug. **Fix:** reword to
  "expect: skills registered ✓, machine store: not registered, harness
  repo — scaffolding + managed block skipped" (exit 0 either way; the
  executable task check is unaffected).

## Dimensions checked and clean

- **Accuracy (beyond findings):** `run(argv)` export returning
  `{code,out,err}` (bin/bee.js:71); `cmdInit` flag-spec shape
  (`check` boolean, `settings` string — the plan's `machine`/`repo`
  string additions fit) and the `--check` exit-1 `NOT registered` rule
  (bin/bee.js:186–191) the tests assert; `inboxAddItem` exists with the
  reusable shape (bin/bee.js:653); both harness templates exist
  (`.hivemind/phases/TEMPLATE.md`, `.hivemind/designs/TEMPLATE.md`);
  `roles/*.md` (6 files) exist; `docs/AXI.md` exists with exactly ten
  numbered principles and task 6's numbered cites (5 empty states,
  9 contextual disclosure, 10 consistent help) match its numbering;
  `scripts/structure.map` first `hivemind:` line is exactly as the plan
  describes (space-separated, extension is mechanical); bin/bee.js is
  shebang'd + executable (adoption-doc claim true); README carries the
  Documents list for the pointer; `docs/adoption.md` and
  `.hivemind/config.toon` absent (create targets clean); worktree.sh
  semantics/message strings/resolution rule match the port spec; baseline
  `bash scripts/structure-check.sh` → 0 findings and
  `node bin/bee.js init --check` → exit 0 (task 7's first check leg
  viable); `~/.pi/agent/settings.json` registers `~/BeeHarness/skills`
  (dogfood viable).
- **External reality (run, not recalled):** `git rev-parse
  --path-format=absolute --git-common-dir` returns the main `.git` from
  both a main checkout and a linked worktree (git 2.47.3) — the plan's
  main-checkout test is sound; `git worktree add -b <branch> <path>
  <start-point>` and `git check-ref-format --branch` behave as the tests
  use them; node v24.20.0 runs the current suite green (307/307, exit 0).
- **Sandbox-run:** all four verbatim test blocks cold-run with the REAL
  `bin/bee.js` copied beside them in a temp dir: zero code bugs (no
  ReferenceError / SyntaxError / module-not-found); every failure is
  feature-missing as expected pre-implementation (`Unknown option
  '--machine'` under parseArgs strict, `unknown command 'suggest'`, ENOENT
  on the registry/AGENTS.md/config.toon the unbuilt features would create).
  Task 5's test file is a port spec, not verbatim — nothing to cold-run;
  its spec (the script) was verified directly instead. Sandbox and external
  temp dirs cleaned up.
- **Ephemeral prose:** no marker findings from the core; the new durable
  surfaces (adoption.md, README pointer, map line, managed block,
  config.toon) carry durable behavior descriptions only.
- **Determinism/AXI:** deterministic work is scripted (scaffold, registry,
  managed block, suggest filing, worktree port); task 6 names its kept
  judgment explicitly; designed outputs follow docs/AXI.md (prefixed lines,
  counts, structured errors + exit codes, empty-store seeding per AXI 5,
  next-step hints on mutations). J5 waived in r1 — not re-litigated.
- **No-globals:** every step leans on bee-native instruments (bin/bee.js,
  scripts/structure-check.sh, docs/AXI.md, node, git, grep); no global
  skill or global rules file is named anywhere. Clean.

## Verdict

**FAIL** — blocking findings: **J1-r2** (task-5 `files:` names the files
the task deletes — `bee verify`'s existence check makes the task's own
declared check unpassable) and **J2-r2** (the "zero hits" sweep claim is
false — `tests/fixtures/parking-lot-v1.md:217` is a fourth live reference
inside the grep scope). Both are one-line plan edits; a re-review after
fixes is a fresh dispatch. Should-fix findings R2-C1 (waiver standing),
R2-C2 (waiver standing), J3-r2 may each be waived by the dispatcher with a
one-line recorded reason beside the finding here.

## Disposition (r2 — written by the planner after fixes, 2026-11-02)

- J1-r2 FIXED — the two deleted files removed from task-5's
  `files:` list; deletes live in the task prose only.
- J2-r2 FIXED — the fixture hit dispositioned in-plan as the one
  expected grep result (historical v1 parking-lot snapshot; fixture
  data stays as written).
- J3-r2 FIXED — dogfood expectations reworded to the plan's own
  contracts: first check shows "machine store: not registered" +
  the skip line (no per-item scaffold output); the drift line
  belongs to the post-write check.

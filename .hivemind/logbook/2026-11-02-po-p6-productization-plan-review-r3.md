# Plan review r3 — P6 productization plan

**Plan:** `/home/saphron/BeeHarness/.hivemind/plans/2026-11-02-po-p6-productization.md`
**Reviewer:** cold dispatch (bee-plan-review; reviewer wrote neither the plan nor r1/r2)
**Core:** `bash scripts/plan-checks.sh --run .hivemind/plans/2026-11-02-po-p6-productization.md` → exit 1 (findings; core itself healthy)
**Prior rounds:** r1 + Disposition, r2 + Disposition read first; waived findings (r1 C2, C4, J5; r2 standing re-records) not re-litigated — every claimed r2 FIX re-verified against the current text and the repo (below).

## Mechanical core — counts and findings (each triaged)

```
boxes: 0/40
blocks: 10/15 tagged, 5 untagged
finding blocks: 5 untagged code block(s) — every verbatim block needs a path= tag
suite: node --test tests/*.test.mjs
finding suite: command failed in sandbox: node --test tests/*.test.mjs
```

No target findings, no extraction mismatch, no ephemeral-prose marker findings.
Boxes 0/40: consistent with an unstarted plan pending review.

- **[R3-C1] Should fix — waived (r1 C2 / r2 R2-C1 waiver, standing).** The 5
  untagged blocks, enumerated: plan line 142 (registry shape), 162 (init
  output lines), 290 (worktree refusal line), 340 (consumer-default config
  constant), 618 (suggest document shape). All five are constants/shapes to
  be baked into `bin/bee.js` — a modify-target no truthful `path=` tag can
  name; tagging it would corrupt extraction. Same set as r2; nothing new
  joined the class. Standing waiver covers them; recorded because the core
  finding stands until waived.
- **[R3-C2] Should fix — waived (r1 C4 / r2 R2-C2 waiver, standing).** Suite
  failed in sandbox: the sandbox holds only extracted blocks; `bin/bee.js`
  is a modify-target built by insertion specs, so the test blocks'
  `import { run } from '../bin/bee.js'` cannot resolve there. Structural for
  this plan shape (the class the r1 Disposition named C4-waivable). The
  cold-run below with the real CLI present shows every failure
  feature-missing — the blocks are sound.

## r2 fix-claims — verification of the Disposition (all checked against current text and repo)

- **J1-r2 FIXED ✓** — task-5 `files:` in the machine header is now
  `[bin/bee.js, tests/bee-worktree.test.mjs,
  skills/loop/bee-loop/assets/dispatch-brief-template.md]`; neither deleted
  file (`scripts/worktree.sh`, `tests/worktree-sh.test.mjs`) is named. The
  `bee verify` existence check that made this blocking is confirmed in the
  live code: every `files:` entry must exist or the check fails with
  `fix: <path> — place it or fix the path` (bin/bee.js:2186–2197). All
  three listed files exist after task 5; every other task's `files:` list
  likewise names only post-task-existing artifacts.
- **J2-r2 FIXED ✓** — the sweep verification now reads "exactly ONE hit:
  `tests/fixtures/parking-lot-v1.md` — a historical fixture … Fixture data
  stays as written — carve-out, review r2 J2". Arithmetic verified live:
  the in-scope hits today are the three swept references
  (dispatch-brief-template.md:20, bin/bee.js:4045,
  tests/bee-logbook.test.mjs:3 — each confirmed present with exactly the
  text the plan's rewrites target), the two files task 5 deletes first
  (scripts/worktree.sh's own self-references; tests/worktree-sh.test.mjs:1,17),
  and the fixture (tests/fixtures/parking-lot-v1.md:217). Deletes (step 2)
  precede the sweep (step 3) in the same task → post-task state is exactly
  the fixture. The expected-hits statement is now true.
- **J3-r2 FIXED ✓** — task-7 dogfood expectations match the plan's own
  contracts: first `--check` expects "skills registered ✓, machine store:
  not registered (the first check runs BEFORE the first real-machine
  write)" plus the harness-skip line "(no per-item scaffold lines — the
  skip rule replaces them)"; the drift line is assigned to the post-write
  follow-up check. Both match task 1's output-line contract (`--check`
  absent-entry line; drift informational) and task 2's harness-skip rule.
  Consistent with external reality too: `~/.bee/` does not yet exist and
  `node bin/bee.js init --check` currently exits 0 "already registered"
  (verified live), so the first leg is viable as written.

r1 fixes also re-confirmed standing in the current text where cheap: J1
(`fileURLToPath` + `TESTS_DIR` — no `__dirname` anywhere; proven by
cold-run), J2 (exit-class summary matches `scripts/worktree.sh` exactly —
die 2 in `require_phase_branch`, die 3 for branch/worktree exists, exit 4
in `resolve`, exit 5 unmerged abandon, usage 1; all read from the script),
J3 ("Node 20+ … the repo's declared floor" vs `engines: { "node": ">=20" }`
✓), J4 (seed headers byte-match `INBOX_HEADER` bin/bee.js:481–482 and
`GLOSSARY_HEADER` :2984–2985), J6 (hygiene step, plan line 172), J7 (three
swept references + widened grep, subsumed by J2-r2's verified arithmetic).

## Judgment findings

**None — blocking or should-fix.** All six dimensions checked clean:

- **Accuracy:** `run(argv)` exported returning `{code,out,err}`
  (bin/bee.js:71); `cmdInit` flag-spec shape (`check` boolean, `settings`
  string — the `machine`/`repo` string additions fit, bin/bee.js:144–147);
  `--check` exit-1 `NOT registered` to err (bin/bee.js:186–191) as the
  tests assert; check cmds run via `spawnSync('sh', ['-c', cmd])`
  (bin/bee.js:2159–2162) so task-7's compound `&&` chain and glob are
  valid; `inboxAddItem` reusable (bin/bee.js:653); both harness templates
  exist; `roles/*.md` (6 files) exist; first `hivemind:` line of
  scripts/structure.map is the space-separated top-level-file line the
  plan extends, and `config.toon` is not already on the map (count 0);
  `docs/adoption.md` and `.hivemind/config.toon` absent (create targets
  clean); all modify targets exist; `~/.pi/agent/settings.json` registers
  `~/BeeHarness/skills` (dogfood leg 1 viable).
- **External reality (run, not recalled):** `git rev-parse
  --path-format=absolute --git-common-dir` returns the main `.git` from
  both a main checkout and a linked worktree (git 2.47.3) — the plan's
  main-checkout test is sound; `git worktree add -b <branch> <path>
  <start-point>` behaves as the test uses it; `bash
  scripts/structure-check.sh /home/saphron/BeeHarness` → `0 findings`,
  exit 0 (the script's usage takes exactly `<root>` — task-7's invocation
  is its contract); baseline `node --test tests/*.test.mjs` → 307/307,
  exit 0 (node v24.20.0).
- **Sandbox-run:** all four verbatim test blocks pass `node --check`;
  cold-run in the extracted sandbox with the REAL `bin/bee.js` copied
  beside them: bee-machine 1 pass/4 fail, bee-init 1/5, bee-agents 0/5,
  bee-suggest 0/4 — every failure is feature-missing as expected
  pre-implementation (`ERR_PARSE_ARGS_UNKNOWN_OPTION: Unknown option
  '--machine'`, `bee: unknown command 'suggest'`); zero code bugs (no
  ReferenceError / SyntaxError / module-not-found). Task 5's block is a
  port spec, not verbatim — its spec source (scripts/worktree.sh) was
  verified directly instead. Sandbox and all temp dirs created for this
  review cleaned up.
- **Ephemeral prose:** no marker findings from the core; the new durable
  surfaces (adoption.md, README pointer, map line, managed block,
  config.toon, consumer seeds) carry durable behavior descriptions only.
- **Determinism/AXI:** deterministic work is scripted (scaffold, registry,
  managed block, suggest filing, worktree port); task 6 names its kept
  judgment explicitly and its deliverable (audit table in the verify
  record); designed outputs follow docs/AXI.md (prefixed lines, counts,
  structured errors + exit codes, empty-store seeding per principle 5,
  next-step hints on mutations per principle 9, per-subcommand usage per
  principle 10 — numbering confirmed in the doc). J5 waived in r1 — not
  re-litigated.
- **No-globals:** every step leans on bee-native instruments (bin/bee.js,
  scripts/plan-checks.sh, scripts/structure-check.sh, docs/AXI.md, node,
  git, grep); no global skill or global rules file is named anywhere.
  Clean.

## Observations (non-findings)

- The verbatim `tests/bee-init.test.mjs` writes its settings file as a
  sibling of its mkdtemp dir directly under os.tmpdir()
  (`path.join(dir, '..', basename + '-settings.json')`). Harmless in a
  test context (unique random names) and the same no-cleanup class as the
  repo's existing tests; noted only because the cold-run surfaced the
  stray files. No action required.

## Verdict

**PASS** — no blocking findings, no new should-fix findings. The two core
findings (R3-C1, R3-C2) are the standing waived classes, re-recorded here;
all three r2 fix-claims landed and verify against the current text and the
repo. The plan is ready for the loop.

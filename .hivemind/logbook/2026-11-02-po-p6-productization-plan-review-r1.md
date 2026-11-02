# Plan review r1 — P6 productization plan

**Plan:** `/home/saphron/BeeHarness/.hivemind/plans/2026-11-02-po-p6-productization.md`
**Reviewer:** cold dispatch (bee-plan-review; reviewer did not write the plan)
**Core:** `bash scripts/plan-checks.sh --run .hivemind/plans/2026-11-02-po-p6-productization.md` → exit 1 (findings; core itself healthy)

## Mechanical core — counts and findings (each triaged)

```
finding files: target missing and unmarked: scripts/worktree.sh (delete)
finding files: target missing and unmarked: tests/worktree-sh.test.mjs (delete)
boxes: 0/39
blocks: 10/15 tagged, 4 untagged
finding blocks: 4 untagged code block(s) — every verbatim block needs a path= tag
finding blocks: extraction mismatch — 15 fenced block(s) in plan, 14 extracted
suite: node --test tests/*.test.mjs
finding suite: command failed in sandbox: node --test tests/*.test.mjs
```

- **[C1] Should fix** — `(delete)` targets read as "missing and unmarked". The
  core's parser knows `(create)`/`(modify)` only; both files **do exist**
  (`scripts/worktree.sh`, `tests/worktree-sh.test.mjs`), so the underlying
  repo claims are accurate — the marker class is what the core can't verify.
  Fix: list the deletes in prose (task 5 already does) instead of the
  machine-header targets, or teach the core `(delete)`. Finding stands until
  one of those happens.
- **[C2] Should fix** — 4 untagged blocks: plan lines 141 (registry shape),
  155 (init output lines), ~246 (worktree refusal line), 604 (suggest
  document shape). All four are constants/shapes baked into `bin/bee.js`, a
  modify-target that cannot carry verbatim `path=` blocks meaningfully —
  tagging them `path=bin/bee.js` would corrupt extraction. The convention
  has no home for embedded-spec blocks; the mechanical finding stands until
  waived with a recorded reason (or a shape marker the core recognizes).
- **[C3] Should fix** — extraction mismatch: two blocks share
  `path=.hivemind/config.toon` (plan line 329, consumer default L1; line
  810, harness L0). In the sandbox the second silently overwrites the first
  (verified: sandbox file held the L0 content). Fix: retag the task-2 block
  as a constant/shape (it is init-embedded content, not a file the plan
  writes to this repo) — that also removes one C2 hit.
- **[C4] Should fix (waivable, evidence below)** — suite failed in sandbox:
  the sandbox contains only extracted blocks; `bin/bee.js` is a
  modify-target built by insertion specs, so the test blocks' `import {
  run } from '../bin/bee.js'` can never resolve there. Structural for this
  plan shape, not a defect in the test code per se — **except** finding J1,
  which the deeper cold-run exposed. With the live `bin/bee.js` copied into
  the sandbox, every other test failure was feature-missing (unknown
  `--machine`/`--repo` flags under `parseArgs strict`), i.e. the blocks are
  sound apart from J1.

Boxes 0/39: consistent with an unstarted plan pending review. No prose
markers found in modify-targets.

## Judgment findings

### Blocking

- **[J1] Sandbox-run — plan line 454 (`tests/bee-init.test.mjs` verbatim):
  `__dirname` in an ESM module.** The 'harness repo' test passes
  `'--repo', path.resolve(__dirname, '..')`; `.mjs` files have no
  `__dirname`. Proven cold: with the real `bin/bee.js` present in the
  sandbox the test dies `ReferenceError: __dirname is not defined` — it
  fails after a perfect implementation, which is exactly what sandbox-run
  exists to catch. Fix: use the repo's own convention
  (`tests/bee.test.mjs:92–95`): `path.dirname(fileURLToPath(import.meta.url))`
  plus the `node:url` import.
- **[J2] Accuracy — plan line 693: exit-class summary mislabels "no-match".**
  "exists/no-match exit 3" — in `scripts/worktree.sh`, exit 3 is
  *exists only* (branch/worktree path, lines ~117/121); no-match is exit 4
  (`resolve()`, lines 77/89), correctly named one clause later. The script
  and `tests/worktree-sh.test.mjs` (asserts 3 for exists, 4 for ambiguous)
  are both correct, but the plan's own summary is a wrong fact an executor
  treats as spec. Fix: "exists exit 3".
- **[J3] Accuracy — plan line 763 (verbatim `docs/adoption.md`): "Node 24+
  and git on PATH."** The repo declares `engines: { node: ">=20" }`
  (package.json) and `// Node >=20, stdlib only` (bin/bee.js:11). Nothing in
  the plan raises the floor; the verbatim doc would ship a wrong
  prerequisite that turns away Node 20–23 adopters. Fix: "Node 20+ and git
  on PATH."

### Should fix

- **[J4] Accuracy/consistency — plan lines 307/313: consumer seed headers
  diverge from the canonical store headers.** Seeds:
  `# bee inbox — one addressee per item; bee inbox list` and
  `# bee glossary store — term :: gist :: see; bee glossary add`; the
  canonical constants the CLI writes on first mutation are
  `# inbox — items waiting on someone (agent store; views render from here)`
  (bin/bee.js:481) and `# glossary — shared vocabulary (term :: gist ::
  see; supply, never update)` (bin/bee.js:2984) — also what this repo's own
  stores carry. First `bee inbox add` in a consumer regenerates the file
  (renderToonStore) and silently replaces the seed header. Not fatal
  (readToonStore ignores `#` lines) but it is header churn and two headers
  for one store class. Fix: seed with the canonical headers.
- **[J5] Determinism — plan lines 807–810 (and task 5 step 3, task 7 README
  step): deterministic content created/edited by hand.** `config.toon` is
  created BY HAND with verbatim 3-line content (the harness-skip prevents
  the CLI from scaffolding it — acknowledged dogfood, but by the determinism
  test two careful people produce the same bytes, so it is script-shaped);
  same class for the exact-phrase template rewrite and the exact README
  line. Fix: a tiny seeded script step, or waive with the recorded reason
  (verbatim content given; hand-creation is the deliberate dogfood of the
  format).
- **[J6] Accuracy — plan line 120 ("the existing registration flow and its
  `--settings` flag keep their behavior and tests") misses a new side
  effect on pre-existing tests.** Task 1 makes every write-mode init ensure
  a registry entry in the *default* machine dir `~/.bee/`. The existing
  `tests/bee.test.mjs` init tests call write-mode init with no `--machine`:
  they still pass (regex/exit assertions; harness-skip applies via cwd), but
  each suite run now writes the real `~/.bee/registry.toon` — and would
  crash under a read-only HOME. Fix: note the side effect and gate it (e.g.
  tests pass `--machine`, or the ensure step is dogfood-only), or accept
  with a recorded reason.
- **[J7] Accuracy — plan line 710: residual-reference grep scoped too
  narrowly.** The sweep covers `skills/ roles/ docs/ README.md AGENTS.md
  SOUL.md scripts/` — it will pass, but live `worktree.sh` references
  survive outside it: `bin/bee.js:4045` (code comment),
  `tests/bee-logbook.test.mjs:3` (comment naming worktree-sh.test.mjs),
  `.pi/handoff-project-orchestrator.md:86,107` (live handoff instructing
  the script). The plan's "exactly one law-surface reference" claim is
  itself true; the *verification* just can't see the rest. Fix: add
  `bin/ tests/ .pi/` to the grep (or record the survivors as
  historical/ephemeral).

## Dimensions checked and clean

- **Accuracy (beyond the findings):** `run(argv)` exported returning
  `{code,out,err}` (bin/bee.js:71); `cmdInit` flag-spec shape and
  `--settings`/`--check` behavior incl. exit-1 `NOT registered`
  (bin/bee.js:143–205) — matches the tests' assertions; `inboxAddItem`
  exists with exactly the reused shape (bin/bee.js:653) and its
  `IN-001`-style output satisfies the suggest test's `/IN-0*1|inbox/i`;
  `REPO_ROOT`, `atomicWrite` exist; both templates exist
  (`.hivemind/phases/TEMPLATE.md`, `.hivemind/designs/TEMPLATE.md`);
  `roles/*.md` (6 files) exist; dispatch-brief-template line 20 names
  `scripts/worktree.sh create <phase>-<slug>` exactly as the plan says;
  structure.map's first `hivemind:` line is as described;
  `~/.pi/agent/settings.json` registers the skills path (task-7 dogfood
  viable); bin/bee.js is 4,506 lines ("4,500-line" ✓); all four design docs
  named in the header exist under `.hivemind/designs/`; README has the
  Documents list for the adoption pointer; `docs/adoption.md` and
  `.hivemind/config.toon` don't yet exist (create targets clean);
  worktree.sh semantics (cwd-based common-dir resolution, stdout-path-only
  create, message strings) match the port description.
- **External reality:** verified live, not by recall —
  `git rev-parse --path-format=absolute --git-common-dir` (git 2.47.3)
  returns the main `.git` from both a main checkout and a linked worktree
  (the plan's main-checkout test is sound); `git worktree add -b <branch>
  <path> <start-point>` behaves as the test uses it;
  `git check-ref-format --branch` works; node v24.20.0 runs the current
  suite green (baseline `node --test tests/*.test.mjs`: fail 0).
- **Sandbox-run:** all four test blocks pass `node --check`; cold-run with
  live bee.js shows feature-missing failures only, apart from J1. The
  non-test blocks are static text (nothing to execute); inspected in the
  sandbox. Sandbox cleaned up after.
- **Ephemeral prose:** no markers in modify-targets; the new durable docs
  (adoption.md, README line, map line, managed block) carry durable
  descriptions only.
- **Determinism/AXI:** deterministic work is assigned to CLI code
  (scaffold/registry/managed-block all scripted); task 6 names its kept
  judgment explicitly; designed outputs follow docs/AXI.md (prefixed
  lines, structured errors + exit codes, usage blocks, next-step hint on
  mutations; empty-state seeding per AXI 5) — exceptions are J5.
- **No-globals:** every step leans on bee-native instruments
  (plan-checks.sh, structure-check.sh, docs/AXI.md, bin/bee.js, node, git);
  no global skill or global rules file is named anywhere. Clean.

## Verdict

**FAIL** — blocking findings: **J1** (`__dirname` in ESM test code —
proven cold failure), **J2** (exit-3/no-match mislabel), **J3** ("Node 24+"
contradicts the repo's declared Node >=20). All three are one-line fixes;
re-review after fixes is a fresh dispatch. Should-fix findings C1–C4,
J4–J7 may each be waived by the dispatcher with a one-line recorded reason
beside the finding here.

## Disposition (r1 — written by the planner after fixes, 2026-11-02)

- C1 FIXED — `(delete)` markers removed from the machine-header targets;
  the deletes live in task 5's Files list and steps.
- C2 WAIVED — the four blocks are constants/shapes embedded in a
  modify-target (`bin/bee.js`); no truthful `path=` tag exists for that
  class, and tagging `bin/bee.js` would corrupt extraction (the finding's
  own analysis). A shape-marker convention for the core is a separate
  improvement, not this plan's to invent.
- C3 FIXED — task 2's config block retagged as the consumer-default
  constant; task 7's is now the sole `path=.hivemind/config.toon` block.
- C4 WAIVED — the suite is the in-repo `bee verify` contract; the
  sandbox cannot contain a modify-target's result. The reviewer's own
  cold-run with the real CLI present proved every non-J1 failure
  feature-missing — the blocks are sound.
- J1 FIXED — `fileURLToPath(import.meta.url)` + `TESTS_DIR`, the repo's
  own convention.
- J2 FIXED — "branch/worktree already-exists exit 3; no-match and
  ambiguous slug exit 4; unmerged abandon exit 5".
- J3 FIXED — "Node 20+ (the repo's declared floor — package.json
  engines)".
- J4 FIXED — consumer seeds now carry the canonical `INBOX_HEADER` /
  `GLOSSARY_HEADER` strings verbatim; task 1 names the invariant so
  future seeds inherit it.
- J5 WAIVED — all three artifacts have exact verbatim content in-plan;
  `config.toon` hand-creation is the deliberate dogfood of the format
  (the harness-skip rule prevents the CLI from scaffolding this repo's
  own config); the template phrase and README line are exact-text
  edit-tool work. Two careful executors produce identical bytes.
- J6 FIXED — task 1 hygiene step: every write-mode init call in
  `tests/bee.test.mjs` gains `--machine <tmp>`; the dogfood write stays
  the one intentional real-machine write.
- J7 FIXED — task 5 sweeps all three references (dispatch-brief
  template, `bin/bee.js` comment, `tests/bee-logbook.test.mjs` header)
  and the verification grep now covers `bin/ tests/`.

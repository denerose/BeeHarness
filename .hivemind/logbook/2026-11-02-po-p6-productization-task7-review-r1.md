# Review r1 — P6 Task 7: adoption doc + README + dogfood + map

**Role:** project-orchestrator (dispatching loop) — reviewer: cold-review stage agent
**Plan section:** Task 7, `.hivemind/plans/2026-11-02-po-p6-productization.md`
**Verify record:** `.hivemind/logbook/2026-11-02-po-p6-productization-task7-verify-r1.md`
**Work under review:** commit 1f5009b (docs/adoption.md, README.md, scripts/structure.map, .hivemind/config.toon) · verify commit 2c0fcb5

## Verdict

**APPROVE** — the repo diff is verbatim-conformant to the plan and every
durable claim in `adoption.md` matches the shipped CLI; two should-fixes
are machine/record hygiene around the dogfood, neither wrong content.

## First check: claim vs record

- Verify record present: `verdict: PASS · checks-run: 1 · plan … @ c6686e5 ·
  task: task-7`. Header-only shape is `bee verify`'s normal no-anomaly
  output (verified again below — but see Should-fix 2: this run DID have
  anomalies worth the body slot).
- Plan task-7 checkboxes all unchecked; phase row P6 `in-progress`; no
  state ahead of its evidence. Tasks 1–6 checked boxes all have logbook
  entries (verify + review files present per `ls .hivemind/logbook/`).
- Reviewer re-ran everything (evidence below): task check exit 0 end to
  end from the worktree; full suite 348/348.

## Verbatim checks (all PASS)

- `docs/adoption.md` — byte-exact vs the plan block (programmatic diff:
  identical except one trailing newline, POSIX file hygiene). "Node 20+"
  floor present; `package.json` engines `>=20` confirms it.
- `.hivemind/config.toon` — byte-exact vs the plan's L0 block (same
  single-trailing-newline delta). Hand creation is the plan's own
  instruction (J5 standing; not re-litigated).
- `README.md` — exactly one line added (`+ docs/adoption.md — how a
  consuming repo adopts the harness`), byte-exact plan text, placed as
  its own bullet directly after the other docs pointers in the
  Documents list. No other change (1 insertion, 0 deletions).
- `scripts/structure.map` — `.hivemind/config.toon` appended to the
  FIRST `hivemind:` line (the literal status/keeper-report/inbox/
  glossary line), space-separated, same style, no comment. Correct
  line: the class-dir wildcard `<class>/<file>` cannot admit a file at
  `.hivemind/` depth, so the literal is the right home.

## Durability: adoption.md claims vs shipped CLI (all verified)

- Symlink adoption: `bin/bee.js` has `#!/usr/bin/env node` shebang and
  mode 755 — the "executable and self-shebang'd" claim holds.
- Registration: `cmdInit` registers `REPO_ROOT/skills` in
  `~/.pi/agent/settings.json` (bin/bee.js:684, 726) — matches.
- Machine store: write mode records the repo keyed by common-dir root
  with `git rev-parse HEAD` at `REPO_ROOT` (machineStoreReport,
  bin/bee.js:218–269) — "with the harness commit it runs from" is
  exact (HEAD, not working tree — the dogfood's c6686e5 pin is
  faithful).
- Scaffold inventory: `.hivemind/` class dirs + phases/designs
  templates + phase list from template, empty inbox/glossary stores
  (canonical headers), status surface, config with level + gates
  (L1 consumer default, bin/bee.js:317), `docs/` or `docs/research/`
  when `docs/` exists, `roles/` as-is, marker-fenced managed AGENTS.md
  block (fence-pair law, between-fences-only regen) — every item in the
  doc maps to a scaffold step; nothing claimed that isn't scaffolded.
- `--check`: no write anywhere on the check path (settings miss →
  error, no write; machine store reports only; "would scaffold"
  without writing) — matches.
- Update flow: re-init updates the registry line (never duplicates),
  drift line shows the old commit informationally (D3), managed block
  regen is idempotent — matches.
- Feedback: `bee suggest "<text>"` defaults to the PROJECT-local inbox
  via git common-dir resolution (suggestStorePath, bin/bee.js:1601 —
  task 4's fix); `--harness` files under
  `<machine>/suggestions/<repo-name>/` with harness-commit provenance
  (bin/bee.js:1661) — matches `~/.bee/suggestions/<repo>/`, triaged
  harness-side.
- Worktree refusal: consumer dir outside the common-dir root refuses
  with the return-to-main-worktree instruction (bin/bee.js:309) —
  matches, including "branch there, then re-run".

No claim in `adoption.md` is contradicted by the shipped CLI.

## Dogfood deviations (judged)

- Run-1 `--check` expectation failure ("skills registered ✓" → NOT
  registered + exit 1): **acceptable deviation.** Cause is the
  workspace, not the code — from the task worktree, `REPO_ROOT/skills`
  is the worktree path, which was not the registered `~/BeeHarness/
  skills`. The plan assumed main-checkout execution (its own task
  check hardcodes `/home/saphron/BeeHarness`). The harness-skip and
  common-dir keying behaved exactly as designed (decision 2); nothing
  in the shipped code is wrong.
- Two real-machine writes, disclosed: registry entry keyed
  `/home/saphron/BeeHarness @ c6686e5` (verified live in
  `~/.bee/registry.toon`) — same key a main-checkout dogfood would
  have written; pin = worktree HEAD at dogfood time; post-merge drift
  is D3-informational and self-heals on the next init from main.
  The settings write is the residue behind Should-fix 1.
- Structure-check literal path: run from the worktree,
  `structure-check.sh /home/saphron/BeeHarness` validates the MAIN
  checkout (self-consistent pre-merge, 0 findings — reproduced) and
  not the changed map/config.toon. **The repair is sound**: the
  worktree-root re-run is the meaningful assertion, and I reproduced
  it — `0 findings` with config.toon tracked. Post-merge from main
  the literal command becomes meaningful again; the phase-exit
  structure check should run from the merged main checkout.

## Blocking

None.

## Should fix

- `~/.pi/agent/settings.json` (machine, post-merge) — the dogfood's
  write run registered `~/BeeHarness-task-docs/skills` (verified in
  the live settings). That path dangles the moment the task worktree
  is removed at merge-close, and nothing removes it: `cmdInit` only
  appends (bin/bee.js:726); no unregister exists. Suggested fix: at
  task/7 merge-close, after the worktree is removed, delete the
  `~/BeeHarness-task-docs/skills` entry from
  `~/.pi/agent/settings.json`, then run `bee init` once from the main
  checkout (re-registers the registry pin at the merged commit).
- `.hivemind/logbook/2026-11-02-po-p6-productization-task7-verify-r1.md`
  — the entry is header-only, but this run had material anomalies the
  body slot exists for (`verifyEntryText` appends a supplied-anomalies
  body, bin/bee.js:3041; task-6 verify r1 used one): run-1 exit 1,
  the two real-machine writes, and the structure-check leg validating
  the main tree. Suggested fix: append a short body (or re-record r2)
  recording those three deviations plus the Should-fix 1 cleanup
  obligation, so the durable record carries what the pass-back digest
  carried.

## Notes

- Re-run evidence (worktree @ 2c0fcb5): `node bin/bee.js init --check`
  → already registered (worktree path) · DRIFTED c6686e5→2c0fcb5 ·
  harness-skip line, exit 0. `bash scripts/structure-check.sh
  /home/saphron/BeeHarness` → 0 findings; same against the worktree
  root → 0 findings. `node --test tests/*.test.mjs` → 348/348 pass.
- `~/.bee/suggestions/` does not exist — no `--harness` suggestions
  were filed; nothing else leaked to the machine store.
- The registry pin c6686e5 predates the task commits (dogfood ran
  before 1f5009b was committed); honest per the pin rule (HEAD at
  registration), and drift reporting covers the gap by design.

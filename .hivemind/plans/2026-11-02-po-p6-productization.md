# Plan: P6 — productization (`bee init` contract, machine store, distribution)

**Date:** 2026-11-02
**Design doc:** `designs/2026-11-01-pp-harness-feedback-channel.md` · `designs/2026-11-01-pp-references-home.md` · `designs/2026-11-01-pp-automation-levels.md` (init pre-scaffolding only) · `designs/2026-11-01-pp-glossary-store.md` (init seeding)
**Validation level:** phase (recommended: one plan, whole-phase review arc; the AXI task adds a release-grade audit inside the phase)
**Detail:** mixed — verbatim content for every NEW standalone file and output string; exact insertion specs (anchor + contract + output text) for `bin/bee.js`, a 4,500-line file nobody rewrites verbatim. The worktree port names the existing script and its test file as the spec to port.
**Reviewed:** bee-plan-review passed 2026-11-02 (three rounds: r1 FAIL 3 blocking → fixed; r2 FAIL 2 blocking → fixed; r3 PASS — reports in `.hivemind/logbook/2026-11-02-po-p6-productization-plan-review-r{1,2,3}.md`)

<!-- machine
phase: P6
validation: phase
state-source: checkboxes below
targets:
  - bin/bee.js (modify)
  - tests/bee.test.mjs (modify)
  - tests/bee-logbook.test.mjs (modify)
  - tests/bee-machine.test.mjs (create)
  - tests/bee-init.test.mjs (create)
  - tests/bee-agents.test.mjs (create)
  - tests/bee-suggest.test.mjs (create)
  - tests/bee-worktree.test.mjs (create)
  - docs/adoption.md (create)
  - README.md (modify)
  - scripts/structure.map (modify)
  - .hivemind/config.toon (create)
  - skills/loop/bee-loop/assets/dispatch-brief-template.md (modify)
checks:
  - id: task-1
    cmd: node --test tests/bee-machine.test.mjs
    expect: exit 0
    files: [bin/bee.js, tests/bee-machine.test.mjs]
  - id: task-2
    cmd: node --test tests/bee-init.test.mjs
    expect: exit 0
    files: [bin/bee.js, tests/bee-init.test.mjs]
  - id: task-3
    cmd: node --test tests/bee-agents.test.mjs
    expect: exit 0
    files: [bin/bee.js, tests/bee-agents.test.mjs]
  - id: task-4
    cmd: node --test tests/bee-suggest.test.mjs
    expect: exit 0
    files: [bin/bee.js, tests/bee-suggest.test.mjs]
  - id: task-5
    cmd: node --test tests/bee-worktree.test.mjs
    expect: exit 0
    files: [bin/bee.js, tests/bee-worktree.test.mjs, skills/loop/bee-loop/assets/dispatch-brief-template.md]
  - id: task-6
    cmd: node --test tests/bee-init.test.mjs tests/bee-machine.test.mjs tests/bee-suggest.test.mjs tests/bee-worktree.test.mjs tests/bee-agents.test.mjs
    expect: exit 0
    files: [bin/bee.js]
  - id: task-7
    cmd: node bin/bee.js init --check && bash scripts/structure-check.sh /home/saphron/BeeHarness && node --test tests/*.test.mjs
    expect: exit 0
    files: [.hivemind/config.toon, scripts/structure.map, docs/adoption.md, README.md]
suite: node --test tests/*.test.mjs
task-2: done 2026-11-07T11:14:10+11:00 by project-orchestrator record: .hivemind/logbook/2026-11-02-po-p6-productization-task2-verify-r1.md
task-4: done 2026-11-07T11:13:47+11:00 by project-orchestrator record: .hivemind/logbook/2026-11-02-po-p6-productization-task4-verify-r3.md
task-3: done 2026-11-07T11:29:15+11:00 by project-orchestrator record: .hivemind/logbook/2026-11-02-po-p6-productization-task3-verify-r2.md
task-6: done 2026-11-07T12:00:01+11:00 by project-orchestrator record: .hivemind/logbook/2026-11-02-po-p6-productization-task6-verify-r2.md
-->

## Ruled at kickoff (binding; recorded on the P6 row)

- Row-embedded rulings (2026-11-01): GREEN-FIELDS-FIRST (git created if
  none); worktree edge via `--git-common-dir`, respect the branch not the
  worktree, instruct return to the main worktree; MANAGED AGENTS.md BLOCK
  = option a (marker-fenced, create-if-absent, idempotent); distribution =
  repo referenced in place (symlink + path-registered skills, no
  packaging); name stands (BeeHarness + `bee`); fold
  `scripts/worktree.sh` into the CLI; full AXI pass; template glossary
  scaffolding (format only — content is P8's).
- D1 (2026-11-02): NO CONSUMERS BEFORE P8 — the shipped-file seam is
  moot; role files and templates ship as-is with our references; P8
  sweeps; consumers re-pull + re-register (self-healing init).
- D2 (2026-11-02): ONE phase; tasks carry the split.
- D3 (2026-11-02, via PP relay @ cfb8272): version pins = registration
  records the checked-out commit; drift (registered commit vs current
  HEAD) is an INFORMATIONAL line on EVERY `bee init` run, exit 0;
  `--check` reports the same without writing; no network fetch; no
  "available" concept; pins ride the registry entries.
- D4 (2026-11-02): docs MINIMAL — one adoption doc in `docs/` + README
  pointer.

## Decisions made at plan time (reviewed as decisions; feed the close inventory)

1. `--machine <dir>` flag joins `--settings <path>` as init's second
   test seam; default machine dir `~/.bee/` (harness name stands, so the
   dir name is final).
2. Harness-repo skip: `bee init` running with the consumer repo equal to
   the harness's own `REPO_ROOT` skips the managed block (our AGENTS.md
   is law source, not an injected surface) and skips scaffolding (all
   exists); it still registers + drift-reports the machine-store entry.
3. Consumer default automation level L1 (automation-levels design: safe
   default); the harness dogfood config writes L0 (this repo is
   hands-on by design).
4. `config.toon` shape (both defaults verbatim in tasks 2 and 7).
5. Managed-block fences: HTML comments `<!-- bee:managed:start -->` /
   `<!-- bee:managed:end -->` — invisible in rendered markdown, robust
   to markdown tooling.
6. `bee suggest` local default = an inbox add (feedback-channel design:
   "default target is the project-local inbox"); `--harness` files into
   the machine store. The curated `.hivemind/suggestions/*.md`
   documents are a different, human/agent-authored class — suggest does
   not write them.
7. Empty stores ship at init as header-only files (glossary: "0 terms"
   day one; inbox: "0 open") so `bee glossary` / `bee inbox` behave from
   birth (AXI 5). This is the consumer contract only — in-repo stores
   keep their born-at-first-add rule.
8. Green-fields git: `git init` only, NO auto first-commit (the scaffold
   output suggests the commit as its next-step line, AXI 9).

## Execution seams (named at kickoff; the plan honors them)

- **Marker surgery class:** the managed block is fence-delimited and
  scripted-only — one fence without its pair is a FAIL LOUD error, never
  a guess (P5 sed-incident law).
- **First machine-global store:** `~/.bee/` writes use the same
  atomicWrite discipline as repo stores; the registry is one entry per
  repo keyed by absolute path, so concurrent inits of different repos
  touch different lines of a single small file — read-modify-write with
  atomicWrite, same as `settings.json`.
- **P2 stub is live code:** the existing registration flow and its
  `--settings` flag keep their behavior and tests; everything extends,
  nothing rebuilds.
- **P11 no-creep:** no `bee ping`, no relay queue, no level tooling
  beyond scaffolding the config file (automation-levels: P6 is
  pre-scaffolding ONLY).
- **Living references to `worktree.sh`:** three exist (review r1 J7
  verified): the dispatch-brief template (law surface), a `bin/bee.js`
  code comment, and a `tests/bee-logbook.test.mjs` header comment;
  task 5 sweeps all three. Records (plans, logbook, session logs, the
  P6 row itself) keep the old name as history.

## Task 1: machine store — registry + version pins

**Files:** modify `bin/bee.js` · modify `tests/bee.test.mjs` · create `tests/bee-machine.test.mjs`
**Depends on:** nothing
**Provides:** `machineDirOf(flagValue)` → path; `machineRegistryPath(dir)`; `readMachineRegistry(dir)` → array of entry objects `{ repo, commit, date }`; `writeMachineRegistry(dir, entries)` (atomicWrite); drift-line computation used by init; `--machine <dir>` flag parsed by `cmdInit`.

- [x] Step: add to `cmdInit`'s flag spec: `machine: { type: 'string' }`;
  `machineDirOf(v)` resolves `v` if given, else `path.join(os.homedir(), '.bee')`.
- [x] Step: registry store at `<machine>/registry.toon`. File shape
  (TOON, header comments + one line per repo):

```text (shape — baked into bee.js as constants)
# bee machine registry — one line per harnessed repo
# repo :: <absolute path> :: commit <sha at registration> :: <ISO date>
/home/who/projects/notes :: commit 4f2a91c :: 2026-11-02T16:40:00+11:00
```

  Read: ignore `#` lines; empty/absent file = zero entries (create on
  first write only). Keyed by absolute repo path; a re-init of a known
  repo UPDATES its line (new commit + date), never duplicates. The
  consumer-seed headers in task 2 use the SAME canonical header strings
  the CLI's own store writers emit (`INBOX_HEADER`, `GLOSSARY_HEADER` —
  review r1 J4: a divergent seed header would be silently replaced at
  the first add).
- [x] Step: after the existing skills-registration step in `cmdInit`
  (both check and write modes), init reports the machine-store state.
  Write mode also ensures the registry entry: current harness commit =
  `git rev-parse HEAD` executed in `REPO_ROOT` (the PINNED commit at
  registration; drift compares it to `REPO_ROOT` HEAD on later runs).
  Output lines (exact strings; all informational, exit 0 — D3):

```text
bee init: machine registry: <machine>/registry.toon — registered <repo-abs-path> @ <short-sha>   (write mode, after ensure)
bee init: harness <registered-short> · head <head-short> · in sync
bee init: harness <registered-short> · head <head-short> · DRIFTED (pull + bee init to re-register)
bee init: machine store: not registered (run without --check to add <repo-abs-path>)              (--check only, absent entry)
```

- [x] Step: `--check` reports the drift/registry lines WITHOUT writing
  the registry file. Exit code unchanged by drift (0) — drift is
  informational (D3).
- [x] Step: hygiene (review r1 J6) — every write-mode `init` call in
  the EXISTING `tests/bee.test.mjs` gains `--machine <tmp>` (a tmp dir
  per test), so the suite never writes the real `~/.bee/` (the
  unconditional registry-ensure would otherwise touch the user's home
  on every suite run; the dogfood write in task 7 is the ONE
  intentional real-machine write).
- [x] Step: create `tests/bee-machine.test.mjs` (verbatim below) and run
  `node --test tests/bee-machine.test.mjs` — all pass.

```javascript path=tests/bee-machine.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { run } from '../bin/bee.js';

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bee-machine-'));
}

function tmpSettings(dir) {
  const sp = path.join(dir, 'settings.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  return sp;
}

test('init writes a registry entry, keyed by repo path', () => {
  const home = tmp();                 // consumer repo (cwd not changed:
  const machine = tmp();              // registration uses process cwd)
  const sp = tmpSettings(home);
  const r = run(['init', '--settings', sp, '--machine', machine]);
  assert.equal(r.code, 0);
  const reg = fs.readFileSync(path.join(machine, 'registry.toon'), 'utf8');
  assert.match(reg, /^# bee machine registry/m);
  const lines = reg.split('\n').filter((l) => l && !l.startsWith('#'));
  assert.equal(lines.length, 1);
  assert.match(lines[0], /^.+ :: commit [0-9a-f]{7,40} :: \S+$/);
  assert.match(r.out, /machine registry: .* — registered .+ @ [0-9a-f]{7}/);
});

test('re-init updates the entry, never duplicates', () => {
  const home = tmp();
  const machine = tmp();
  const sp = tmpSettings(home);
  run(['init', '--settings', sp, '--machine', machine]);
  const before = fs.readFileSync(path.join(machine, 'registry.toon'), 'utf8');
  const r = run(['init', '--settings', sp, '--machine', machine]);
  assert.equal(r.code, 0);
  const lines = fs.readFileSync(path.join(machine, 'registry.toon'), 'utf8')
    .split('\n').filter((l) => l && !l.startsWith('#'));
  assert.equal(lines.length, 1);
  assert.match(r.out, /in sync/);
  assert.notEqual(before, ''); // sanity: first write happened
});

test('--check reports without writing the registry', () => {
  const home = tmp();
  const machine = tmp();
  const sp = tmpSettings(home);
  const r = run(['init', '--check', '--settings', sp, '--machine', machine]);
  assert.equal(r.code, 1); // skills NOT registered drives exit 1 (P2 rule)
  assert.match(r.err, /NOT registered/);
  assert.ok(!fs.existsSync(path.join(machine, 'registry.toon')),
    '--check must not create the registry');
});

test('drift is informational: exit 0, DRIFTED line', () => {
  const home = tmp();
  const machine = tmp();
  const sp = tmpSettings(home);
  run(['init', '--settings', sp, '--machine', machine]);
  // registration ran from the live harness repo; a forged stale entry
  // forces drift without mutating the real repo:
  const regPath = path.join(machine, 'registry.toon');
  const stale = fs.readFileSync(regPath, 'utf8')
    .replace(/commit [0-9a-f]+/, 'commit 0000000');
  fs.writeFileSync(regPath, stale);
  const r = run(['init', '--settings', sp, '--machine', machine]);
  assert.equal(r.code, 0);
  assert.match(r.out, /DRIFTED/);
  // write mode re-registers: a third run is in sync again
  const r2 = run(['init', '--settings', sp, '--machine', machine]);
  assert.equal(r2.code, 0);
  assert.match(r2.out, /in sync/);
});

test('registry survives unrelated lines (read-modify-write keeps them)', () => {
  const home = tmp();
  const machine = tmp();
  const sp = tmpSettings(home);
  run(['init', '--settings', sp, '--machine', machine]);
  const regPath = path.join(machine, 'registry.toon');
  fs.appendFileSync(regPath,
    '/elsewhere/other :: commit abcdef1 :: 2026-01-01T00:00:00+00:00\n');
  run(['init', '--settings', sp, '--machine', machine]);
  const after = fs.readFileSync(regPath, 'utf8');
  assert.match(after, /\/elsewhere\/other/);
});
```

- [x] Commit: `bee init: machine registry + drift pins`

## Task 2: init contract — green-fields-first + consumer scaffolding

**Files:** modify `bin/bee.js` · create `tests/bee-init.test.mjs`
**Depends on:** task 1 (registry/drift already wired)
**Provides:** `consumerRepoRoot()` (cwd-based, common-dir aware); scaffold steps in `cmdInit`; `config.toon` default content; empty-store headers; `--repo <dir>` flag as the consumer-repo test seam (tests never chdir; default = `process.cwd()`).

- [x] Step: add `repo: { type: 'string' }` to `cmdInit` flags; resolved
  consumer repo = `f.values.repo ? path.resolve(f.values.repo) : process.cwd()`.
- [x] Step: repo-root resolution, in order (worktree edge, PL-PO-002
  ruling): run `git rev-parse --path-format=absolute --git-common-dir`
  in the consumer dir. Not a repo → GREEN-FIELDS path (below). A repo →
  main-checkout test: the repo root is the common dir's dirname; if the
  consumer dir is NOT under that root (i.e. cwd sits in a linked
  worktree), print and stop (exit 0, nothing written):

```text
bee init: running inside a worktree — return to the main worktree (<main-root>) and branch there, then re-run
```

- [x] Step: GREEN-FIELDS: no git in the consumer dir → `git init`
  (execFileSync, `cwd` = consumer dir; fail loud with git's stderr and
  exit 1 if git is missing — structured error, no guessing). Output:
  `bee init: created git repository at <path>`. NO first commit
  (decision 8); the scaffold summary carries the next-step line.
- [x] Step: scaffolding, check-and-do per item, each printing
  `scaffolded <path>` or `exists: <path>` (write mode) and
  `would scaffold <path>` / `exists: <path>` (`--check` mode, writes
  nothing). Item list, in order:
  1. directories `docs/` + `docs/research/` — references-home rule: if
     a `docs/` dir already exists, scaffold `docs/research/` inside it;
     otherwise scaffold `docs/` with a `.gitkeep` (an empty dir alone
     does not survive git);
  2. `.hivemind/` class dirs: `phases designs plans decisions logbook
     memory suggestions sessions`;
  3. `.hivemind/phases/TEMPLATE.md` and `.hivemind/designs/TEMPLATE.md`
     copied verbatim from the harness repo's files
     (`path.join(REPO_ROOT, '.hivemind', ...)`); fail loud exit 1 if a
     harness template is missing (structured error naming the path);
  4. `.hivemind/phases/<Project>.md` — `<Project>` = basename of the
     consumer repo root; content = the phases TEMPLATE verbatim;
  5. `.hivemind/inbox.toon` — header-only:

```text path=.hivemind/inbox.toon (consumer seed)
# inbox — items waiting on someone (agent store; views render from here)
```

  6. `.hivemind/glossary.toon` — header-only:

```text path=.hivemind/glossary.toon (consumer seed)
# glossary — shared vocabulary (term :: gist :: see; supply, never update)
```

  7. `.hivemind/status.md` — fresh surface:

```text path=.hivemind/status.md (consumer seed)
# Status — cross-role surface

Open escalations, cross-role notes. Roles read at session start;
prefix your lines with a role tag.
```

  8. `.hivemind/config.toon` — automation level + gates (default L1,
     decision 3; this block is the consumer-default CONSTANT baked into
     `bee.js` — the file block for THIS repo's own config is task 7's):

```text (consumer-default constant — baked into bee.js)
# bee config — automation level + keeper gates; level changes are keeper-only
level :: L1
gates :: SOUL/identity · irreversible acts · direction beyond the design · config-named items
```

  9. `roles/` — copy every `*.md` from `REPO_ROOT/roles/` into the
     consumer repo's `roles/` (as-is, D1 ruling; P8 sweeps);
  10. `.gitignore` — create if absent, else append if the line is
      missing: `.hivemind/sessions/`.
- [x] Step: harness-repo skip (decision 2): when the resolved consumer
  repo equals `REPO_ROOT`, print
  `bee init: harness repo — scaffolding + managed block skipped` and
  skip items 1–10 and task 3's block (registry + drift still ran in
  task 1's step). Dogfood assertions ride this rule.
- [x] Step: create `tests/bee-init.test.mjs` (verbatim below) and run
  `node --test tests/bee-init.test.mjs` — all pass.

```javascript path=tests/bee-init.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { run } from '../bin/bee.js';

const TESTS_DIR = path.dirname(fileURLToPath(import.meta.url));

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bee-init6-'));
}
function git(cwd, ...args) {
  return execFileSync('git', args, { cwd }).toString();
}

test('green-fields: creates git + full scaffold', () => {
  const dir = tmp();
  const machine = tmp();
  const sp = path.join(dir, '..', path.basename(dir) + '-settings.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const repo = path.join(dir, 'notes');
  fs.mkdirSync(repo);
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', repo]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /created git repository/);
  for (const rel of [
    'docs/.gitkeep',
    '.hivemind/phases/TEMPLATE.md',
    '.hivemind/designs/TEMPLATE.md',
    '.hivemind/phases/notes.md',
    '.hivemind/inbox.toon',
    '.hivemind/glossary.toon',
    '.hivemind/status.md',
    '.hivemind/config.toon',
    '.gitignore',
  ]) {
    assert.ok(fs.existsSync(path.join(repo, rel)), 'missing: ' + rel);
  }
  assert.match(fs.readFileSync(path.join(repo, '.hivemind/config.toon'), 'utf8'),
    /level :: L1/);
  assert.match(fs.readFileSync(path.join(repo, '.gitignore'), 'utf8'),
    /\.hivemind\/sessions\//);
  assert.match(r.out, /in sync|DRIFTED/); // registry + drift reported
});

test('existing docs/ gets docs/research/, no .gitkeep', () => {
  const dir = tmp();
  fs.mkdirSync(path.join(dir, 'docs'));
  fs.writeFileSync(path.join(dir, 'docs', 'keep.md'), 'x');
  git(dir, 'init');
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', dir]);
  assert.equal(r.code, 0, r.err);
  assert.ok(fs.existsSync(path.join(dir, 'docs', 'research')));
  assert.ok(!fs.existsSync(path.join(dir, 'docs', '.gitkeep')));
});

test('idempotent: second run reports exists everywhere, exits 0', () => {
  const dir = tmp();
  git(dir, 'init');
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  run(['init', '--settings', sp, '--machine', machine, '--repo', dir]);
  const before = fs.readFileSync(path.join(dir, '.hivemind/config.toon'), 'utf8');
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', dir]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /exists: /);
  assert.equal(
    fs.readFileSync(path.join(dir, '.hivemind/config.toon'), 'utf8'), before);
});

test('--check scaffolds nothing', () => {
  const dir = tmp();
  git(dir, 'init');
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const r = run(['init', '--check', '--settings', sp, '--machine', machine, '--repo', dir]);
  assert.equal(r.code, 1); // skills unregistered drives exit 1
  assert.ok(!fs.existsSync(path.join(dir, '.hivemind')));
});

test('worktree edge: linked worktree refuses with instruction', () => {
  const dir = tmp();
  git(dir, 'init');
  git(dir, 'commit', '--allow-empty', '-m', 'x');
  git(dir, 'branch', 'phase/1');
  const wt = dir + '-wt';
  git(dir, 'worktree', 'add', '-b', 'task/1-a', wt, 'phase/1');
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', wt]);
  assert.equal(r.code, 0);
  assert.match(r.out, /return to the main worktree/);
  assert.ok(!fs.existsSync(path.join(wt, '.hivemind')));
});

test('harness repo: skip line, no scaffold writes beyond registry', () => {
  const machine = tmp();
  const sp = path.join(machine, 's.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const r = run(['init', '--settings', sp, '--machine', machine,
    '--repo', path.resolve(TESTS_DIR, '..')]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /harness repo — scaffolding \+ managed block skipped/);
});
```

- [x] Commit: `bee init: green-fields scaffold per P6 rulings`

## Task 3: MANAGED AGENTS.md BLOCK

**Files:** modify `bin/bee.js` · create `tests/bee-agents.test.mjs`
**Depends on:** task 2 (scaffold step order; harness-skip rule)
**Provides:** `ensureManagedBlock(repoRoot)` — create-if-absent, idempotent regen, fail-loud on corrupt fences; wired as init's final scaffold step (runs on every init, after item 10; skipped for the harness repo).

- [x] Step: block content (verbatim — pointer-only until P8's PL-PP-006
  distillation; decisions 2 + 5):

```text path=AGENTS.md managed block (exact fenced content)
<!-- bee:managed:start -->
<!-- BeeHarness managed section — regenerated by `bee init`; everything outside these fences is the project's own. -->
- This project runs BeeHarness. Vocabulary: `bee glossary <term>` · `bee glossary` lists all.
- Guidance: `bee guidance list` for topics, `bee guidance show <topic>` to read one.
<!-- bee:managed:end -->
```

- [x] Step: `ensureManagedBlock(repoRoot)` behavior:
  - no `AGENTS.md` → create it with a one-line header
    (`# AGENTS.md — <Project>`) + blank line + the block; report
    `managed block: created AGENTS.md`;
  - file exists, no fences → append blank line + block; report
    `managed block: appended`;
  - fences present → replace ONLY the content between them when it
    differs from the canonical block; report `managed block: updated`
    or `managed block: current`;
  - exactly one fence → structured error, exit 1:
    `bee init: corrupt managed block in <path> — found one fence, expected a start/end pair; fix by hand`;
  - never write anything outside the fences (marker-surgery seam law).
- [x] Step: wire into `cmdInit` after scaffold item 10 (write mode
  executes it; `--check` reports `managed block: <state>` without
  writing).
- [x] Step: create `tests/bee-agents.test.mjs` (verbatim below) and run
  `node --test tests/bee-agents.test.mjs` — all pass.

```javascript path=tests/bee-agents.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { run } from '../bin/bee.js';

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bee-agents-'));
}
function git(cwd, ...args) {
  return execFileSync('git', args, { cwd }).toString();
}
function initRepo(dir, settings) {
  git(dir, 'init');
  const machine = tmp();
  fs.writeFileSync(settings, JSON.stringify({ skills: [] }, null, 2));
  return run(['init', '--settings', settings, '--machine', machine, '--repo', dir]);
}

test('creates AGENTS.md with the block when absent', () => {
  const dir = tmp();
  const sp = path.join(dir, 's.json');
  const r = initRepo(dir, sp);
  assert.equal(r.code, 0, r.err);
  const ag = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
  assert.match(ag, /# AGENTS\.md — /);
  assert.match(ag, /bee:managed:start/);
  assert.match(ag, /bee:managed:end/);
  assert.match(ag, /bee glossary/);
});

test('appends to an existing AGENTS.md, keeps project text', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'AGENTS.md'),
    '# My project\n\nOur own rule: be kind.\n');
  const sp = path.join(dir, 's.json');
  const r = initRepo(dir, sp);
  assert.equal(r.code, 0, r.err);
  const ag = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
  assert.match(ag, /Our own rule: be kind\./);
  assert.ok(ag.indexOf('bee:managed:start') > ag.indexOf('be kind'));
});

test('idempotent: second run leaves the file byte-identical', () => {
  const dir = tmp();
  const sp = path.join(dir, 's.json');
  initRepo(dir, sp);
  const before = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
  const machine = tmp();
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', dir]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /managed block: current|managed block: updated/);
  assert.equal(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8'), before);
});

test('updates only between fences; project text outside untouched', () => {
  const dir = tmp();
  const sp = path.join(dir, 's.json');
  initRepo(dir, sp);
  const agPath = path.join(dir, 'AGENTS.md');
  let ag = fs.readFileSync(agPath, 'utf8');
  ag = ag.replace('bee glossary', 'STALE bee glossary');
  fs.writeFileSync(agPath, ag);
  const machine = tmp();
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', dir]);
  assert.equal(r.code, 0, r.err);
  const after = fs.readFileSync(agPath, 'utf8');
  assert.match(after, /bee glossary/);
  assert.ok(!after.includes('STALE'));
});

test('single fence: fail loud, no writes', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'AGENTS.md'),
    '# P\n\n<!-- bee:managed:start -->\norphan\n');
  git(dir, 'init');
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', dir]);
  assert.equal(r.code, 1);
  assert.match(r.err, /corrupt managed block/);
  assert.match(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8'), /orphan/);
});
```

- [x] Commit: `bee init: managed AGENTS.md block, fence-safe`

## Task 4: `bee suggest` — project-local + harness channel

**Files:** modify `bin/bee.js` · create `tests/bee-suggest.test.mjs`
**Depends on:** task 1 (`--machine` seam, machine dir helpers)
**Provides:** `bee suggest "<text>" [--harness] [--origin <role>] [--ref <path>] [--store <path>] [--machine <dir>]` — USAGE line added to the top-level usage block.

- [x] Step: local default = `bee inbox add` semantics (addressee
  `keeper`, origin from `--origin` else `agent`, text as given); output
  mirrors inbox add's confirmation (reuse `inboxAddItem`).
- [x] Step: `--harness` files one TOON document at
  `<machine>/suggestions/<repo-name>/NNNN-<slug>.toon` where
  `<repo-name>` = basename of the consumer repo (cwd), NNNN = next
  number in that folder (zero-padded 4), slug = kebab-case of the first
  six words (lowercase; non-alphanumeric runs → single `-`; empty slug
  → `item`). Document (verbatim shape; wrap the text at 72 cols):

```text (shape — one document per suggestion)
# harness feedback — <repo-name>
repo :: <repo-name>
role :: <origin>
date :: <ISO 8601>
harness :: <harness short sha>
text :: <the suggestion text, one or more lines>
```

- [x] Step: output (AXI 4/9):
  `bee suggest: filed <machine>/suggestions/<repo>/NNNN-<slug>.toon (#<NNNN>) · triage happens harness-side` — and exit 0.
  Empty text / missing quotes: structured error + usage, exit 1.
- [x] Step: create `tests/bee-suggest.test.mjs` (verbatim below) and run
  `node --test tests/bee-suggest.test.mjs` — all pass.

```javascript path=tests/bee-suggest.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { run } from '../bin/bee.js';

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bee-suggest-'));
}

test('local default lands in the project inbox', () => {
  const dir = tmp();
  const store = path.join(dir, 'inbox.toon');
  const r = run(['suggest', 'add a squash verb', '--origin', 'power-planner',
    '--store', store]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /IN-0*1|inbox/i);
  const storeText = fs.readFileSync(store, 'utf8');
  assert.match(storeText, /add a squash verb/);
});

test('--harness files numbered TOON with provenance', () => {
  const dir = tmp();
  const machine = tmp();
  const r = run(['suggest', 'the compact verb should take --dry-run',
    '--harness', '--origin', 'task-orc', '--machine', machine]);
  assert.equal(r.code, 0, r.err);
  const folder = path.join(machine, 'suggestions',
    path.basename(process.cwd()));
  const files = fs.readdirSync(folder).filter((f) => f.endsWith('.toon'));
  assert.equal(files.length, 1);
  assert.match(files[0], /^0001-.+\.toon$/);
  const doc = fs.readFileSync(path.join(folder, files[0]), 'utf8');
  assert.match(doc, /^repo :: /m);
  assert.match(doc, /^role :: task-orc$/m);
  assert.match(doc, /^date :: \S+$/m);
  assert.match(doc, /^harness :: [0-9a-f]{7,}$/m);
  assert.match(doc, /compact verb should take/);
  assert.match(r.out, /#0001/);
});

test('--harness numbering increments across suggests', () => {
  const machine = tmp();
  for (const t of ['first thing', 'second thing']) {
    const r = run(['suggest', t, '--harness', '--machine', machine]);
    assert.equal(r.code, 0, r.err);
  }
  const folder = path.join(machine, 'suggestions',
    path.basename(process.cwd()));
  const names = fs.readdirSync(folder).sort();
  assert.match(names[0], /^0001-/);
  assert.match(names[1], /^0002-/);
});

test('empty text: structured error, exit 1', () => {
  const r = run(['suggest', '']);
  assert.equal(r.code, 1);
  assert.match(r.err, /expected "<text>"/);
});
```

- [x] Commit: `bee suggest: local + harness feedback channel`

## Task 5: `bee worktree` — fold the script into the CLI

**Files:** modify `bin/bee.js` · delete `scripts/worktree.sh` · delete `tests/worktree-sh.test.mjs` · create `tests/bee-worktree.test.mjs` · modify `skills/loop/bee-loop/assets/dispatch-brief-template.md` · modify `tests/bee-logbook.test.mjs`
**Depends on:** nothing (parallel-safe with tasks 1–4)
**Provides:** `bee worktree create <phase>-<slug> | merge <slug> | abandon <slug>`; USAGE line in the top-level usage block.

- [x] Step: port `scripts/worktree.sh`'s three subcommands to Node in
  `bin/bee.js` (`cmdWorktree`). The script is the spec — semantics,
  validation order, error classes (usage exit 1; not-a-phase-branch
  exit 2; branch/worktree already-exists exit 3; no-match and
  ambiguous slug exit 4; unmerged abandon exit 5), and message strings port verbatim with `worktree.sh:` →
  `bee worktree:`. Git runs via `execFileSync('git', args, { cwd:
  process.cwd() })`; repo context resolves from cwd exactly as the
  script does (dirname of `--git-common-dir`), never from REPO_ROOT.
  stdout of `create` carries only the worktree path; git chatter goes
  to stderr (match the script).
- [x] Step: port the test cases from `tests/worktree-sh.test.mjs` to
  `tests/bee-worktree.test.mjs`: same scenarios and assertions, invoked
  as `run(['worktree', 'create', ...])` etc.; where the suite ran the
  script with `bash`, run `bee` in-process instead. Then delete
  `tests/worktree-sh.test.mjs` and `scripts/worktree.sh`.
- [x] Step: sweep the live references (review r1 J7 — three, not one):
  (a) `skills/loop/bee-loop/assets/dispatch-brief-template.md` names
  `scripts/worktree.sh create <phase>-<slug>` — rewrite that phrase to
  `bee worktree create <phase>-<slug>` (the template's other text
  stands); (b) the `bin/bee.js` comment near the phase-close worktree
  walk ("the same porcelain walk worktree.sh uses") — reword to
  "the same porcelain walk `bee worktree` uses"; (c) the header
  comment in `tests/bee-logbook.test.mjs` citing
  `tests/worktree-sh.test.mjs patterns` — reword to
  `tests/bee-worktree.test.mjs patterns`. Then verify:
  `grep -rn "worktree.sh" skills/ roles/ docs/ README.md AGENTS.md SOUL.md scripts/ bin/ tests/` →
  exactly ONE hit: `tests/fixtures/parking-lot-v1.md` — a historical
  fixture (the v1 parking-lot snapshot; its PL-PO-002 entry quotes the
  old script as a record). Fixture data stays as written — carve-out,
  review r2 J2. (Records under `.hivemind/plans|logbook|sessions` keep
  the old name as history; `.pi/handoff-*` is an ephemeral crash-brief
  replaced at the next handoff write — out of scope.)
- [x] Step: run `node --test tests/bee-worktree.test.mjs` — all pass;
  full suite still green (`node --test tests/*.test.mjs`).
- [x] Commit: `bee worktree: fold helper script into CLI`

  Task notes: review r1 (task5-review-r1) verdict FIX-FIRST on one
  should-fix (prefix-match in worktreeOfBranch → wrong-worktree
  removal). Fix round 1: reviewer's one-token exact-match fix applied
  near-verbatim + permanent regression test; verify r2 carries the
  probe. Re-review waived — near-verbatim fix + probe replicated
  (verify r2 body).

## Task 6: AXI compliance pass

**Files:** modify `bin/bee.js` (gap fixes)
**Depends on:** tasks 1–5 (audits the final command set)
**Provides:** an audit table recorded in this task's verify entry; fixes for every gap found.

- [x] Step: audit every command family against the ten principles
  (`docs/AXI.md`): report · init · inbox · park · memory · design ·
  capture · logbook · glossary · verify · task · guidance · phase ·
  suggest · worktree. The judgment this step keeps (not scriptable):
  which outputs violate which principle and what the right fix is.
  Write the table (command × principle × verdict × action) into the
  verify record at task end — the table IS the deliverable, fixes ride
  it.
- [x] Step: guided findings, pre-named (audit may add):
  - principle 5 (definitive empty states): every list surface prints an
    explicit `0 <noun>` line when empty — check each;
  - principle 9 (contextual disclosure): apply to MUTATION outputs
    only (one short next-step hint line); list/read outputs stay lean
    (principle 1 outweighs there — this split is the plan-time ruling);
  - principle 10 (consistent help): every command family carries a
    per-subcommand usage block reachable the same way (`<cmd>` misuse
    prints it; `help` lists all).
- [x] Step: fix every gap the table marks; keep behavior changes tested
  (extend the command's existing test file where one exists; new gaps
  without a test file get assertions added to the closest one).
- [x] Step: run the full suite `node --test tests/*.test.mjs` — green;
  record the audit table + fix list in the verify entry body.
- [x] Commit: `AXI pass: close compliance gaps across bee commands`

## Task 7: adoption doc + README + dogfood + map

**Files:** create `docs/adoption.md` · modify `README.md` · modify `scripts/structure.map` · create `.hivemind/config.toon`
**Depends on:** tasks 1–6 (dogfood exercises the finished contract)

- [ ] Step: create `docs/adoption.md` (verbatim below).

```markdown path=docs/adoption.md
# Adopting BeeHarness

BeeHarness is referenced in place — no packaging, no bootstrap script.
A consuming repo symlinks the `bee` CLI, registers the skills path,
and runs `bee init`.

## Prerequisites

- Node 20+ and git on PATH (the repo's declared floor —
  `package.json` engines).
- A checkout of this harness repo somewhere on the machine (update =
  `git pull` in it).

## Adopt a repo

1. Symlink the CLI onto PATH:
   `ln -s <harness-repo>/bin/bee.js ~/.local/bin/bee` (the file is
   executable and self-shebang'd).
2. Register + scaffold, from the consuming repo's root:
   `bee init` — it registers the harness skills path in
   `~/.pi/agent/settings.json`, records the repo in the machine store
   (`~/.bee/registry.toon`) with the harness commit it runs from, and
   scaffolds what's missing: `.hivemind/` (phase list from the
   template, empty inbox + glossary stores, status surface, config with
   automation level + keeper gates), `docs/` (or `docs/research/` if
   `docs/` exists), `roles/`, and a marker-fenced managed section in
   `AGENTS.md` (pointer-only; everything outside the fences is the
   project's own).
3. `bee init --check` reports registration, drift, and scaffold state
   without writing anything.

Update: `git pull` in the harness repo, then re-run `bee init` — it
re-registers (the drift line shows the old commit until you do) and
regenerates the managed block idempotently. Machine state (registry,
per-project harness feedback) lives under `~/.bee/`.

Feedback: `bee suggest "<text>"` files to the project's own inbox;
`bee suggest "<text>" --harness` files harness feedback under
`~/.bee/suggestions/<repo>/` — triaged harness-side, never automatic.

First run inside a worktree is refused with the instruction to return
to the main worktree — branch there, then re-run.
```

- [ ] Step: README gains the adoption pointer in its Documents list:
  one line — `docs/adoption.md — how a consuming repo adopts the harness` — placed with the other document pointers (no other README change; durable description only).
- [ ] Step: `scripts/structure.map` — extend the first `hivemind:` line
  with `.hivemind/config.toon` (same line style, space-separated).
- [ ] Step: dogfood on the harness repo itself: run
  `node bin/bee.js init --check` — expect: skills registered ✓,
  machine store: not registered (the first check runs BEFORE the first
  real-machine write), and `harness repo — scaffolding + managed block
  skipped` (no per-item scaffold lines — the skip rule replaces them,
  review r2 J3). Then the write run: `node bin/bee.js init` — expect
  the machine-store registration line for this repo; a follow-up
  `--check` now reports the harness in-sync drift line. Create `.hivemind/config.toon` BY HAND from the run's
  check-and-do semantics with the harness-repo level (decision 3):

```text path=.hivemind/config.toon
# bee config — automation level + keeper gates; level changes are keeper-only
level :: L0
gates :: SOUL/identity · irreversible acts · direction beyond the design · config-named items
```

  (The harness-repo skip means init will not scaffold it — creating it
  by hand is the dogfood of the format, and the file is law the keeper
  can veto at sign-off.)
- [ ] Step: run the task check:
  `node bin/bee.js init --check && bash scripts/structure-check.sh /home/saphron/BeeHarness && node --test tests/*.test.mjs` —
  exit 0 end to end (structure check 0 findings with config.toon on
  the map).
- [ ] Commit: `P6: adoption doc, dogfood config, map entry`

## Phase exit

- All seven task checks pass; full suite green
  (`node --test tests/*.test.mjs`); structure check 0 findings.
- `bee init` (with no args, from a consumer sandbox) exercises the whole
  contract end to end in tests: registration, registry + drift, green-
  fields git + scaffold, managed block, idempotence, worktree refusal.
- `bee suggest`, `bee worktree` live; `scripts/worktree.sh` gone.
- AXI audit table recorded (task 6 verify entry).
- Keeper reviews the decision inventory at phase end (kickoff D1–D4 +
  plan-time decisions 1–8 + any in-phase rulings).

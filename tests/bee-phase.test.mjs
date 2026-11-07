// AXI compliance battery for `bee phase` (P4 Task 9) — decision
// inventory + scripted close. NEVER touches the live repo or its
// branches: every close/inventory runs against a throwaway git
// repo under the OS temp dir via the --root seam (mkdtemp + git
// init); the real P4 close is the loop's, not a test's.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run } from '../bin/bee.js';

const PLAN_SLUG = '2026-11-01-test-p4-close';

const GREEN_TEST = [
  "import { test } from 'node:test';",
  "import assert from 'node:assert/strict';",
  "test('green', () => { assert.ok(true); });",
  '',
].join('\n');

const RED_TEST = [
  "import { test } from 'node:test';",
  "test('red', () => { throw new Error('suite gate probe'); });",
  '',
].join('\n');

function planText(suite) {
  return [
    '# Plan: fixture close plan', '',
    '<!-- machine',
    'phase: P4',
    'validation: phase',
    'state-source: checkboxes below',
    `suite: ${suite}`,
    'checks:', '  - id: task-1', '    cmd: "true"',
    '-->', '', '## Task 1: only', '', '- [ ] step', '',
  ].join('\n');
}

// main @ base (plan + green suite); phase/4 one commit ahead
// (marker file; the suite goes red there when opts.redSuite).
function fixtureRepo(opts = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-phase-'));
  const git = (cmd, cwd = dir) =>
    execSync(`git ${cmd}`, { cwd, encoding: 'utf8' });
  git('init -q -b main');
  git('config user.email bee@test.local');
  git('config user.name bee-test');
  fs.mkdirSync(path.join(dir, '.hivemind', 'plans'), { recursive: true });
  fs.mkdirSync(path.join(dir, '.hivemind', 'logbook'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'tests'), { recursive: true });
  fs.writeFileSync(path.join(dir, '.hivemind', 'plans', `${PLAN_SLUG}.md`),
    planText(opts.suite ?? 'node --test tests/green.test.mjs'));
  fs.writeFileSync(path.join(dir, 'tests', 'green.test.mjs'), GREEN_TEST);
  // board + design docs ride the BASE commit — the close's
  // clean-tree gate refuses uncommitted fixture files
  if (opts.phasesFile) {
    fs.mkdirSync(path.join(dir, '.hivemind', 'phases'), { recursive: true });
    fs.writeFileSync(path.join(dir, '.hivemind', 'phases', 'phases.md'),
      opts.phasesFile);
  }
  if (opts.templateFile) {
    fs.mkdirSync(path.join(dir, '.hivemind', 'phases'), { recursive: true });
    fs.writeFileSync(path.join(dir, '.hivemind', 'phases', 'TEMPLATE.md'),
      opts.templateFile);
  }
  if (opts.designDocs) {
    fs.mkdirSync(path.join(dir, '.hivemind', 'designs'), { recursive: true });
    for (const d of opts.designDocs) {
      fs.writeFileSync(path.join(dir, '.hivemind', 'designs', d.name),
        d.text);
    }
  }
  git('add -A && git commit -qm base');
  git('branch phase/4');
  git('checkout -q phase/4');
  fs.writeFileSync(path.join(dir, 'phase-work.txt'), 'phase 4 work\n');
  if (opts.redSuite) {
    fs.writeFileSync(path.join(dir, 'tests', 'green.test.mjs'), RED_TEST);
  }
  git('add -A && git commit -qm "phase work"');
  git('checkout -q main');
  if (opts.origin) {
    const bare = `${dir}-origin.git`;
    execSync(`git init --bare -q -b main "${bare}"`, { encoding: 'utf8' });
    git(`remote add origin "${bare}"`);
  }
  return { dir, git };
}

function decisionsFile(dir, n, name = 'decisions.txt') {
  // outside the fixture repo — an assembled working file is not
  // repo content until the inventory command writes the store
  const src = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-phase-dec-'));
  const file = path.join(src, name);
  const lines = [];
  for (let i = 1; i <= n; i++) {
    lines.push(`D${i} · decision number ${i} · .hivemind/decisions/rec-${i}.md`);
  }
  fs.writeFileSync(file, lines.join('\n') + '\n');
  return file;
}

// decisions with provenance prefixes (the D5 split's input):
// [{ prefix: 'kickoff', n: 9 }, …] → one line per decision
function prefixedDecisionsFile(pairs) {
  const src = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-phase-dec-'));
  const file = path.join(src, 'decisions.txt');
  const lines = [];
  let id = 0;
  for (const p of pairs) {
    for (let i = 0; i < p.n; i++) {
      id++;
      lines.push(`D${id} · ${p.prefix}: ruling ${i + 1} · rec-${id}.md`);
    }
  }
  fs.writeFileSync(file, lines.join('\n') + '\n');
  return file;
}

// a design doc with a machine block the design.sh state machine
// accepts (implement refuses anything but picked-up)
function designDocText(status, merge = '-') {
  return [
    '# Design: fixture', '',
    '<!-- machine',
    `status: ${status}`,
    'phase: P4',
    'hash: -',
    `merge: ${merge}`,
    '-->', '',
    '## Goal', '',
    'fixture design body — close-stamp test', '',
  ].join('\n');
}

// a one-row phase board; designsCell is the row's designs cell
function phasesBoard(designsCell) {
  return [
    '# Phases — fixture', '',
    '| id | description | status | designs | plan | owner | escalations |',
    '|---|---|---|---|---|---|---|',
    `| P4 | fixture phase | in-progress | ${designsCell} | — | — | — |`,
    '',
  ].join('\n');
}

function runInventory(fx, n) {
  const file = decisionsFile(fx.dir, n);
  return run(['phase', 'inventory', '4', '--decisions', file,
    '--root', fx.dir]);
}

const decPathOf = (fx) =>
  path.join(fx.dir, '.hivemind', 'logbook', `${PLAN_SLUG}-decisions.toon`);

const worktreePaths = (fx) =>
  fx.git('worktree list --porcelain').split('\n')
    .filter((l) => l.startsWith('worktree '))
    .map((l) => l.slice(9).trim());

// ---- AXI battery ----

test('help exits 0 with per-subcommand usage', () => {
  const r = run(['phase', 'help']);
  assert.equal(r.code, 0);
  assert.match(r.out, /usage:/);
  assert.match(r.out, /close <phase-id> \[--check\]/);
  assert.match(r.out, /under-asked\s+kickoff — front-load harder next phase/);
});

test('bare bee phase lists phases (content first, aggregate header)', () => {
  const fx = fixtureRepo();
  const r = run(['phase', '--root', fx.dir]);
  assert.equal(r.code, 0);
  assert.match(r.out, /^1 phase\n/);
  assert.match(r.out, new RegExp(`P4 · ${PLAN_SLUG} · fixture close plan`));
  // populated list output stays lean (AXI P1/P9 split — review r1)
  assert.ok(!r.out.includes('next:'));
});

test('list: definitive empty state over a bare dir', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-phase-empty-'));
  const r = run(['phase', 'list', '--root', dir]);
  assert.equal(r.code, 0);
  assert.match(r.out, /^0 phases\n/);
  assert.match(r.out, /fix:/);
});

test('unknown subcommand → exit 1 + usage', () => {
  const r = run(['phase', 'frobnicate']);
  assert.equal(r.code, 1);
  assert.match(r.err, /unknown subcommand 'frobnicate'/);
  assert.match(r.err, /usage:/);
});

test('unknown flag → exit 1 + usage', () => {
  const fx = fixtureRepo();
  const r = run(['phase', 'close', '4', '--bogus', '--root', fx.dir]);
  assert.equal(r.code, 1);
  assert.match(r.err, /usage:/);
});

// ---- inventory ----

test('inventory writes the .toon: header + verbatim decision lines', () => {
  const fx = fixtureRepo();
  const r = runInventory(fx, 3);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /^3 decisions · P4 · /);
  assert.match(r.out, new RegExp(`wrote: .*${PLAN_SLUG}-decisions\\.toon`));
  const text = fs.readFileSync(decPathOf(fx), 'utf8');
  assert.match(text, /^# decisions — P4 close inventory \(plan: /m);
  assert.match(text, /^phase: P4$/m);
  assert.match(text, /^plan: \.hivemind\/plans\/'?\.?/m);
  assert.match(text, new RegExp(`^plan: \\.hivemind/plans/${PLAN_SLUG}\\.md$`, 'm'));
  assert.match(text, /^count: 3$/m);
  assert.match(text, /^assembled: \S+ by bee$/m);
  assert.match(text,
    /^D2 · decision number 2 · \.hivemind\/decisions\/rec-2\.md$/m);
});

test('inventory: P<n> and phase/<n> id forms accepted', () => {
  const fx = fixtureRepo();
  const file = decisionsFile(fx.dir, 1);
  for (const id of ['P4', 'phase/4']) {
    const r = run(['phase', 'inventory', id, '--decisions', file,
      '--root', fx.dir]);
    assert.equal(r.code, 0, r.err);
  }
});

test('inventory --check writes nothing, previews the file', () => {
  const fx = fixtureRepo();
  const file = decisionsFile(fx.dir, 2);
  const r = run(['phase', 'inventory', '4', '--decisions', file,
    '--check', '--root', fx.dir]);
  assert.equal(r.code, 0);
  assert.match(r.out, /--check: would write .* \(2 decisions\)/);
  assert.equal(fs.existsSync(decPathOf(fx)), false);
});

test('inventory refuses a missing decisions file → exit 1 + fix', () => {
  const fx = fixtureRepo();
  const r = run(['phase', 'inventory', '4',
    '--decisions', path.join(fx.dir, 'nope.txt'), '--root', fx.dir]);
  assert.equal(r.code, 1);
  assert.match(r.err, /cannot read/);
  assert.match(r.err, /fix:/);
});

test('inventory refuses without --decisions → usage error', () => {
  const fx = fixtureRepo();
  const r = run(['phase', 'inventory', '4', '--root', fx.dir]);
  assert.equal(r.code, 1);
  assert.match(r.err, /--decisions <file> is required/);
  assert.match(r.err, /fix:/);
});

test('inventory refuses malformed lines → exit 1 naming the line', () => {
  const fx = fixtureRepo();
  const file = path.join(fx.dir, 'bad.txt');
  fs.writeFileSync(file,
    'D1 · good line · path.md\nD2 missing separators\n');
  const r = run(['phase', 'inventory', '4', '--decisions', file,
    '--root', fx.dir]);
  assert.equal(r.code, 1);
  assert.match(r.err, /line 2 is not 'id · one-line · source-record-path'/);
  assert.match(r.err, /fix:/);
  assert.equal(fs.existsSync(decPathOf(fx)), false);
});

test('inventory refuses unknown phase → exit 1 + phases listed', () => {
  const fx = fixtureRepo();
  const file = decisionsFile(fx.dir, 1);
  const r = run(['phase', 'inventory', '6', '--decisions', file,
    '--root', fx.dir]);
  assert.equal(r.code, 1);
  assert.match(r.err, /no plan for phase P6/);
  assert.match(r.err, /phases with plans here: P4/);
  assert.match(r.err, /fix:/);
});

test('inventory refuses ambiguous phase (two plans claim P4)', () => {
  const fx = fixtureRepo();
  fs.writeFileSync(path.join(fx.dir, '.hivemind', 'plans',
    `${PLAN_SLUG}-v2.md`), planText('node --test tests/green.test.mjs'));
  const file = decisionsFile(fx.dir, 1);
  const r = run(['phase', 'inventory', '4', '--decisions', file,
    '--root', fx.dir]);
  assert.equal(r.code, 1);
  assert.match(r.err, /2 plans claim P4/);
  assert.match(r.err, /fix:/);
});

test('inventory re-run replaces the file (idempotent write)', () => {
  const fx = fixtureRepo();
  runInventory(fx, 5);
  const r = runInventory(fx, 5);
  assert.equal(r.code, 0, r.err);
  const text = fs.readFileSync(decPathOf(fx), 'utf8');
  assert.match(text, /^count: 5$/m);
  assert.equal(text.match(/^D\d+ ·/gm).length, 5);
});

// ---- close: --check ----

test('close --check prints the plan, touches no git', () => {
  const fx = fixtureRepo();
  runInventory(fx, 9); // untracked .toon — exempt pre-close dirt
  const pwt = `${fx.dir}-phase`;
  fx.git(`worktree add "${pwt}" phase/4`);
  const mainBefore = fx.git('rev-parse main').trim();
  const branchBefore = fx.git('rev-parse phase/4').trim();
  const r = run(['phase', 'close', '4', '--check', '--root', fx.dir]);
  assert.equal(r.code, 0, r.out + r.err);
  assert.match(r.out, /1 · gate · phase\/4 @ \w+ · suite PASS/);
  assert.match(r.out, /2 · merge · would --no-ff phase\/4 → main \(main @ \w+\)/);
  assert.match(r.out, new RegExp(`3 · rest · would detach ${pwt} at main`));
  assert.match(r.out, /4 · branch · would delete phase\/4/);
  assert.match(r.out, /decisions: 9/);
  assert.match(r.out, /flag: under-asked kickoff — front-load harder next phase/);
  assert.match(r.out, /6 · push · no remote 'origin' — would skip/);
  assert.equal(fx.git('rev-parse main').trim(), mainBefore);
  assert.equal(fx.git('rev-parse phase/4').trim(), branchBefore);
  assert.equal(fx.git('branch --show-current', pwt).trim(), 'phase/4');
  assert.deepEqual(worktreePaths(fx).sort(),
    [fx.dir, pwt].sort()); // suite ran at the clean persistent wt
});

test('close --check without worktree: rest step reports skip', () => {
  const fx = fixtureRepo();
  runInventory(fx, 8);
  const r = run(['phase', 'close', '4', '--check', '--root', fx.dir]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /3 · rest · no worktree on phase\/4 — would skip/);
  assert.match(r.out, /decisions: 8/);
  assert.doesNotMatch(r.out, /flag:/);
  assert.match(r.out, /6 · push · no remote 'origin' — would skip/);
  // the suite gate's throwaway worktree is gone
  assert.deepEqual(worktreePaths(fx), [fx.dir]);
});

// ---- close: refusals ----

test('close refuses unmerged work (dirty main checkout) → exit 1 + fix', () => {
  const fx = fixtureRepo();
  runInventory(fx, 9);
  fs.writeFileSync(path.join(fx.dir, 'junk.txt'), 'unmerged work\n');
  const mainBefore = fx.git('rev-parse main').trim();
  const r = run(['phase', 'close', '4', '--root', fx.dir]);
  assert.equal(r.code, 1);
  assert.match(r.out, /2 · merge · FAIL · uncommitted work/);
  assert.match(r.out, /junk\.txt/);
  assert.match(r.out, /fix:/);
  assert.equal(fx.git('rev-parse main').trim(), mainBefore);
  fx.git('rev-parse --verify phase/4'); // branch intact
});

test('the decision inventory itself is exempt from the clean-tree gate', () => {
  const fx = fixtureRepo();
  runInventory(fx, 9); // leaves the .toon untracked — nothing else
  const r = run(['phase', 'close', '4', '--check', '--root', fx.dir]);
  assert.equal(r.code, 0, r.out);
});

test('close refuses a dirty persistent worktree → step 3 fix line', () => {
  const fx = fixtureRepo();
  runInventory(fx, 9);
  const pwt = `${fx.dir}-phase`;
  fx.git(`worktree add "${pwt}" phase/4`);
  fs.writeFileSync(path.join(pwt, 'stray.txt'), 'phase-side dirt\n');
  const r = run(['phase', 'close', '4', '--check', '--root', fx.dir]);
  assert.equal(r.code, 1);
  assert.match(r.out, /3 · rest · FAIL · worktree .* has uncommitted work/);
  assert.match(r.out, /fix:/);
});

test('suite-gate failure blocks close (no merge, branch intact)', () => {
  const fx = fixtureRepo({ redSuite: true });
  runInventory(fx, 9);
  const mainBefore = fx.git('rev-parse main').trim();
  const r = run(['phase', 'close', '4', '--root', fx.dir]);
  assert.equal(r.code, 1);
  assert.match(r.out, /1 · gate · FAIL · suite '.*' exit 1/);
  assert.match(r.out, /fix: run '.*' at the phase\/4 tree/);
  assert.equal(fx.git('rev-parse main').trim(), mainBefore);
  fx.git('rev-parse --verify phase/4');
  assert.deepEqual(worktreePaths(fx), [fx.dir]); // temp worktree cleaned
});

test('close refuses when the phase branch is missing → exit 1 + fix', () => {
  const fx = fixtureRepo();
  runInventory(fx, 9);
  const r = run(['phase', 'close', '5', '--root', fx.dir]);
  assert.equal(r.code, 1);
  assert.match(r.out, /1 · gate · FAIL · no branch phase\/5 \(local: main, phase\/4\)/);
  assert.match(r.out, /fix:/);
});

test('close refuses when not on main → names the main checkout', () => {
  const fx = fixtureRepo();
  runInventory(fx, 9);
  fx.git('checkout -q phase/4');
  const r = run(['phase', 'close', '4', '--root', fx.dir]);
  assert.equal(r.code, 1);
  assert.match(r.out, /2 · merge · FAIL .*on 'phase\/4'/);
  assert.match(r.out, new RegExp(`fix: run from the main checkout on main — ${fx.dir}`));
  fx.git('checkout -q main');
});

test('close refuses when no decision inventory exists → inventory fix line', () => {
  const fx = fixtureRepo();
  const r = run(['phase', 'close', '4', '--check', '--root', fx.dir]);
  assert.equal(r.code, 1);
  assert.match(r.out, /5 · card · FAIL · no decision inventory/);
  assert.match(r.out, /fix: assemble the decisions file, then run bee phase inventory 4/);
});

test('merge conflicts abort cleanly → main restored, fix line', () => {
  const fx = fixtureRepo();
  runInventory(fx, 9);
  fs.writeFileSync(path.join(fx.dir, 'phase-work.txt'), 'conflicting main-side work\n');
  fx.git('add -A && git commit -qm "main diverges"');
  const mainBefore = fx.git('rev-parse main').trim();
  const r = run(['phase', 'close', '4', '--root', fx.dir]);
  assert.equal(r.code, 1);
  assert.match(r.out, /2 · merge · FAIL/);
  assert.match(r.out, /merge aborted — main restored to/);
  assert.match(r.out, /fix:/);
  assert.equal(fx.git('rev-parse main').trim(), mainBefore);
  assert.throws(() => fx.git('rev-parse -q --verify MERGE_HEAD'));
  fx.git('rev-parse --verify phase/4');
});

// ---- close: the real run (fixture repos only) ----

test('close: full scripted run — no-ff merge, rest, delete, card, push', () => {
  const fx = fixtureRepo({ origin: true });
  runInventory(fx, 9);
  const pwt = `${fx.dir}-phase`;
  fx.git(`worktree add "${pwt}" phase/4`);
  const mainBefore = fx.git('rev-parse main').trim();
  const phaseBefore = fx.git('rev-parse phase/4').trim();
  const r = run(['phase', 'close', '4', '--root', fx.dir]);
  assert.equal(r.code, 0, r.out + r.err);
  // real merge commit, never a fast-forward: two parents
  const parents = fx.git('rev-list --parents -n 1 main').trim()
    .split(' ');
  assert.equal(parents.length, 3, `two parents, got: ${parents}`);
  assert.equal(parents[1], mainBefore);
  assert.equal(parents[2], phaseBefore);
  assert.ok(fs.existsSync(path.join(fx.dir, 'phase-work.txt')));
  assert.match(r.out, /2 · merge · --no-ff phase\/4 → main · \w+/);
  // persistent worktree rests detached at main
  assert.equal(fx.git('rev-parse HEAD', pwt).trim(),
    fx.git('rev-parse main').trim());
  assert.equal(fx.git('branch --show-current', pwt).trim(), '');
  assert.match(r.out, new RegExp(`3 · rest · ${pwt} detached at main`));
  // branch deleted
  assert.throws(() => fx.git('rev-parse --verify phase/4'));
  assert.match(r.out, /4 · branch · deleted phase\/4/);
  // card: count + calibration flag at 9 fixture decisions
  assert.match(r.out, /5 · close card · P4/);
  assert.match(r.out, /decisions: 9/);
  assert.match(r.out, /flag: under-asked kickoff — front-load harder next phase/);
  // push: origin/main advanced to the merge
  assert.match(r.out, /6 · push · origin main · pushed/);
  // AXI 9: the mutation output ends with one next-step line
  assert.match(r.out, /next: bee phase list shows what remains\n$/);
  assert.equal(fx.git('rev-parse origin/main').trim(),
    fx.git('rev-parse main').trim());
  // no leftover worktrees beyond main + the rested persistent one
  assert.equal(worktreePaths(fx).length, 2);
  // re-running --check now reports the missing branch
  const again = run(['phase', 'close', '4', '--check', '--root', fx.dir]);
  assert.equal(again.code, 1);
  assert.match(again.out, /no branch phase\/4/);
});

test('close at 8 decisions: count emitted, flag silent, push skipped', () => {
  const fx = fixtureRepo();
  runInventory(fx, 8);
  const r = run(['phase', 'close', '4', '--root', fx.dir]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /decisions: 8/);
  assert.doesNotMatch(r.out, /flag:/);
  assert.match(r.out, /6 · push · skipped — no remote 'origin'/);
  assert.match(r.out, /3 · rest · no worktree on phase\/4 — skipped/);
});

test('close reads the inventory from the phase tree when main lacks it', () => {
  const fx = fixtureRepo();
  const file = decisionsFile(fx.dir, 9);
  // inventory onto the phase branch (committed there), not main
  fx.git('checkout -q phase/4');
  const inv = run(['phase', 'inventory', '4', '--decisions', file,
    '--root', fx.dir]);
  assert.equal(inv.code, 0, inv.err);
  fx.git('add -A && git commit -qm "decision inventory"');
  fx.git('checkout -q main');
  assert.equal(fs.existsSync(decPathOf(fx)), false); // absent on main
  const r = run(['phase', 'close', '4', '--root', fx.dir]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /decisions: 9/);
  assert.match(r.out, /flag: under-asked kickoff — front-load harder next phase/);
});

// ---- close: flag split (P8 Task 2, D5) ----

test('close splits decision counts; flag fires only on in-phase', () => {
  // 9 front-loaded (kickoff + plan-time) + 3 in-phase → no flag
  const fx = fixtureRepo();
  let r = run(['phase', 'inventory', '4', '--decisions',
    prefixedDecisionsFile([
      { prefix: 'kickoff', n: 6 },
      { prefix: 'plan-time', n: 3 },
      { prefix: 'review-driven', n: 3 },
    ]), '--root', fx.dir]);
  assert.equal(r.code, 0, r.err);
  r = run(['phase', 'close', '4', '--check', '--root', fx.dir]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /decisions: 12 \(front-loaded 9 · in-phase 3\)/);
  assert.doesNotMatch(r.out, /flag:/);
  // 3 front-loaded + 9 in-phase → flag fires (in-phase > 8, dominant)
  const fx2 = fixtureRepo();
  r = run(['phase', 'inventory', '4', '--decisions',
    prefixedDecisionsFile([
      { prefix: 'kickoff', n: 3 },
      { prefix: 'dogfood', n: 9 },
    ]), '--root', fx2.dir]);
  assert.equal(r.code, 0, r.err);
  r = run(['phase', 'close', '4', '--root', fx2.dir]);
  assert.equal(r.code, 0, r.out + r.err);
  assert.match(r.out, /decisions: 12 \(front-loaded 3 · in-phase 9\)/);
  assert.match(r.out, /flag: under-asked kickoff — front-load harder next phase/);
});

// ---- close: phase-row flip + design stamps (P8 Task 2) ----

test('close flips the phase row with the close note; re-close is a no-op', () => {
  const fx = fixtureRepo({ phasesFile: phasesBoard('—') });
  runInventory(fx, 3);
  let r = run(['phase', 'close', '4', '--check', '--root', fx.dir]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out,
    /  phase row: would flip P4 in-progress → done \(\.hivemind\/phases\/phases\.md\)/);
  assert.match(r.out, /  designs: none linked in the P4 row/);
  r = run(['phase', 'close', '4', '--root', fx.dir]);
  assert.equal(r.code, 0, r.out + r.err);
  const mergeSha = fx.git('rev-parse --short main').trim();
  assert.match(r.out,
    /  phase row: P4 in-progress → done \(\.hivemind\/phases\/phases\.md\)/);
  assert.match(r.out, /next: commit the phase-row flip\n$/);
  const board = path.join(fx.dir, '.hivemind', 'phases', 'phases.md');
  assert.match(fs.readFileSync(board, 'utf8'), new RegExp(
    '^\\| P4 \\| fixture phase \\| done \\| — \\| — \\| — \\| ' +
    `close via bee phase close 4 \\(merge ${mergeSha}\\) \\|$`, 'm'));
  // second close — flip committed, branch re-created at main: the
  // already-merged path meets a done row → no-op, byte-identical
  fx.git('add -A && git commit -qm "phase row flip"');
  fx.git('branch phase/4 main');
  const before = fs.readFileSync(board, 'utf8');
  r = run(['phase', 'close', '4', '--root', fx.dir]);
  assert.equal(r.code, 0, r.out + r.err);
  assert.match(r.out, /2 · merge · already merged \(no merge commit\)/);
  assert.match(r.out, /  phase row: P4 already done — no-op/);
  assert.equal(fs.readFileSync(board, 'utf8'), before);
  assert.match(r.out, /next: bee phase list shows what remains\n$/);
});

test('close stamps unstamped design docs; pre-stamped untouched', () => {
  const fx = fixtureRepo({
    phasesFile: phasesBoard(
      '`designs/design-a.md` (implemented @ aaaaaaa) · `designs/design-b.md`'),
    designDocs: [
      { name: 'design-a.md', text: designDocText('implemented', 'aaaaaaa') },
      { name: 'design-b.md', text: designDocText('picked-up') },
    ],
  });
  runInventory(fx, 2);
  const r = run(['phase', 'close', '4', '--root', fx.dir]);
  assert.equal(r.code, 0, r.out + r.err);
  const mergeSha = fx.git('rev-parse --short main').trim();
  // row: flipped + only the unstamped entry annotated
  const board = fs.readFileSync(
    path.join(fx.dir, '.hivemind', 'phases', 'phases.md'), 'utf8');
  assert.match(board, /\| P4 \| fixture phase \| done \|/);
  assert.ok(board.includes('`designs/design-a.md` (implemented @ aaaaaaa)'));
  assert.ok(board.includes(`\`designs/design-b.md\` (implemented @ ${mergeSha})`));
  // doc b: machine block stamped in the closed repo
  const docB = fs.readFileSync(
    path.join(fx.dir, '.hivemind', 'designs', 'design-b.md'), 'utf8');
  assert.match(docB, /^status: implemented$/m);
  assert.match(docB, new RegExp(`^merge: ${mergeSha}$`, 'm'));
  // doc a: untouched
  assert.equal(fs.readFileSync(
    path.join(fx.dir, '.hivemind', 'designs', 'design-a.md'), 'utf8'),
  designDocText('implemented', 'aaaaaaa'));
  assert.match(r.out,
    new RegExp(`designs: \\.hivemind/designs/design-b\\.md — stamped ` +
      `\\(implemented @ ${mergeSha}\\)`));
  assert.match(r.out, /next: commit the phase-row flip\n$/);
});

test('design-stamp refusal is informational — close still succeeds', () => {
  const fx = fixtureRepo({
    phasesFile: phasesBoard('`designs/design-live.md`'),
    designDocs: [{ name: 'design-live.md', text: designDocText('live') }],
  });
  runInventory(fx, 2);
  const r = run(['phase', 'close', '4', '--root', fx.dir]);
  assert.equal(r.code, 0, r.out + r.err);
  assert.match(r.out,
    /  note: implement \.hivemind\/designs\/design-live\.md: refused — status is 'live' \(must be picked-up\)/);
  // the row still flips; the refused entry gains no annotation
  const board = fs.readFileSync(
    path.join(fx.dir, '.hivemind', 'phases', 'phases.md'), 'utf8');
  assert.match(board, /\| P4 \| fixture phase \| done \|/);
  assert.ok(!board.includes('(implemented @'));
  assert.match(r.out, /next: commit the phase-row flip\n$/);
});

test('close ignores TEMPLATE.md when finding the phase row', () => {
  // byte-sort puts TEMPLATE.md before lowercase-named boards — its
  // example row must never win the scan (review r1 should-fix)
  const fx = fixtureRepo({
    phasesFile: phasesBoard('—'),
    templateFile: [
      '# Phases — template', '',
      '| id | description | status | designs | plan | owner | escalations |',
      '|---|---|---|---|---|---|---|',
      '| P4 | example row — never flip | planned | — | — | — | — |',
      '',
    ].join('\n'),
  });
  runInventory(fx, 3);
  const r = run(['phase', 'close', '4', '--root', fx.dir]);
  assert.equal(r.code, 0, r.out + r.err);
  const board = fs.readFileSync(
    path.join(fx.dir, '.hivemind', 'phases', 'phases.md'), 'utf8');
  assert.match(board, /\| P4 \| fixture phase \| done \|/);
  const tmpl = fs.readFileSync(
    path.join(fx.dir, '.hivemind', 'phases', 'TEMPLATE.md'), 'utf8');
  assert.match(tmpl, /\| P4 \| example row — never flip \| planned \|/);
  assert.ok(!tmpl.includes('close via'));
});

test('recovery: refused implement on an already-stamped doc recovers the row annotation', () => {
  // crash-recovery shape (review r1 should-fix): a previous run
  // stamped the doc, then failed its row write — the row entry is
  // still bare; design.sh refuses; the annotation recovers from
  // the doc's machine block
  const fx = fixtureRepo({
    phasesFile: phasesBoard('`designs/design-done.md`'),
    designDocs: [
      { name: 'design-done.md', text: designDocText('implemented', '0aaaaaa') },
    ],
  });
  runInventory(fx, 2);
  const r = run(['phase', 'close', '4', '--root', fx.dir]);
  assert.equal(r.code, 0, r.out + r.err);
  assert.match(r.out, /designs: \.hivemind\/designs\/design-done\.md — recovered \(implemented @ 0aaaaaa\)/);
  const board = fs.readFileSync(
    path.join(fx.dir, '.hivemind', 'phases', 'phases.md'), 'utf8');
  assert.ok(board.includes('`designs/design-done.md` (implemented @ 0aaaaaa)'));
  const doc = fs.readFileSync(
    path.join(fx.dir, '.hivemind', 'designs', 'design-done.md'), 'utf8');
  assert.match(doc, /^merge: 0aaaaaa$/m);
});

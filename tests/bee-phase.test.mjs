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

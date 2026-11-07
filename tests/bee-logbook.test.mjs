// bee logbook — stamp + index + compact battery (P5 Tasks 2–3).
// Every run goes through tmp-dir --logbook fixtures (git
// sandboxes for the date/hash sources, tests/bee-worktree.test.mjs
// patterns); nothing touches the live .hivemind/logbook.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { run } from '../bin/bee.js';

// git sandbox: throwaway repo, identity configured, logbook dir
// seeded inside it (the logbook's date/hash sources are git).
function sandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-lb-'));
  const git = (...args) => execFileSync('git', args,
    { cwd: dir, encoding: 'utf8' }).trim();
  git('init', '-b', 'main');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'test');
  git('config', 'commit.gpgsign', 'false');
  const lb = path.join(dir, 'logbook');
  fs.mkdirSync(lb);
  return { dir, lb, git };
}

// plain fixture dir — no git, for index-only cases.
function plainLogbook() {
  const lb = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'bee-lb-')),
    'logbook');
  fs.mkdirSync(lb);
  return lb;
}

function entry(lb, name, body) {
  fs.writeFileSync(path.join(lb, name), body);
}

// legacy (blockless) corpus shape: title, Role: line (either
// form), prose, **Verdict:** line.
function legacyBody(roleLine, opts = {}) {
  return '# Verify record — fixture\n\n' +
    `${roleLine}\n\nwork happened\n\n` +
    (opts.noVerdict ? '' : '**Verdict:** PASS\n') +
    '**Log:** inline above\n';
}

const stamp = (lb, ...extra) =>
  run(['logbook', 'stamp', '--logbook', lb, ...extra]);

// bare invocation = index (content first)
const index = (lb) => run(['logbook', '--logbook', lb]);

const read = (lb, name) =>
  fs.readFileSync(path.join(lb, name), 'utf8');

// name → content snapshot; proves writes happened (or didn't).
const snapshot = (lb) =>
  fs.readdirSync(lb).sort()
    .map((n) => [n, read(lb, n)]);

test('filename parse: stem → plan path, n → task', () => {
  const s = sandbox();
  entry(s.lb, '2026-11-02-x-demo-task3-verify-r1.md',
    legacyBody('**Role:** project-orchestrator'));
  s.git('add', '.');
  s.git('commit', '-m', 'seed');
  const r = stamp(s.lb);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /stamped: 2026-11-02-x-demo-task3-verify-r1\.md/);
  const t = read(s.lb, '2026-11-02-x-demo-task3-verify-r1.md');
  assert.match(t, /^<!-- machine\n/);
  assert.match(t, /task: task-3\n/);
  // stem from the filename → plan path; plan never committed → '-'
  assert.match(t, /plan: \.hivemind\/plans\/2026-11-02-x-demo\.md @ -\n/);
  assert.match(t, /checks-run: -\n/);
  assert.match(t, /links: -\n/);
});

test('role stamps from BOTH corpus forms (plain + bold)', () => {
  const s = sandbox();
  entry(s.lb, '2026-11-02-x-demo-task1-verify-r1.md',
    legacyBody('Role: power-planner')); // plain form
  entry(s.lb, '2026-11-02-x-demo-task2-review-r1.md',
    legacyBody('**Role:** project-orchestrator (loop; dispatch)'));
  s.git('add', '.');
  s.git('commit', '-m', 'seed');
  const r = stamp(s.lb);
  assert.equal(r.code, 0, r.out);
  assert.match(read(s.lb, '2026-11-02-x-demo-task1-verify-r1.md'),
    /role: power-planner\n/);
  // bold + parenthetical: role stops at the space before '('
  assert.match(read(s.lb, '2026-11-02-x-demo-task2-review-r1.md'),
    /role: project-orchestrator\n/);
});

test('date mints from the file\'s git history (%cI of last commit)', () => {
  const s = sandbox();
  // plan committed first — its commit is the plan-hash source
  fs.mkdirSync(path.join(s.dir, '.hivemind', 'plans'),
    { recursive: true });
  fs.writeFileSync(
    path.join(s.dir, '.hivemind', 'plans', '2026-11-02-x-demo.md'),
    '# plan\n');
  s.git('add', '.');
  s.git('commit', '-m', 'plan');
  const planHash = s.git('log', '-1', '--format=%h',
    '--', '.hivemind/plans/2026-11-02-x-demo.md');
  entry(s.lb, '2026-11-02-x-demo-task1-verify-r1.md',
    legacyBody('**Role:** bee'));
  s.git('add', '.');
  execFileSync('git', ['commit', '-m', 'entry'], {
    cwd: s.dir, encoding: 'utf8',
    env: { ...process.env,
      // committer date is the %cI source; author differs on purpose
      GIT_COMMITTER_DATE: '2026-11-02T10:00:00+11:00',
      GIT_AUTHOR_DATE: '2026-11-02T09:00:00+11:00' },
  });
  const r = stamp(s.lb);
  assert.equal(r.code, 0, r.out);
  const t = read(s.lb, '2026-11-02-x-demo-task1-verify-r1.md');
  assert.match(t, /date: 2026-11-02T10:00:00\+11:00\n/);
  assert.match(t,
    new RegExp(`plan: \\.hivemind/plans/2026-11-02-x-demo\\.md @ ` +
      `${planHash}\\n`));
});

test('missing role/verdict → hand-fix list, exit 1, names files', () => {
  const s = sandbox();
  entry(s.lb, '2026-11-02-x-demo-task1-verify-r1.md',
    legacyBody('**Role:** bee', { noVerdict: true }));
  entry(s.lb, '2026-11-02-x-demo-task2-verify-r1.md',
    '# Review — fixture\n\nno role line in this body\n\n' +
    '**Verdict:** PASS\n');
  s.git('add', '.');
  s.git('commit', '-m', 'seed');
  const r = stamp(s.lb);
  assert.equal(r.code, 1, r.out);
  assert.match(r.out,
    /hand-fix: 2026-11-02-x-demo-task1-verify-r1\.md — missing verdict/);
  assert.match(r.out,
    /hand-fix: 2026-11-02-x-demo-task2-verify-r1\.md — missing role/);
  assert.match(r.out, /fix: hand-add the missing machine lines/);
  // unstampable files stay untouched
  assert.ok(!read(s.lb, '2026-11-02-x-demo-task1-verify-r1.md')
    .includes('<!-- machine'));
  assert.ok(!read(s.lb, '2026-11-02-x-demo-task2-verify-r1.md')
    .includes('<!-- machine'));
});

test('stamped entry missing task/links → topped up from filename', () => {
  const s = sandbox();
  const name = '2026-11-02-x-demo-task6-verify-r2.md';
  entry(s.lb, name, '# Verify r2 — fixture\n\n<!-- machine\n' +
    'role: project-orchestrator\n' +
    'date: 2026-11-01T14:40:44+11:00\n' +
    'verdict: PASS\n' +
    'checks-run: 1\n' +
    'plan: .hivemind/plans/2026-11-02-x-demo.md @ abc1234\n' +
    '-->\n\nbody prose stays\n');
  s.git('add', '.');
  s.git('commit', '-m', 'seed');
  const r = stamp(s.lb);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /topped-up: 2026-11-02-x-demo-task6-verify-r2\.md/);
  const t = read(s.lb, name);
  // inserted after plan: (header field order), existing fields byte-kept
  assert.match(t,
    /plan: \.hivemind\/plans\/2026-11-02-x-demo\.md @ abc1234\ntask: task-6\nlinks: -\n-->/);
  assert.ok(!t.includes('checks-run: -'));
  assert.ok(t.endsWith('body prose stays\n'));
});

test('quoted machine block inside a fence is not the file\'s own', () => {
  const s = sandbox();
  const name = '2026-11-02-x-demo-task4-verify-r1.md';
  // complete machine block QUOTED as evidence: task:/links: and
  // all — a naive scan would read it as the file's own and skip
  // the file as complete; the fence makes it a quote, so the
  // file is legacy and gets stamped.
  entry(s.lb, name, '# Verify record — fixture\n\n' +
    '**Role:** bee\n\nquoted block as evidence:\n\n' +
    '```markdown\n' +
    '<!-- machine\n' +
    'role: bee\n' +
    'date: 2026-11-01T09:00:00+11:00\n' +
    'verdict: PASS\n' +
    'checks-run: 1\n' +
    'plan: .hivemind/plans/2026-11-02-x-demo.md @ abc1234\n' +
    'task: task-4\n' +
    'links: -\n' +
    '-->\n' +
    '```\n\n' +
    '**Verdict:** PASS\n');
  s.git('add', '.');
  s.git('commit', '-m', 'seed');
  const r = stamp(s.lb);
  assert.equal(r.code, 0, r.out);
  // treated as legacy — stamped, not skipped as complete
  assert.match(r.out, /stamped: 2026-11-02-x-demo-task4-verify-r1\.md/);
  const t = read(s.lb, name);
  // fresh block minted at the top; the quote stays in the body
  assert.match(t, /^<!-- machine\n/);
  assert.equal((t.match(/<!-- machine/g) ?? []).length, 2);
  assert.match(t, /quoted block as evidence:/);
});

test('non-matching filenames skipped + reported; exit unaffected', () => {
  const s = sandbox();
  entry(s.lb, '2026-11-02-x-demo-task1-2-verify-r1.md',
    legacyBody('**Role:** bee')); // multi-task range → not task-tier
  entry(s.lb, '2026-11-02-po-p3-calibration.md', 'calibration\n');
  entry(s.lb, '2026-11-02-x-demo-plan-review-r1.md',
    'plan review report\n');
  entry(s.lb, '2026-11-02-x-demo-task1-verify-r1.md',
    legacyBody('**Role:** bee'));
  s.git('add', '.');
  s.git('commit', '-m', 'seed');
  const r = stamp(s.lb);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /3 out-of-scope/);
  assert.match(r.out, /out-of-scope: 2026-11-02-x-demo-task1-2-verify-r1\.md/);
  assert.match(r.out, /out-of-scope: 2026-11-02-po-p3-calibration\.md/);
  assert.match(r.out, /out-of-scope: 2026-11-02-x-demo-plan-review-r1\.md/);
  // out-of-scope files untouched; the one stampable entry stamped
  assert.ok(!read(s.lb, '2026-11-02-po-p3-calibration.md')
    .includes('<!-- machine'));
  assert.equal((r.out.match(/^stamped: /gm) ?? []).length, 1);
});

test('index: TOON line per entry, sorted; missing task renders -', () => {
  const lb = plainLogbook();
  entry(lb, 'b-plan-task2-verify-r1.md',
    '<!-- machine\nrole: bee\ndate: 2026-11-02T10:00:00+11:00\n' +
    'verdict: FAIL\nchecks-run: 2\nplan: p @ h\ntask: task-2\n' +
    'links: -\n-->\nbody\n');
  entry(lb, 'a-plan-task1-review-r1.md',
    '<!-- machine\nrole: power-planner\n' +
    'date: 2026-11-01T09:00:00+11:00\nverdict: APPROVE\n' +
    'checks-run: 1\nplan: p @ h\n-->\nbody\n'); // no task/links yet
  entry(lb, 'c-plan-task3-verify-r1.md', '# legacy, no block\n'); // all '-'
  entry(lb, 'notes.md', 'not an entry\n'); // never indexed
  const before = snapshot(lb);
  const r = index(lb);
  assert.equal(r.code, 0, r.out);
  assert.equal(r.out,
    '3 entries\n' +
    'a-plan-task1-review-r1.md :: power-planner :: ' +
    '2026-11-01T09:00:00+11:00 :: - :: APPROVE\n' +
    'b-plan-task2-verify-r1.md :: bee :: ' +
    '2026-11-02T10:00:00+11:00 :: task-2 :: FAIL\n' +
    'c-plan-task3-verify-r1.md :: - :: - :: - :: -\n');
  assert.deepEqual(snapshot(lb), before); // writes nothing
});

test('index: missing logbook dir → definitive empty state', () => {
  const r = index(path.join(plainLogbook(), 'does-not-exist'));
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /^0 entries\n/);
});

test('stamp is idempotent: second run has nothing to do', () => {
  const s = sandbox();
  entry(s.lb, '2026-11-02-x-demo-task1-verify-r1.md',
    legacyBody('**Role:** bee'));
  s.git('add', '.');
  s.git('commit', '-m', 'seed');
  assert.equal(stamp(s.lb).code, 0);
  const after1 = snapshot(s.lb);
  const r2 = stamp(s.lb);
  assert.equal(r2.code, 0, r2.out);
  assert.match(r2.out, /0 stamped · 0 topped-up · 0 hand-fix/);
  assert.deepEqual(snapshot(s.lb), after1); // nothing rewritten
});

test('stamp --check: same counts, writes nothing', () => {
  const s = sandbox();
  // one stampable (legacy, every field derivable) + one
  // top-up-able (block present, task:/links: missing)
  entry(s.lb, '2026-11-02-x-demo-task1-verify-r1.md',
    legacyBody('**Role:** bee'));
  entry(s.lb, '2026-11-02-x-demo-task2-verify-r1.md',
    '# Verify — fixture\n\n<!-- machine\n' +
    'role: bee\n' +
    'date: 2026-11-01T09:00:00+11:00\n' +
    'verdict: PASS\n' +
    'checks-run: 1\n' +
    'plan: .hivemind/plans/2026-11-02-x-demo.md @ abc1234\n' +
    '-->\n\nbody prose stays\n');
  s.git('add', '.');
  s.git('commit', '-m', 'seed');
  const before = snapshot(s.lb);
  const r = stamp(s.lb, '--check');
  assert.equal(r.code, 0, r.out);
  assert.match(r.out,
    /1 stamped · 1 topped-up · 0 hand-fix · 0 out-of-scope/);
  assert.match(r.out, /stamped: 2026-11-02-x-demo-task1-verify-r1\.md/);
  assert.match(r.out,
    /topped-up: 2026-11-02-x-demo-task2-verify-r1\.md \+ task, links/);
  // never writes: every file byte-identical
  assert.deepEqual(snapshot(s.lb), before);
});

// ---- compact (P5 Task 3) ----
// Plain tmp roots — compact's membership comes from the phase
// list, its rewrite targets from machine blocks; no git needed.

const MARKER = 'compacted at phase close; full text in git history';

function compactRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-lbcomp-'));
  fs.mkdirSync(path.join(root, 'logbook'));
  fs.mkdirSync(path.join(root, 'phases'));
  return root;
}

const lbOf = (root) => path.join(root, 'logbook');
const phasesOf = (root) => path.join(root, 'phases');

const PHASES_FIXTURE = [
  '# Phases — Fixture',
  '',
  '| id | description | status | designs | plan | owner | escalations |',
  '|---|---|---|---|---|---|---|',
  '| P1 | fixture phase one | done | — | .hivemind/plans/2026-11-02-x-one.md | — | — |',
  '| P2 | fixture phase two (no plan) | done | — | — | — | — |',
  '| P3 | fixture phase three | planned | — | .hivemind/plans/2026-11-02-x-three.md | — | — |',
  ''].join('\n');

// entry with a complete machine block naming <planPath>
function blockBody(planPath) {
  return '<!-- machine\n' +
    'role: bee\n' +
    'date: 2026-11-02T10:00:00+11:00\n' +
    'verdict: PASS\n' +
    'checks-run: 1\n' +
    `plan: ${planPath} @ abc1234\n` +
    'task: task-1\n' +
    'links: -\n' +
    '-->\n\n' +
    '# Verify record — fixture\n\nwork happened\n';
}

// the rewritten shape: machine block + blank + marker, EOF
const compactedForm = (orig) =>
  orig.split('-->\n')[0] + '-->\n\n' + MARKER + '\n';

const compact = (root, phase, ...extra) =>
  run(['logbook', 'compact', phase,
    '--logbook', lbOf(root), '--phases', phasesOf(root), ...extra]);

function seedCompactFixture() {
  const root = compactRoot();
  fs.writeFileSync(path.join(phasesOf(root), 'Fixture.md'),
    PHASES_FIXTURE);
  // HEADERLESS plan file — membership must come from the list,
  // never from the plan's own (absent) machine header
  fs.mkdirSync(path.join(root, '.hivemind', 'plans'),
    { recursive: true });
  fs.writeFileSync(
    path.join(root, '.hivemind', 'plans', '2026-11-02-x-one.md'),
    '# Plan one\n\nno machine header here\n');
  const one = '.hivemind/plans/2026-11-02-x-one.md';
  const three = '.hivemind/plans/2026-11-02-x-three.md';
  entry(lbOf(root), '2026-11-02-x-one-task1-verify-r1.md', blockBody(one));
  entry(lbOf(root), '2026-11-02-x-one-task2-review-r1.md', blockBody(one));
  entry(lbOf(root), '2026-11-02-x-three-task1-verify-r1.md',
    blockBody(three));
  // blockless, non-task-tier filename — out of scope, never
  // scanned, so its missing block is NOT a fail-loud
  entry(lbOf(root), '2026-11-02-x-one-calibration.md',
    'calibration record — no machine block\n');
  return { root, one, three };
}

test('compact: phase entries rewrite to block + marker; membership from the list', () => {
  const { root, one, three } = seedCompactFixture();
  const r = compact(root, 'P1');
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /2 entries · 2 compacted · 0 already/);
  assert.match(r.out, /compacted: 2026-11-02-x-one-task1-verify-r1\.md/);
  assert.match(r.out, /compacted: 2026-11-02-x-one-task2-review-r1\.md/);
  for (const n of ['2026-11-02-x-one-task1-verify-r1.md',
    '2026-11-02-x-one-task2-review-r1.md']) {
    assert.equal(read(lbOf(root), n), compactedForm(blockBody(one)));
  }
  // headerless plan file untouched by the pass
  assert.equal(fs.readFileSync(
    path.join(root, '.hivemind', 'plans', '2026-11-02-x-one.md'),
    'utf8'), '# Plan one\n\nno machine header here\n');
  // other-phase entry and out-of-scope file byte-identical
  assert.equal(read(lbOf(root), '2026-11-02-x-three-task1-verify-r1.md'),
    blockBody(three));
  assert.equal(read(lbOf(root), '2026-11-02-x-one-calibration.md'),
    'calibration record — no machine block\n');
});

test('compact is idempotent: marker-only second run exits 0 unchanged', () => {
  const { root } = seedCompactFixture();
  assert.equal(compact(root, 'P1').code, 0);
  const after1 = snapshot(lbOf(root));
  const r2 = compact(root, 'P1');
  assert.equal(r2.code, 0, r2.out);
  assert.match(r2.out, /2 entries · 0 compacted · 2 already/);
  assert.match(r2.out, /already compacted: 2026-11-02-x-one-task1-verify-r1\.md/);
  assert.deepEqual(snapshot(lbOf(root)), after1); // nothing rewritten
});

test('compact: unstamped task-tier file fails loud, writes nothing', () => {
  const { root } = seedCompactFixture();
  entry(lbOf(root), '2026-11-02-x-one-task3-verify-r1.md',
    '# Verify record — fixture\n\n**Role:** bee\n\nno machine block\n');
  const before = snapshot(lbOf(root));
  const r = compact(root, 'P1');
  assert.equal(r.code, 1);
  assert.ok(r.err.includes('2026-11-02-x-one-task3-verify-r1.md'), r.err);
  assert.match(r.err, /bee logbook stamp/);
  assert.deepEqual(snapshot(lbOf(root)), before); // no partial pass
});

test('compact --check: lists what would compact, writes nothing', () => {
  const { root } = seedCompactFixture();
  const before = snapshot(lbOf(root));
  const r = compact(root, 'P1', '--check');
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /2 entries · 2 to compact/);
  assert.match(r.out, /would compact: 2026-11-02-x-one-task1-verify-r1\.md/);
  assert.match(r.out, /would compact: 2026-11-02-x-one-task2-review-r1\.md/);
  assert.deepEqual(snapshot(lbOf(root)), before);
  // and the real run still works afterwards
  assert.equal(compact(root, 'P1').code, 0);
});

test('compact: entries of other phases untouched (incl. their plan rows)', () => {
  const { root, three } = seedCompactFixture();
  const r = compact(root, 'P1');
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /1 other-phase/);
  assert.equal(read(lbOf(root), '2026-11-02-x-three-task1-verify-r1.md'),
    blockBody(three));
  // and compacting THAT phase rewrites it — membership travels
  const r3 = compact(root, 'P3');
  assert.equal(r3.code, 0, r3.out);
  assert.match(r3.out, /1 entries · 1 compacted/);
  assert.equal(read(lbOf(root), '2026-11-02-x-three-task1-verify-r1.md'),
    compactedForm(blockBody(three)));
  // the already-compacted P1 entries stay compacted
  assert.equal(read(lbOf(root), '2026-11-02-x-one-task1-verify-r1.md'),
    compactedForm(blockBody('.hivemind/plans/2026-11-02-x-one.md')));
});

test('compact: plan-— row matches nothing — 0 entries, exit 0', () => {
  const { root } = seedCompactFixture();
  const before = snapshot(lbOf(root));
  const r = compact(root, 'P2');
  assert.equal(r.code, 0, r.out);
  assert.equal(r.out, '0 entries\n');
  assert.deepEqual(snapshot(lbOf(root)), before); // clean no-op
});

test('compact: missing phase list or row fails loud naming it', () => {
  const { root } = seedCompactFixture();
  const r = compact(root, 'P9'); // no such row
  assert.equal(r.code, 1);
  assert.match(r.err, /no row for phase P9/);
  assert.match(r.err, /P1, P2, P3/);
  const empty = compactRoot(); // phases dir has no project list
  const r2 = compact(empty, 'P1');
  assert.equal(r2.code, 1);
  assert.match(r2.err, /no phase list in/);
  assert.ok(r2.err.includes(phasesOf(empty)));
});

// ---- AXI pass (P6 task 6): stamp/compact mutation hints ----

test('stamp: writes carry the index next-step, --check does not (AXI 9)', () => {
  const s = sandbox();
  entry(s.lb, '2026-11-02-x-demo-task3-verify-r1.md',
    legacyBody('Role: task-orc'));
  s.git('add', '.');
  s.git('commit', '-m', 'seed');
  const check = stamp(s.lb, '--check');
  assert.equal(check.code, 0, check.out);
  assert.ok(!check.out.includes('next:')); // preview stays lean
  const r = stamp(s.lb);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out,
    /next: bee logbook index shows the derived view\n$/);
  // idempotent no-op run (nothing left to stamp) stays lean
  const again = stamp(s.lb);
  assert.equal(again.code, 0, again.out);
  assert.ok(!again.out.includes('next:'));
});

test('compact: writes carry the phase-close next-step, --check does not (AXI 9)', () => {
  const { root } = seedCompactFixture();
  const check = compact(root, 'P1', '--check');
  assert.equal(check.code, 0, check.out);
  assert.ok(!check.out.includes('next:'));
  const r = compact(root, 'P1');
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /next: bee phase close P1 --check\n$/);
  // idempotent re-run (all already compacted) writes nothing and
  // stays lean — a no-op is a read (review r1, matching stamp)
  const again = compact(root, 'P1');
  assert.ok(!again.out.includes('next:'));
});

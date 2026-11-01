// AXI compliance battery for `bee task` (P4 Task 6) — work-item
// state moves over a plan's checkboxes + machine-block ledger.
// Never touches the live .hivemind: every move runs against a
// fixture plan in a temp dir; `--check` writes nothing; byte
// exactness is asserted by full-file comparison (hand-written
// expected literals, the runtime-stamped ledger line normalized
// to a sentinel).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run, parsePlanHeader } from '../bin/bee.js';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)),
  '..');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bee-task-'));
}

// The canonical fixture: a stray pre-task checkbox, two task
// sections (one with inline `- [ ]` text — byte-exactness probe),
// and a post-tasks Phase exit checkbox. opts.task2AllTicked makes
// task-2 hand-ticked everywhere (derived done, no ledger).
function writePlan(dir, opts = {}) {
  const task2 = opts.task2AllTicked
    ? ['- [x] hand-ticked step', '- [x] another hand-ticked step']
    : ['- [x] hand-ticked step', '- [ ] open step'];
  const text = [
    '# Plan: task fixture',
    '',
    '<!-- machine',
    'phase: P9',
    'validation: task',
    'state-source: checkboxes below',
    'checks:',
    '  - id: task-1',
    '    cmd: "true"',
    '  - id: task-2',
    '    cmd: "true"',
    'suite: node --test tests/*.test.mjs',
    '-->',
    '',
    '## Standing rules',
    '',
    '- [ ] stray checkbox before any task (never touched)',
    '',
    '## Task 1: alpha work',
    '',
    '- [ ] step one',
    '- [ ] step two — with `- [ ]` inline text (untouched)',
    '',
    '## Task 2: beta work',
    '',
    ...task2,
    '',
    '## Phase exit',
    '',
    '- [ ] suite green (never touched by task moves)',
    '',
  ].join('\n');
  const plan = path.join(dir, opts.name ?? 'fixture-plan.md');
  fs.writeFileSync(plan, text);
  return { plan, text };
}

// Replace the runtime-stamped ledger line with a sentinel so the
// REST of the file compares byte-exact against a hand literal.
function normalizeLedger(text, n) {
  const re = new RegExp(
    `^task-${n}: \\S+ \\S+ by \\S+(?: record: \\S+)?$`, 'm');
  if (!re.test(text)) {
    throw new Error(`no ledger line for task-${n} in:\n${text}`);
  }
  return text.replace(re, '@@LEDGER@@');
}

// The fixture after a `move 1 implemented --origin bee`: body
// byte-identical, one ledger line before `-->`.
const EXPECTED_IMPLEMENTED = [
  '# Plan: task fixture',
  '',
  '<!-- machine',
  'phase: P9',
  'validation: task',
  'state-source: checkboxes below',
  'checks:',
  '  - id: task-1',
  '    cmd: "true"',
  '  - id: task-2',
  '    cmd: "true"',
  'suite: node --test tests/*.test.mjs',
  '@@LEDGER@@',
  '-->',
  '',
  '## Standing rules',
  '',
  '- [ ] stray checkbox before any task (never touched)',
  '',
  '## Task 1: alpha work',
  '',
  '- [ ] step one',
  '- [ ] step two — with `- [ ]` inline text (untouched)',
  '',
  '## Task 2: beta work',
  '',
  '- [x] hand-ticked step',
  '- [ ] open step',
  '',
  '## Phase exit',
  '',
  '- [ ] suite green (never touched by task moves)',
  '',
].join('\n');

// The fixture after `move 1 done --record <path> --origin po`:
// task-1's two boxes tick (inline `- [ ]` text intact), everything
// else byte-identical, ledger line with record before `-->`.
const EXPECTED_DONE = EXPECTED_IMPLEMENTED
  .replace('- [ ] step one', '- [x] step one')
  .replace('- [ ] step two — with `- [ ]` inline text (untouched)',
    '- [x] step two — with `- [ ]` inline text (untouched)');

// ---- AXI battery ----

test('help exits 0 with per-subcommand usage', () => {
  const r = run(['task', 'help']);
  assert.equal(r.code, 0);
  assert.match(r.out, /usage:/);
  assert.match(r.out, /move <plan-path> <task-n> <state>/);
});

test('bare bee task (no plan) → exit 1 + fix instruction', () => {
  const r = run(['task']);
  assert.equal(r.code, 1);
  assert.match(r.err, /expected <plan-path>/);
  assert.match(r.err, /fix:/);
  assert.match(r.err, /usage:/);
});

test('unknown subcommand → exit 1 + usage', () => {
  const r = run(['task', 'frobnicate']);
  assert.equal(r.code, 1);
  assert.match(r.err, /unknown subcommand 'frobnicate'/);
  assert.match(r.err, /usage:/);
});

test('unknown flag → exit 1 + usage', () => {
  const dir = tmpDir();
  const { plan } = writePlan(dir);
  const r = run(['task', 'move', plan, '1', 'done', '--bogus']);
  assert.equal(r.code, 1);
  assert.match(r.err, /usage:/);
});

test('missing plan file → exit 1 + fix', () => {
  const r = run(['task', 'show', '/nonexistent/plan.md']);
  assert.equal(r.code, 1);
  assert.match(r.err, /cannot read/);
  assert.match(r.err, /fix:/);
});

test('plan without machine header → exit 1 (parsePlanHeader reused)', () => {
  const dir = tmpDir();
  const plan = path.join(dir, 'headerless.md');
  fs.writeFileSync(plan, '# Plan: headerless\n\nno machine block\n');
  const r = run(['task', 'show', plan]);
  assert.equal(r.code, 1);
  assert.match(r.err, /no <!-- machine --> header/);
});

test('unknown state → exit 1 + states listed', () => {
  const dir = tmpDir();
  const { plan } = writePlan(dir);
  const r = run(['task', 'move', plan, '1', 'shipped']);
  assert.equal(r.code, 1);
  assert.match(r.err, /unknown state 'shipped'/);
  assert.match(r.err,
    /draft → implemented → verified → reviewed → done/);
});

test('non-numeric task → usage error', () => {
  const dir = tmpDir();
  const { plan } = writePlan(dir);
  const r = run(['task', 'move', plan, 'abc', 'done']);
  assert.equal(r.code, 1);
  assert.match(r.err, /<task-n> expects a task number/);
});

// ---- move semantics ----

test('unknown task number → exit 1 + fix + ids listed', () => {
  const dir = tmpDir();
  const { plan, text } = writePlan(dir);
  const r = run(['task', 'move', plan, '9', 'implemented']);
  assert.equal(r.code, 1);
  assert.match(r.err, /no task 9 in /);
  assert.match(r.err, /tasks here: task-1, task-2/);
  assert.match(r.err, /fix:/);
  assert.equal(fs.readFileSync(plan, 'utf8'), text); // untouched
});

test('declared task with no body section → exit 1 + fix', () => {
  const dir = tmpDir();
  const plan = path.join(dir, 'gap.md');
  fs.writeFileSync(plan, [
    '# Plan', '', '<!-- machine', 'phase: P1',
    'checks:', '  - id: task-3', '    cmd: "true"',
    'suite: "true"', '-->', '', '## Task 1: only one', '', '- [ ] step',
    '',
  ].join('\n'));
  const r = run(['task', 'move', plan, '3', 'implemented']);
  assert.equal(r.code, 1);
  assert.match(r.err, /no '## Task 3:' section/);
  assert.match(r.err, /fix:/);
});

test('move implemented: body byte-identical, ledger appended, by bee', () => {
  const dir = tmpDir();
  const { plan } = writePlan(dir);
  const r = run(['task', 'move', plan, '1', 'implemented']);
  assert.equal(r.code, 0, r.err);
  const after = fs.readFileSync(plan, 'utf8');
  const m = /^task-1: implemented (\S+) by bee$/m.exec(after);
  assert.ok(m, 'ledger line present');
  assert.match(m[1], /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
  assert.equal(normalizeLedger(after, 1), EXPECTED_IMPLEMENTED);
});

test('task-1 form accepted alongside bare number', () => {
  const dir = tmpDir();
  const { plan } = writePlan(dir);
  const r = run(['task', 'move', plan, 'task-1', 'implemented']);
  assert.equal(r.code, 0, r.err);
  assert.match(fs.readFileSync(plan, 'utf8'), /^task-1: implemented /m);
});

test('forward chain: second ledger line, last wins in show', () => {
  const dir = tmpDir();
  const { plan } = writePlan(dir);
  run(['task', 'move', plan, '1', 'implemented', '--origin', 'po']);
  const r = run(['task', 'move', plan, '1', 'verified', '--origin', 'po']);
  assert.equal(r.code, 0, r.err);
  const after = fs.readFileSync(plan, 'utf8');
  assert.match(after, /^task-1: implemented \S+ by po$/m);
  assert.match(after, /^task-1: verified \S+ by po$/m);
  const lines = after.split('\n')
    .filter((l) => l.startsWith('task-1:'));
  assert.equal(lines.length, 2);
  const s = run(['task', 'show', plan, '--full']);
  assert.equal(s.code, 0);
  assert.match(s.out, /task-1 · verified · 0\/2 steps · alpha work/);
  assert.match(s.out, /last: verified \S+ by po\n/);
});

test('backwards move refused: exit 1 + fix, file unchanged', () => {
  const dir = tmpDir();
  const { plan } = writePlan(dir);
  run(['task', 'move', plan, '1', 'verified']);
  const before = fs.readFileSync(plan, 'utf8');
  const r = run(['task', 'move', plan, '1', 'implemented']);
  assert.equal(r.code, 1);
  assert.match(r.err, /task-1 is verified/);
  assert.match(r.err, /'implemented' is backwards/);
  assert.match(r.err, /fix:/);
  assert.equal(fs.readFileSync(plan, 'utf8'), before);
});

test('idempotent re-move: no-op note, exit 0, file unchanged', () => {
  const dir = tmpDir();
  const { plan } = writePlan(dir);
  run(['task', 'move', plan, '1', 'verified']);
  const before = fs.readFileSync(plan, 'utf8');
  const r = run(['task', 'move', plan, '1', 'verified']);
  assert.equal(r.code, 0);
  assert.match(r.out, /task-1 already verified — nothing to do/);
  assert.equal(fs.readFileSync(plan, 'utf8'), before);
});

test('derived done (all boxes ticked, no ledger): draft move is backwards', () => {
  const dir = tmpDir();
  const { plan } = writePlan(dir, { task2AllTicked: true });
  const s = run(['task', 'show', plan]);
  assert.match(s.out, /task-2 · done · 2\/2 steps/); // derived
  const r = run(['task', 'move', plan, '2', 'draft']);
  assert.equal(r.code, 1);
  assert.match(r.err, /'draft' is backwards/);
});

// ---- done + --record ----

test('done without --record → exit 1 + fix, file unchanged', () => {
  const dir = tmpDir();
  const { plan, text } = writePlan(dir);
  const r = run(['task', 'move', plan, '1', 'done']);
  assert.equal(r.code, 1);
  assert.match(r.err, /requires --record <path>/);
  assert.match(r.err, /fix:/);
  assert.match(r.err, /bee verify --task 1/);
  assert.equal(fs.readFileSync(plan, 'utf8'), text);
});

test('done with nonexistent record path → exit 1 + fix', () => {
  const dir = tmpDir();
  const { plan } = writePlan(dir);
  const r = run(['task', 'move', plan, '1', 'done',
    '--record', path.join(dir, 'no-such-entry.md')]);
  assert.equal(r.code, 1);
  assert.match(r.err, /--record path does not exist/);
  assert.match(r.err, /fix:/);
});

test('--record on a non-done state → usage error', () => {
  const dir = tmpDir();
  const { plan } = writePlan(dir);
  const r = run(['task', 'move', plan, '1', 'implemented',
    '--record', plan]);
  assert.equal(r.code, 1);
  assert.match(r.err, /--record belongs to done moves/);
  assert.match(r.err, /usage:/);
});

test('done with record: checkbox rewrite byte-exact, record stamped', () => {
  const dir = tmpDir();
  const { plan } = writePlan(dir);
  const entry = path.join(dir, 'verify-entry.md');
  fs.writeFileSync(entry, '<!-- machine\nverdict: PASS\n-->\n');
  const r = run(['task', 'move', plan, '1', 'done',
    '--record', entry, '--origin', 'po']);
  assert.equal(r.code, 0, r.err);
  const after = fs.readFileSync(plan, 'utf8');
  assert.match(after,
    /^task-1: done \S+ by po record: \S+$/m);
  // byte-exact: every byte outside the timestamped ledger line
  // matches the hand-written literal (only task-1's two leading
  // markers changed; the stray, inline, and Phase exit boxes and
  // task-2's hand-ticked box are untouched)
  assert.equal(normalizeLedger(after, 1), EXPECTED_DONE);
  const s = run(['task', 'show', plan]);
  assert.match(s.out, /task-1 · done · 2\/2 steps/);
  assert.match(s.out, /2 tasks · 1 done/);
});

test('record path displays repo-relative inside a git repo', () => {
  const dir = tmpDir();
  const git = (cmd) =>
    execSync(`git ${cmd}`, { cwd: dir, encoding: 'utf8' });
  git('init -q -b main');
  git('config user.email bee@test.local');
  git('config user.name bee-test');
  const { plan } = writePlan(dir);
  fs.mkdirSync(path.join(dir, '.hivemind', 'logbook'),
    { recursive: true });
  const entry = path.join(dir, '.hivemind', 'logbook',
    'plan-task1-verify-r1.md');
  fs.writeFileSync(entry, '<!-- machine\nverdict: PASS\n-->\n');
  git('add -A && git commit -qm base');
  const r = run(['task', 'move', plan, '1', 'done', '--record', entry]);
  assert.equal(r.code, 0, r.err);
  assert.match(fs.readFileSync(plan, 'utf8'),
    /record: \.hivemind\/logbook\/plan-task1-verify-r1\.md$/m);
});

test('idempotent done re-move: exit 0, file unchanged', () => {
  const dir = tmpDir();
  const { plan } = writePlan(dir);
  const entry = path.join(dir, 'verify-entry.md');
  fs.writeFileSync(entry, '<!-- machine\nverdict: PASS\n-->\n');
  run(['task', 'move', plan, '1', 'done', '--record', entry]);
  const before = fs.readFileSync(plan, 'utf8');
  const r = run(['task', 'move', plan, '1', 'done',
    '--record', entry]);
  assert.equal(r.code, 0);
  assert.match(r.out, /task-1 already done — nothing to do/);
  assert.equal(fs.readFileSync(plan, 'utf8'), before);
});

// ---- --check ----

test('--check previews and writes nothing (done form)', () => {
  const dir = tmpDir();
  const { plan, text } = writePlan(dir);
  const entry = path.join(dir, 'verify-entry.md');
  fs.writeFileSync(entry, '<!-- machine\nverdict: PASS\n-->\n');
  const r = run(['task', 'move', plan, '1', 'done',
    '--record', entry, '--check']);
  assert.equal(r.code, 0);
  assert.match(r.out, /--check: would move task-1 draft → done/);
  assert.match(r.out, /^task-1: done \S+ by bee record: \S+$/m);
  assert.match(r.out, /2 checkbox\(es\) would tick/);
  assert.equal(fs.readFileSync(plan, 'utf8'), text); // nothing written
});

// ---- ledger robustness + parser compatibility ----

test('malformed ledger line → exit 1 + hand-fix', () => {
  const dir = tmpDir();
  const plan = path.join(dir, 'bad-ledger.md');
  fs.writeFileSync(plan, [
    '# Plan', '', '<!-- machine', 'phase: P1',
    'checks:', '  - id: task-1', '    cmd: "true"',
    'suite: "true"',
    'task-1: implementid 2026-11-01 po',
    '-->', '', '## Task 1: x', '', '- [ ] step', '',
  ].join('\n'));
  const r = run(['task', 'show', plan]);
  assert.equal(r.code, 1);
  assert.match(r.err, /cannot parse ledger line/);
  assert.match(r.err, /fix:/);
});

test('unknown ledger state → same hand-fix finding', () => {
  const dir = tmpDir();
  const plan = path.join(dir, 'bad-state.md');
  fs.writeFileSync(plan, [
    '# Plan', '', '<!-- machine', 'phase: P1',
    'checks:', '  - id: task-1', '    cmd: "true"',
    'suite: "true"',
    'task-1: shipped 2026-11-01T09:00:00+11:00 by po',
    '-->', '', '## Task 1: x', '', '- [ ] step', '',
  ].join('\n'));
  const r = run(['task', 'move', plan, '1', 'reviewed']);
  assert.equal(r.code, 1);
  assert.match(r.err, /cannot parse ledger line/);
});

test('parsePlanHeader ignores ledger lines (reused parser, contract intact)', () => {
  const dir = tmpDir();
  const { plan } = writePlan(dir);
  run(['task', 'move', plan, '1', 'implemented']);
  const { header, err } =
    parsePlanHeader(fs.readFileSync(plan, 'utf8'));
  assert.equal(err, undefined);
  assert.equal(header.checks.length, 2);
  assert.deepEqual(header.checks.map((c) => c.id), ['task-1', 'task-2']);
  assert.equal(header.suite, 'node --test tests/*.test.mjs');
  assert.equal(header.phase, 'P9');
});

test('plan-checks.sh still parses a plan carrying ledger lines', () => {
  const dir = tmpDir();
  fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'docs', 'alpha.md'), '# a\n');
  const plan = path.join(dir, 'plan.md');
  fs.writeFileSync(plan, [
    '# Plan', '', '<!-- machine', 'phase: P1',
    'validation: task', 'state-source: checkboxes below',
    'targets:', '  - docs/alpha.md (modify)',
    'checks:', '  - id: task-1', '    cmd: "true"',
    'suite: node --test tests/*.test.mjs',
    'task-1: implemented 2026-11-01T09:00:00+11:00 by bee',
    'task-1: verified 2026-11-01T10:00:00+11:00 by bee',
    '-->', '', '## Task 1: x', '', '- [x] step', '',
  ].join('\n'));
  const out = execSync(
    `bash ${path.join(REPO, 'scripts', 'plan-checks.sh')} ${plan}`,
    { encoding: 'utf8' });
  assert.match(out, /^checks: clean$/m);
});

// ---- show ----

test('show: aggregate header + per-task TOON rows', () => {
  const dir = tmpDir();
  const { plan } = writePlan(dir);
  const r = run(['task', 'show', plan]);
  assert.equal(r.code, 0);
  assert.match(r.out, /^2 tasks · 0 done\n/);
  assert.match(r.out, /task-1 · draft · 0\/2 steps · alpha work/);
  assert.match(r.out, /task-2 · draft · 1\/2 steps · beta work/);
});

test('show: definitive 0 tasks + fix when no checks', () => {
  const dir = tmpDir();
  const plan = path.join(dir, 'no-checks.md');
  fs.writeFileSync(plan, [
    '# Plan', '', '<!-- machine', 'phase: P1', 'suite: "true"',
    '-->', '',
  ].join('\n'));
  const r = run(['task', 'show', plan]);
  assert.equal(r.code, 0);
  assert.match(r.out, /^0 tasks\n/);
  assert.match(r.out, /fix: add a checks: block/);
});

test('fenced verbatim example boxes are not step boxes (review r1 SF1 regression)', () => {
  const dir = tmpDir();
  const { plan } = writePlan(dir);
  // plant a fenced contract block with checkbox-looking lines inside task 1
  let text = fs.readFileSync(plan, 'utf8');
  text = text.replace('- [ ] step one',
    '- [ ] step one\n\n```text path=store.toon\n- [ ] example line one\n- [x] example line two\n```');
  fs.writeFileSync(plan, text);
  fs.writeFileSync(path.join(dir, 'rec.md'), '# r\n');
  const r = run(['task', 'move', plan, '1', 'done',
    '--record', path.join(dir, 'rec.md')]);
  assert.equal(r.code, 0, r.err);
  const after = fs.readFileSync(plan, 'utf8');
  assert.ok(after.includes('- [ ] example line one'),
    'fenced example box must NOT tick');
  assert.ok(after.includes('- [x] example line two'),
    'fenced example ticked box must NOT untick');
  assert.ok(after.includes('- [x] step one'));
  assert.ok(after.includes('- [x] step two'));
  // fenced boxes are not counted: show reports 2/2, not 2/4
  const s = run(['task', 'show', plan]);
  assert.match(s.out, /task-1 · done · 2\/2 steps/);
});

test('--full untruncates long task titles (review r1 SF2 regression)', () => {
  const dir = tmpDir();
  const longTitle = 'w'.repeat(80);
  const plan = path.join(dir, 'fixture-plan.md');
  fs.writeFileSync(plan, [
    '# Plan: fixture', '',
    '<!-- machine',
    'phase: P1', 'validation: task', 'state-source: checkboxes below',
    'checks:', '  - id: task-1', '    cmd: "true"',
    'suite: "true"',
    '-->', '',
    `## Task 1: ${longTitle}`, '', '- [ ] step', '',
  ].join('\n') + '\n');
  const short = run(['task', 'show', plan]);
  assert.match(short.out, /\u2026 \(\+\d+ chars\)/);
  const full = run(['task', 'show', plan, '--full']);
  assert.ok(full.out.includes(longTitle));
});

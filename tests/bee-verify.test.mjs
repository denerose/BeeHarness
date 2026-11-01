// AXI compliance battery for `bee verify` (P4 Task 5) — plan-header
// checks + link-check + logbook evidence. Never touches the live
// .hivemind: plans run from temp dirs (link-check skips — no git),
// link tests build throwaway git repos, entries write to temp
// logbooks. The fixture (tests/fixtures/verify-plan.md) is a copy
// of the P4 plan's machine-header shape — the dogfood stand-in
// (the real plan's checks block lands from main post-merge).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { run, parsePlanHeader } from '../bin/bee.js';

const TESTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_PLAN = path.join(TESTS_DIR, 'fixtures', 'verify-plan.md');

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bee-verify-'));
}

// A temp home: the fixture plan copied in, its named files placed.
function fixtureHome() {
  const dir = tmpDir();
  fs.mkdirSync(path.join(dir, 'docs'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'docs', 'alpha.md'), '# alpha\n');
  fs.writeFileSync(path.join(dir, 'docs', 'beta.md'), '# beta\n');
  const plan = path.join(dir, 'fixture-plan.md');
  fs.copyFileSync(FIXTURE_PLAN, plan);
  return { dir, plan };
}

// A plan with an arbitrary machine block (inline contract probes).
function writePlan(dir, machineBlock, name = 'probe-plan.md') {
  const plan = path.join(dir, name);
  fs.writeFileSync(plan,
    `# Plan: probe\n\n<!-- machine\n${machineBlock}\n-->\n\n## Task 1\n\n- [ ] step\n`);
  return plan;
}

function tmpGitRepo() {
  const dir = tmpDir();
  const git = (cmd) =>
    execSync(`git ${cmd}`, { cwd: dir, encoding: 'utf8' });
  git('init -q -b main');
  git('config user.email bee@test.local');
  git('config user.name bee-test');
  return { dir, git };
}

// ---- AXI battery ----

test('help exits 0 with per-subcommand usage', () => {
  const r = run(['verify', 'help']);
  assert.equal(r.code, 0);
  assert.match(r.out, /usage:/);
  assert.match(r.out, /--plan <path>/);
});

test('bare verify (no --plan) → exit 1 + fix instruction', () => {
  const r = run(['verify']);
  assert.equal(r.code, 1);
  assert.match(r.err, /--plan <path> is required/);
  assert.match(r.err, /fix:/);
  assert.match(r.err, /usage:/); // AXI 6/10
});

test('unknown flag → exit 1 + usage', () => {
  const r = run(['verify', '--bogus']);
  assert.equal(r.code, 1);
  assert.match(r.err, /usage:/);
});

test('missing plan file → exit 1 + fix', () => {
  const r = run(['verify', '--plan', '/nonexistent/plan.md']);
  assert.equal(r.code, 1);
  assert.match(r.err, /cannot read/);
  assert.match(r.err, /fix:/);
});

test('plan without machine header → exit 1 + contract pointer', () => {
  const dir = tmpDir();
  const plan = path.join(dir, 'no-header.md');
  fs.writeFileSync(plan, '# Plan: headerless\n\nno machine block\n');
  const r = run(['verify', '--plan', plan]);
  assert.equal(r.code, 1);
  assert.match(r.err, /no <!-- machine --> header/);
  assert.match(r.err, /plan-template\.md/);
});

// ---- header contract (the interface bee-plan writes, verify reads) ----

test('parses the fixture header (P4 plan header shape)', () => {
  const { header, err } =
    parsePlanHeader(fs.readFileSync(FIXTURE_PLAN, 'utf8'));
  assert.equal(err, undefined);
  assert.equal(header.phase, 'P9');
  assert.equal(header.validation, 'task');
  assert.equal(header.stateSource, 'checkboxes below');
  assert.equal(header.design, 'none — bounded task');
  assert.deepEqual(header.targets, [
    { path: 'docs/alpha.md', verb: 'create' },
    { path: 'docs/beta.md', verb: 'create' },
  ]);
  assert.equal(header.checks.length, 2);
  assert.equal(header.checks[0].id, 'task-1');
  assert.equal(header.checks[0].n, 1);
  assert.equal(header.checks[0].cmd,
    'node -e "console.log(\'fixture ok\')"');
  assert.equal(header.checks[0].expect, 'exit 0');
  assert.deepEqual(header.checks[0].filesList, ['docs/alpha.md']);
  assert.equal(header.checks[1].cmd, undefined); // files-only entry
  assert.deepEqual(header.checks[1].filesList, ['docs/beta.md']);
  assert.equal(header.suite, 'node --test tests/*.test.mjs');
});

test('first machine block only (fenced copies ignored)', () => {
  const dir = tmpDir();
  const plan = path.join(dir, 'two-blocks.md');
  fs.writeFileSync(plan,
    `# Plan\n\n<!-- machine\nphase: P1\nchecks:\n  - id: task-1\n    cmd: "true"\n-->\n\n` +
    '```text\n<!-- machine\nphase: P2\nchecks:\n  - id: task-9\n    cmd: "false"\n-->\n```\n');
  const { header } = parsePlanHeader(fs.readFileSync(plan, 'utf8'));
  assert.equal(header.phase, 'P1');
  assert.deepEqual(header.checks.map((c) => c.id), ['task-1']);
});

test('bad id → exit 1 with fix', () => {
  const dir = tmpDir();
  const plan = writePlan(dir,
    'phase: P1\nchecks:\n  - id: step-one\n    cmd: "true"');
  const r = run(['verify', '--plan', plan]);
  assert.equal(r.code, 1);
  assert.match(r.err, /id: task-<n>/);
  assert.match(r.err, /got 'step-one'/);
});

test('neither cmd nor files → exit 1', () => {
  const dir = tmpDir();
  const plan = writePlan(dir, 'phase: P1\nchecks:\n  - id: task-1');
  const r = run(['verify', '--plan', plan]);
  assert.equal(r.code, 1);
  assert.match(r.err, /at least one is required/);
});

test('expect other than exit 0 → exit 1 (only form this phase)', () => {
  const dir = tmpDir();
  const plan = writePlan(dir,
    'phase: P1\nchecks:\n  - id: task-1\n    cmd: "true"\n    expect: output matches');
  const r = run(['verify', '--plan', plan]);
  assert.equal(r.code, 1);
  assert.match(r.err, /only form this phase/);
});

test('duplicate ids → exit 1', () => {
  const dir = tmpDir();
  const plan = writePlan(dir,
    'phase: P1\nchecks:\n  - id: task-1\n    cmd: "true"\n  - id: task-1\n    cmd: "true"');
  const r = run(['verify', '--plan', plan]);
  assert.equal(r.code, 1);
  assert.match(r.err, /duplicate checks id 'task-1'/);
});

// ---- check runs ----

test('all checks run → TOON lines, aggregate, links skip note', () => {
  const { plan } = fixtureHome();
  const lb = path.join(tmpDir(), 'lb');
  const r = run(['verify', '--plan', plan, '--logbook', lb]);
  assert.equal(r.code, 0, r.out + r.err);
  assert.match(r.out, /^2 checks · 2 pass · 0 fail\n/m);
  assert.match(r.out, /task-1 · node -e .* · PASS · exit 0 · 1 file\n/);
  assert.match(r.out, /task-2 · files: docs\/beta\.md · PASS · 1 file\n/);
  assert.match(r.out, /links · skipped · no git repo/);
});

test('empty checks → definitive 0 checks + fix, exit 0', () => {
  const dir = tmpDir();
  const plan = writePlan(dir, 'phase: P1\nsuite: "true"');
  const r = run(['verify', '--plan', plan]);
  assert.equal(r.code, 0);
  assert.match(r.out, /^0 checks\n/);
  assert.match(r.out, /fix: add a checks: block/);
  assert.match(r.out, /plan-template\.md/);
  const rr = run(['verify', '--plan', plan, '--record']);
  assert.match(rr.out, /not written \(0 checks ran/);
});

test('--task runs one task only', () => {
  const { plan } = fixtureHome();
  const lb = path.join(tmpDir(), 'lb');
  const r = run(['verify', '--plan', plan, '--task', '1',
    '--logbook', lb]);
  assert.equal(r.code, 0);
  assert.match(r.out, /^1 checks · 1 pass · 0 fail\n/m);
  assert.match(r.out, /task-1 ·/);
  assert.ok(!r.out.includes('task-2 ·'));
});

test('--task unknown → exit 1, ids listed + fix', () => {
  const { plan } = fixtureHome();
  const r = run(['verify', '--plan', plan, '--task', '9']);
  assert.equal(r.code, 1);
  assert.match(r.err, /no check 'task-9'/);
  assert.match(r.err, /checks here: task-1, task-2/);
  assert.match(r.err, /fix:/);
});

test('--task non-numeric → usage error', () => {
  const { plan } = fixtureHome();
  const r = run(['verify', '--plan', plan, '--task', 'abc']);
  assert.equal(r.code, 1);
  assert.match(r.err, /--task expects a task number/);
});

test('failing cmd → FAIL line + fix line, exit 1', () => {
  const dir = tmpDir();
  const plan = writePlan(dir,
    'phase: P1\nchecks:\n  - id: task-1\n    cmd: echo boom >&2; exit 3');
  const r = run(['verify', '--plan', plan]);
  assert.equal(r.code, 1);
  assert.match(r.out, /task-1 · echo boom.* · FAIL · exit 3: boom/);
  assert.match(r.out, /fix: run '.*' and repair/);
});

test('missing files → FAIL lists paths + place-or-fix lines', () => {
  const dir = tmpDir();
  const plan = writePlan(dir,
    'phase: P1\nchecks:\n  - id: task-1\n    files: [gone/one.md, gone/two.md]');
  const r = run(['verify', '--plan', plan]);
  assert.equal(r.code, 1);
  assert.match(r.out, /task-1 · files: gone\/one\.md, gone\/two\.md · FAIL · missing: gone\/one\.md, gone\/two\.md/);
  assert.match(r.out, /fix: gone\/one\.md — place it or fix the path/);
  assert.match(r.out, /fix: gone\/two\.md — place it or fix the path/);
});

// ---- logbook emission ----

test('unscoped run writes nothing by default (review r1 SF3 regression)', () => {
  const { plan } = fixtureHome();
  const lb = path.join(tmpDir(), 'lb');
  const r = run(['verify', '--plan', plan, '--logbook', lb]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /logbook: not written \(unscoped run/);
  assert.ok(!fs.existsSync(lb) || fs.readdirSync(lb).length === 0);
});

test('--record fans out one clean entry per task (r1)', () => {
  const { plan } = fixtureHome();
  const lb = path.join(tmpDir(), 'lb');
  const r = run(['verify', '--plan', plan, '--logbook', lb, '--record']);
  assert.equal(r.code, 0, r.out);
  const e1 = path.join(lb, 'fixture-plan-task1-verify-r1.md');
  const e2 = path.join(lb, 'fixture-plan-task2-verify-r1.md');
  const t1 = fs.readFileSync(e1, 'utf8');
  assert.match(t1, /^<!-- machine\nrole: bee\ndate: \S+\nverdict: PASS\nchecks-run: 1\nplan: \S+ @ -\n-->\n$/);
  assert.ok(!t1.includes('---\n')); // body empty = clean run
  assert.equal(fs.readFileSync(e2, 'utf8').includes('verdict: PASS'),
    true);
  assert.match(r.out, new RegExp(
    `logbook: ${e1.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  // atomic: no tmp leftovers
  assert.ok(fs.readdirSync(lb).every((f) => !f.includes('.tmp-')));
});

test('--role stamps the entry header', () => {
  const { plan } = fixtureHome();
  const lb = path.join(tmpDir(), 'lb');
  const r = run(['verify', '--plan', plan, '--task', '1',
    '--role', 'project-orchestrator', '--logbook', lb]);
  assert.equal(r.code, 0);
  const t = fs.readFileSync(
    path.join(lb, 'fixture-plan-task1-verify-r1.md'), 'utf8');
  assert.match(t, /role: project-orchestrator/);
});

test('rN continues the series (next free round)', () => {
  const { plan } = fixtureHome();
  const lb = path.join(tmpDir(), 'lb');
  fs.mkdirSync(lb, { recursive: true });
  fs.writeFileSync(path.join(lb, 'fixture-plan-task1-verify-r1.md'),
    '<!-- machine\nrole: bee\n-->\n');
  const r = run(['verify', '--plan', plan, '--task', '1',
    '--logbook', lb]);
  assert.equal(r.code, 0);
  const r2 = path.join(lb, 'fixture-plan-task1-verify-r2.md');
  assert.ok(fs.existsSync(r2), r.out);
  assert.match(fs.readFileSync(r2, 'utf8'), /verdict: PASS/);
  // r1 untouched
  assert.equal(fs.readFileSync(
    path.join(lb, 'fixture-plan-task1-verify-r1.md'), 'utf8'),
    '<!-- machine\nrole: bee\n-->\n');
});

test('FAIL writes nothing unless --record; --record captures the FAIL', () => {
  const dir = tmpDir();
  const plan = writePlan(dir,
    'phase: P1\nchecks:\n  - id: task-1\n    cmd: exit 3');
  const lb = path.join(tmpDir(), 'lb');
  const r = run(['verify', '--plan', plan, '--logbook', lb]);
  assert.equal(r.code, 1);
  assert.ok(!fs.existsSync(lb) || fs.readdirSync(lb).length === 0,
    'no entry without --record');
  const rr = run(['verify', '--plan', plan, '--record',
    '--logbook', lb]);
  assert.equal(rr.code, 1);
  const e = path.join(lb, 'probe-plan-task1-verify-r1.md');
  const t = fs.readFileSync(e, 'utf8');
  assert.match(t, /verdict: FAIL/);
  assert.match(t, /task-1 · exit 3 · FAIL · exit 3/); // anomaly body
  assert.match(t, /fix: run /); // fix rides into the record
});

test('--check previews, writes nothing', () => {
  const { plan } = fixtureHome();
  const lb = path.join(tmpDir(), 'lb');
  const r = run(['verify', '--plan', plan, '--task', '1', '--check',
    '--logbook', lb]);
  assert.equal(r.code, 0);
  assert.match(r.out, /--check: would write .*task1-verify-r1\.md/);
  assert.match(r.out, /verdict: PASS/); // preview shows the entry
  assert.ok(!fs.existsSync(lb), '--check never writes');
});

test('plan @ hash lands when the plan sits in a git repo', () => {
  const { dir, git } = tmpGitRepo();
  fs.copyFileSync(FIXTURE_PLAN, path.join(dir, 'plan.md'));
  fs.mkdirSync(path.join(dir, 'docs'));
  fs.writeFileSync(path.join(dir, 'docs', 'alpha.md'), '# a\n');
  fs.writeFileSync(path.join(dir, 'docs', 'beta.md'), '# b\n');
  git('add -A && git commit -qm base');
  git('checkout -q -b work');
  const r = run(['verify', '--plan', path.join(dir, 'plan.md'),
    '--task', '1', '--logbook', path.join(dir, 'out')]);
  assert.equal(r.code, 0, r.out);
  const t = fs.readFileSync(
    path.join(dir, 'out', 'plan-task1-verify-r1.md'), 'utf8');
  assert.match(t, / @ [0-9a-f]{7,}\n/); // hash, not '-'
});

// ---- link check (kickoff item 4 — PL-PP-001 hygiene) ----

// A work branch over main with changed docs; the plan's checks pass,
// so only the link verdict varies.
function linkRepo(docs) {
  const { dir, git } = tmpGitRepo();
  fs.writeFileSync(path.join(dir, 'plan.md'),
    `# Plan\n\n<!-- machine\nphase: P1\nchecks:\n  - id: task-1\n    cmd: "true"\n-->\n`);
  fs.writeFileSync(path.join(dir, 'base.md'), '# base\n');
  git('add -A && git commit -qm base');
  git('checkout -q -b work');
  for (const [name, body] of Object.entries(docs)) {
    fs.mkdirSync(path.dirname(path.join(dir, name)), { recursive: true });
    fs.writeFileSync(path.join(dir, name), body);
  }
  git('add -A && git commit -qm work');
  return { dir, git };
}

test('broken repo-relative link → FAIL + fix line, exit 1', () => {
  const { dir } = linkRepo({
    'doc.md': '# doc\n\nSee [alpha](missing-target.md).\n',
  });
  const r = run(['verify', '--plan', path.join(dir, 'plan.md')]);
  assert.equal(r.code, 1);
  assert.match(r.out, /links · 1 docs · FAIL · 1 links checked, 1 broken/);
  assert.match(r.out, /doc\.md:3 → missing-target\.md/);
  assert.match(r.out, /fix: repair the link or the target \(missing-target\.md\)/);
});

test('valid, fenced, and non-repo-relative links all pass', () => {
  const { dir } = linkRepo({
    'docs/doc.md': [
      '# doc',
      '',
      'Good: [sibling](sibling.md), [up one](../peer.md), ' +
        '[with hash](sibling.md#frag).',
      'Skipped: [url](https://example.com/a), [anchor](#top), ' +
        '[abs](/etc/hosts), [tilde](~/x).',
      '',
      '```text',
      '[fenced broken](fenced-missing.md) — not a link to check',
      '```',
      '',
    ].join('\n') + '\n',
    'docs/sibling.md': '# sibling\n',
    'peer.md': '# peer\n',
  });
  const r = run(['verify', '--plan', path.join(dir, 'plan.md')]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /links · 3 docs · PASS · 3 links checked/);
});

test('deleted doc in the diff range is not checked', () => {
  const { dir, git } = tmpGitRepo();
  fs.writeFileSync(path.join(dir, 'plan.md'),
    `# Plan\n\n<!-- machine\nphase: P1\nchecks:\n  - id: task-1\n    cmd: "true"\n-->\n`);
  fs.writeFileSync(path.join(dir, 'gone.md'),
    '# gone\n\n[x](never.md)\n');
  git('add -A && git commit -qm base');
  git('checkout -q -b work');
  fs.unlinkSync(path.join(dir, 'gone.md'));
  git('add -A && git commit -qm delete');
  const r = run(['verify', '--plan', path.join(dir, 'plan.md')]);
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /links · 0 docs · PASS · 0 links checked/);
});

test('--base override + bad base', () => {
  const { dir } = linkRepo({
    'doc.md': '# doc\n\n[x](missing.md)\n',
  });
  const plan = path.join(dir, 'plan.md');
  const sameBase = run(['verify', '--plan', plan, '--base', 'work']);
  assert.equal(sameBase.code, 0, sameBase.out);
  assert.match(sameBase.out, /links · 0 docs · PASS · 0 links checked/);
  const bad = run(['verify', '--plan', plan, '--base', 'nope']);
  assert.equal(bad.code, 1);
  assert.match(bad.err, /--base 'nope' does not resolve/);
  assert.match(bad.err, /fix: pass a ref that exists/);
});

test('link FAIL feeds the entry verdict + anomalies (--record)', () => {
  const { dir } = linkRepo({
    'doc.md': '# doc\n\n[x](missing.md)\n',
  });
  const lb = path.join(dir, 'out');
  const r = run(['verify', '--plan', path.join(dir, 'plan.md'),
    '--record', '--logbook', lb]);
  assert.equal(r.code, 1);
  const t = fs.readFileSync(
    path.join(lb, 'plan-task1-verify-r1.md'), 'utf8');
  assert.match(t, /verdict: FAIL/);
  assert.match(t, /doc\.md:3 → missing\.md/);
});

test('timeout lands in did-not-finish, not make-it-runnable (review r1 SF1 regression)', () => {
  const dir = tmpDir();
  const plan = writePlan(dir,
    'phase: P1\nchecks:\n  - id: task-1\n    cmd: sleep 5');
  const prev = process.env.BEE_VERIFY_TIMEOUT_MS;
  process.env.BEE_VERIFY_TIMEOUT_MS = '300';
  try {
    const r = run(['verify', '--plan', plan, '--task', '1']);
    assert.equal(r.code, 1);
    assert.match(r.out, /FAIL · timeout SIGTERM/);
    assert.match(r.out, /fix: 'sleep 5' did not finish/);
    assert.ok(!r.out.includes('make \'sleep 5\' runnable'));
  } finally {
    if (prev === undefined) delete process.env.BEE_VERIFY_TIMEOUT_MS;
    else process.env.BEE_VERIFY_TIMEOUT_MS = prev;
  }
});

test('--full untruncates long cmds (review r1 SF2 regression)', () => {
  const dir = tmpDir();
  const long = 'echo ' + 'x'.repeat(120);
  const plan = writePlan(dir,
    `phase: P1\nchecks:\n  - id: task-1\n    cmd: ${long}`);
  const r = run(['verify', '--plan', plan, '--task', '1']);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /\u2026 \(\+\d+ chars\)/); // truncated by default
  const rf = run(['verify', '--plan', plan, '--task', '1', '--full']);
  assert.equal(rf.code, 0, rf.err);
  assert.ok(rf.out.includes(long)); // full cmd visible with --full
});

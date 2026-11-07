import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const SCRIPT = join(dirname(new URL(import.meta.url).pathname), '..', 'scripts', 'plan-census.sh');

function corpus(plans, logs) {
  const dir = mkdtempSync(join(tmpdir(), 'plan-census-test-'));
  const plansDir = join(dir, 'plans');
  const logsDir = join(dir, 'logbook');
  mkdirSync(plansDir);
  mkdirSync(logsDir);
  for (const [p, c] of Object.entries(plans)) writeFileSync(join(plansDir, p), c);
  for (const [p, c] of Object.entries(logs)) writeFileSync(join(logsDir, p), c);
  return { dir, plansDir, logsDir };
}

function run(args) {
  try {
    const out = execFileSync('bash', [SCRIPT, ...args], { encoding: 'utf8' });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: e.stdout ?? '' };
  }
}

const wc = (s) => s.length - s.replaceAll('\n', '').length;

const PLAN_A = `<!-- machine
phase: P1
validation: task
state-source: checkboxes below
targets:
  - a.md (create)
checks:
  - id: task-1
    cmd: true
    expect: exit 0
suite: true
-->

# Plan A

## Task 1: first

- [ ] Step: do the thing

## Task 2: second

- [ ] Step: do more
`;

// pre-convention plan: no machine block, no phase: header
const PLAN_B = `# Plan B

## Task 1: only

- [ ] Step: old-style work
`;

// machine-block forms: role + verdict inside the header, and it
// references plan-b (the headerless plan is live corpus)
const LOG_1 = `<!-- machine
role: task-orc
date: 2026-11-07T10:00:00+11:00
verdict: PASS
checks-run: node --test tests/x.test.mjs
plan: plans/plan-b.md @ abc1234
task: task-1
links: -
-->

verify body
`;

// bold body forms: **Role:** and **Verdict:**
const LOG_2 = `# Review: something

**Role:** project-orchestrator

**Verdict:** PASS
`;

// plain Role form, no verdict line at all
const LOG_3 = `# Review: older

Role: cold-dispatched reviewer

no verdict here
`;

test('census counts corpus: plans, headerless, role forms, verdict coverage', () => {
  const { plansDir, logsDir } = corpus(
    { 'plan-a.md': PLAN_A, 'plan-b.md': PLAN_B },
    { 'log-1.md': LOG_1, 'log-2.md': LOG_2, 'log-3.md': LOG_3 });
  const r = run([plansDir, logsDir]);
  assert.equal(r.code, 0);
  assert.match(r.out, /^plans: 2$/m);
  assert.match(r.out, /^plans-headerless: 1$/m);
  assert.match(r.out, /^logbook-files: 3$/m);
  assert.match(r.out, /^role-bold: 1$/m);
  assert.match(r.out, /^role-plain: 1$/m);
  assert.match(r.out, /^role-machine: 1$/m);
  assert.match(r.out, /^role-none: 0$/m);
  assert.match(r.out, /^verdict-line: 2$/m);
  assert.match(r.out, /^verdict-missing: 1$/m);
  assert.match(r.out, new RegExp(`^plan: plan-a\\.md lines=${wc(PLAN_A)} machine=y phase=P1 tasks=2$`, 'm'));
  assert.match(r.out, new RegExp(`^plan: plan-b\\.md lines=${wc(PLAN_B)} machine=n phase=- tasks=1$`, 'm'));
});

test('unreferenced headerless plan does not count as headerless', () => {
  const { plansDir, logsDir } = corpus(
    { 'plan-b.md': PLAN_B },
    { 'log-3.md': LOG_3 }); // nothing references plan-b
  const r = run([plansDir, logsDir]);
  assert.equal(r.code, 0);
  assert.match(r.out, /^plans: 1$/m);
  assert.match(r.out, /^plans-headerless: 0$/m);
});

test('empty dirs census to zeros and exit 0', () => {
  const { plansDir, logsDir } = corpus({}, {});
  const r = run([plansDir, logsDir]);
  assert.equal(r.code, 0);
  assert.match(r.out, /^plans: 0$/m);
  assert.match(r.out, /^logbook-files: 0$/m);
  assert.match(r.out, /^role-none: 0$/m);
});

test('usage error exits 2', () => {
  assert.equal(run([]).code, 2);
  assert.equal(run(['only-one']).code, 2);
});

test('missing dir exits 1', () => {
  const { plansDir } = corpus({}, {});
  const r = run([plansDir, '/nonexistent-logbook-dir-xyz']);
  assert.equal(r.code, 1);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, chmodSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const SCRIPT = join(dirname(new URL(import.meta.url).pathname), '..', 'scripts', 'plan-checks.sh');

function fixture(plan, files = {}) {
  const dir = mkdtempSync(join(tmpdir(), 'plan-checks-test-'));
  for (const [p, c] of Object.entries(files)) {
    mkdirSync(join(dir, dirname(p)), { recursive: true });
    writeFileSync(join(dir, p), c);
  }
  const planPath = join(dir, 'plan.md');
  writeFileSync(planPath, plan);
  return { dir, planPath };
}

function run(args, cwd) {
  try {
    const out = execFileSync('bash', [SCRIPT, ...args], { cwd, encoding: 'utf8' });
    return { code: 0, out };
  } catch (e) {
    return { code: e.status, out: e.stdout ?? '' };
  }
}

const MACHINE = `<!-- machine
phase: T
validation: task
state-source: checkboxes
targets:
  - exists.md (modify)
suite: echo ok
-->`;

const MACHINE_CREATE = `<!-- machine
phase: T
validation: task
state-source: checkboxes
targets:
  - made.md (create)
suite: echo ok
-->`;

const MACHINE_GLOB_SUITE = `<!-- machine
phase: T
validation: task
state-source: checkboxes
targets:
  - exists.md (modify)
suite: node --test tests/*.test.mjs
-->`;

test('clean plan passes with counts and no findings', () => {
  const { planPath, dir } = fixture(`${MACHINE}\n\n# Plan\n\n- [ ] step one\n- [x] step two\n`, { 'exists.md': 'durable text\n' });
  const r = run([planPath], dir);
  assert.equal(r.code, 0);
  assert.match(r.out, /boxes: 1\/2/);
  assert.match(r.out, /checks: clean/);
});

test('missing modify-target is a finding', () => {
  const { planPath, dir } = fixture(`${MACHINE}\n`);
  const r = run([planPath], dir);
  assert.equal(r.code, 1);
  assert.match(r.out, /modify-target missing: exists\.md/);
});

test('ephemeral prose in a durable target is a finding', () => {
  const { planPath, dir } = fixture(`${MACHINE}\n`, { 'exists.md': 'the pilot is currently running\n' });
  const r = run([planPath], dir);
  assert.equal(r.code, 1);
  assert.match(r.out, /prose: exists\.md/);
});

test('untagged code block is a finding; tagged block extracts', () => {
  const { planPath, dir } = fixture(
    `${MACHINE}\n\n\`\`\`bash path=scripts/x.sh\necho hi\n\`\`\`\n\n\`\`\`bash\necho loose\n\`\`\`\n`,
    { 'exists.md': 'ok\n' });
  const r = run([planPath], dir);
  assert.equal(r.code, 1);
  assert.match(r.out, /blocks: 1\/2 tagged, 1 untagged/);
});

test('create-target existing as a file is satisfied, not a finding', () => {
  const { planPath, dir } = fixture(`${MACHINE_CREATE}\n`, { 'made.md': 'already there\n' });
  const r = run([planPath], dir);
  assert.equal(r.code, 0);
  assert.match(r.out, /note files: made\.md exists \(create-target satisfied\)/);
  assert.doesNotMatch(r.out, /non-directory ancestor/);
});

test('missing create-target gets no satisfied note; ancestor walk still applies', () => {
  const { planPath, dir } = fixture(`${MACHINE_CREATE}\n`);
  const r = run([planPath], dir);
  assert.equal(r.code, 0);
  assert.doesNotMatch(r.out, /create-target satisfied/);
});

test('missing create-target under a non-directory ancestor is still a finding', () => {
  const machine = MACHINE_CREATE.replace('made.md (create)', 'blocker.md/deep.md (create)');
  const { planPath, dir } = fixture(`${machine}\n`, { 'blocker.md': 'a file, not a dir\n' });
  const r = run([planPath], dir);
  assert.equal(r.code, 1);
  assert.match(r.out, /non-directory ancestor/);
});

test('plans over 500 lines get a non-blocking size note', () => {
  const big = `${MACHINE}\n\n# Plan\n\n${Array.from({ length: 500 }, (_, i) => `filler line ${i}`).join('\n')}\n`;
  const { planPath, dir } = fixture(big, { 'exists.md': 'ok\n' });
  const r = run([planPath], dir);
  assert.equal(r.code, 0);
  assert.match(r.out, /note size: \d+ lines — large plan; gate cost rises/);
});

test('short plans get no size note', () => {
  const { planPath, dir } = fixture(`${MACHINE}\n`, { 'exists.md': 'ok\n' });
  const r = run([planPath], dir);
  assert.equal(r.code, 0);
  assert.doesNotMatch(r.out, /note size:/);
});

test('--run executes the declared suite and passes', () => {
  const { planPath, dir } = fixture(`${MACHINE}\n`, { 'exists.md': 'ok\n' });
  const r = run(['--run', planPath], dir);
  assert.equal(r.code, 0);
  assert.match(r.out, /suite: pass/);
  assert.doesNotMatch(r.out, /note suite:/);
});

test('--run notes a suite that runs 0 tests in the sandbox', () => {
  const { planPath, dir } = fixture(`${MACHINE_GLOB_SUITE}\n`, { 'exists.md': 'ok\n' });
  const r = run(['--run', planPath], dir);
  assert.equal(r.code, 0);
  assert.match(r.out, /suite: pass/);
  assert.match(r.out, /note suite: 0 tests ran in sandbox — repo-wide suite, not block-reachable/);
});

test('--extract keeps and reports the sandbox', () => {
  const { planPath, dir } = fixture(
    `${MACHINE}\n\n\`\`\`bash path=scripts/x.sh\necho hi\n\`\`\`\n`,
    { 'exists.md': 'ok\n' });
  const r = run(['--extract', planPath], dir);
  assert.equal(r.code, 0);
  assert.match(r.out, /sandbox: \S/);
  const m = r.out.match(/sandbox: (\S+)/);
  assert.ok(existsSync(join(m[1], 'scripts', 'x.sh')), 'tagged block extracted into kept sandbox');
  rmSync(m[1], { recursive: true, force: true });
});

test('usage errors exit 2', () => {
  assert.equal(run([]).code, 2);
});

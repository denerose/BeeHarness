import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, chmodSync, existsSync, readFileSync } from 'node:fs';
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

test('--run executes the declared suite and passes', () => {
  const { planPath, dir } = fixture(`${MACHINE}\n`, { 'exists.md': 'ok\n' });
  const r = run(['--run', planPath], dir);
  assert.equal(r.code, 0);
  assert.match(r.out, /suite: pass/);
});

test('usage errors exit 2', () => {
  assert.equal(run([]).code, 2);
});

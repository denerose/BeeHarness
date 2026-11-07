import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { run } from '../bin/bee.js';

const TESTS_DIR = path.dirname(fileURLToPath(import.meta.url));

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

test('local default is project-local: subprocess from a consumer repo',
  async () => {
    // Review r1 blocking: the default store must resolve from the
    // runner's repo (cwd), never from the harness checkout.
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-suggest-sub-'));
    try {
      const git = (...args) => execFileSync('git', args, { cwd: dir });
      git('init');
      git('config', 'user.email', 't@t');
      git('config', 'user.name', 't');
      const bee = path.resolve(TESTS_DIR, '..', 'bin', 'bee.js');
      const r = execFileSync('node', [bee, 'suggest',
        'consumer feedback lands at home'], { cwd: dir,
        encoding: 'utf8' });
      assert.match(r, /IN-001 suggested · keeper/);
      const inbox = path.join(dir, '.hivemind', 'inbox.toon');
      assert.match(r, new RegExp(
        `bee inbox show IN-001 --store ${
          inbox.replace(/\//g, '\\/')}`),
        'hint must name the non-default store (review r2)');
      assert.ok(fs.existsSync(inbox),
        'item must land in the CONSUMER repo inbox');
      assert.match(fs.readFileSync(inbox, 'utf8'),
        /consumer feedback lands at home/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }, { timeout: 30000 });

// ---- AXI pass (P6 task 6): help reachability ----

test('help prints usage, files nothing (AXI 10)', () => {
  const machine = tmp();
  const r = run(['suggest', 'help', '--machine', machine,
    '--store', path.join(tmp(), 'inbox.toon')]);
  assert.equal(r.code, 0);
  assert.match(r.out, /usage: bee suggest/);
  // P8 Task 6: observation-type help line (plan-verbatim wording)
  assert.match(r.out,
    /problem with no proposed solution\s+\(observation-type\); it routes as a design input\./);
  const folder = path.join(machine, 'suggestions');
  assert.ok(!fs.existsSync(folder));
});

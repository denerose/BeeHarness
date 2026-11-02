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

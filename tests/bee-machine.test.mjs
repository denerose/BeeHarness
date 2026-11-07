import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { run } from '../bin/bee.js';

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bee-machine-'));
}

function tmpSettings(dir) {
  const sp = path.join(dir, 'settings.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  return sp;
}

test('init writes a registry entry, keyed by repo path', () => {
  const home = tmp();                 // consumer repo (cwd not changed:
  const machine = tmp();              // registration uses process cwd)
  const sp = tmpSettings(home);
  const r = run(['init', '--settings', sp, '--machine', machine]);
  assert.equal(r.code, 0);
  const reg = fs.readFileSync(path.join(machine, 'registry.toon'), 'utf8');
  assert.match(reg, /^# bee machine registry/m);
  const lines = reg.split('\n').filter((l) => l && !l.startsWith('#'));
  assert.equal(lines.length, 1);
  assert.match(lines[0], /^.+ :: commit [0-9a-f]{7,40} :: \S+$/);
  assert.match(r.out, /machine registry: .* — registered .+ @ [0-9a-f]{7}/);
});

test('re-init updates the entry, never duplicates', () => {
  const home = tmp();
  const machine = tmp();
  const sp = tmpSettings(home);
  run(['init', '--settings', sp, '--machine', machine]);
  const before = fs.readFileSync(path.join(machine, 'registry.toon'), 'utf8');
  const r = run(['init', '--settings', sp, '--machine', machine]);
  assert.equal(r.code, 0);
  const lines = fs.readFileSync(path.join(machine, 'registry.toon'), 'utf8')
    .split('\n').filter((l) => l && !l.startsWith('#'));
  assert.equal(lines.length, 1);
  assert.match(r.out, /in sync/);
  assert.notEqual(before, ''); // sanity: first write happened
});

test('--check reports without writing the registry', () => {
  const home = tmp();
  const machine = tmp();
  const sp = tmpSettings(home);
  const r = run(['init', '--check', '--settings', sp, '--machine', machine]);
  assert.equal(r.code, 1); // skills NOT registered drives exit 1 (P2 rule)
  assert.match(r.err, /NOT registered/);
  assert.ok(!fs.existsSync(path.join(machine, 'registry.toon')),
    '--check must not create the registry');
});

test('drift is informational: exit 0, DRIFTED line', () => {
  const home = tmp();
  const machine = tmp();
  const sp = tmpSettings(home);
  run(['init', '--settings', sp, '--machine', machine]);
  // registration ran from the live harness repo; a forged stale entry
  // forces drift without mutating the real repo:
  const regPath = path.join(machine, 'registry.toon');
  const stale = fs.readFileSync(regPath, 'utf8')
    .replace(/commit [0-9a-f]+/, 'commit 0000000');
  fs.writeFileSync(regPath, stale);
  const r = run(['init', '--settings', sp, '--machine', machine]);
  assert.equal(r.code, 0);
  assert.match(r.out, /DRIFTED/);
  // write mode re-registers: a third run is in sync again
  const r2 = run(['init', '--settings', sp, '--machine', machine]);
  assert.equal(r2.code, 0);
  assert.match(r2.out, /in sync/);
});

test('registry survives unrelated lines (read-modify-write keeps them)', () => {
  const home = tmp();
  const machine = tmp();
  const sp = tmpSettings(home);
  run(['init', '--settings', sp, '--machine', machine]);
  const regPath = path.join(machine, 'registry.toon');
  fs.appendFileSync(regPath,
    '/elsewhere/other :: commit abcdef1 :: 2026-01-01T00:00:00+00:00\n');
  run(['init', '--settings', sp, '--machine', machine]);
  const after = fs.readFileSync(regPath, 'utf8');
  assert.match(after, /\/elsewhere\/other/);
});

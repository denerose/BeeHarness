import { test } from 'node:test';
import assert from 'node:assert/strict';
import { run, VERSION } from '../bin/bee.js';

test('help exits 0 with usage', () => {
  const r = run(['help']);
  assert.equal(r.code, 0);
  assert.match(r.out, /usage:/);
});

test('no args = help', () => {
  assert.equal(run([]).code, 0);
});

test('unknown command exits 1', () => {
  const r = run(['bogus']);
  assert.equal(r.code, 1);
  assert.match(r.err, /unknown command/);
});

test('version prints VERSION', () => {
  assert.match(run(['version']).out, new RegExp(VERSION));
});

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bee-init-'));
}

test('init: adds skills entry, preserves other keys', () => {
  const dir = tmp();
  const sp = path.join(dir, 'settings.json');
  fs.writeFileSync(sp, JSON.stringify({
    theme: 'dark',
    skills: ['~/other/skills'],
  }, null, 2));
  const r = run(['init', '--settings', sp]);
  assert.equal(r.code, 0);
  const after = JSON.parse(fs.readFileSync(sp, 'utf8'));
  assert.equal(after.theme, 'dark');
  assert.deepEqual(after.skills,
    ['~/other/skills', '~/BeeHarness/skills']);
});

test('init: --check on unregistered exits 1, writes nothing', () => {
  const dir = tmp();
  const sp = path.join(dir, 'settings.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const before = fs.readFileSync(sp, 'utf8');
  const r = run(['init', '--check', '--settings', sp]);
  assert.equal(r.code, 1);
  assert.match(r.err, /NOT registered/);
  assert.equal(fs.readFileSync(sp, 'utf8'), before);
});

test('init: already registered exits 0 (tilde entry)', () => {
  const dir = tmp();
  const sp = path.join(dir, 'settings.json');
  fs.writeFileSync(sp, JSON.stringify({
    skills: ['~/BeeHarness/skills'],
  }, null, 2));
  const r = run(['init', '--settings', sp]);
  assert.equal(r.code, 0);
  assert.match(r.out, /already registered/);
});

test('init: malformed settings exits 1, writes nothing', () => {
  const dir = tmp();
  const sp = path.join(dir, 'settings.json');
  fs.writeFileSync(sp, '{broken');
  const r = run(['init', '--settings', sp]);
  assert.equal(r.code, 1);
  assert.match(r.err, /cannot parse/);
});

test('init: missing settings file is created fresh', () => {
  const dir = tmp();
  const sp = path.join(dir, 'nested', 'settings.json');
  const r = run(['init', '--settings', sp]);
  assert.equal(r.code, 0);
  const after = JSON.parse(fs.readFileSync(sp, 'utf8'));
  assert.deepEqual(after.skills, ['~/BeeHarness/skills']);
});

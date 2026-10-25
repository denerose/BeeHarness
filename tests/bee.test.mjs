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

import { fileURLToPath } from 'node:url';
const TESTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const FIX = path.join(TESTS_DIR, 'fixtures');

function reportTmp() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-report-'));
  // copy fixtures; create the file the derived ask references so
  // absolutization resolves it
  fs.mkdirSync(path.join(dir, '.hivemind', 'designs'), {
    recursive: true,
  });
  fs.copyFileSync(path.join(FIX, 'status.md'),
    path.join(dir, '.hivemind', 'status.md'));
  fs.writeFileSync(path.join(dir, '.hivemind', 'designs', 'widget.md'),
    '# widget\n');
  return dir;
}

test('report: keeper list verbatim, merge keeps untraceable ask', () => {
  const dir = reportTmp();
  const rp = path.join(dir, 'keeper-report.md');
  fs.copyFileSync(path.join(FIX, 'report.md'), rp);
  const r = run(['report', '--status',
    path.join(dir, '.hivemind', 'status.md'), '--report', rp]);
  assert.equal(r.code, 0);
  const after = fs.readFileSync(rp, 'utf8');
  const kl = after.split("## Keeper's list")[1].split('##')[0];
  assert.ok(kl.includes('Pick a name for the second hive.'));
  assert.ok(after.includes('Untraceable ask kept'));
  assert.ok(!after.includes('Ratify the widget design.')); // deduped
  assert.ok(after.includes('An old ask wrapped across two lines ' +
    'because live reports wrap.')); // wrapped old item joined
});

test('report: derived asks land, paths absolute', () => {
  const dir = reportTmp();
  const rp = path.join(dir, 'keeper-report.md');
  fs.copyFileSync(path.join(FIX, 'report.md'), rp);
  run(['report', '--status', path.join(dir, '.hivemind', 'status.md'),
    '--report', rp]);
  const after = fs.readFileSync(rp, 'utf8');
  assert.ok(after.includes('sample ask two'));
  assert.ok(after.includes(
    path.join(dir, '.hivemind', 'designs', 'widget.md')));
});

test('report: --check writes nothing', () => {
  const dir = reportTmp();
  const rp = path.join(dir, 'keeper-report.md');
  fs.copyFileSync(path.join(FIX, 'report.md'), rp);
  const before = fs.readFileSync(rp, 'utf8');
  const r = run(['report', '--check', '--status',
    path.join(dir, '.hivemind', 'status.md'), '--report', rp]);
  assert.equal(r.code, 0);
  assert.ok(r.out.includes("## Needs the keeper"));
  assert.equal(fs.readFileSync(rp, 'utf8'), before);
});

test('report: second run is idempotent (zones byte-stable)', () => {
  const dir = reportTmp();
  const rp = path.join(dir, 'keeper-report.md');
  fs.copyFileSync(path.join(FIX, 'report.md'), rp);
  const st = path.join(dir, '.hivemind', 'status.md');
  run(['report', '--status', st, '--report', rp]);
  const first = fs.readFileSync(rp, 'utf8');
  run(['report', '--status', st, '--report', rp]);
  const second = fs.readFileSync(rp, 'utf8');
  const zones = (s) => s.slice(s.indexOf("## Keeper's list"));
  assert.equal(zones(second), zones(first));
});

test('report: changed/sample zones verbatim, header Generated restamped',
    () => {
  const dir = reportTmp();
  const rp = path.join(dir, 'keeper-report.md');
  fs.copyFileSync(path.join(FIX, 'report.md'), rp);
  run(['report', '--status', path.join(dir, '.hivemind', 'status.md'),
    '--report', rp]);
  const after = fs.readFileSync(rp, 'utf8');
  assert.ok(after.includes('- Fixture change line.'));
  assert.ok(after.includes('/already/absolute/sample.md'));
  assert.ok(after.includes('Protocol block stands in'));
  assert.match(after, /\*\*Generated:\*\*.*by bee report/);
});

test('report: missing zone heading refuses to write', () => {
  const dir = reportTmp();
  const rp = path.join(dir, 'keeper-report.md');
  fs.writeFileSync(rp, '# no zones here\n');
  const before = fs.readFileSync(rp, 'utf8');
  const r = run(['report', '--status',
    path.join(dir, '.hivemind', 'status.md'), '--report', rp]);
  assert.equal(r.code, 1);
  assert.match(r.err, /refusing to write/);
  assert.equal(fs.readFileSync(rp, 'utf8'), before);
});

test('report: fresh file gets protocol header + placeholder list', () => {
  const dir = reportTmp();
  const rp = path.join(dir, 'keeper-report.md');
  const r = run(['report', '--status',
    path.join(dir, '.hivemind', 'status.md'), '--report', rp]);
  assert.equal(r.code, 0);
  const after = fs.readFileSync(rp, 'utf8');
  assert.ok(after.includes('read before regenerating'));
  assert.ok(after.includes('sample ask two'));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { run } from '../bin/bee.js';

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bee-agents-'));
}
function git(cwd, ...args) {
  return execFileSync('git', args, { cwd }).toString();
}
function initRepo(dir, settings) {
  git(dir, 'init');
  const machine = tmp();
  fs.writeFileSync(settings, JSON.stringify({ skills: [] }, null, 2));
  return run(['init', '--settings', settings, '--machine', machine, '--repo', dir]);
}

test('creates AGENTS.md with the block when absent', () => {
  const dir = tmp();
  const sp = path.join(dir, 's.json');
  const r = initRepo(dir, sp);
  assert.equal(r.code, 0, r.err);
  const ag = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
  assert.match(ag, /# AGENTS\.md — /);
  assert.match(ag, /bee:managed:start/);
  assert.match(ag, /bee:managed:end/);
  assert.match(ag, /bee glossary/);
});

test('appends to an existing AGENTS.md, keeps project text', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'AGENTS.md'),
    '# My project\n\nOur own rule: be kind.\n');
  const sp = path.join(dir, 's.json');
  const r = initRepo(dir, sp);
  assert.equal(r.code, 0, r.err);
  const ag = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
  assert.match(ag, /Our own rule: be kind\./);
  assert.ok(ag.indexOf('bee:managed:start') > ag.indexOf('be kind'));
});

test('idempotent: second run leaves the file byte-identical', () => {
  const dir = tmp();
  const sp = path.join(dir, 's.json');
  initRepo(dir, sp);
  const before = fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8');
  const machine = tmp();
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', dir]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /managed block: current|managed block: updated/);
  assert.equal(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8'), before);
});

test('updates only between fences; project text outside untouched', () => {
  const dir = tmp();
  const sp = path.join(dir, 's.json');
  initRepo(dir, sp);
  const agPath = path.join(dir, 'AGENTS.md');
  let ag = fs.readFileSync(agPath, 'utf8');
  ag = ag.replace('bee glossary', 'STALE bee glossary');
  fs.writeFileSync(agPath, ag);
  const machine = tmp();
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', dir]);
  assert.equal(r.code, 0, r.err);
  const after = fs.readFileSync(agPath, 'utf8');
  assert.match(after, /bee glossary/);
  assert.ok(!after.includes('STALE'));
});

test('single fence: fail loud, no writes', () => {
  const dir = tmp();
  fs.writeFileSync(path.join(dir, 'AGENTS.md'),
    '# P\n\n<!-- bee:managed:start -->\norphan\n');
  git(dir, 'init');
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', dir]);
  assert.equal(r.code, 1);
  assert.match(r.err, /corrupt managed block/);
  assert.match(fs.readFileSync(path.join(dir, 'AGENTS.md'), 'utf8'), /orphan/);
});

test('AGENTS.md as a directory: structured error, no raw stack', () => {
  const dir = tmp();
  fs.mkdirSync(path.join(dir, 'AGENTS.md'));
  git(dir, 'init');
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', dir]);
  assert.equal(r.code, 1);
  assert.match(r.err, /bee init: cannot read .*AGENTS\.md: /);
  assert.doesNotMatch(r.err, /at /); // no stack frames
});

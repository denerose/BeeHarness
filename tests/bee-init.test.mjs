import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { run } from '../bin/bee.js';

const TESTS_DIR = path.dirname(fileURLToPath(import.meta.url));

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bee-init6-'));
}
function git(cwd, ...args) {
  return execFileSync('git', args, { cwd }).toString();
}

test('green-fields: creates git + full scaffold', () => {
  const dir = tmp();
  const machine = tmp();
  const sp = path.join(dir, '..', path.basename(dir) + '-settings.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const repo = path.join(dir, 'notes');
  fs.mkdirSync(repo);
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', repo]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /created git repository/);
  for (const rel of [
    'docs/.gitkeep',
    '.hivemind/phases/TEMPLATE.md',
    '.hivemind/designs/TEMPLATE.md',
    '.hivemind/phases/notes.md',
    '.hivemind/inbox.toon',
    '.hivemind/glossary.toon',
    '.hivemind/status.md',
    '.hivemind/config.toon',
    '.gitignore',
  ]) {
    assert.ok(fs.existsSync(path.join(repo, rel)), 'missing: ' + rel);
  }
  assert.match(fs.readFileSync(path.join(repo, '.hivemind/config.toon'), 'utf8'),
    /level :: L1/);
  assert.match(fs.readFileSync(path.join(repo, '.gitignore'), 'utf8'),
    /\.hivemind\/sessions\//);
  assert.match(r.out, /in sync|DRIFTED/); // registry + drift reported
});

test('existing docs/ gets docs/research/, no .gitkeep', () => {
  const dir = tmp();
  fs.mkdirSync(path.join(dir, 'docs'));
  fs.writeFileSync(path.join(dir, 'docs', 'keep.md'), 'x');
  git(dir, 'init');
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', dir]);
  assert.equal(r.code, 0, r.err);
  assert.ok(fs.existsSync(path.join(dir, 'docs', 'research')));
  assert.ok(!fs.existsSync(path.join(dir, 'docs', '.gitkeep')));
});

test('idempotent: second run reports exists everywhere, exits 0', () => {
  const dir = tmp();
  git(dir, 'init');
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  run(['init', '--settings', sp, '--machine', machine, '--repo', dir]);
  const before = fs.readFileSync(path.join(dir, '.hivemind/config.toon'), 'utf8');
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', dir]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /exists: /);
  assert.equal(
    fs.readFileSync(path.join(dir, '.hivemind/config.toon'), 'utf8'), before);
});

test('--check scaffolds nothing', () => {
  const dir = tmp();
  git(dir, 'init');
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const r = run(['init', '--check', '--settings', sp, '--machine', machine, '--repo', dir]);
  assert.equal(r.code, 1); // skills unregistered drives exit 1
  assert.ok(!fs.existsSync(path.join(dir, '.hivemind')));
});

test('worktree edge: linked worktree refuses with instruction', () => {
  const dir = tmp();
  git(dir, 'init');
  git(dir, 'commit', '--allow-empty', '-m', 'x');
  git(dir, 'branch', 'phase/1');
  const wt = dir + '-wt';
  git(dir, 'worktree', 'add', '-b', 'task/1-a', wt, 'phase/1');
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', wt]);
  assert.equal(r.code, 0);
  assert.match(r.out, /return to the main worktree/);
  assert.ok(!fs.existsSync(path.join(wt, '.hivemind')));
});

test('harness repo: skip line, no scaffold writes beyond registry', () => {
  const machine = tmp();
  const sp = path.join(machine, 's.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const r = run(['init', '--settings', sp, '--machine', machine,
    '--repo', path.resolve(TESTS_DIR, '..')]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /harness repo — scaffolding \+ managed block skipped/);
});

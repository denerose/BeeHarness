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

// ---- AXI pass (P6 task 6): init help reachability + next-step line

test('init: help exits 0 with the family usage (AXI 10)', () => {
  const r = run(['init', 'help']);
  assert.equal(r.code, 0);
  assert.match(r.out, /usage: bee init/);
});

test('init: misuse exits 1 with usage, never a raw parse error (AXI 10)', () => {
  const r = run(['init', '--bogus']);
  assert.equal(r.code, 1);
  assert.match(r.err, /usage: bee init/);
  assert.ok(!r.err.includes('TypeError'));
});

test('init: write run ends with exactly one next-step line when nothing scaffolds (AXI 9)', () => {
  const dir = tmp();
  const sp = path.join(dir, 'settings.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const repo = path.join(dir, 'repo');
  fs.mkdirSync(repo);
  const first = run(['init', '--settings', sp, '--machine', dir,
    '--repo', repo]);
  assert.equal(first.code, 0, first.err);
  assert.match(first.out, /bee init: next — commit the scaffold/);
  // re-runs converge on nothing-to-scaffold (docs/research lands on
  // the second pass — the docs/ branch adds research/ only once
  // docs/ exists); the machine store still re-registers each time
  let again;
  for (let i = 0; i < 2; i++) {
    again = run(['init', '--settings', sp, '--machine', dir,
      '--repo', repo]);
    assert.equal(again.code, 0, again.err);
  }
  assert.match(again.out,
    /bee init: next — bee init --check reports registration \+ drift/);
  assert.equal((again.out.match(/bee init: next —/g) ?? []).length, 1);
  // --check is a read: no next-step line
  const check = run(['init', '--check', '--settings', sp,
    '--machine', dir, '--repo', repo]);
  assert.equal(check.code, 0, check.err);
  assert.ok(!check.out.includes('bee init: next'));
});

test('harness repo: write run still ends with the next-step line (AXI 9)', () => {
  const machine = tmp();
  const sp = path.join(machine, 's.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const r = run(['init', '--settings', sp, '--machine', machine,
    '--repo', path.resolve(TESTS_DIR, '..')]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /harness repo — scaffolding \+ managed block skipped/);
  assert.match(r.out,
    /bee init: next — bee init --check reports registration \+ drift/);
});

// ---- settings prune (P8 task 4, D6): dead entries self-heal

function targetEntry() {
  return path.resolve(TESTS_DIR, '..', 'skills');
}

test('init: dead settings entry drops on a write run, live kept (D6)', () => {
  const dir = tmp();
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  const dead = path.join(dir, 'gone-skill');
  fs.writeFileSync(sp, JSON.stringify(
    { skills: [targetEntry(), dead] }, null, 2));
  const repo = path.join(dir, 'repo');
  fs.mkdirSync(repo);
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', repo]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /already registered: /);
  assert.match(r.out, /pruned 1 dead entry\(ies\): .*gone-skill/);
  const after = JSON.parse(fs.readFileSync(sp, 'utf8'));
  assert.deepEqual(after.skills, [targetEntry()]);
});

test('init: --check names would-prune entries, writes nothing (D6)', () => {
  const dir = tmp();
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  const dead = path.join(dir, 'gone-skill');
  const original = JSON.stringify(
    { skills: [targetEntry(), dead] }, null, 2) + '\n';
  fs.writeFileSync(sp, original);
  const repo = path.join(dir, 'repo');
  fs.mkdirSync(repo);
  const r = run(['init', '--check', '--settings', sp,
    '--machine', machine, '--repo', repo]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /would prune: .*gone-skill/);
  assert.ok(!r.out.includes('pruned 1'));
  assert.equal(fs.readFileSync(sp, 'utf8'), original);
});

test('init: settings with only live entries stay byte-unchanged (D6)', () => {
  const dir = tmp();
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  const other = path.join(dir, 'other-skill');
  fs.mkdirSync(other);
  const original = JSON.stringify(
    { skills: [targetEntry(), other] }, null, 2) + '\n';
  fs.writeFileSync(sp, original);
  const repo = path.join(dir, 'repo');
  fs.mkdirSync(repo);
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', repo]);
  assert.equal(r.code, 0, r.err);
  assert.ok(!r.out.includes('pruned'));
  assert.equal(fs.readFileSync(sp, 'utf8'), original);
});

test('init: miss path prunes too — one write registers without the dead (D6)', () => {
  const dir = tmp();
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  const dead = path.join(dir, 'gone-skill');
  fs.writeFileSync(sp, JSON.stringify({ skills: [dead] }, null, 2));
  const repo = path.join(dir, 'repo');
  fs.mkdirSync(repo);
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', repo]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /bee init: registered /);
  assert.match(r.out, /pruned 1 dead entry\(ies\): .*gone-skill/);
  const after = JSON.parse(fs.readFileSync(sp, 'utf8'));
  assert.equal(after.skills.length, 1); // registered, dead gone
  assert.ok(after.skills[0].endsWith('skills'));
});

// ---- template glossary seed (P8 task 17, item 4, D10)

const SEEDED_BEE_LOOP_LINE =
  'bee-loop :: the plan → implement → verify → review cycle; ' +
  'entered only by explicit direction :: -';
const SEEDED_KEEPER_LINE =
  'keeper :: the human owner; final authority on every decision ' +
  'that matters :: -';

test('green-fields: glossary.toon seeded with the core terms (D10)', () => {
  const dir = tmp();
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const repo = path.join(dir, 'repo');
  fs.mkdirSync(repo);
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', repo]);
  assert.equal(r.code, 0, r.err);
  const store = fs.readFileSync(
    path.join(repo, '.hivemind/glossary.toon'), 'utf8');
  const termLines = store.split('\n')
    .filter((l) => l !== '' && !l.startsWith('#'));
  assert.ok(termLines.length >= 21,
    `expected >= 21 term lines, got ${termLines.length}`);
  assert.ok(store.includes(SEEDED_BEE_LOOP_LINE + '\n'),
    'missing bee-loop line verbatim');
  assert.ok(store.includes(SEEDED_KEEPER_LINE + '\n'),
    'missing keeper line verbatim');
});

test('init: seeded glossary.toon is never re-seeded (D10)', () => {
  const dir = tmp();
  const machine = tmp();
  const sp = path.join(dir, 's.json');
  fs.writeFileSync(sp, JSON.stringify({ skills: [] }, null, 2));
  const repo = path.join(dir, 'repo');
  fs.mkdirSync(repo);
  run(['init', '--settings', sp, '--machine', machine, '--repo', repo]);
  const store = path.join(repo, '.hivemind/glossary.toon');
  const before = fs.readFileSync(store, 'utf8');
  const edited = before + 'local term :: added by the project :: -\n';
  fs.writeFileSync(store, edited); // keeper-owned line must survive
  const r = run(['init', '--settings', sp, '--machine', machine, '--repo', repo]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /exists: /);
  assert.equal(fs.readFileSync(store, 'utf8'), edited);
});

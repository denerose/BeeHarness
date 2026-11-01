// AXI compliance battery for `bee design` (P4 Task 4) — the CLI
// surface over scripts/design.sh. Never touches the live
// .hivemind/designs: `new` runs against BEE_DESIGN_DIR temp dirs,
// pick-up/implement run inside temp git repos (the script resolves
// the repo from cwd, hashes need commits).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { run } from '../bin/bee.js';

function tmpDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bee-design-'));
}

function today() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' +
    p(d.getDate());
}

// Run `bee design …` with BEE_DESIGN_DIR=<dir> (and optionally cwd)
// — env/cwd always restored, tests stay sequential per file.
function inDesignDir(dir, argv, cwd) {
  const prevEnv = process.env.BEE_DESIGN_DIR;
  const prevCwd = process.cwd();
  process.env.BEE_DESIGN_DIR = dir;
  try {
    if (cwd !== undefined) process.chdir(cwd);
    return run(['design', ...argv]);
  } finally {
    if (cwd !== undefined) process.chdir(prevCwd);
    if (prevEnv === undefined) delete process.env.BEE_DESIGN_DIR;
    else process.env.BEE_DESIGN_DIR = prevEnv;
  }
}

// A throwaway git repo whose .hivemind/designs is a fixture home.
function tmpGitRepo() {
  const dir = tmpDir();
  const designs = path.join(dir, '.hivemind', 'designs');
  fs.mkdirSync(designs, { recursive: true });
  const git = (cmd) =>
    execSync(`git ${cmd}`, { cwd: dir, encoding: 'utf8' });
  git('init -q -b main');
  git('config user.email bee@test.local');
  git('config user.name bee-test');
  return { dir, designs, git };
}

// AXI 8 — content first: bare `bee design` lists live data, not help.
test('bare design = status (content first)', () => {
  const dir = tmpDir();
  const n = inDesignDir(dir, ['new', 'Fixture design']);
  assert.equal(n.code, 0, n.err);
  const r = inDesignDir(dir, []);
  assert.equal(r.code, 0);
  assert.match(r.out, /fixture-design\.md · live · phase -/);
  assert.ok(!r.out.includes('usage:'));
});

// AXI 5 — definitive empty state (absent designs dir, BEE_DESIGN_DIR
// seam — the script's documented seam).
test('status over an empty temp dir → 0 designs + next step', () => {
  const r = inDesignDir(path.join(tmpDir(), 'absent'), ['status']);
  assert.equal(r.code, 0);
  assert.ok(r.out.startsWith('0 designs'));
  assert.match(r.out, /next: copy .*TEMPLATE\.md/);
});

test('status lists state + drift flags', () => {
  const { dir, designs, git } = tmpGitRepo();
  const n = inDesignDir(designs, ['new', 'Inbox store shape'], dir);
  assert.equal(n.code, 0, n.err);
  const doc = path.join(designs, `${today()}-inbox-store-shape.md`);
  git(`add -A && git commit -qm fixture`);

  const pu = inDesignDir(designs,
    ['pick-up', doc, '--phase', '4'], dir);
  assert.equal(pu.code, 0, pu.err);
  assert.match(pu.out, /picked-up · phase 4/);

  let s = inDesignDir(designs, ['status'], dir);
  assert.equal(s.code, 0);
  assert.match(s.out, /^1 designs · 0 drift/);
  assert.match(s.out,
    /inbox-store-shape\.md · picked-up · phase 4$/m);

  // prose change after pick-up → drift flag (machine blocks excluded)
  fs.appendFileSync(doc, '\nan addendum in prose\n');
  s = inDesignDir(designs, ['status'], dir);
  assert.match(s.out, /^1 designs · 1 drift/);
  assert.match(s.out, /drift: pending rectification/);
  const full = inDesignDir(designs, ['status', '--full'], dir);
  assert.match(full.out, /drift: pending rectification \(content changed since /);
});

test('new fills title + date; machine block starts live', () => {
  const dir = tmpDir();
  const r = inDesignDir(dir, ['new', "Keeper's Secretary: roles"]);
  assert.equal(r.code, 0, r.err);
  const file = path.join(dir, `${today()}-keeper-s-secretary-roles.md`);
  const text = fs.readFileSync(file, 'utf8');
  assert.match(text, /^# Keeper's Secretary: roles — design note$/m);
  assert.match(text, new RegExp(`^\\*\\*Date:\\*\\* ${today()}$`, 'm'));
  assert.match(text, /^status: live$/m);
  assert.match(r.out, /next: fill the sections/);
});

test('new refuses an existing path (no overwrite)', () => {
  const dir = tmpDir();
  const first = inDesignDir(dir, ['new', 'Same title']);
  assert.equal(first.code, 0, first.err);
  const file = path.join(dir, `${today()}-same-title.md`);
  const before = fs.readFileSync(file, 'utf8');
  const second = inDesignDir(dir, ['new', 'Same title']);
  assert.equal(second.code, 1);
  assert.match(second.err, /already exists — refusing to overwrite/);
  assert.match(second.err, /fix: pick a different title/);
  assert.equal(fs.readFileSync(file, 'utf8'), before);
});

// AXI 6 — mutations --check never write.
test('new --check writes nothing', () => {
  const dir = tmpDir();
  const r = inDesignDir(dir, ['new', 'Checked design', '--check']);
  assert.equal(r.code, 0);
  assert.match(r.out, /--check: would create/);
  assert.equal(fs.readdirSync(dir).length, 0);
});

test('pick-up --check and implement --check write nothing', () => {
  const { dir, designs, git } = tmpGitRepo();
  inDesignDir(designs, ['new', 'Transitions'], dir);
  const doc = path.join(designs, `${today()}-transitions.md`);
  git(`add -A && git commit -qm fixture`);

  let r = inDesignDir(designs, ['pick-up', doc, '--phase', '4',
    '--check'], dir);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /no write/);
  const committed = fs.readFileSync(doc, 'utf8');
  assert.ok(!committed.includes('status: picked-up'));

  inDesignDir(designs, ['pick-up', doc, '--phase', '4'], dir);
  const picked = fs.readFileSync(doc, 'utf8');
  assert.match(picked, /^status: picked-up$/m);

  r = inDesignDir(designs, ['implement', doc, '--phase', '4',
    '--merge', 'abc1234', '--check'], dir);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /no write/);
  assert.equal(fs.readFileSync(doc, 'utf8'), picked);

  // real implement completes the transition
  r = inDesignDir(designs, ['implement', doc, '--phase', '4',
    '--merge', 'abc1234'], dir);
  assert.equal(r.code, 0, r.err);
  assert.match(fs.readFileSync(doc, 'utf8'), /^status: implemented$/m);
  assert.match(fs.readFileSync(doc, 'utf8'), /^merge: abc1234$/m);
});

// Delegated output names the CLI surface (BEE_DESIGN_PROG seam):
// self-correction lines tell the agent to run `bee design …`.
test('delegated messages carry the bee design surface', () => {
  const { dir, designs, git } = tmpGitRepo();
  inDesignDir(designs, ['new', 'Surface check'], dir);
  const doc = path.join(designs, `${today()}-surface-check.md`);
  git(`add -A && git commit -qm fixture`);
  const pu = inDesignDir(designs, ['pick-up', doc, '--phase', '4'],
    dir);
  assert.equal(pu.code, 0, pu.err);
  assert.match(pu.out, /next: bee design implement/);
  assert.ok(!pu.out.includes('design.sh implement'));

  // refusals self-correct through the same surface
  const again = inDesignDir(designs,
    ['pick-up', doc, '--phase', '4'], dir);
  assert.equal(again.code, 1);
  assert.match(again.err, /bee design: pick-up .*refused/);
  assert.match(again.err, /fix: .*bee design implement/);
});

// AXI 6 — fail loud on unknown flags/subcommands: exit 1 + usage.
test('unknown flag → exit 1 + usage', () => {
  const dir = tmpDir();
  for (const argv of [['status', '--bogus'],
    ['new', 'x', '--bogus'],
    ['pick-up', 'doc.md', '--phase', '4', '--bogus']]) {
    const r = inDesignDir(dir, argv);
    assert.equal(r.code, 1, JSON.stringify(argv));
    assert.match(r.err, /--bogus/);
    assert.match(r.err, /usage:/);
  }
});

test('unknown subcommand → exit 1 + usage', () => {
  const r = run(['design', 'bogus']);
  assert.equal(r.code, 1);
  assert.match(r.err, /unknown subcommand 'bogus'/);
  assert.match(r.err, /usage:/);
});

test('help exits 0 with usage; new refuses empty slug + newlines', () => {
  const h = run(['design', 'help']);
  assert.equal(h.code, 0);
  assert.match(h.out, /usage:/);
  const dir = tmpDir();
  const noSlug = inDesignDir(dir, ['new', '???']);
  assert.equal(noSlug.code, 1);
  assert.match(noSlug.err, /empty slug/);
  const nl = inDesignDir(dir, ['new', 'a\nb']);
  assert.equal(nl.code, 1);
  assert.match(nl.err, /single-line/);
  assert.equal(fs.readdirSync(dir).length, 0);
});

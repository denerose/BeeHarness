// structure-check.test.mjs — suite wrapper for
// scripts/structure-check.sh. Each test builds a sandbox git repo
// in a mkdtemp dir (map + files committed) and runs the real
// script by absolute path with the sandbox root as <root>. The
// script is read-only; cleanup is the sandbox itself.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const exec = promisify(execFile);
const SCRIPT = path.resolve(path.dirname(fileURLToPath(import.meta.url)),
  '..', 'scripts', 'structure-check.sh');

// sandbox(mapText | null, files) — a git repo with the given
// structure map (none when null) and files (path → body, 'x\n'
// default); everything committed so ls-files sees it.
async function sandbox(mapText, files = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-struct-'));
  const git = (...args) => exec('git', args, { cwd: dir });
  await git('init', '-q', '-b', 'main');
  await git('config', 'user.email', 'test@example.com');
  await git('config', 'user.name', 'test');
  await git('config', 'commit.gpgsign', 'false');
  if (mapText !== null) {
    fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'scripts', 'structure.map'),
      mapText);
  }
  for (const name of Object.keys(files)) {
    const abs = path.join(dir, name);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, files[name] ?? 'x\n');
  }
  await git('add', '.');
  await git('commit', '-qm', 'seed');
  const cleanup = () => fs.rmSync(dir, { recursive: true, force: true });
  return { dir, git, cleanup };
}

// Run the script; never throws — captures exit code and streams.
const check = (...args) =>
  exec(SCRIPT, args).then(
    ({ stdout, stderr }) => ({ code: 0, stdout, stderr }),
    (e) => ({ code: e.code, stdout: e.stdout ?? '',
      stderr: e.stderr ?? '' }));

// A map shaped like the real seed (trimmed to the cases probed).
const MAP = [
  '# allowed structure — one pattern per line; <x> = one segment.',
  'root: .gitignore README.md docs scripts',
  'hivemind: .hivemind/status.md',
  'hivemind: .hivemind/<class>/<file>  # class: decisions logbook phases',
  'docs: docs/<file>.md docs/guidance/<file>.md',
  'scripts: scripts/<file>.sh scripts/structure.map',
].join('\n') + '\n';

test('clean tree (dotfiles, mid-segment placeholders) → 0 findings, exit 0',
  async () => {
    const s = await sandbox(MAP, {
      'README.md': '# t\n',
      '.gitignore': 'x\n',
      '.hivemind/status.md': 'status\n',
      '.hivemind/decisions/001-x.md': 'd\n',
      '.hivemind/phases/.gitkeep': '',
      'docs/a.md': 'a\n',
      'docs/guidance/b.md': 'b\n',
      'scripts/plan-checks.sh': '#\n',
      'scripts/structure.map': MAP, // the map checks itself too
    });
    try {
      const r = await check(s.dir);
      assert.equal(r.code, 0, r.stdout + r.stderr);
      assert.equal(r.stdout.trim(), '0 findings'); // definitive empty
    } finally {
      s.cleanup();
    }
  });

test('stray root file → finding + fix line, exit 1', async () => {
  const s = await sandbox(MAP, { 'README.md': '# t\n', 'stray.bin': 'x\n' });
  try {
    const r = await check(s.dir);
    assert.equal(r.code, 1);
    assert.match(r.stdout, /^1 findings\n/);
    assert.match(r.stdout,
      /^stray\.bin · - · fix: place it in an allowed class \(root, hivemind, docs, scripts\), or extend scripts\/structure\.map deliberately$/m);
  } finally {
    s.cleanup();
  }
});

test('wrong depth under a class root → home class + its patterns in fix',
  async () => {
    const s = await sandbox(MAP, {
      'README.md': '# t\n',
      'docs/deep/c.md': 'c\n', // <file> never crosses '/'
    });
    try {
      const r = await check(s.dir);
      assert.equal(r.code, 1);
      assert.match(r.stdout, /^1 findings\n/);
      assert.match(r.stdout,
        /^docs\/deep\/c\.md · docs · fix: place it in docs under an allowed pattern \(docs\/<file>\.md, docs\/guidance\/<file>\.md\), or extend scripts\/structure\.map deliberately$/m);
    } finally {
      s.cleanup();
    }
  });

test('unparseable map line is a finding itself', async () => {
  const s = await sandbox(
    'root: README.md\nscripts: scripts/structure.map\ngarbage line here\n',
    { 'README.md': '# t\n' });
  try {
    const r = await check(s.dir);
    assert.equal(r.code, 1);
    assert.match(r.stdout, /^1 findings\n/);
    assert.match(r.stdout,
      /^scripts\/structure\.map:3 · - · fix: line does not parse — shape: '<class>: <pattern> <pattern>…'$/m);
  } finally {
    s.cleanup();
  }
});

test('class line with no patterns is a finding', async () => {
  const s = await sandbox('root: README.md\nscripts: scripts/structure.map\nempty:\n',
    { 'README.md': '# t\n' });
  try {
    const r = await check(s.dir);
    assert.equal(r.code, 1);
    assert.match(r.stdout,
      /^scripts\/structure\.map:3 · - · fix: class 'empty' lists no patterns — add patterns or drop the line$/m);
  } finally {
    s.cleanup();
  }
});

test('trailing map comments are not patterns', async () => {
  const s = await sandbox(
    'docs: docs/<file>.md  # one level only\n' +
    'scripts: scripts/structure.map\n',
    { 'docs/a.md': 'a\n' });
  try {
    const r = await check(s.dir);
    assert.equal(r.code, 0, r.stdout + r.stderr);
      assert.equal(r.stdout.trim(), '0 findings');
  } finally {
    s.cleanup();
  }
});

test('no map → exit 2 + adopt fix line', async () => {
  const s = await sandbox(null, { 'README.md': '# t\n' });
  try {
    const r = await check(s.dir);
    assert.equal(r.code, 2);
    assert.match(r.stderr, /no structure map/);
    assert.match(r.stderr, /fix: add one to adopt the structure check/);
  } finally {
    s.cleanup();
  }
});

test('not a git repo → exit 2 + fix', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-struct-'));
  try {
    fs.mkdirSync(path.join(dir, 'scripts'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'scripts', 'structure.map'),
      'root: README.md\n');
    const r = await check(dir);
    assert.equal(r.code, 2);
    assert.match(r.stderr, /not a git repository/);
    assert.match(r.stderr, /fix: run against a git repo root/);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('wrong argument count → usage, exit 2', async () => {
  const r = await check();
  assert.equal(r.code, 2);
  assert.match(r.stderr, /usage: .* <root>/);
});

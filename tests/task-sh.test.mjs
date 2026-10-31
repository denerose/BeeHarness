// task-sh.test.mjs — suite wrapper for scripts/task.sh.
// Each test builds a sandbox git repo in a mkdtemp dir and invokes
// the real script by absolute path with cwd = sandbox. Derived
// worktrees land OUTSIDE the sandbox (<sandbox-parent>/$(basename
// <sandbox>)-task-<slug>) and are cleaned up per case.
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
  '..', 'scripts', 'task.sh');

async function sandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-tasksh-'));
  const git = (...args) => exec('git', args, { cwd: dir });
  await git('init', '-b', 'main');
  await git('config', 'user.email', 'test@example.com');
  await git('config', 'user.name', 'test');
  await git('config', 'commit.gpgsign', 'false');
  fs.writeFileSync(path.join(dir, 'README.md'), '# t\n');
  await git('add', '.');
  await git('commit', '-m', 'seed');
  await git('checkout', '-b', 'phase/9'); // plain checkout of the phase
  const wtPath = (slug) =>
    path.join(path.dirname(dir), `${path.basename(dir)}-task-${slug}`);
  const cleanup = () => {
    for (const p of [dir, wtPath('alpha'), wtPath('beta')]) {
      fs.rmSync(p, { recursive: true, force: true });
    }
  };
  return { dir, git, wtPath, cleanup };
}

// Run the script; never throws — captures exit code and streams.
const task = (dir, ...args) =>
  exec(SCRIPT, args, { cwd: dir }).then(
    ({ stdout, stderr }) => ({ code: 0, stdout, stderr }),
    (e) => ({ code: e.code, stdout: e.stdout ?? '', stderr: e.stderr ?? '' }));

// Commit inside a worktree (identity is shared via the common config).
const gitIn = (wt, ...args) => exec('git', args, { cwd: wt });

test('create: branch + worktree exist, prints path, exit 0', async () => {
  const s = await sandbox();
  try {
    const wt = s.wtPath('alpha');
    const r = await task(s.dir, 'create', '9-alpha');
    assert.equal(r.code, 0);
    assert.equal(r.stdout.trim(), wt);
    assert.ok(fs.existsSync(wt));
    const branches = (await s.git('branch', '--list', 'task/9-alpha')).stdout;
    assert.ok(branches.includes('task/9-alpha'));
  } finally {
    s.cleanup();
  }
});

test('merge: branch merged into phase/9, worktree + branch gone',
  async () => {
    const s = await sandbox();
    try {
      const wt = s.wtPath('alpha');
      await task(s.dir, 'create', '9-alpha');
      fs.writeFileSync(path.join(wt, 'work.txt'), 'task work\n');
      await gitIn(wt, 'add', '.');
      await gitIn(wt, 'commit', '-m', 'task work');
      const r = await task(s.dir, 'merge', 'alpha');
      assert.equal(r.code, 0);
      assert.match(r.stdout, /merged task\/9-alpha into phase\/9/);
      assert.match(r.stdout, /removed worktree/);
      assert.ok(!fs.existsSync(wt));
      const branches = (await s.git('branch', '--list', 'task/9-alpha')).stdout;
      assert.equal(branches.trim(), '');
      const subject = (await s.git('log', '-1', '--format=%s')).stdout.trim();
      assert.equal(subject, 'task work');
    } finally {
      s.cleanup();
    }
  });

test('abandon: unmerged branch with a commit -> exit 5, branch kept',
  async () => {
    const s = await sandbox();
    try {
      const wt = s.wtPath('alpha');
      await task(s.dir, 'create', '9-alpha');
      fs.writeFileSync(path.join(wt, 'work.txt'), 'task work\n');
      await gitIn(wt, 'add', '.');
      await gitIn(wt, 'commit', '-m', 'task work');
      const r = await task(s.dir, 'abandon', 'alpha');
      assert.equal(r.code, 5);
      assert.match(r.stderr, /git branch -D task\/9-alpha/);
      const branches = (await s.git('branch', '--list', 'task/9-alpha')).stdout;
      assert.ok(branches.includes('task/9-alpha'));
      assert.ok(!fs.existsSync(wt)); // worktree removed, branch kept
    } finally {
      s.cleanup();
    }
  });

test('abandon: empty task branch -> clean removal, exit 0', async () => {
  const s = await sandbox();
  try {
    const wt = s.wtPath('beta');
    await task(s.dir, 'create', '9-beta');
    const r = await task(s.dir, 'abandon', 'beta');
    assert.equal(r.code, 0);
    assert.ok(!fs.existsSync(wt));
    const branches = (await s.git('branch', '--list', 'task/9-beta')).stdout;
    assert.equal(branches.trim(), '');
  } finally {
    s.cleanup();
  }
});

test('create: off a non-phase branch -> exit 2', async () => {
  const s = await sandbox();
  try {
    await s.git('checkout', 'main');
    const r = await task(s.dir, 'create', '9-alpha');
    assert.equal(r.code, 2);
    assert.match(r.stderr, /not on a phase branch/);
  } finally {
    s.cleanup();
  }
});

test('create: existing branch name -> exit 3', async () => {
  const s = await sandbox();
  try {
    await s.git('branch', 'task/9-alpha'); // raw precondition
    const r = await task(s.dir, 'create', '9-alpha');
    assert.equal(r.code, 3);
    assert.match(r.stderr, /already exists/);
  } finally {
    s.cleanup();
  }
});

test('merge: ambiguous slug (two phases, same slug) -> exit 4', async () => {
  const s = await sandbox();
  try {
    await s.git('branch', 'task/8-alpha'); // other phase, same slug
    await task(s.dir, 'create', '9-alpha');
    const r = await task(s.dir, 'merge', 'alpha');
    assert.equal(r.code, 4);
    assert.match(r.stderr, /ambiguous/);
    assert.match(r.stderr, /task\/8-alpha/);
    assert.match(r.stderr, /task\/9-alpha/);
  } finally {
    s.cleanup();
  }
});

test('unknown subcommand -> exit 1, usage on stderr', async () => {
  const s = await sandbox();
  try {
    const r = await task(s.dir, 'frobnicate', 'x');
    assert.equal(r.code, 1);
    assert.match(r.stderr, /usage:/);
  } finally {
    s.cleanup();
  }
});

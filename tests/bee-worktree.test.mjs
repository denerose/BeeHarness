// bee-worktree.test.mjs — suite for `bee worktree` (P6 Task 5). Each
// test builds a sandbox git repo in a mkdtemp dir and runs bee IN-PROCESS
// with cwd parked in the sandbox (chdir in, restore after — the
// command reads its repo context from process.cwd(), never from the
// harness checkout). Derived worktrees land OUTSIDE the sandbox
// (<sandbox-parent>/$(basename <sandbox>)-task-<slug>) and are cleaned
// up per case.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { run } from '../bin/bee.js';

const exec = promisify(execFile);

async function sandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-beewt-'));
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

// Run `bee worktree` in-process (cwd must already sit in the sandbox);
// returns the run() result { code, out, err } — never throws.
const task = (...args) => run(['worktree', ...args]);

// Park cwd in the sandbox for the body, restore it (and clean up)
// after — bee's repo context is process.cwd().
async function inSandbox(s, body) {
  const prev = process.cwd();
  process.chdir(s.dir);
  try {
    await body();
  } finally {
    process.chdir(prev);
    s.cleanup();
  }
}

// Commit inside a worktree (identity is shared via the common config).
const gitIn = (wt, ...args) => exec('git', args, { cwd: wt });

test('create: branch + worktree exist, prints path, exit 0', async () => {
  const s = await sandbox();
  await inSandbox(s, async () => {
    const wt = s.wtPath('alpha');
    const r = task('create', '9-alpha');
    assert.equal(r.code, 0);
    assert.equal(r.out.trim(), wt);
    assert.ok(fs.existsSync(wt));
    const branches = (await s.git('branch', '--list', 'task/9-alpha')).stdout;
    assert.ok(branches.includes('task/9-alpha'));
  });
});

test('merge: branch merged into phase/9, worktree + branch gone',
  async () => {
    const s = await sandbox();
    await inSandbox(s, async () => {
      const wt = s.wtPath('alpha');
      task('create', '9-alpha');
      fs.writeFileSync(path.join(wt, 'work.txt'), 'task work\n');
      await gitIn(wt, 'add', '.');
      await gitIn(wt, 'commit', '-m', 'task work');
      const r = task('merge', 'alpha');
      assert.equal(r.code, 0);
      assert.match(r.out, /merged task\/9-alpha into phase\/9/);
      assert.match(r.out, /removed worktree/);
      assert.ok(!fs.existsSync(wt));
      const branches = (await s.git('branch', '--list', 'task/9-alpha')).stdout;
      assert.equal(branches.trim(), '');
      const subject = (await s.git('log', '-1', '--format=%s')).stdout.trim();
      assert.equal(subject, 'task work');
    });
  });

test('abandon: unmerged branch with a commit -> exit 5, branch kept',
  async () => {
    const s = await sandbox();
    await inSandbox(s, async () => {
      const wt = s.wtPath('alpha');
      task('create', '9-alpha');
      fs.writeFileSync(path.join(wt, 'work.txt'), 'task work\n');
      await gitIn(wt, 'add', '.');
      await gitIn(wt, 'commit', '-m', 'task work');
      const r = task('abandon', 'alpha');
      assert.equal(r.code, 5);
      assert.match(r.err, /git branch -D task\/9-alpha/);
      const branches = (await s.git('branch', '--list', 'task/9-alpha')).stdout;
      assert.ok(branches.includes('task/9-alpha'));
      assert.ok(!fs.existsSync(wt)); // worktree removed, branch kept
    });
  });

test('abandon: empty task branch -> clean removal, exit 0', async () => {
  const s = await sandbox();
  await inSandbox(s, async () => {
    const wt = s.wtPath('beta');
    task('create', '9-beta');
    const r = task('abandon', 'beta');
    assert.equal(r.code, 0);
    assert.ok(!fs.existsSync(wt));
    const branches = (await s.git('branch', '--list', 'task/9-beta')).stdout;
    assert.equal(branches.trim(), '');
  });
});

test('create: off a non-phase branch -> exit 2', async () => {
  const s = await sandbox();
  await inSandbox(s, async () => {
    await s.git('checkout', 'main');
    const r = task('create', '9-alpha');
    assert.equal(r.code, 2);
    assert.match(r.err, /not on a phase branch/);
  });
});

test('create: existing branch name -> exit 3', async () => {
  const s = await sandbox();
  await inSandbox(s, async () => {
    await s.git('branch', 'task/9-alpha'); // raw precondition
    const r = task('create', '9-alpha');
    assert.equal(r.code, 3);
    assert.match(r.err, /already exists/);
  });
});

test('merge: ambiguous slug (two phases, same slug) -> exit 4', async () => {
  const s = await sandbox();
  await inSandbox(s, async () => {
    await s.git('branch', 'task/8-alpha'); // other phase, same slug
    task('create', '9-alpha');
    const r = task('merge', 'alpha');
    assert.equal(r.code, 4);
    assert.match(r.err, /ambiguous/);
    assert.match(r.err, /task\/8-alpha/);
    assert.match(r.err, /task\/9-alpha/);
  });
});

test('unknown subcommand -> exit 1, usage on stderr', async () => {
  const s = await sandbox();
  await inSandbox(s, async () => {
    const r = task('frobnicate', 'x');
    assert.equal(r.code, 1);
    assert.match(r.err, /usage:/);
  });
});

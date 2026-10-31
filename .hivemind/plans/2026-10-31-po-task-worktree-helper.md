# Plan: task-worktree helper (`scripts/task.sh`)

**Date:** 2026-10-31
**Design doc:** ADR-012 (git topology — task tier mechanics) + ADR-007
amendment 2 (logbook rides task branches; reaches main at merge) +
ADR-013 (logbook naming). Parent plan:
`.hivemind/plans/2026-10-31-po-p3-orchestration-buildout.md` (Task 3).
**Validation level:** merge — task checks + `npm test` (the whole
suite; the helper's tests join it).
**Detail:** lean — the CLI contract below is exact (commands, args,
behaviors, errors, outputs); bash implementation is the implementer's.
Conventions covered by: in-repo test style (`tests/bee.test.mjs` —
mkdtemp sandboxes, assert/strict), ADR-012's tier definitions.
**Reviewed:** plan-reviewer passed 2026-10-31 — all git mechanics
verified empirically (git 2.47.3, scratch repos); 2 🔴 ($0-based
root resolution broke tests AND the parent plan's first merge;
done-gate unsatisfiable — exit 1 untested) + 4 🟡 fixed in-plan;
root resolution now cwd-based via --git-common-dir, worktree name
derived from repo basename (byte-identical for the real repo).

## Task 1: `scripts/task.sh`

**Files:** create `scripts/task.sh` (executable)
**Depends on:** nothing
**Provides:** the task-tier helper every future dispatch uses

CLI contract (bash + git only, zero dependencies). Repo context
resolves from the CURRENT DIRECTORY, never from the script's
location: repo root = `dirname $(git rev-parse --path-format=absolute
--git-common-dir)` (stable across main checkout, phase worktree, and
test sandboxes); git ops run in cwd. Reject a `<slug>` containing
`/` or ref-invalid characters: usage, exit 1.

- `task.sh create <phase>-<slug>`
  - Requires: current checkout is on a branch matching `phase/<n>`
    (else exit 2, "not on a phase branch").
  - Creates branch `task/<phase>-<slug>` at HEAD and worktree
    `<root-parent>/$(basename <root>)-task-<slug>` in one step
    (`git worktree add -b …`) — for this repo:
    `/home/saphron/BeeHarness-task-<slug>`.
  - Collision (branch or worktree path exists): exit 3, clear message.
  - Success: prints the worktree path to stdout, exit 0.
- `task.sh merge <slug>`
  - Resolves `<slug>` to the unique branch matching `task/*-<slug>`
    (0 or 2+ matches: exit 4, list candidates if 2+).
  - Requires: current checkout on a `phase/<n>` branch (exit 2).
  - Locates the task worktree by branch via `git worktree list
    --porcelain` (robust when the worktree was created by other
    means, e.g. the first raw-git dispatch).
  - Merges the task branch into the current phase branch; then
    removes the task worktree FIRST, deletes the branch second
    (branch checked out in a worktree cannot be deleted first).
  - Git failures (dirty worktree, unmerged) propagate: non-zero exit,
    git's message including the worktree path (a dirty worktree
    needs a hand `--force`; surface where).
  - Success: prints merged + removed lines to stdout, exit 0.
- `task.sh abandon <slug>`
  - Slug resolution as merge (`task/*-<slug>`, 0/2+ → exit 4). No
    phase-branch requirement — abandon operates on named refs from
    any checkout (task reset is PO's call anywhere, ADR-012). Removes
    worktree (porcelain lookup), deletes branch with `git branch -d`
    (NOT -D). Unmerged branch: exit 5, message suggests explicit
    `git branch -D` if truly intended.
- Unknown subcommand / wrong arg count: usage to stderr, exit 1.
- Every error path: message to stderr, no partial cleanup left behind
  (if worktree removal succeeds but branch delete fails, say so).

- [ ] Implement per contract; `chmod +x scripts/task.sh`.
- [ ] Smoke: from a scratch repo (NOT this one), create → merge →
  create → abandon cycles behave per contract.
- [ ] Commit (with `Role: task-orc` trailer, per dispatch brief):
  `implement task worktree helper`

## Task 2: suite wrapper `tests/task-sh.test.mjs`

**Files:** create `tests/task-sh.test.mjs`
**Depends on:** Task 1
**Provides:** deterministic coverage; `npm test` unchanged

- [ ] Wrapper pattern: `node:test` + `assert/strict`; each test
  builds a sandbox git repo in `fs.mkdtempSync(os.tmpdir())` —
  `git init -b main`, then local identity (`git config user.email
  test@example.com; git config user.name test`) before the initial
  commit, then create + check out a `phase/9` branch (a plain
  checkout of the phase branch is a valid context for the helper).
  Invokes the REAL script by absolute path via
  `child_process.execFile` with cwd = sandbox; asserts exit codes,
  stdout/stderr substrings, and filesystem state (worktree dirs —
  note the derived worktree path lands OUTSIDE the sandbox dir, as
  `<sandbox-parent>/$(basename <sandbox>)-task-<slug>`; clean it up
  per case — branches via `git branch --list`).
- [ ] Cases (one `test()` each):
  1. create → branch `task/9-alpha` + worktree exist, exit 0;
  2. merge → branch merged into `phase/9`, worktree + branch gone;
  3. abandon (unmerged task branch with a commit) → exit 5, branch
     still present;
  4. abandon of an empty task branch (create → abandon) → clean
     removal, exit 0;
  5. create off a non-phase branch → exit 2;
  6. create with existing branch name → exit 3;
  7. merge with ambiguous slug (two phases, same slug) → exit 4;
  8. unknown subcommand → exit 1, usage on stderr.
  Setup may use raw git for preconditions (e.g. `git branch
  task/8-alpha` for case 7); commits inside a task worktree run via
  `git -C <worktree-path>` using the printed path.
- [ ] Run `npm test` — all pass (existing 19 + 8 new).
- [ ] Commit (`Role: task-orc` trailer): `add task helper suite wrapper`

## Task 3: verify at merge level

**Depends on:** Task 2

- [ ] `npm test` green from the repo root of THIS worktree.
- [ ] Write logbook verify entry covering Tasks 1–2 (template:
  `skills/bee-verify/assets/verify-record-template.md`; name it
  `2026-10-31-po-task-worktree-helper-task1-2-verify-r1.md` —
  combined numbering has prior art).
- [ ] Commit (`Role: task-orc` trailer): `verify task worktree helper`

## Phase exit

Done means: `npm test` green including the eight new cases; every
exit code 1–5 covered by a case; logbook verify entry
filed on this branch (reaches main at merge, per ADR-007 amendment 2).

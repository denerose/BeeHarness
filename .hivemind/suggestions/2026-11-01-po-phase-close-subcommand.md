# Suggestion — phase-close subcommand (spine → main)

**Filed:** project-orchestrator, 2026-11-01 (P3 closure audit)
**Status:** awaiting keeper read

## What

`scripts/task.sh` covers the task tier (create / merge / abandon) but
nothing closes the phase tier: spine → main merge, worktree rest,
branch delete. P3 hand-rolled the close and produced a topology
defect: the plan's merge step was checked off but executed as direct
commits on main, leaving `phase/3` a patch-duplicate series (content
fully on main, no ancestry edge). Repaired retroactively (merge
commit 809385c completes the ancestry as a content no-op; worktree
detached at main; branch deleted) — but every future phase close hits
the same seam by hand, and ADR-006 (checked box without done work)
already bit here once.

## Proposal

Add a scripted close step for the phase tier — `task.sh close <n>`
subcommand or (preferred, once P4 lands) a `bee` CLI step inside the
loop's phase-close Record step:

1. verify the phase plan's boxes against logbook entries (records
   exist per task) — the ADR-006 guard;
2. `git merge phase/<n>` into main (merge commit per ADR-012, message
   templated);
3. detach the persistent worktree at main (rest state for the next
   spine cut);
4. `git branch -d phase/<n>`;
5. emit a structured result: steps run, ancestry verified.

Determinism test (ADR-014): every step is mechanical — script, not
prose. The agent keeps only the judgment: is the phase actually done.

## Feeds

P4+ phase closes (first user: P4). Adjacent: PL-PO-002 (bee init
worktree registration — same file, worktree mechanics).

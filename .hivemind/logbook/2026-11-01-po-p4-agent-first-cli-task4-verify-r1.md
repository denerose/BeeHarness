# Verify record: Task 4 — `bee design` (CLI surface over the Task-0 core)

**Role:** project-orchestrator (produced by task-orc, dispatched per ADR-011)
**Level:** phase (plan: `node --test tests/*.test.mjs` + task's own checks)
**Date/time:** 2026-11-01 21:05
**Work item state after this record:** implemented → verified

| command | exit | note |
|---|---|---|
| `node --test tests/bee-design.test.mjs` | 0 | 11 pass, 0 fail — AXI battery: bare=status, empty temp dir → `0 designs` + next step, state+drift listing (temp git repo: `picked-up · phase 4` → append prose → `1 designs · 1 drift` + flag), title/date fill with `status: live` block, refuse-overwrite, `new`/`pick-up`/`implement` `--check` write nothing (byte-compare), unknown flag + subcommand → exit 1 + usage, delegated messages carry `bee design` surface (no `design.sh` leakage) |
| `node --test tests/*.test.mjs` | 0 | full suite: 120 pass, 0 fail |
| `node bin/bee.js design status` (worktree) | 0 | `15 designs · 0 drift`; P4 design `picked-up · phase 4` |
| clean clone: `git clone --branch task/4-design-cli <main>` then `node bin/bee.js design status` | 0 | `15 designs · 0 drift`; `2026-10-25-pp-p4-inbox-design.md · picked-up · phase 4`; `grep -c 'drift: pending'` → 0 — plan's clean-clone check |
| `git status --porcelain` (worktree, after tests) | 0 | only the task's three files — live `.hivemind/designs/` never touched (safety line 2 held) |
| reference sweep (below) | 0 | all hits classified, none stale |

**Verdict:** PASS
**Log:** inline above (commands run in worktree `/home/saphron/BeeHarness-task-design-cli`, branch `task/4-design-cli`; clean-clone check in a throwaway `/tmp` clone, since deleted)

**Sane-output check:** yes — design count (15) matches the designs dir listing in both worktree and clone; drift count 0 matches per-line output; empty-state and drift fixtures produced the flagged/unflagged lines they should, on both sides of the transition.

**Reference sweep** (task-scoped; `grep -rn "design\.sh\|bee design" bin scripts tests skills AGENTS.md README.md docs`):

- `bin/bee.js` — all hits functional: the new CLI surface itself (USAGE strings, self-correction error strings, `scripts/design.sh` as the delegated core path, the `BEE_DESIGN_PROG` env seam).
- `scripts/design.sh` — its own self-description, usage header, and the documented `BEE_DESIGN_PROG` seam; its "the `bee design` CLI (Task 4) wraps this script" note is now true, not stale.
- `tests/bee-design.test.mjs` — the new battery (excluded above for brevity; all functional).
- `skills/`, `AGENTS.md`, `README.md`, `docs/` — zero hits: nothing instructs hand-running `design.sh` where `bee design` now exists. (Global `bee design` GLOSSARY entry is Task 10's scope, not this task's.)

# ADR 012: Git topology — main, phase branch, task worktrees

**Date:** 2026-10-25
**Status:** Accepted (keeper card, P3 design session; closes the P3
git-strategy seam)

## Context

ADR-011's task-orc carries `workspace: worktree` once the git strategy
lands; P2's near-miss (a dispatched reviewer writing a live file in the
shared checkout) and the session's repeated dirty-tree dances between
the standing roles are the evidence base. The keeper asked: worktree
per task-orc, and should PO and PP share a phase-level trunk branch for
a safe reset — or is that overkill?

## Decision

**Three tiers, drawn by what the work is — not who does it:**

1. **main — governance + stable.** PP's ADRs, design docs, GLOSSARY,
   role files; the shared surfaces (`status.md`, `keeper-report.md`);
   keeper relays; PO's small direct bee-loop runs (decision 51's small
   path). Direct commits, current partition discipline. Governance is
   the always-current truth: a ratified ADR must not hide behind a
   build merge.
2. **`phase/<n>` — the project-orchestrator's integration spine.** PO
   works it in a persistent worktree; task branches merge here; the
   phase ends in a review → main, tiered by ADR-004's validation
   levels (that ladder becomes the merge policy).
3. **`task/<phase>-<slug>` — one worktree per task-orc dispatch**, off
   the phase branch. Records ride the task branch (ADR-007 amendment
   2); the dispatcher reads mid-flight records via
   `git show <branch>:<path>`; the dispatch's diff is the review
   artifact.

**Two-size resets:** task reset = delete the branch and worktree (a
non-event, PO's call); phase reset = abandon the phase branch, main
untouched (the keeper's word, drastic, rare).

**The straddle, stated:** shared surfaces are main-checkout-only; PO
edits them from the main checkout (minutes per day, atomic-commit rule
per ADR-007 amendment 1) while its phase work lives in the phase
worktree. This is what actually relieves standing-role contention —
which a shared phase trunk would not have done (contention is
checkout-shaped, not branch-shaped).

**Explicitly not doing (the overkill line):** no branches for PP's
textual governance work; no worktrees for PO's small direct runs; no
release branches (P6's problem, with evidence).

## Consequences

- Dispatched write-capable agents stop being able to touch live
  surfaces — the P2 incident class dies structurally.
- Parallel dispatches stop serializing through one checkout.
- Concurrent dispatches may conflict at merge; resolution is PO's
  (or bounces back as a stop-and-return).
- Per-worktree dependency installs are a real cost in build-heavy
  repos; calibrate in P3 execution.
- An agent dying mid-dispatch leaves a worktree behind — a cleanup
  ritual belongs to PO's phase-close Record step.

## Alternatives considered

- **Task worktrees merging straight to main** — simpler, but main
  becomes the integration point and the phase-level safe reset is
  lost.
- **Shared phase trunk for PP and PO** — safest-sounding reset, but
  doesn't fix checkout contention between the standing roles and
  hides ratified governance behind the merge.

# Handoff — project-orchestrator

**Updated:** 2026-11-01 03:45
**Previous:** 2026-11-01 00:35 (pre-P7; superseded)

## Working mode — read this before the task state

You are the **project-orchestrator** (mandate:
`roles/project-orchestrator.md`; FORMING). You run the build track:
bee-plan, bee-loop, dispatches, verify/review gates, phases. Design
decisions are NOT yours — escalate. Announce the role + first move in
your first reply; don't re-interview the keeper.

## CURRENT: P7 bee-loop IN FLIGHT (keeper-directed: "plan and execute Phase 7")

- **Plan:** `/home/saphron/BeeHarness/.hivemind/plans/2026-11-01-po-p7-superpowers-replacement.md` — gate PASSED (round 1 FAIL: 2🔴 4🟡 resolved d0d525b; round 2 PASS c9fae7f; waiver on file: status.md not machine-targeted — live surface).
- **Design input (read whole):** `.hivemind/designs/2026-11-01-pp-skill-authoring-kit.md` — COMPLETE P7 design. Law: ADR-014, ADR-015, docs/AXI.md, docs/WRITING-STANDARD.md.
- **Topology:** spine `phase/7` in persistent worktree `/home/saphron/BeeHarness-phase3` (currently at f8564cb). Task worktrees via `scripts/task.sh`. **create takes `<phase>-<slug>`; merge takes SLUG ONLY.** Run task.sh FROM the phase worktree.
- **Task 1 DONE** (bee-skill-write built, tested COMPREHENDS, reviewed APPROVE, merged ff, boxes checked c4c30a4).
- **NEXT: Task 2** (bee-skill-review — same cycle: dispatch worker → cold-test + cold quality review in parallel → logbook records on task branch → merge slug-only → per-task box check → push). Then Task 3 (biggest: verbatim plan-checks.sh + tests from the plan's tagged blocks, bee-plan-review skill, the big reference sweep incl. PP's AGENTS.md law edit — post [PO] status note so PP lands the gate-rule edit in-window), Task 4 (handoff pair + its sweep), Task 5 (folds + ADR-014/am.1 lines + dispatch-docs verification + bee-review "currently undecided" rephrase), Task 6 (keeper sign-off card → phase review → phase verify → REAL merge to main (merge commit!), worktree rest detached, branch -d, hindsight).
- **Standing:** shipping test governs (self-contained text, no ADR cites in shipped skills; runtime .hivemind working paths + working GLOSSARY anchors = exceptions); scope guard (keeper's global kit untouched); P8 stays gated; PP live in shared checkout — stage by name, Role trailer, push promptly, re-read law after sibling commits (lesson 32).

## State quick-map

- P0–P3 done. P3 FULLY closed (closure audit 2026-11-01: spine merge completed retroactively 809385c, worktree resting detached at main, phase/3 deleted; close-seam suggestion filed `suggestions/2026-11-01-po-phase-close-subcommand.md`).
- P7 in-progress, 1/6 tasks done. P4 next in queue after (design note + 2026-11-01 addendum: consume at P4 planning; fold-order note goes in P4's plan). P5 gated by PL-002 unpark. P6, P8 (gated by P7 completing) queued.
- Task-orc codification ACCEPTED ("for now", hindsight-gated) — detail in the P4 note's codification section (PP lane).
- `bee report` is live (first real run a5a2ea1); report regen protocol in its own header — re-read before any regen. PP live: don't regen keeper-report while PP is mid-session unless needed (a31812e class).

## Boot sequence

1. This file
2. `.hivemind/sessions/project-orchestrator.md` (entries 43–48 are the live ones)
3. `.hivemind/status.md` — re-pull first (`git pull --rebase --autostash`)
4. The plan + kit note, then resume the loop at Task 2

## Environment notes

denerose-pi identity (pushes + gh); Node 24 (`node --test tests/*.test.mjs`); git 2.47.3; absolute paths to the keeper in chat (Paseo dot-dir quirk); record timestamps via `date`.

## Close-out

Memory sync only (session file current through entry 48). No parking-lot sweep — mid-phase handoff, threads open.

## Wake prompt — paste into the new context

```markdown
You are the project-orchestrator for BeeHarness, fresh context, same
role (mandate: roles/project-orchestrator.md; FORMING). Repo:
/home/saphron/BeeHarness — pull --rebase --autostash first.

Pick up in order:
1. .pi/handoff-project-orchestrator.md — P7 loop state (1/6 done)
2. .hivemind/sessions/project-orchestrator.md — entries 43-48 live
3. .hivemind/status.md — cross-role surface

Then announce the role and resume the bee-loop on the P7 plan at
Task 2 — the keeper already directed "plan and execute Phase 7";
the plan is gated-approved; do not re-ask. The handoff carries the
cycle mechanics (task.sh arg asymmetry, records-on-branch, per-task
box discipline). The files carry the content; this prompt is the
pointer.
```

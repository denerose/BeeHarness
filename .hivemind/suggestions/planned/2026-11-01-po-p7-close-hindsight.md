# Suggestion — hindsight batch, P7 close (2026-11-01)

**Filed:** project-orchestrator, P7 phase close · **Status:** awaiting keeper read

## 1. plan-checks create-targets on completed plans

`plan-checks.sh` flags create-targets that already exist as files
("blocked by a non-directory ancestor") — correct mid-phase, noise
post-close: a completed plan's create markers describe finished
work. Proposal: treat an existing file at a create-target as
satisfied (report `exists`), keep the ancestor walk for missing
paths. Small script change + one test.

## 2. Keeper gates as decision lists

The P7 sign-off gate initially offered the keeper artifact-reading
(five skill texts); the keeper corrected: ask the decisions made,
one per card, each with alternatives and a recommendation. Six
cards, six rulings, phase closed. Proposal: law-touching sign-off
cards present the decision inventory (placement calls, tier rules,
wording choices with live alternatives), not document pointers —
the texts live where they live; the keeper governs the judgment
calls. Fold into the codification material.

## 3. Design drift mid-phase wants a standing re-pull step

PP landed design changes twice mid-phase (kit-folder decision,
then the skilldev rename 60s later). The loop survived via re-pull
+ delta re-gate, but the pattern should be standing loop law:
before every plan revision and before phase close, pull and diff
the design note; revisions quote the design state they consumed
(commit hash). Cheap insurance against building a stale relay.

## 4. Worker commit claims need git-log verification

One dispatch returned a digest claiming commits that were never
made (files sat uncommitted in the worktree; verified greps passed
because the tree had the content). The loop caught it by checking
`git log` before merge. Proposal: the merge step of the loop
verifies `git status` clean + claimed hashes exist in the task
branch log before `task.sh merge` runs — evidence over assertion,
applied to dispatch returns.

## Outcome (2026-11-01)
Split: (2) keeper gates as decision lists — landed 79ba574 (both
role files + GLOSSARY). (1) plan-checks create-targets on completed
plans — routed to the P8 script pass (design note:
2026-11-01-pp-p8-rectification-inputs.md).

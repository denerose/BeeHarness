# Suggestion — worker commit claims need git-log verification

**Date:** 2026-11-07 (re-filed; origin: P7-close hindsight batch,
`planned/2026-11-01-po-p7-close-hindsight.md` item 4 — deleted at P8
Task 1 with items #1/#2 dispositioned; #3/#4 carried no disposition.
Re-filed verbatim per the P8 T1 review r1 finding, keeper-unread.)

**Project:** BeeHarness
**Role:** project-orchestrator (P7 close)
**Scope:** harness (bee-loop law)

## What happened

One dispatch returned a digest claiming commits that were never made
(files sat uncommitted in the worktree; verified greps passed because
the tree had the content). The loop caught it by checking `git log`
before merge. Proposal: the merge step of the loop verifies `git
status` clean + claimed hashes exist in the task branch log before
the merge runs — evidence over assertion, applied to dispatch
returns.

## Suggestion

The loop's merge step verifies `git status` clean + claimed hashes
exist in the task branch log before merging a dispatch's work.

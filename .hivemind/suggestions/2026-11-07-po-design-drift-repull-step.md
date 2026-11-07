# Suggestion — design drift mid-phase wants a standing re-pull step

**Date:** 2026-11-07 (re-filed; origin: P7-close hindsight batch,
`planned/2026-11-01-po-p7-close-hindsight.md` item 3 — deleted at P8
Task 1 with items #1/#2 dispositioned; #3/#4 carried no disposition.
Re-filed verbatim per the P8 T1 review r1 finding, keeper-unread.)

**Project:** BeeHarness
**Role:** project-orchestrator (P7 close)
**Scope:** harness (bee-loop law)

## What happened

PP landed design changes twice mid-phase (kit-folder decision, then
the skilldev rename 60s later). The loop survived via re-pull + delta
re-gate, but the pattern should be standing loop law: before every
plan revision and before phase close, pull and diff the design note;
revisions quote the design state they consumed (commit hash). Cheap
insurance against building a stale relay.

## Suggestion

Standing loop law: before every plan revision and before phase close,
pull and diff the design note; revisions quote the design state they
consumed (commit hash).

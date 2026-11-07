# Suggestion — dispatched implementer timed out mid-analysis; code anchors halved the retry

**Date:** 2026-11-07
**Project:** BeeHarness
**Role:** project-orchestrator — any role when the keeper asks
**Scope:** harness (dispatch-brief guidance in bee-loop)

## What happened

Task 2's first dispatch (900s default) spent its entire budget reading bin/bee.js to locate the phase-close code region, timed out before making a single edit, and left a pristine tree. The re-dispatch with code anchors (specific line numbers and function names from my pre-dispatch reading) landed clean in one round. The implementer spent zero budget on discovery and all of it on implementation.

This is the inverse of the "give the worker autonomy" instinct: for tasks whose targets live in a large single file (bin/bee.js is 5,500+ lines), the dispatcher's 2-minute read-and-anchor is cheaper than the implementer's 15-minute cold read.

## Suggestion

The dispatch-brief guidance (bee-loop's step 2, or the dispatch-brief template's fill notes) gains one line: "for tasks targeting a large file, the dispatcher names the code region (function names, approximate line numbers) in the brief — discovery is the dispatcher's 2-minute read, not the implementer's 15-minute one." Not a mandate — small-file tasks don't need it — but the pattern halves dispatch cost when it applies.

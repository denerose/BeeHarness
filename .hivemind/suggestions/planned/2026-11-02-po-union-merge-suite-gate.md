**Date:** 2026-11-02
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** Resolving the T3/T4 merge conflicts on the spine by union, git had matched two functions' identical closing lines into the common region — the union splice silently dropped `logbookCompact`'s return statement. The committed-merge result was 303/307; only because I ran the full suite before pushing was it caught. Nothing in bee-loop, worktree.sh, or any template says "full suite after manual conflict resolution, before the merge commit."
**Suggestion:** Two layers: (1) bee-loop's Record step gains one line — after ANY manual conflict resolution on a merge, run the plan's suite before committing (a union that looks clean can be semantically broken; markers gone ≠ code whole). (2) Optional tooling: `scripts/worktree.sh merge` could run the suite automatically when it exits mid-conflict (the resolution path is exactly where this class lives) and refuse to complete the merge commit on failure.

## Outcome (2026-11-02)
Planned in, not landed (keeper ruling): P8 inputs item 22 — the
AGENTS commit-discipline clause lands at P8, drafted text in the
P8 note. PP executes the law edit.

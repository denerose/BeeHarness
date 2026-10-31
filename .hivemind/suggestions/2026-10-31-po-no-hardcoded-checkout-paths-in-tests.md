**Date:** 2026-10-31
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** During P3's first task-orc dispatch, three P2-era
tests in `tests/bee.test.mjs` failed in the task worktree — they
hardcoded `~/BeeHarness/skills` while `bee init` correctly derives the
path from its own location. The suite had only ever run from the main
checkout, so the assumption was invisible until ADR-012's worktree
topology put a second checkout in play (16/19 on the unmodified phase
branch). task-orc fixed the assertions to derive from location
(behavior-neutral, documented as a deviation).
**Suggestion:** Add a convention line to the repo test style (or
bee-verify's checklist): tests must not hardcode checkout-derived
paths — derive from the test file's own location (`import.meta.url`),
or from a fixture, so the suite is green from any worktree. Consider
having bee-verify at merge level run `npm test` from a linked worktree
at least once per phase, which would have caught this class at P2.

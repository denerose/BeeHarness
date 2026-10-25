**Date:** 2026-10-25
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** PP's wake-prompt tweak (56b22c5, 13:04) landed via a
rebase pull while the orchestrator was mid-handoff (13:06); AGENTS.md
was not re-read after the pull, so the new ritual was missed and the
handoff shipped without a wake prompt (fixed same hour). Parallel roles
make this a standing hazard: law can change under you between pull and
action.
**Suggestion:** Add one line to the ADR-007 commit-discipline block in
AGENTS.md: "After a pull that lands sibling commits, re-read the
changed law files (AGENTS.md, roles/, skills/GLOSSARY.md) before
acting on anything they govern." Mirrors the existing discipline lines;
no new machinery.

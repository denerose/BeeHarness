**Date:** 2026-11-01
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** Two dispatched subagents hit the same hazard class
this project, one with real damage: (P2) a reviewer subagent ran
`bee report` without flags — CLI defaults wrote the live keeper
report three times (restored; disclosed in its report); (P3) the
phase reviewer's scratch harness ran two `git -C "$var"` calls with
an unset variable, which executed in the session's default cwd — the
main checkout — as accidental `git add`/`git commit` calls (both
aborted as no-ops; verified clean; disclosed). Root cause in both:
commands whose intended working directory was implicit (CLI defaults;
empty `-C` argument falling back to cwd) rather than pinned.
**Suggestion:** Add a fourth standing safety line to the dispatch
brief (GLOSSARY: dispatch brief, safety lines): "Pin the working
directory on every command in your scratch harness — pass absolute
`cwd`/`-C <path>` explicitly; treat an empty path variable as a
hard error, never let a command fall back to the session cwd."
Cheap to add to the existing GLOSSARY entry and the dispatch-brief
template (`skills/bee-loop/assets/dispatch-brief-template.md`); would
have prevented both incidents.

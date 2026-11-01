**Date:** 2026-11-02
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** Resolving merge-conflict markers with a sed line-delete + pattern-blank corrupted bin/bee.js (line numbers shifted under the deletion; the blanking pattern hit unintended lines). The editing-discipline law already says "prefer whole-file rewrites over scripted patches" — but its named scope is session files, glossaries, and parking lots, so marker surgery on source files felt outside it.
**Suggestion:** Extend the editing-discipline law (AGENTS.md — PP drafts, keeper authorizes) by one clause: conflict-marker removal and any edit of marker-bounded regions is edit-tool work, never sed/regex scripts — line-number mutations under deletion make positional edits lie. The existing rules already carry the spirit (real bytes, re-read before edit); this closes the scope gap the incident slipped through.

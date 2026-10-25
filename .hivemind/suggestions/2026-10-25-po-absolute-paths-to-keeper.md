**Date:** 2026-10-25
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** Paseo renders chat-quoted repo-relative paths as
clickable links, and dot-directory paths (`.hivemind/status.md`) 404
for the keeper, verified while the file existed on disk, in git, on
origin, and via the GitHub API. Currently noted only on status.md —
which is interim and will be replaced, losing the observation.
**Suggestion:** Carry this as a design constraint for the decisions
inbox (P4) and any keeper-facing report generation (`bee report`):
every path surfaced to the keeper must be verified openable in the
surface that renders it — absolute paths, or link forms tested against
Paseo's resolver. Until then, both roles quote absolute paths in chat
(status.md note stands).

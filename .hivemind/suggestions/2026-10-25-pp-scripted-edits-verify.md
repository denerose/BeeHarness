**Date:** 2026-10-25
**Project:** BeeHarness
**Role:** planner (session hindsight)
**Scope:** harness
**What happened:** Four separate mechanical errors from scripted edits to markdown state files in one session: the session-split script duplicated decision blocks 20–24; a sed/python chain produced `.hivemind/.hivemind/` double prefixes; a GLOSSARY edit replaced the `claim` entry instead of appending (lost it until manually restored); a regex removal missed its target and left PL-003 parked *and* resolved simultaneously. All were caught quickly, but each cost a fix cycle and one (the duplicated blocks) was reported by a subagent reviewer as repo corruption before I'd noticed.
**Suggestion:** adopt an editing rule for living documents: prefer full-file rewrites (write tool) over sed/python patching for session files, GLOSSARY, and parking lot; where scripted patches are justified (many files, mechanical rename), the patch must be followed immediately by a verification grep in the same command chain — output shown, not assumed. Belongs in AGENTS.md rules of engagement or the writing standard.

**Outcome (2026-10-25):** acted on in-session (keeper: "let's just
handle it here"). Now law — AGENTS.md Rules of engagement, "Editing
discipline for living documents": edit-tool anchoring (replace-never-
insert, anchor on surviving lines), whole-file rewrites over scripted
patches for living docs, verification grep chained in-command, and
residual grep before commit for multi-file sweeps. This file stays as
the origin record.

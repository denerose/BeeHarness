**Date:** 2026-10-18
**Project:** BeeHarness
**Role:** planner (power-planner session)
**Scope:** harness
**What happened:** `paseo ls` and the Paseo UI disagree about agent status. A
session that ended parked on an unanswered ask_user card ("pdf reader plugin",
6c545cf7) has shown as `running` indefinitely; idle/closed-but-unarchived
entries from old sessions make the UI report 7 "working" agents when only
one was live. Keeper noticed and asked whether agents were stuck.
**Suggestion:** the waiting-for-human mechanism (decisions inbox design,
orchestration phase) must surface wait state honestly: visible "waiting since
<time> on <question>", and a way to distinguish waiting from working in any
status surface. Also: subagent dispatch cleanup needs auditing — some
successful scout entries were not reaped (extension policy says delete on
success); consider a periodic `paseo ls` truth-check in the harness tooling.

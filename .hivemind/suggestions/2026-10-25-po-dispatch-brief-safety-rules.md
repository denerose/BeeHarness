**Date:** 2026-10-25
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** During P2 review round 1, the dispatched reviewer
subagent probed header stability by running `bee report` three times
WITHOUT flags — the CLI's defaults write the live
`.hivemind/keeper-report.md`. It restored from git immediately and
disclosed the incident in its report (record:
`2026-10-25-po-bee-cli-stub-task1-3-review-r1.md`), but the brief had
not warned that defaults write; the reviewer had to learn it by doing
it. Near-miss in the same class: the dispatcher's own first
verification command misread the test output (grep pattern mismatch
reported as failure).
**Suggestion:** Dispatch briefs for any agent that can invoke
write-capable tools carry three standing safety lines (make them a
GLOSSARY entry — e.g. "dispatch brief, safety lines" — so bee-loop and
review dispatches inherit them without restating):
1. "Tool defaults may write to live files — always pass `--check` or
   explicit output paths; verify with `git status` after."
2. "Live shared surfaces (`.hivemind/status.md`,
   `.hivemind/keeper-report.md`) are concurrently edited by a parallel
   role — never stash or restore them; leave others' modifications
   untouched."
3. "If you touched a live file by accident: `git restore` it
   immediately, verify porcelain clean, and disclose it in your
   report."
Applies to any repo with the harness; here it would have prevented the
round-1 incident outright.

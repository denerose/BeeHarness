# Dispatch brief — task-orc

(Fill one per dispatch; this template carries ADR-011's brief
contract. Everything between the markers goes to the subagent.)

---

**Plan:** <absolute path to the plan — main checkout copy, readable
from any worktree>
**Phase:** <phase id, e.g. P3>
**Validation level:** <from the plan header — task | merge | phase>
**Escalation envelope:** decide alone: <what this dispatch may choose
without asking — e.g. implementation approach within the plan, fix
rounds, test design>. Return to dispatcher: <what must come back —
e.g. plan conflicts, two failed fix rounds, anything outside the
plan's scope, design questions>. Never card the keeper directly.

**Workspace:** task worktree `<path>` on branch `task/<phase>-<slug>`,
cut from the phase branch. Logbook entries ride this branch and reach
main at merge. Mid-flight reads from other checkouts use
`git show <branch>:<path>`.

**Safety lines:**
1. Tool defaults may write to live files — always pass `--check` or
   explicit output paths, and verify with `git status` after.
2. Live shared surfaces (`status.md`, `keeper-report.md`) are
   concurrently edited by a parallel role — never stash or restore
   them, leave others' modifications untouched.
3. If you touched a live file by accident: `git restore` it
   immediately, verify porcelain clean, and disclose it in your
   report.

**Pass-back (your return):** a done-ness digest ONLY — tasks
complete; verify/review verdicts with logbook paths; commit hashes;
plan/phase-list state; deviations with reasons; escalation and
parking/suggestion candidates. Logbook paths, never contents — if the
return carries what the logbook carries, the context win is zero.

---

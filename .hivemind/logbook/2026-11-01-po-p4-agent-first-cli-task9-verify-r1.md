<!-- machine
role: project-orchestrator
date: 2026-11-01T16:01:03+11:00
verdict: PASS
checks-run: 1
plan: .hivemind/plans/2026-11-01-po-p4-agent-first-cli.md @ dd4b897
-->

## Prose evidence (task-orc, appended per dispatch)

Implemented by task-orc in worktree task/4-phase-close (dispatch
brief: Task 9 only, escalation envelope per roles/task-orc.md).

| command | exit | note |
|---|---|---|
| `node --test tests/bee-phase.test.mjs` | 0 | 27 pass (AXI battery 5, inventory 9, close --check 2, refusals 6, real-run closes 3, misc 2) |
| `node --test tests/*.test.mjs` | 0 | 237 pass, 0 fail (full suite) |
| `bash scripts/structure-check.sh .` | 0 | 0 findings |
| `node bin/bee.js verify --plan … --task 9 --role project-orchestrator` | 0 | this entry (minted by the command) |
| `git status --porcelain` after | clean-except | bin/bee.js (M), tests/bee-phase.test.mjs (??), this entry — worktree only |

**Fixture safety:** every close/inventory test runs against a
throwaway git repo (mkdtemp + git init) via the `--root` seam; the
real repo's branches were never touched — the plan's note holds:
P4's own close is the loop's first real run, after Task 10 + keeper
sign-off. Only read-only probes ran against the real tree
(`bee phase list`, `bee phase help`).

**Reference sweep** (grep shown, zero hits = nothing stale):

```
$ grep -rn "bee phase" skills/ docs/ AGENTS.md README.md roles/
(no output — exit 1)
$ grep -rn "phase close" skills/ docs/ AGENTS.md README.md roles/ \
    | grep -v "hivemind/logbook\|hivemind/plans\|decisions/"
(no output)
```

No living document referenced the `bee phase` grammar before this
task; GLOSSARY vocabulary entries are Task 10's scope (plan line).

**Deviations (in-envelope decisions, reported per mandate):**

1. **NODE_TEST_CONTEXT strip in the suite gate.** A `node --test`
   suite spawned from inside a Node test-runner process inherits
   `NODE_TEST_CONTEXT=child-v8` and silently exits 0 on failure —
   observed live (red fixture suite reported PASS until the strip).
   The gate now deletes that var from the child env. Latent sibling
   hazard noted for bee verify's `runCheckEntry` (same inheritance,
   unobserved there — no check cmd uses `node --test` today); left
   untouched, flagged to the loop.
2. **`--untracked-files=all` on the clean-tree gate.** Plain
   porcelain collapses untracked directories (`?? .hivemind/logbook/`),
   which defeated the decisions-inventory exemption; -uall lists
   the file so the exemption matches exactly one path.
3. **Decisions-inventory exemption from the clean-tree gate** (the
   inventory is the close's own input, expected present pre-close —
   committed or not); everything else dirty refuses. Close reads
   the inventory from the working tree, falling back to the phase
   branch tree (both flows covered by tests).
4. **`bee phase` bare call = list** (AXI 8 content-first): scans
   `.hivemind/plans/` machine headers for `phase:` fields — beyond
   the plan's two named subcommands but required by the standing
   AXI rule; zero-plan and ambiguous-plan states are tested.
5. **Branch-existence check runs before plan lookup** (a missing
   branch is the more immediate finding and needs no plan); step
   output still numbers it as step 1 per the plan's numbering.

**Verdict:** PASS (r1, command-minted; prose appended).

# Review: P4 Task 0 — interim design helper + design stamp

**Role:** project-orchestrator (dispatching loop; reviewer cold-dispatched per bee-review)
**Reviewer:** bee-review stage agent (cold dispatch)
**Plan section:** [.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md](/home/saphron/BeeHarness/.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md) — Task 0 + Standing rules + Kickoff rulings
**Verify record:** [.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task0-verify-r1.md](/home/saphron/BeeHarness/.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task0-verify-r1.md) (branch: task/4-design-stamp)

## Verdict

Fix first — no blocking findings; two should-fixes (file-mode side effect, missing sweep grep) are worth landing before merge, and the disclosed drift deviation is adjudicated accepted (note 2).

## Blocking

None.

## Should fix

- `scripts/design.sh:173` — `mktemp` creates the stamp target with mode 600, and `mv` (lines 177, 222) keeps it: every doc this script stamps silently drops from repo-normal `-rw-rw-r--` to `-rw-------` (the stamped P4 design is the only 600 file in `.hivemind/designs/` today; siblings are all 664). Git won't show it (it tracks only the exec bit), but every working tree where a stamp runs loses group read on that doc. Suggested fix: after `mktemp`, run `chmod --reference="$f" "$tmp"` before each `mv` (covers both the no-title INSERT path and the rewrite path).

- `.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task0-verify-r1.md` (evidence bullets) — the standing rule "every task's finished-test includes its reference sweep — grep shown in the task's verify entry" is not met: the record shows no sweep grep. I ran the applicable one (`grep -rn "design\.sh" skills roles docs scripts bin AGENTS.md README.md`): only self-references inside `scripts/design.sh` — clean, so this is a missing-evidence gap, not a stale-reference find. Suggested fix: the loop runs the grep, appends the shown output to this record (or a verify r2) before flipping Task 0's boxes — the boxes must not flip ahead of it.

## Notes

- Claim-vs-record check: PASS. All four Task 0 boxes are correctly still unchecked (loop's job from main); claimed-complete-instead, each has its evidence — script written to the box's grammar (`--check` on both mutations, refusal rules with fix lines, definitive `0 designs`); stamp landed (`status: picked-up` · `phase: 4` · `hash: ad77aa4`, block at TEMPLATE position, 7 lines, matching the plan's frozen `design:` header @ ad77aa4); idempotency + refusal reproduced by me (exit 1, "must be live" + fix line); suite 34/34 green reproduced; commit message matches the box verbatim. Branch state clean before and after my checks.
- Deviation adjudicated: **accepted**. The plan's literal "recorded hash ≠ current `git log -1` hash" permanently flags the doc's own stamping commit (reproduced: after the stamp commit, recorded 7dd617a ≠ current 4820ad9 → would flag forever), making Task 4's verify ("flags nothing on a clean clone") unpassable. Content-diff excluding machine blocks is ADR-016's actual drift definition ("the design changed after pickup"; the block is script territory, never agentic). I reproduced both directions in a scratch repo: prose addendum → `drift: pending rectification`; machine-block-only commit → 0 drift; uncommitted prose → drift. The verify record disclosed it properly. Consequence for the loop: Task 0's checkbox text now diverges from shipped behavior — record that when flipping the boxes (plan-text amendment is the planner's call, not this review's).
- `scripts/design.sh` (cmd_implement, ~line 236): `--phase` on implement silently rewrites `phase:` with no cross-check against the pick-up phase — a fat-fingered close stamps the wrong phase permanently. Low risk (implement runs once, at close, and the mismatch is visible in `status`), so no action demanded; a refuse-on-mismatch guard would be cheap.
- Bare `design.sh` → usage + exit 1 (matches `plan-checks.sh`/`task.sh` conventions; the AXI bare-call-content rule binds the `bee design` wrapper in Task 4, not the script core). Exit codes verified: unknown subcommand/flag → 1 + usage; `status --check` → 1 with a pointed message; shellcheck clean.
- Diff-artifact warning for the loop: `git diff main..task/4-design-stamp` shows `.hivemind/designs/2026-11-01-pp-harness-feedback-channel.md` and a P6 phase-list line as removed — that is main-side drift (bb108df landed 12:47:08, after the task commits 12:45–12:46; phase/4 was current with main at dispatch), not task work. Merge the branch into phase/4 (three-way); never apply this two-way diff raw, or the feedback-channel design is lost.

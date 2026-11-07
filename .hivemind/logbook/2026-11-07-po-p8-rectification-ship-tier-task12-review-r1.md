# Review: P8 Task 12 — bee-handoff pre-write gate + scoped authority (items 5-verify, 19, 16), r1

**Role:** task-orc (dispatching role; reviewer cold-dispatched)
**Reviewer:** bee-review stage agent, cold dispatch, 600s budget
**Plan section:** [Task 12](../plans/2026-11-07-po-p8-rectification-ship-tier.md)
**Verify record:** [task12-verify-r1](2026-11-07-po-p8-rectification-ship-tier-task12-verify-r1.md) (FAIL — the known stale-header-path FAIL; see Notes)
**Diff reviewed:** `ea0d816..HEAD` on `task/8-handoff-pair` (commits 89d51b4 work + a86386c verify record); changed: `skills/thinking/bee-handoff/SKILL.md`, `.hivemind/suggestions/2026-11-02-po-handoff-scheduling-guard.md` (LIVE, stamped, left), `.hivemind/suggestions/planned/2026-11-01-po-wake-prompt-must-be-delivered-in-chat.md` (deleted), verify-r1 record

## Verdict

**Approve** — both skill edits byte-match the plan's verbatim texts at the directed placements, the item-5 verify claim is genuine, both D7 dispositions match the keeper ruling and the sibling-task convention, and the verify FAIL is the plan header's stale pre-reorg path alone: the corrected-path check passes (evidence in Notes).

## Blocking

None.

## Should fix

None.

## Notes

- **The FAIL is the header's, reproduced two ways.** Corrected-path check: `grep -q 'continuity-law check' skills/thinking/bee-handoff/SKILL.md` → exit 0 (run this review). Full hand-run `node bin/bee.js verify --plan .hivemind/plans/2026-11-07-po-p8-rectification-ship-tier.md --task 12 --role project-orchestrator --check` → 1 fail, and the failing check's only complaint is `skills/session/bee-handoff/SKILL.md: No such file or directory` (the plan header at line 89-91 still carries the pre-reorg path); links (79 docs) and structure (map) both PASS. The plan's Task-16 notes already record this staleness class (tasks 8/11/12/13/14 → `skills/session/`) as the loop's maintenance pass — this report is the corrected-path evidence record for task-12; that maintenance pass should land before phase close, whose exit demands all 17 checks pass.
- **Claim-vs-record check clean; states are the loop's.** No task box is checked anywhere in this plan (uniform across all 17 tasks; `bee task show` reads all draft), so no checked box lacks its record. Verify record rides the task branch per logbook versioning; this report is the review record. Flipping task-12's work-item state from here is the loop's move, not this report's.
- **Verbatim fidelity, both edits.** The pre-write section (`SKILL.md:15-21`) byte-matches the plan's quoted block, line wrapping included, and sits immediately before "## The handoff file" (`:23`) as directed. The authority line (`:50-55`) byte-matches its plan quote and opens "Write the handoff" (`:48`) before the numbered sections. Reading order stays coherent: check the role's law → the file → absorb the session → write.
- **Item-5 verify claim is genuine.** `SKILL.md:93` — "**Hand over the wake prompt** — give the keeper the fenced block from the handoff, paste-ready … This is the ritual's last act": in-chat fenced delivery, explicitly the last act, as the plan required confirming. Commit 89d51b4's body carries "verified present, no edit" per the plan step.
- **Entry-discipline coherence: complement, not contradiction.** The new section is a precedence rule at write time (role file's continuity law wins over the skill; say so and stop), not a "should you use this skill?" entry gate — so it adds no noise to the entry decision Task 11's standard protects, and the description keeps its trigger wording ("Use when a role's context runs short…"). It also matches the standing law's deference (AGENTS.md: "when one applies is role law, not this file") and the motivating suggestion's own rationale — the guard lives in the skill because the reflex fires before the role file is re-read.
- **D7 dispositions match the ruling and the sibling convention.** LIVE file stamped `## Outcome (2026-11-07)` "Landed: the pre-write gate…" and left for the keeper's triage read — same shape as Task 1's LIVE stamps. Planned file deleted with the disposition recorded in the commit body — same convention as Task 1's planned deletions (pure deletion; the file already carried its 2026-11-01 keeper-ruling Outcome from routing time).
- **For the keeper's triage read (no action demanded):** the LIVE suggestion's original ask named specific refusal heuristics ("this looks like scheduling… delegate harder instead") and an explicit-keeper-direction proceed path; the landed gate generalizes to role-law deference. The motivating scenario is covered where the role file's law says crash-recovery-only, and proceeding against it now rides the ordinary escalation instrument rather than being named in the skill. The stamp honestly says "landed: pre-write gate".
- **Writing standard holds.** Both new passages are generic — no dated stories, no task narratives; vocabulary is shared (parking resolves, decision records, keeper zone). The suggestion Outcome stamps carry specifics, which is the records' job.

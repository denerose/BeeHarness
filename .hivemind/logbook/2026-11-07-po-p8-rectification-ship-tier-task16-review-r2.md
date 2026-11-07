# Review: P8 Task 16 — ship-tier citation strip (item 3, D8), re-review r2

**Role:** task-orc (dispatching role; reviewer cold-dispatched)
**Reviewer:** bee-review stage agent, cold dispatch, 600s budget
**Plan section:** [Task 16](../plans/2026-11-07-po-p8-rectification-ship-tier.md)
**Verify record:** [task16-verify-r2](2026-11-07-po-p8-rectification-ship-tier-task16-verify-r2.md) (PASS, checks-run: 1)
**Diff reviewed:** fix round `d1b9ea5..HEAD` (commits 352a4e1 review-r1 + 09aa78a fix) on `task/8-ship-tier`; changed: this report's r1 sibling, verify-r2 record, plan Task-16 notes, `skills/thinking/bee-brainstorm/SKILL.md`

## Verdict

**Approve** — the single blocking finding from r1 is fixed correctly and narrowly; every check re-run passes.

## Blocking

None.

## Should fix

None.

## Notes

- **Fix verified, three ways.** (1) The pinned probe passes: `grep -q 'a decision is what the keeper decided' skills/thinking/bee-brainstorm/SKILL.md` → exit 0 — the phrase now sits contiguous on one line (line 43). (2) The sentence still reads naturally: the break lands after "agreed —", a clean clause boundary; step 4 in full is unchanged in content from the pre-regression wrap. (3) The fix commit (09aa78a) touched exactly the three expected files — skill re-wrap, plan Task-16 notes, verify-r2 record — and the round's other commit (352a4e1) added only the r1 report; nothing else moved.
- **r1's loop-side notes stand, no action here.** Task 12 never dispatched and the machine-header stale paths (tasks 8/11/12/13/14 → `skills/session/`) are recorded in the plan's Task-16 notes for the orchestrator; both pre-date this round and stay open loop-side. Task 8's corrected-path check now passes mechanically (the wrap was its only failure).
- Checks re-run this round: task-16 header check (memory file present, no `ADR-[0-9]` in `roles/` or skills' SKILL.md) — PASS; full suite `node --test tests/*.test.mjs` — 386 pass, 0 fail; `scripts/structure-check.sh .` — 0 findings.

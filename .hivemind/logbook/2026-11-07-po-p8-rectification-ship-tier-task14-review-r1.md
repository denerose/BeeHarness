# Review: P8 Task 14 — project-update skill

**Role:** task-orc
**Reviewer:** cold-dispatched bee-review (worker session)
**Plan section:** `.hivemind/plans/2026-11-07-po-p8-rectification-ship-tier.md` — Task 14 (item 27)
**Verify record:** `.hivemind/logbook/2026-11-07-po-p8-rectification-ship-tier-task14-verify-r1.md` (task branch, acb443d — PASS)
**Scope:** `git diff 980600e..HEAD` on `task/8-project-update` — `skills/session/bee-project-update/SKILL.md` (new) + the verify record; nothing else.

## Verdict

**Approve** — a faithful, cold-readable transposition of the design note: every gather command verified real in `bin/bee.js`, the design's comparisons all present, the gap hunt mandatory with its disqualifier, no invented mechanics, the gate conforms to the landed T11 standard, and the writing standard holds (greps clean).

## Blocking

None.

## Should fix

None.

## Notes

- Claim-vs-record first check: clean. The verify record exists on the task branch (machine header: verdict PASS, task-14, role stamped); Task 14's plan checkboxes remain unchecked on the branch — consistent with the landed record rule (boxes tick via `bee task move` at state move; T11's pattern at 980600e). No state is ahead of its evidence.
- Gather verified against reality: all five reads exist in `bin/bee.js` — `bee design status` (:46, designStatus :2781), `bee phase list` (:64), `bee task show <plan-path>` (:60, taskShow :4576), `bee inbox list` (:33, :1346), `bee park list` (:37). The design's "the phase list" is rendered as the command that reads it — an accuracy upgrade, not a deviation. "The whole read, no prose archaeology" carried (`SKILL.md:31`).
- Design fidelity: all three altitude comparisons present — divergence/staleness/unowned gaps (`:47-50`), on-track/blocked/starved with logbook grounding (`:57-60`), digest's four lines in flight / done since / waiting on the keeper / next (`:65-67`). Gap hunt mandatory (`:71` heading), all four sweep places (phase rows, designs, parking lot, recent conversation, `:76-81`), the disqualifier sentence (`:86-87`), additions on keeper approval only (`:84-85`). The "clean hunt is a finding" line and the no-target-section first-finding line are operationalizations the design licenses, not inventions.
- Sufficiency verdict honored: the skill creates no store, no command, no state (`Boundaries`, `:109-110`); the target-state section is referenced as the design's own one new mechanic, with its absence proposed as a finding rather than auto-written.
- Gate conforms to the landed T11 standard: heading matches the house convention (relay — the sibling authored under the same standard — uses the identical heading); the content is trigger conditions — `EXTERNALLY-GATED. Trigger =` (`:92`), never-self-initiated, recognition-not-evaluation — not a discretionary skip-by-naming gate, so no gate-noise.
- Role-agnostic and writing standard: "this skill carries all three and belongs to none" (`:16`); routing explicitly role-file law. Greps clean for ADR refs, design-note citations, role names, global-kit references, and dated content.
- `SKILL.md:26` — `bee task show <active-plan>`: the placeholder resolves by inference (the phase-list bullet above says rows name each phase's plan), but the skill never says "the active plan is the in-progress phase's plan". A cold agent with the gather in hand gets there; one clause would remove the friction. No action demanded.
- `SKILL.md:31-33` vs `:78` — mild tension: the gather forbids "re-reading whole plans, designs, or session logs for context" while the hunt sweeps "the designs — aims a live design commits to", which necessarily reads design content. The tension is the design note's own (same structure there); the skill's guard ("say what is missing and ask — do not dig") keeps it workable — reading for aims is the hunt's job, not archaeology for context.
- `SKILL.md:32-33` — "the one artifact an altitude names below" is exact for the design altitude (the Target state section), loose for the others: execution's logbook grounding is conditional ("when a claim needs it") and the keeper digest names no artifact. The Boundaries section restates it correctly (`:113-115`). Wording only.
- Mechanics reproduced: `test -f skills/session/bee-project-update/SKILL.md` → exit 0; diff touches exactly the two declared files; working tree clean; both commits short imperative with `Role: task-orc` trailers, matching the plan's commit line verbatim.

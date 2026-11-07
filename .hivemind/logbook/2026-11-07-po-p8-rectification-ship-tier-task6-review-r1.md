# Review: P8 Task 6 — bee-hindsight pass (items 6, 29)

**Role:** task-orc (dispatching loop)
**Reviewer:** bee-review, cold-dispatched, 600s budget
**Plan section:** `.hivemind/plans/2026-11-07-po-p8-rectification-ship-tier.md` Task 6 + D7
**Verify record:** `.hivemind/logbook/2026-11-07-po-p8-rectification-ship-tier-task6-verify-r1.md` (PASS, machine-header shape matching all sibling tasks)
**Diff reviewed:** `git diff 43a008b..HEAD` on `task/8-hindsight-pass` (a472967 + 16eff2c) — `skills/session/bee-hindsight/SKILL.md`, `assets/suggestion-format.md`, `bin/bee.js` (SUGGEST_USAGE only), `tests/bee-suggest.test.mjs`, two planned-suggestion deletions per D7, verify record

## Claim-vs-record (first check)

Consistent. Task 6's boxes are unchecked on the branch — the house pattern
(traced via `git log -S`: every sibling task's boxes were ticked by the
loop's wave-merge commits "wave N done … states moved", e.g. Task 5 at
43a008b, Task 1/2 at fab7a0f, Task 7 at d3e191e — never by the
implementer's commit), so nothing is claimed without evidence. Behind the
work stands verify r1 (PASS, checks-run 1) and this review. The D7
deletions carry their stamp record in commit a472967's body, matching the
disposition pattern of Tasks 1/4/5/7/8/9/10.

## Verdict

**Approve** — the work lands the plan's intent verbatim on every judgment
axis probed (Inputs discipline, sixth question, never-asks rule, Role and
observation-type lines, usage pin, D7 dispositions — each independently
reproduced); one should-fix on the status-listing step's fit with current
surface mechanics, nothing blocking.

## Blocking

None.

## Should fix

- `skills/session/bee-hindsight/SKILL.md:67-68` — the final step ("list
  new suggestions in the status surface's prose, under Awaiting keeper —
  never inside the script-owned render region") is plan-verbatim but
  disagrees with a sibling instrument and names a landing spot the script
  can destroy. (a) The GLOSSARY `inbox` entry
  (`skills/GLOSSARY.md:51`) says "new note traffic and awaiting-read
  suggestions ride it instead of hand-written queues" — the sanctioned
  channel there is `bee inbox add`, which renders INTO the region this
  line forbids; two shipped instruments now give opposite channels for
  the same act, and a cold reader cannot tell which wins. (b) In a
  surface with no render region yet (the `bee init` consumer seed has
  none), `renderIntoStatus` (`bin/bee.js:1525-1540`) replaces a
  hand-written "## Awaiting keeper" section wholesale on first render —
  the prose listing would be silently destroyed. The instruction is
  mechanically safe only where a region already exists (text outside the
  markers is never touched, `bin/bee.js:1150`). Suggested fix: reword to
  point at prose the render never replaces and name the inbox channel —
  e.g. "surface new suggestions via `bee inbox add` (addressee keeper),
  which renders into the script-owned region; or as a prose note outside
  the render region (cross-role notes) — never hand-edit the region
  itself" — or, if the prose channel is the settled intent, amend the
  GLOSSARY inbox entry so the two stop disagreeing. The channel choice
  may be a keeper question; the loop judges.

## Notes

- `skills/session/bee-hindsight/assets/suggestion-format.md:4` vs `:9` —
  the Role line now admits any role, but the filename vocabulary stays
  `YYYY-MM-DD-<pp|po>-<slug>.md` (and SKILL.md's What-to-produce
  paragraph still glosses pp/po as the two loop roles): a hindsight
  runner outside those roles has a Role line to write but no filename
  initials. The disposition's already-landed claim is honest — role
  initials ARE present at 43a008b, verified — so this is residual scope,
  not a wrong claim; a future one-line generalization (`<initials>`)
  closes it.
- `skills/session/bee-hindsight/SKILL.md:21-25` — the loop example omits
  "keeper corrections in the conversation," which the pre-change loop
  list carried as item 5. The plan's own loop list omits it too, so this
  is deliberate, not drift; recorded so the omission is traceable to the
  plan text.

## What was checked and passed

- Inputs generalization holds the ordered re-read discipline: title
  verbatim, "in a fixed order" retained, each example list internally
  ordered (memory → phase list → plan → records; memory → ADRs/designs →
  status surface → corrections), "don't trust recall over the record"
  stays.
- Sixth question lands verbatim (`SKILL.md:43-44`) as the final
  examination bullet, after the deficit list, per plan.
- Never-asks rule lands verbatim (`SKILL.md:64-67`).
- Suggestion-format Role line (`:9`) and observation-type line (`:19-20`)
  match the plan and design item 29 verbatim.
- `SUGGEST_USAGE` (`bin/bee.js:1731-1732`) renders in the help output
  (reproduced); test pin (`tests/bee-suggest.test.mjs:103-105`) matches
  across the line wrap; `node --test tests/bee-suggest.test.mjs`
  reproduced: 6/6 pass, 0 fail.
- D7 dispositions: both planned files deleted in a472967 with the stamp
  record in the commit body; the "slug-format already landed" claim
  verified against the asset at 43a008b (naming line present unchanged).
- Writing standard: changed skill/asset text is generic — no dates, no
  task narratives, generic actors only; the test comment follows the
  established `P8 Task N` test-comment convention (bee-phase, bee-verify).
- No stale references to the replaced text ("re-read before judging",
  old Role vocabulary) anywhere in the repo.

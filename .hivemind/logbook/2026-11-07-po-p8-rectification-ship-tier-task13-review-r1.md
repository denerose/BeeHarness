# Review: P8 Task 13 — relay skill (item 25)

**Role:** task-orc (dispatching role; reviewer cold-dispatched)
**Reviewer:** bee-review stage agent, cold dispatch, 600s budget
**Plan section:** [Task 13](../plans/2026-11-07-po-p8-rectification-ship-tier.md)
**Verify record:** [task13-verify-r1](2026-11-07-po-p8-rectification-ship-tier-task13-verify-r1.md) (PASS, plan @ 980600e, checks-run: 1)
**Diff reviewed:** `git diff 980600e..HEAD` on `task/8-relay-skill` (8434c0c + 49a4338) — `skills/session/bee-relay/SKILL.md` (new, 83 lines), `.hivemind/glossary.toon` + `skills/GLOSSARY.md` (relay block term), planned suggestion deleted per D7, verify record

## Verdict

**Approve** — the skill carries the plan's contract complete and verbatim (all seven items, the final-artifacts rules, both modes, the entry trigger, judgment kept); the GLOSSARY term landed in store and view exactly as specified; the D7 disposition matches the phase's accepted convention; every check reproduced live. No blocking, no should-fix; notes only.

## Blocking

None.

## Should fix

None.

## Notes

- **Contract completeness verified item by item** against the plan's Task 13 spec and the origin suggestion (`git show 980600e:.hivemind/suggestions/planned/2026-11-02-po-relays-are-final-artifacts.md`): one topic (SKILL.md:19-20), numbered items (21-22), self-contained context (23-25), as-of commit stamp with the concrete command (26-28), absolute paths (29-31), recipient-should-do line (32-33), no duplicated content pointing at the first relay's home (34-35). Final artifacts carries every element of the origin suggestion: never edit/merge/splice/proofread (39-42), clean full replacement for unpassed (44-45), standalone addendum covering exactly the delta / sized to the ask / never a superset for passed (46-50), and "correct and complete on first hand-off" (39-40) absorbs the suggestion's "always correct on first hand-off." The two modes (52-59) match the GLOSSARY relay entry on both halves: gated — the keeper passes the prompt, direction is theirs; ambient — shared surfaces carry state, roles pick up context without the keeper relaying.
- **Entry gate complies with the T11 standard in substance.** bee-skill-write's Entry discipline says EXTERNALLY-GATED skills "carry their trigger conditions instead — a gate there is noise"; bee-relay:62-68 does exactly that — the content is trigger-only ("EXTERNALLY-GATED. The trigger: …"), with no discretionary USE-IT / skip-by-naming language. The heading (62) borrows the discretionary gate's phrasing because the plan's Task 13 spec dictates that heading with this content — plan-literal and substance-compliant; no action.
- **Writing standard + Task 16 forward-check clean.** No `ADR-[0-9]` anywhere in the new SKILL.md; the phase-wide sweep `! grep -rq --include='SKILL.md' 'ADR-[0-9]' skills/` exits 0 today, so Task 13 adds nothing Task 16 must strip. Content is generic — placeholders and generic actors, no dated stories, no current-work narratives; "siblings in this folder" (Boundaries, 76-77) survives Task 15's folder rename without edits.
- **Glossary add verified end to end.** The store line matches the plan's verbatim text (`relay block :: a relay's deliverable: … :: -`), `bee glossary 'relay block'` resolves it (exit 0), the rendered view carries it in correct alphabetical position (relay < relay block < role, GLOSSARY.md:78-80), and the view diff is exactly the two new lines — nothing else drifted in the regen.
- **D7 disposition matches the accepted phase convention.** Planned `2026-11-02-po-relays-are-final-artifacts.md` deleted in the landing commit 8434c0c, its pre-existing 2026-11-02 Outcome stands in history, and the commit body discloses "stamped + deleted at landing (item 25 landed)" — the same single-commit convention the T8/T9 reviews accepted. The same wording nit T9's review recorded applies here ("stamped + deleted" slightly overstates when no fresh landing-date stamp was added); if the commit is ever amended, mirror T8's "Outcome stamp … stands" phrasing — not worth a round.
- **Mild wording tension inside the contract, plan-carried.** Item 3 (23-25) says the recipient "reads nothing else — … not earlier relays," while item 7 (34-35) says to "point at the first relay's home" for already-relayed content. Coherent reading: item 3 governs what the block must contain (no reliance on other reads), item 7 governs writer-side dedup (the pointer is provenance, not required reading). Both items are the plan's verbatim text, so no fix was this task's to make; noted for any future contract revision.
- **GLOSSARY seam, outside this task's scope.** The pre-existing relay entry ends "The design doc is the relay artifact," while the new relay block entry names "a relay's deliverable" — two artifact nouns, no cross-reference. The store has no edit path (supply-not-update), so Task 13 could not have resolved this; flag for a future store decision if the seam reads confusing to a cold reader.
- **Claim-vs-record (first check) passed.** Task 13's boxes: 0 `[x]` / 5 `[ ]` on this branch and on `phase/8`; ledger reads `task-13 · draft · 0/5 steps` — state sits behind its evidence (verify r1 PASS; this report is the next record). Box-ticking rides the loop's wave-done state moves, the phase's established practice.

**Evidence:** task check reproduced live (`test -f skills/session/bee-relay/SKILL.md && grep -q 'relay block' skills/GLOSSARY.md` → exit 0); `bash scripts/structure-check.sh "$PWD"` → 0 findings; `bee glossary 'relay block'` → exit 0; ADR sweep across `skills/` → exit 0; diff archaeology (8434c0c commit body, 980600e suggestion content, 3b92535 + T9-review D7 precedent); Task 13 box census (branch + `phase/8` + `bee task show` ledger line).

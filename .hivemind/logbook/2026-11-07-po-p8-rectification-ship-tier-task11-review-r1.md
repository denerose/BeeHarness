# Review: P8 Task 11 — entry discipline (authoring standard + bee-argue)

**Role:** task-orc (dispatching role; report by cold-dispatched bee-review worker)
**Plan:** `.hivemind/plans/2026-11-07-po-p8-rectification-ship-tier.md` — Task 11 (item 2)
**Verify record:** `.hivemind/logbook/2026-11-07-po-p8-rectification-ship-tier-task11-verify-r1.md` (this branch, verdict PASS, checks-run: 1)
**Scope:** worktree `/home/saphron/BeeHarness-task-entry-discipline`, branch `task/8-entry-discipline`, diff `43a008b..HEAD` (239ddde + 436ef6a). Changed: `skills/skilldev/bee-skill-write/SKILL.md`, `skills/session/bee-argue/SKILL.md` (+ the verify record).

## Verdict

**Approve** — both edits carry the plan's verbatim texts word-for-word (verified by whitespace-normalized comparison, not eyeball), placement is as specified, the design-input fold is faithful, and the reproduction check passes. Only notes remain.

## Mechanical checks

- **Claim vs record:** all Task 11 boxes in the plan are unchecked (as are all 105 plan-wide — this plan checks boxes at a later stage); no checked box lacks its record; the verify record exists on the task branch with `verdict: PASS`, `checks-run: 1`, `plan @ 43a008b` matching the diff base. No state is ahead of its evidence.
- **Verbatim match, bee-skill-write section:** normalized text equals the plan's Task 11 step-1 text exactly (True, programmatic). Section sits between `## Style` (line 80) and `## Lifecycle` (line 116) — "after Style" as specified.
- **Verbatim match, bee-argue gate:** normalized text equals the plan's step-2 text exactly (True, programmatic). Gate sits before `## Notes` (line 68), after the run steps — "before Notes" as specified.
- **Permissive bullet removed:** "A tool available to any agentic user of the harness…" is gone from `skills/session/bee-argue/SKILL.md` (grep-confirmed).
- **Notes bullet added:** "Dispatched workers return the FINISHED case only — no working notes, transcripts, or process narration." present, verbatim (lines 76–77).
- **Reproduction:** `grep -q 'Should you use this skill' skills/session/bee-argue/SKILL.md` → exit 0. Also matches the plan header's `checks:` contract for `task-11` verbatim.
- **Commit message:** `entry discipline: authoring standard + argue gate` — exactly the plan's commit step.

## Judgment

- **Three bullets vs the dispatch's four:** the plan's step-1 text carries exactly three bullets (DISCRETIONARY · PIPELINE/EXTERNALLY-GATED · SELF-vs-KEEPER). Following the plan was right: the plan is the gated contract (bee-plan-review r3 PASS), and its three bullets cover all four clauses of the design input — the kit note's fourth clause (the mid-P7 ruling provenance: "standalone entry-check DROPPED; authoring input to bee-skill-write") is record material, correctly absent from the shipped skill per bee-skill-write's own Style law (self-contained, no record citations). The fold is realized by where the text landed, which is the ruling's effect. The dispatch's "four" appears to have counted the design note's clauses; discrepancy noted for the dispatcher, no defect in the work.
- **Fold faithfulness (design input → landed text):** kit note `2026-11-01-pp-skill-authoring-kit.md` "Entry discipline (keeper direction, 2026-11-01)" — every operative clause survives: gate with meet-criteria-means-USE-IT and name-the-failure-out-loud skipping; pipeline/externally-gated carry triggers instead; the two-layer rule (gate governs SELF-initiated use; KEEPER invocation IS the entry decision — recognition, not evaluation). The plan's additions ("agents bias toward acting directly", "Not using a skill the keeper explicitly called is the failure mode") sharpen, not change. Faithful.
- **Coherence in bee-skill-write:** Style → Entry discipline → Lifecycle reads as a natural progression (how to write → when it should run → how it matures). The entry-discipline prose uses the document's own vocabulary (gate, trigger conditions, discretionary) and introduces no terms the glossary or the doc fails to carry.
- **bee-argue satisfies its own standard:** it is a DISCRETIONARY skill and now carries a "Should you use this skill?" gate whose entry conditions are stated so that meeting them means USE IT (decision-maker asks for more than one opinion, or fork is few + genuinely distinct + worth the dispatch cost), and skipping requires naming the failed condition out loud, with two worked example phrases — never silently. The closing line ("A plain recommendation remains the common right move; this skill is entered on purpose") preserves the removed bullet's truth while converting it from permission-to-skip into a named default. The standard is met.
- **Writing standard:** both texts are generic (no task specifics, dates, or work narratives; the skip phrases and FINISHED-case bullet use generic actors). Keeper-verbatim emphasis caps (USE IT, SKIP, DISCRETIONARY, SELF-, KEEPER, FINISHED) are kept as the plan wrote them — consistent with kit register elsewhere. Coherent.

## Blocking

None.

## Should fix

None.

## Notes

- `skills/skilldev/bee-skill-write/SKILL.md:9` — the opener still says "The craft is four moves," which the new fifth standing section outgrows. Readable as riding under "give it the house structure," so no contradiction; a future opener touch-up could name entry discipline. No action demanded.
- `skills/session/bee-argue/SKILL.md:19–66` — the entry criteria now live on three surfaces (front-matter description, "When to use"/"When NOT to use", and the gate). The gate is the discipline surface the standard mandates; the detail sections carry the full criteria (including the readiness precondition the gate compresses away). Mild redundancy, no contradiction. No action demanded.
- The dispatch brief's "four bullets" vs the plan's three (see Judgment) — dispatcher-count discrepancy only; the implementer's choice to follow the plan was correct.

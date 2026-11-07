# Review: P8 Task 16 — ship-tier citation strip (item 3, D8)

**Role:** task-orc (dispatching role; reviewer cold-dispatched)
**Reviewer:** bee-review stage agent, cold dispatch, 600s budget
**Plan section:** [Task 16](../plans/2026-11-07-po-p8-rectification-ship-tier.md)
**Verify record:** [task16-verify-r1](2026-11-07-po-p8-rectification-ship-tier-task16-verify-r1.md) (PASS, checks-run: 1)
**Diff reviewed:** `git diff 80d294a..HEAD` (commits 3ad7847 + d1b9ea5) on `task/8-ship-tier`; changed: `roles/power-planner.md`, `roles/project-orchestrator.md`, `roles/task-orc.md`, `roles/retired-pp.md` → `.hivemind/memory/retired-pp-role.md` (rename), `skills/thinking/bee-brainstorm/SKILL.md`

## Verdict

**Fix first** — the strip work itself is sound (all ten census hits verified below), but the mandated bee-brainstorm re-wrap broke a sibling task's pinned check phrase; one-line re-wrap fixes it.

## Blocking

- `skills/thinking/bee-brainstorm/SKILL.md:42-43` — the re-wrap from replacing "(global `adr` skill)" split the phrase across lines: "…a decision is what / the keeper decided, not what the…". Task 8's pinned check `grep -q 'a decision is what the keeper decided'` now fails even against the corrected path (verified: fails on `skills/thinking/bee-brainstorm/SKILL.md`; it passed on the pre-edit wrap at 80d294a). The checks contract is plan law — review-time claims and verify-time evidence share it — and this task's edit regressed a previously-passing pin. Suggested fix: re-wrap step 4 so `a decision is what the keeper decided` sits contiguous on one line (break the line after "agreed —" rather than inside the pinned phrase), then re-run `grep -q 'a decision is what the keeper decided' skills/thinking/bee-brainstorm/SKILL.md` — exit 0.

## Should fix

None.

## Notes

- **Task 12 has never run** — its plan boxes are all unchecked, no task-12 verify/review records exist in the logbook, no wave commit carries it, and `skills/thinking/bee-handoff/SKILL.md` contains no continuity-law section. The dispatch premise "the LAST task; after this the phase closes" is therefore wrong: the phase exit's "all 17 checks pass" criterion cannot be met until T12 executes. No defect in T16's work — surfaced so the loop schedules T12 before close.
- **Plan machine-header stale paths** — checks for tasks 8, 11, 12, 13, 14 still reference `skills/session/…`, dead since Task 15's rename (pre-dates this diff; present at 80d294a). Mechanical run today: 8/11/12/13/14 FAIL as written; path-corrected, 11/13/14 pass, 8 fails on the blocking wrap above, 12 fails pending T12. The header sweep is plan maintenance and the loop's call — best done before T12's verify runs against a stale check.
- `.hivemind/memory/retired-pp-role.md:5` — the "(ADR-010)" anchor was stripped from what is now a record, where provenance anchors are the point ("records live in the records"). Plan-compliant (the strip step ran while the file was still `roles/retired-pp.md`; the release check greps `roles/` only), and "the one role concept" matches ADR-010's title so a search still finds it. Restoring the anchor would be reasonable polish, not a round.

## Verification performed

- **Claim vs record:** verify record exists and matches the sibling convention (machine header, verdict PASS, checks-run 1, plan @ 80d294a). Task 16's boxes unchecked is normal mid-flow — box-ticking rides the wave-merge commits (plan-file history: "wave N done … states moved"), and T16 is unmerged. No checked box anywhere lacks its records.
- **Census, all ten hits at 80d294a (`git grep 'ADR-[0-9]' 80d294a -- roles/ skills/`), each checked against pre-change text:** power-planner ×3 (ADR-007 per-role handoff, ADR-016 lifecycle stamp, ADR-014 determinism line — all drop, rule text stands alone); project-orchestrator ×2 (ADR-003 relay artifact, ADR-011 context-flat — drop, stands alone); task-orc ×4 (intro rewritten, `## Attributes (ADR-010)` and workspace ADR-012 and boundary-test header — drop, law sentences self-contained); retired-pp ×1 (see note 3). Post-change census: GLOSSARY-only, 14 anchors intact per the two-glossaries rule.
- **task-orc intro judgment call — upheld.** "This file is its whole contract" is accurate: ADR-011's contract is fully present in `roles/task-orc.md` — one plan per dispatch, the five brief elements (embedded dispatch-brief section), stop-and-return at two failed fix rounds with question+context+recommendation, pass-back digest with paths-not-contents, and the boundary test (dispatcher never opens source files; tooling clarification included). Dropped "minted under ADR-010" is provenance — exactly what ship-tier strips from shipped specs.
- **D8 move:** rename detected (93% similarity); the functional pointer at `roles/power-planner.md:14` updated to `.hivemind/memory/retired-pp-role.md` and the entry region reads coherently; no dangling `roles/retired-pp` references outside plan history (which stays as written); `scripts/structure-check.sh` clean — the new memory path is allowed.
- **Kept references, none over-stripped:** GLOSSARY anchors kept; bee-plan's two "not the global plan skill" notes kept; `roles/power-planner.md:37-38` keeps its global `adr` skill reference per the kit design ("the `adr` skill's references stay by design — build-time tooling, never a loop dependency").
- **bee-brainstorm replacement:** verbatim per the plan step — "(the project's own decision-record practice)".
- **Checks:** task-16 release check reproduces (PASS); full suite `node --test tests/*.test.mjs` — 386 pass, 0 fail; structure check 0 findings.
- **Cold-read:** all three role files read whole post-change; every stripped site's surrounding contract stands alone; task-orc and both orchestrator roles remain fully self-contained specs.

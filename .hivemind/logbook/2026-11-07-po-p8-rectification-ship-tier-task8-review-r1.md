# Review: P8 Task 8 — bee-brainstorm ownership filter

**Role:** project-orchestrator (dispatching loop; reviewer cold-dispatched)
**Reviewer:** bee-review stage agent, cold dispatch, 600s budget
**Plan section:** [Task 8](../plans/2026-11-07-po-p8-rectification-ship-tier.md)
**Verify record:** [task8-verify-r1](2026-11-07-po-p8-rectification-ship-tier-task8-verify-r1.md)

Scope reviewed: `git diff d3e191e..HEAD` on `task/8-brainstorm-filter`
(commits 3b92535, 7b25af2) — `skills/session/bee-brainstorm/SKILL.md`
step 4 rewrite, one `suggestions/planned/` file deleted per D7, verify
record.

## Verdict

Fix first — the substantive edit is exact and clean, but the landed
`(GLOSSARY: memory ownership)` pointer names a glossary term that does
not exist; one cheap fix before merge (S1).

## Claim vs record

Clean. All checked plan boxes (T1/T2/T3/T7) have verify + review
entries behind them. Task 8's boxes remain unchecked on the task
branch — consistent with the established convention (the PO flips
boxes at wave-close merge; cf. fab7a0f, d3e191e). Task 8's verify
record exists, rides the branch, cites `plan @ d3e191e` (correct
branch point), verdict PASS, 1 check. Check re-run by this reviewer:
`grep -q 'a decision is what the keeper decided'
skills/session/bee-brainstorm/SKILL.md` → exit 0. No stale references
to the old "Record decisions as ADRs" wording anywhere in living
files.

## Blocking

None.

## Should fix

- `skills/session/bee-brainstorm/SKILL.md:43-44` — "(GLOSSARY: memory
  ownership)" names a term that is not in the glossary: no `memory
  ownership` entry exists in `skills/GLOSSARY.md` (rendered) or
  `.hivemind/glossary.toon` (store) — the vocabulary actually lives
  as a section heading in `AGENTS.md:15` ("## Memory ownership").
  Every other `(GLOSSARY: …)` pointer in the kit (relay, determinism
  test, ADR, escalate, claim, validation level, Role trailer)
  resolves to a real glossary term; this one dangles, against the
  writing standard's "define or link any term of art." The defect
  enters through the plan's verbatim quote (the implementer landed
  the contract faithfully), and no later P8 task repairs it (Task 13
  adds only `relay block`; Task 17 seeds consumer-repo glossaries).
  Suggested fix (loop's fix round; both deviate from the plan's
  verbatim text, which is the loop's call): either add the term so
  the pointer resolves (`bee glossary add 'memory ownership' '<gist
  of AGENTS.md's section>' --see AGENTS.md`), or reword the
  parenthetical to point at the true source, e.g. "(memory ownership
  — AGENTS.md)".

## Notes

- Verbatim verification (the brief's question): landed step 4 ==
  the plan's quote, word for word. Method: extracted both, collapsed
  whitespace, byte-compared (`[ "$a" = "$b" ]`) — exact match,
  including the em-dash. The re-wrap to the file's ~72-column
  convention is format-only, as the implementer claimed; steps 3 and
  5 are untouched; the hunk is surgical.
- The landed text correctly retains "(global `adr` skill)" — the
  plan marks that reference as Task 16's scope, not this edit's.
- D7 disposition verified against sibling practice: the deleted
  `suggestions/planned/2026-10-25-po-brainstorm-ownership-filter.md`
  carried its Outcome stamp (2026-11-01, routed) before deletion, and
  the landing is disclosed in the commit body — identical handling to
  T7's `e99dc73` deletion. Consistent.
- Writing standard: compliant. Plain declaratives, generic actors,
  no dated stories or task narratives introduced; "memory ownership"
  mirrors the keeper's own AGENTS.md heading (not coined vocabulary),
  so the plain-language rule holds — only the attribution is wrong
  (S1).
- Verify-record machine blocks across P8 (T3/T7/T8) all carry
  `role: project-orchestrator` while implement commits trailer
  `Role: task-orc` — phase-wide convention in the tooling, identical
  across tasks; not a Task 8 deviation.

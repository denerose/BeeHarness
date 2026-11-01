# Review: P4 Task 7 — guidance skeleton + skill folds + task-orc codification

**Role:** project-orchestrator (dispatching loop — GLOSSARY: Role trailer)
**Reviewer:** bee-review, cold dispatch, worktree `task/4-guidance` @ ef37bbf
**Plan section:** `.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md` Task 7
**Verify record:** `.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task7-verify-r1.md` (PASS)

## Claim vs record

Task 7 boxes in the plan are all unchecked — correct: the loop flips them
from this report. The verify record exists on the branch and every
command it claims was reproduced in the worktree:

- `node --test tests/*.test.mjs` → 201 pass, 0 fail (188 prior + 13
  guidance — matches the record's arithmetic).
- `bee guidance` (live default dir) → `4 topics`, the four stems, exit 0.
- `bee guidance show nope` → exit 1, `no topic nope — bee guidance list`.
- `bee verify --plan … --task 7 --check` → `task-7 … PASS · 2 files`,
  links PASS, would-write r2 (check-only; nothing written).
- Reference sweep grep (`verify-record-template|verify-record` over
  skills/ bin/ scripts/ tests/ docs/ roles/ AGENTS.md README.md) → zero
  hits, exit 1 — the deleted template orphans nothing (the bee-verify
  assets/ dir is gone entirely; no remaining references anywhere).
- `git status` clean after all runs; read-only family honored.

Role-trailer shape (`project-orchestrator (loop)` in the record,
`task-orc` on the commit) matches the sibling convention (task 5, task 6
records). No claim ahead of its evidence. No blocking findings here.

## Verdict

**Fix first** — the work matches the plan's intent end to end (all seven
steps verified live); one should-fix: the bee-skill-review gate's
product has no durable home beyond the verify record's summary.

## Blocking

None.

## Should fix

- `.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task7-verify-r1.md:42-69`
  — the skill-review gate (plan step 5) is evidenced only by its summary
  in the verify record: two r1 reviews (4 blocking findings total) plus
  a re-review whose "all four fix confirmations CONFIRMED" is not
  checkable against any artifact. bee-skill-review's own input contract
  says the dispatch names the report's home *before* the review starts;
  no home is named or filed. This evidence is load-bearing twice over:
  the codified nested-review split is hindsight-gated (the design note
  says hindsight reviews re-check it), and the keeper's phase-end
  sign-off on the law-touching skill texts leans on the gate having
  passed. Suggested fix: file the two r1 reports and the re-review
  confirmations as a logbook entry riding this branch (e.g.
  `…-task7-skill-review-r1.md`), reconstructed from the dispatch
  transcripts or from the summary if the transcripts are gone — and in
  either case the filing names its sources.

## Notes

- `bin/bee.js:2547` (`guidanceOneLiner`) — the list one-liner is the
  file's first *physical* line; house hard-wrap (~72 cols) means every
  shipped purpose lists as a mid-sentence fragment (`…agents are… (+4
  chars)`) and the size hint counts only the hidden tail of that line,
  not the paragraph. All four read fine as identifiers; when P6 grows
  real content, either join the first paragraph (to the first blank
  line) or state the first-line rule wherever topic-writing gets its
  convention.
- `skills/loop/bee-plan/SKILL.md:64-65` — "the task's verification
  command (rule 4) is its `checks:` entry's `cmd` — one command, both
  homes" quietly requires every task's checks entry to carry `cmd`,
  while the Task-5 header contract permits files-only entries. The two
  rules together imply cmd is mandatory; a half-line saying a files-only
  entry cannot satisfy rule 4 alone would make that explicit.
- `bin/bee.js:1869-1873` — the link-check parses markdown-link syntax
  only; the guidance topics (like all house docs) use backtick path
  pointers, so the dogfood's `links PASS · 0 links checked` is vacuous
  for them. All 11 topic pointers were checked by hand and resolve.
  House style predates this task, so no defect here — but the phase's
  new pointer-heavy shipped docs have zero automated link coverage;
  worth a line when the link-check next matures.
- `.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task7-verify-r1.md:24-26`
  — task 7's own r1 record is hand-written prose (`--check` disclosed),
  while the folded bee-verify skill now defines command-minted entries
  with machine headers. Consistent with sibling records during the
  transition; it is the pattern the fold retires, so from the next task
  on, records should be `bee verify`-minted (anomalies appended to the
  prose body per the folded skill).

## Deviation adjudication (as dispatched — none fixed here)

1. **Brief-template line in both surfaces — accepted.** Plan bullet
   lists it among the role-file additions (role file = plan-literal);
   the design note's codification section and the machine-header
   targets name the template (template = design intent + the only task
   that touches it). Both placements are the plan's own two surfaces
   reconciled minimally; the template stays canonical (the role file's
   brief section already embeds a condensed copy — pre-existing
   pattern). Exactly the four role-file adds, no expansions.
2. **Traversal guard — accepted.** Security-positive, tested
   (`../alpha` → usage error), disclosed in usage text; sibling shape
   (fail loud, fix line) intact.
3. **`--full` on list only — accepted.** Show has no truncation; AXI's
   "`--full` wherever truncation exists" is inapplicable, and `show
   --full` correctly fails loud as an unknown flag (verified in code).
4. **Gate reviews as cold scout analyses — accepted as the codified
   fallback's exact case** (design note: "cold scout analysis …
   disclosed"; no worker type on the surface). The disclosure is
   thorough; the durability gap is the should-fix above, not the
   reviewer type.
5. **Template deletion — accepted.** The skill-review gate itself
   flagged the stale template as blocking; the standing no-stale-
   references rule and the sweep (clean, no orphans) carry it.
   Bookkeeping only: the phase targets list doesn't record the
   deletion — the loop's task-notes convention covers it.

## Intent match

Thin-minimal held everywhere it was asked to: no injection machinery
(guidance is read-only — verified by porcelain after live runs); four
lean skeletons (38–46 lines, purpose / when-to-use / core rules /
pointers, generic actors, zero ADR citations, zero dated stories —
grepped); the named content all present (four session rituals in
how-to-be-a-bee, the full AXI battery + TOON + atomic writes +
provenance in cli-writing, house test patterns in tdd, the
reproduce-then-fix vs feature split in triage-distinction); bee-verify
thinned with both judgment lines surviving ("is this output sane",
anomalies reproduced) and its CLI claims byte-accurate against
bin/bee.js (--role, --base, --record semantics, scoped-success writes,
`0 checks` writes nothing — all verified in source); bee-plan rule 4
strengthened exactly as specified with the checks-contract pointer;
role file carries only the four adds. Tests (13) cover the plan's
battery plus the two deviation probes.

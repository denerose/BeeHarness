# Review: P4 Task 10 — reference sweep + phase exit (sweep work + dogfood)

**Role:** project-orchestrator
**Reviewer:** bee-review (cold dispatch, worktree task/4-sweep @ 5cfac1d)
**Plan section:** `.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md` Task 10 + Standing rules
**Verify record:** `.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task10-verify-r1.md` (committed @ 5cfac1d)

## Verdict

Fix first — 0 blocking, 3 should-fix, 5 notes. The sweep work itself is
sound and every reproduced check passes (238/238 suite, 0 structure
findings, 11/11 dogfood, unscoped verify writes nothing); the
should-fixes are two stale-reference residuals in README and one
unrecorded class-widening on the bin/scripts boundary.

## Blocking

None.

## Should fix

- `README.md:34` — the `.hivemind/` bullet still glosses "suggestions
  (the inbox)". This is the exact naming collision the task fixed in
  AGENTS.md:144 (deviation 1, disclosed): GLOSSARY now defines
  **inbox** as `inbox.toon`, so a second "the inbox" meaning
  `suggestions/` misleads cold readers — the class the sweep exists to
  kill. Suggested fix: "suggestions (improvement proposals)".
- `README.md:27` — "(when built)" is stale as of this phase: the
  agent-first CLI (`bee inbox`/`park`/`design`/`verify`/`task`/`phase`)
  is built and live. The implementer's out-of-scope flag rests on the
  Files-list parenthetical ("documents list only"), but the standing
  rule — "the build is not finished until stale references are gone" —
  and the GLOSSARY README entry ("if a sentence can go stale, it
  doesn't belong") cover it; this one already has. Suggested fix: drop
  the parenthetical.
- `.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task10-verify-r1.md:58` (Boundary C) —
  the plan's letter says "Usage/help text and error strings carry zero
  hits"; the work carries hits in both: usage/help
  (`bin/bee.js:2729`, PHASE_USAGE naming
  `.hivemind/logbook/…-decisions.toon`) and error strings
  (`bin/bee.js:1976,2391,2508,2524,2904` — `fix:` lines with
  `.hivemind/…` examples). The record classifies them (a) with sound
  reasoning (all are operating surfaces / self-correction per ruling 4;
  zero authority citations — reviewer re-checked every line), but that
  widens class (a) past the plan's text and the widening lives only in
  this entry. Suggested fix: loop records the accepted deviation
  durably at close (task notes: "ruling-4 fix lines and usage
  destinations naming default operating paths are class (a)") —
  rewording the strings would degrade self-correction output.

## Notes

- Verify record:42 — Boundary A says "15 hits"; actual count is 16
  (`grep -rn "hivemind" skills/ | grep -v GLOSSARY`). Reviewer checked
  all 16: every one a functional operating-surface reference
  (sessions/suggestions/phases/logbook/plans/memory + GLOSSARY
  pointers), zero authority citations — miscount only, verdict
  unaffected.
- `skills/GLOSSARY.md:58` — "the CLI never edits them by hand"
  conflates hands with the CLI path; the Task-4 contract is "edited
  only via the script". Suggested wording: "edited only by the script —
  never by hand". Vocabulary-only intact.
- Box 3's "no skill text pointing at hand-run verify steps" clause has
  no dedicated grep in the record; reviewer ran it (`grep -rn
  "node --test|npm test|run the suite|run the checks|structure-check"
  skills/`): only `plan-template.md:23`'s `suite:` contract example —
  functional. Zero residuals; evidence gap only.
- Named deviations adjudicated fine: (2) GLOSSARY hivemind enumeration
  + parking-lot family naming are consistency touches within the named
  shapes — the plan's "`bee park`" entry is satisfied by the parking-lot
  entry naming the family, which avoids a duplicate entry for the same
  store; (3) `bin/bee.js:1233` "live"→"legacy" is accurate (migrate
  parses the legacy md format); (4) `.hivemind/phases/BeeHarness.md`
  untouched is consistent with the plan's own structure — the Files
  list covers the whole task including the phase-end box, which is the
  loop's from main (box correctly unchecked).
- Claim-vs-record clean: all six Task 10 boxes unchecked, no task-10
  ledger lines, commit message matches the plan's prescribed text,
  verify entry's role field (project-orchestrator = the loop that
  evidences) matches the task-9 pattern against the task-orc commit
  trailer (the implementer). Dogfood arithmetic reproduced: the
  record's "links · 48 docs" equals the pre-commit diff
  (main..484d54c: 49 md − 1 deleted); post-commit it is 52 — evidence
  genuine, not post-hoc.

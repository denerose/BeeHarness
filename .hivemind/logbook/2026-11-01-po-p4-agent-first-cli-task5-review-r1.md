# Review: P4 Task 5 — plan-header check contract + `bee verify`

**Role:** project-orchestrator (bee-review dispatch, review round r1)
**Reviewer:** cold-dispatched reviewer (bee-review skill)
**Plan section:** Task 5 — [`/home/saphron/BeeHarness/.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md`](/home/saphron/BeeHarness/.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md)
**Verify record:** [`/home/saphron/BeeHarness-task-verify-cli/.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task5-verify-r1.md`](/home/saphron/BeeHarness-task-verify-cli/.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task5-verify-r1.md) (task/4-verify-cli @ 1b6f0df)
**Scope:** commits 2074c5a (task3 record link repair — disclosed deviation) + 5974aa6 (bin/bee.js, skills/loop/bee-plan/assets/plan-template.md, tests/bee-verify.test.mjs, tests/fixtures/verify-plan.md) + 1b6f0df (verify record). Diff `672987d..1b6f0df`.

## Claim vs record (first check)

Clean. Task 5's plan boxes remain unchecked (correct — the loop flips them from
this report); the verify record exists and backs implemented→verified. Every
recorded command re-run in the worktree and reproduced:

- `node --test tests/bee-verify.test.mjs` → 29/29 pass ✓
- `node --test tests/*.test.mjs` → 151/151 pass ✓
- dogfood `bee verify --plan <this plan> --check` → `0 checks` + fix line +
  `links · 27 docs · PASS · 0 links checked`, exit 0 ✓ (record said 23 docs —
  local main advanced after the record was written; scope drift, not a
  discrepancy — see Notes)
- `bash scripts/plan-checks.sh` over a copy of the fixture → exit 0, checks
  clean ✓

No checked box without a record; no state ahead of its evidence.

## Verdict

Fix first — no blocking findings; the work matches the plan's contract
(template block verbatim, TOON shape, fix-on-FAIL, entry header fields, atomic
writes, `--check` never writes — all asserted and replicated), but two
behavioral gaps against the plan's own standing rules plus one envelope
decision's blast radius deserve a fix round before merge.

## Blocking

None.

## Should fix

- `bin/bee.js:1478` (`runCheckEntry`, cmd branch) — timeout lands on the wrong
  branch and emits the wrong self-correction. `spawnSync` on timeout sets BOTH
  `r.error` (`spawnSync sh ETIMEDOUT`) and `r.signal` (`SIGTERM`) — verified by
  probe — so the `r.error` check at :1478 always wins: a hung command reports
  `cannot run: …` with fix `make '<cmd>' runnable`, when the command ran fine
  and hung. The correct branch (:1782, `did not finish — repair or shorten it`)
  is unreachable for the only realistic signal case, and its own hardcoded
  `(timeout after 600s)` annotation is wrong for a genuine external signal.
  Ruling 4 (failing checks emit what to do next) is this feature's point; a
  misleading fix line defeats it on the slowest, most confusing failure.
  Suggested fix: branch on `r.error?.code === 'ETIMEDOUT'` (or test
  `r.signal` before `r.error`) so timeouts land in the timeout note + fix, and
  drop or condition the `(timeout after …)` parenthetical on an actual
  ETIMEDOUT.
- `bin/bee.js` (verify flags; truncation at :1764, :1813–1814) — truncation
  exists with no `--full`. The standing rule for every task ("`--full`
  wherever truncation exists") is not met: TOON lines truncate cmd→60 and
  files→40, the first output line→80 (`… (+N chars)` hints), and every sibling
  subcommand (`inbox`, `park`, `design status`) ships `--full`. Suggested fix:
  add a `--full` boolean to `cmdVerify` gating the `truncText` calls in
  `runCheckEntry`/`firstOutputLine` (and document it in `VERIFY_USAGE`).
- `bin/bee.js:2039–2052` (adjudicating deviation 3) — an unscoped full run
  mints one logbook entry per task on success by default. Blast radius on the
  real dogfood: the post-merge full run and Task 10's phase exit each write
  ~11 entries (task-0…task-10), bumping every task's verify series (r2/r3 on
  tasks that already carry loop-driven rounds), so a `bee verify --plan X`
  used as a status check silently appends a dozen evidence files and the
  round suffix (GLOSSARY: logbook versioning — deliberate verify rounds)
  dilutes into sweep artifacts. Related: a link failure anywhere marks EVERY
  task's entry FAIL (:2047), so one broken link in any changed doc fails all
  eleven records under `--record`. Nothing breaks mechanically
  (`nextVerifyRound` just continues; per-entry ADR-006 invariant holds), and
  the plan's letter ("on success … writes") supports writing — but the
  fan-out on unscoped runs is this task's envelope call, and the write-default
  surprise cuts against the repo's own safety-lines culture. Suggested fix:
  write per-task entries only when the run is scoped (`--task <n>`) or
  `--record` is passed; an unscoped default run prints its TOON lines plus
  `logbook: not written (no --task — pass --task <n> or --record to
  evidence)`. Task 10 keeps its phase-exit evidence via `--record`.

## Notes

- Deviation 1 (dogfood checks block deferred to post-merge): accepted. The
  fixture (`tests/fixtures/verify-plan.md`) genuinely mirrors the contract
  shape — every field, both entry forms exercised (task-1 cmd+files+expect,
  task-2 files-only), byte-level parse assertions, and plan-checks tolerance
  proven. Residual risk: the dispatcher-authored real block (~11 entries) gets
  its first real parse at Task 10's dogfood — the dispatcher should run
  `bee verify --plan <plan> --check` once when adding the block from main.
- Deviation 2 (on-branch repair of the task3 record's `](_..)` link):
  accepted, and its factual claim holds — the record has zero commits on main
  (rides phase/4 only), so it appears in every `main..HEAD` and
  `main..phase/4` diff, and `_..` is repo-relative → it would have failed this
  task's dogfood and Task 10's phase exit until repaired. Repair is minimal,
  disclosed in-file and in the verify record; in-envelope per the deviation
  envelope. First real catch of the new check is a point in its favor.
- Deviation 4 (link-check on every invocation; changed *.md at HEAD; no
  .hivemind exclusion): accepted — the plan's letter asks exactly this, skip
  and bad-base paths are tested, deleted docs correctly skipped. One scope
  quirk found while replicating: `main` is the local ref tip, so docs modified
  on main after the branch point appear in `main..HEAD` and are checked
  against HEAD's pre-sync copy (the 23→27 docs drift is this effect). A
  branch can transiently fail on a link already fixed on main; the
  spine-currency sync rule bounds it. No action.
- Link matcher edges, latent (zero occurrences repo-wide today, verified by
  grep): (a) angle-bracketed spaced targets `[x](<a b.md>)` capture only `a`
  → valid CommonMark flagged broken (`bin/bee.js:1836` regex); (b) unbracketed
  spaced targets capture the first word; (c) link syntax inside inline-code
  spans `` `[x](y)` `` is checked — a false-positive class for docs that show
  link examples in backticks; (d) image links `![x](y.png)` ARE checked —
  correct (a broken image is a broken link), noted for the record. When any
  of these bites: skip inline-code spans the way fences are skipped and give
  `<...>` destinations their own capture branch. Not worth a round now.

Careful-developer pass otherwise clean: `parsePlanHeader` is solid
(indent-agnostic bullets, id/duplicate/expect validation with line numbers
and template pointers, unknown keys tolerated forward-compatibly);
`nextVerifyRound` escapes the stem and `taskN` is digits-only by
construction; atomic writes tested (no tmp leftovers); the 29-test battery
covers the plan's named AXI list plus header-contract and link-check probes.

Role: project-orchestrator

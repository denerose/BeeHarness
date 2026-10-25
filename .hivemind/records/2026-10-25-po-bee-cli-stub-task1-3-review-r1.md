# Review: bee CLI stub — Tasks 1–3 (scaffold, `bee init`, `bee report`)

**Role:** project-orchestrator
**Reviewer:** bee-review stage agent (dispatched by project-orchestrator)
**Plan section:** `/home/saphron/BeeHarness/.hivemind/plans/2026-10-25-po-bee-cli-stub.md` Tasks 1–3 (all checkboxes checked)
**Verify records:** task1-verify-r1, task2-verify-r1, task3-verify-r1 (all PASS)

## Verdict

**Fix first** — the implementation matches the plan verbatim and all
16 tests pass, but repeated `bee report` regens progressively destroy
the report's own protocol header (verified by experiment); plus one
digest-quality issue on the live queue.

Review basis: files match the plan's verbatim code exactly (diffed by
read); `npm test` 16/16 green; live `--check` dry-runs of both
commands exit 0 and write nothing; sandboxed multi-run experiments in
`/tmp` for header stability.

## Blocking

- `bin/bee.js:330` — the Generated-restamp regex
  `/\*\*Generated:\*\*.*(\n.*)?$/m` unconditionally consumes the line
  following the stamp. Trace (verified in `/tmp`, both header forms):
  on a report the tool itself wrote, the stamp is single-line, so run
  N eats the blank line after it, run N+1 eats the protocol block's
  first line (`**Zones and rules — read before regenerating this
  file:** *Keeper's`), run N+2 the second, etc. — one header line
  destroyed per regen. The plan's contract says the header is
  "preserved verbatim except the `**Generated:**` line"; the protocol
  block is the most protected content in the file (it instructs every
  future regen). The wrapped-stamp case (the live report's two-line
  Generated) is handled correctly on run 1, then decays the same way
  from run 3. No test catches it: the idempotency test
  (`tests/bee.test.mjs`, "second run is idempotent") compares only
  from `## Keeper's list` onward, excluding the header — and only
  runs twice. Suggested fix: join continuation lines only when they
  are non-blank and don't start a structural marker, e.g. replace the
  regex with `/\*\*Generated:\*\*[^\n]*(?:\n(?!\s*$|\*\*|#)[^\n]*)*$/m`
  (matches the live two-line stamp and multi-line wraps; never eats a
  blank line, a `**…**` emphasis line, or a heading). Add a test:
  three consecutive regens leave the header byte-identical except the
  Generated line.

## Should fix

- `bin/bee.js:202` — `queueBullets` derives every `## Awaiting keeper`
  bullet as an ask, but the live queue's convention keeps RESOLVED
  history bullets. Live `node bin/bee.js report --check` output shows
  "Needs the keeper" items 1–3 all marked `RESOLVED …` — resolution
  history surfaced as numbered asks to the keeper. ADR-008 defines the
  zone as decision asks; the digest misleads. Suggested fix: skip
  queue bullets whose text contains a resolved marker (e.g.
  `/\bRESOLVED\b/`), or record a queue-hygiene rule (resolved bullets
  leave the queue) and fix status.md instead — that choice is a small
  convention call the loop may want to put to the keeper as one
  question before the code changes.

## Notes

- `bin/bee.js:229` — `absolutize` drops the backticks when rewriting a
  backticked repo-relative token: `` `.hivemind/designs/widget.md` ``
  becomes a bare absolute path (verified in sandbox output). Plan
  prose is silent on backtick retention; markdown emphasis is lost.
  Cheap fix if the file is touched: return the absolute path
  re-wrapped in backticks.
- Plan contract says "backticked **or bare** repo-relative tokens" go
  absolute, but the bare-token regex (`bin/bee.js:232`) only matches
  `.hivemind/…` paths — a bare `bin/bee.js` in a queue bullet stays
  relative. The conservative scoping is defensible (avoids rewriting
  incidental path-like words in prose); either extend the regex or
  narrow the plan's prose so contract and code agree.
- Process/evidence: each task's commit bundled code + verify record +
  plan checkbox flip, where the plan said "stage only" the code files
  (records were Task 4's to commit). Harmless — arguably better
  atomicity — but note the Task 1 verify record is dated 15:32 inside
  commit 208e7ca whose author *and* committer dates are 15:22:05; a
  record postdating its containing commit is a timestamp
  inconsistency worth avoiding (record the hash after committing, or
  commit the record afterwards).
- `cmdInit` write path re-serializes the whole settings file
  (`JSON.stringify(settings, null, 2)`): keys and order preserved, but
  pre-existing formatting normalizes. Acceptable for a stub; only the
  append path writes (already-registered never writes — verified live,
  exit 0, no write).
- Test `init: adds skills entry, preserves other keys` hardcodes the
  literal `~/BeeHarness/skills` — machine-bound by design (plan
  acknowledges this in a note). Fine while the repo lives at
  `~/BeeHarness`.
- Reviewer incident, disclosed for the log: while probing header
  stability I ran `node bin/bee.js report` three times **without**
  flags — the defaults wrote the live
  `/home/saphron/BeeHarness/.hivemind/keeper-report.md` (three merge
  regens; the third also demonstrated the blocking bug on the live
  file). Restored immediately with
  `git restore .hivemind/keeper-report.md`; verified clean porcelain
  and header identical to the pre-incident content. No other file
  written (status.md and `~/.pi/agent/settings.json` untouched).
  Aside from the embarrassment tax, it is live-file confirmation of
  the Blocking finding: the defaults + this bug make an ungated
  non-check run genuinely destructive.

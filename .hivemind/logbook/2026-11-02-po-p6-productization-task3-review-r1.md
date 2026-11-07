# Review: task-3 MANAGED AGENTS.md BLOCK (P6 productization)

**Role:** project-orchestrator (dispatched stage review, bee-review)
**Reviewer:** cold reviewer, workspace /home/saphron/BeeHarness-task-block @ 6d9850f
**Plan section:** /home/saphron/BeeHarness/.hivemind/plans/2026-11-02-po-p6-productization.md Task 3
**Verify record:** /home/saphron/BeeHarness-task-block/.hivemind/logbook/2026-11-02-po-p6-productization-task3-verify-r1.md (PASS)

## Claim vs record

Clean. Task-3 verify entry exists (PASS) behind commit 65cac49; the
diff is exactly the two claimed files (bin/bee.js +107,
tests/bee-agents.test.mjs +86). Task-3's plan boxes remain unchecked —
that is the loop's close-time flip (observed: task-2's boxes flipped in
the "task-2 state: done" commit 2df5ec7), not a missing record. All
already-checked boxes in the plan (tasks 1, 2, 4, 5) have their verify
and review entries behind them.

## Verdict

Approve — spec-faithful on every binding line (block byte-exact, error
string byte-exact, outside-fence bytes preserved, idempotent, check
writes nothing, harness-repo skip verified live); one should-fix (raw
crash instead of structured error when AGENTS.md is unreadable) and
notes on the disclosed interpretations, all judged within intent.

## Blocking

None.

## Should fix

- `bin/bee.js:361-363` — `ensureManagedBlock` rethrows every non-ENOENT
  read failure. Verified: with AGENTS.md as a directory, `bee init`
  dies on a raw `EISDIR` stack trace — exit 1, stdout empty (the
  scaffold lines from items 1–10, which were already written, are
  never printed), no `bee init:` structured error. This deviates from
  the CLI's own convention for unreadable paths (structured
  `cannot read <path>: <message>` at bee.js:911, 1057, 1441). Suggested
  fix: in the catch, return a structured failure for non-ENOENT codes —
  `{ code: 1, out: '', err: 'bee init: cannot read ' + agPath + ': ' +
  e.message + '\n' }` — and handle it in `scaffoldReport` exactly like
  the corrupt-fence branch at bee.js:600-607, so the accumulated
  scaffold lines survive in `out`. No writes happen either way; this is
  polish of a pathological case, not a data-safety bug.

## Notes

- **Block content byte-exact.** Extracted the generated block from a
  fresh init and diffed against the plan's fenced block: identical,
  353/353 bytes (em-dashes and `·` included). Header is
  `# AGENTS.md — <basename(repoRoot)>`, consistent with the phase
  list's project naming (item 4). All four write-mode report strings
  byte-match the plan.
- **Corrupt error string byte-exact.** The exactly-one-fence message
  matches the plan's string character-for-character (verified by
  instantiating `<path>` and `cmp`); exit 1, AGENTS.md untouched.
- **N-fence generalization (disclosed #2) — within intent.** 2 fences
  (end-before-start) and 4 fences (two full blocks) both fail loud with
  the count in the message and no writes, in write AND check mode.
  Treating those as "update the first block" would be the guessing the
  seam law forbids; generalization is the only safe reading. The
  exactly-one case keeps the verbatim string.
- **Check-mode "would" phrasing (disclosed #1) — within intent.**
  `would create AGENTS.md` / `would append` / `would update`, `current`
  as-is. Mirrors task 2's established `would scaffold <rel>` convention
  (bee.js:465-467); verified `--check` writes nothing in all four
  states (file absent / no fences / stale inner / current) and on the
  corrupt cases.
- **Line-exact trimmed fence detection (disclosed #3) — within
  intent.** Prose quoting a fence mid-line is prose (verified: file
  whose fence lines carry prose decoration takes the append path and
  gains a second real block; the next run sees one real pair and
  reports current — stale decorated block left as the project's own
  bytes, never guessed at). The alternative (substring detection)
  would misfire on legitimate prose mentions. Same rule means indented
  fences count as fences and keep their indentation on update —
  verified. Both consequences are deterministic and lossless outside
  the fences.
- **CRLF behavior.** Fence detection works under CRLF (`\r` trimmed);
  bytes outside the fences are preserved exactly (verified: CRLF
  project text and CRLF trailer byte-preserved through an update). The
  rewritten inner block is canonical LF, so a CRLF file ends up with
  mixed line endings, and a whole-file CRLF re-conversion re-reports
  `updated` once. Never corrupts, never fails spurious; acceptable.
- **EOF / empty edge cases.** Update on a file whose end-fence is the
  last line without trailing newline preserves the missing newline
  (verified `od`). Block-only file without trailing newline →
  `current`, byte-identical, no write. Empty between-fences →
  `updated` to canonical. A 0-byte AGENTS.md takes the append path and
  gains a leading blank line before the block — harmless cosmetic.
- **Wiring.** `ensureManagedBlock` runs as the final scaffold step,
  after item 10 (.gitignore), inside `scaffoldReport` — which
  `cmdInit` calls last (bee.js:696-702). The harness-skip early return
  (bee.js:431-436) precedes it: verified live with `--check` against
  this workspace — exit 0, "harness repo — scaffolding + managed block
  skipped", working tree clean. Block write alone sets `touched`
  (verified: update on an otherwise-complete repo emits the next-step
  commit line; an all-current run emits none).
- **Suites.** `node --test tests/bee-agents.test.mjs` 5/5 pass
  (test file verbatim vs the plan, diff clean); full suite
  `node --test tests/*.test.mjs` 329 pass / 0 fail;
  `scripts/structure-check.sh` 0 findings. Commit message matches the
  plan's step verbatim.

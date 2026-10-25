# Verify record: bee CLI stub — fix round 1 (review r1 findings)

**Role:** project-orchestrator
**Level:** task
**Date/time:** 2026-10-25 16:02
**Work item state after this record:** verified (fix round 1 complete)

Fixes applied per `.hivemind/records/2026-10-25-po-bee-cli-stub-task1-3-review-r1.md`:

1. **Blocking** — header restamp regex progressively ate the protocol
   header (run N eats blank line, N+1 eats protocol lines; verified by
   reviewer's 3-run experiment). Replaced with
   `/\*\*Generated:\*\*[^\n]*(?:\n(?!\s*$|\*\*|#)[^\n]*)*$/m` — joins
   wrapped stamp lines only when non-blank and not starting a
   structural marker (`**`, `#`). New test: 3 consecutive regens,
   whole-file idempotent modulo stamp, protocol line present.
2. **Should fix** — RESOLVED queue bullets surfaced as keeper asks;
   `queueBullets` now skips bullets matching `/\bRESOLVED\b/` (per
   ADR-008's "decision asks" intent). New test with fixture RESOLVED
   bullet.
3. **Note** — `absolutize` dropped backticks on rewrite; backticked
   tokens now stay backticked. Assertion updated to expect
   `` `/abs/path` ``.

| command | exit | note |
|---|---|---|
| `npm test` | 0 | 18 pass, 0 fail (16 + 2 new) |
| `node bin/bee.js report --check` (live) | 0 | derived RESOLVED bullets no longer in Needs-the-keeper; old-zone items preserved (role prunes, tool never drops) |
| `git status --porcelain .hivemind/keeper-report.md` | 0 | unchanged by --check (pre-existing concurrent hand edit untouched) |

**Verdict:** PASS
**Log:** inline above

# Verify record: P4 Task 5 — plan-header check contract + `bee verify`

**Role:** project-orchestrator
**Level:** phase
**Date/time:** 2026-11-01 14:19 +11:00
**Work item state after this record:** implemented → verified
**Plan:** `.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md` @ 4ec0bcc (Task 5)
**Branch:** task/4-verify-cli (worktree `/home/saphron/BeeHarness-task-verify-cli`)

| command | exit | note |
|---|---|---|
| node --check bin/bee.js | 0 | syntax |
| node --test tests/bee-verify.test.mjs | 0 | 29 pass — AXI battery (bare-call, unknown flag, `0 checks` empty state, fix: on FAIL asserted, --check writes nothing, entry emission, rN continuation) + header-contract probes + link-check battery (temp git repos; fenced/URL/anchor/absolute exclusions, --base, bad base, deleted doc) |
| node --test tests/*.test.mjs | 0 | 151 pass — full suite (plan's `suite:` line) |
| node bin/bee.js verify --plan .hivemind/plans/2026-11-01-po-p4-agent-first-cli.md --check | 0 | dogfood, partial as planned: `0 checks` + fix line (the plan's own checks block lands from main post-merge — dispatcher's step; `tests/fixtures/verify-plan.md` is the header-shape stand-in proving parse + run) · `links · 23 docs · PASS` |
| bash scripts/plan-checks.sh <copy of tests/fixtures/verify-plan.md> | 0 | gate core tolerates the new `checks:` block (targets/suite parsing unchanged) |
| node --test tests/plan-checks.test.mjs | 0 | gate-core tests green after the template change |

**Verdict:** PASS
**Log:** inline above; sweep below.

## Reference sweep (grep shown)

- `grep -rn "state-source" skills scripts tests bin docs` → 5 hits,
  all classified: `plan-template.md` (new contract block —
  functional), `scripts/plan-checks.sh` + `tests/plan-checks.test.mjs`
  (their own parse keywords/fixtures — functional),
  `skills/loop/bee-plan/SKILL.md:55` (field list now missing
  `checks` — deferred BY PLAN to Task 7, which owns that file's
  checks-contract pointer), `skills/loop/bee-plan-review/SKILL.md:24`
  (describes what the gate itself reads — accurate for its
  consumption; no edit needed).
- `grep -rn "bee verify" bin skills/loop/bee-verify/SKILL.md` →
  hits are the new command surface + the skill's P4-boundary note;
  the skill's fold toward the CLI is Task 7's step, untouched here.
- No stale references to the old template machine-block shape
  beyond the Task-7-deferred SKILL line above.

## Deviations (recorded)

1. **Dogfood checks block**: the plan's own header does NOT gain
   its `checks:` block in this task — the plan file is a main-checkout
   shared surface; per the dispatch brief the dispatcher adds the
   block from main post-merge. Fixture `tests/fixtures/verify-plan.md`
   (a copy of the header shape) + the parse/run tests stand in;
   the real-plan run shows `0 checks` + fix line until then.
2. **Link repair in a landed record**: `bee verify`'s link-check
   caught a pre-existing broken link target (`](_..)` in
   `…-task3-review-r1.md:6`). Repaired to the sibling
   absolute-path convention (separate commit; absolute targets are
   skipped by the repo-relative check and Paseo-renderable).
   In-envelope per the deviation line (repairs to the plan's own
   exit criteria); first real catch of the new check.
3. **Envelope decisions** (mine per brief): TOON second field shows
   cmd (truncated 60) or `files: …`; cmd runs via `sh -c` in the
   plan's git root, 600 s timeout; link-check always runs (skips
   with a note outside git; bad `--base` is exit 1 + fix); a
   passing run writes one entry per task checked (full run = one
   entry per task with checks; `--record` forces FAIL runs to
   record); 0-checks runs record nothing (`--record` says so).

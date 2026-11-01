# Verify r1 — P4 Task 0: interim design helper + design stamp

**Role:** project-orchestrator (loop; stage agent task-orc) ·
**Level:** phase (declared) · **Date:** 2026-11-01 · **Task branch:**
task/4-design-stamp @ 2ff7816

| command | exit | note |
|---|---|---|
| scripts/design.sh pick-up .hivemind/designs/2026-10-25-pp-p4-inbox-design.md --phase 4 --check | 0 | preview: hash ad77aa4; git porcelain unchanged — no write |
| scripts/design.sh pick-up .hivemind/designs/2026-10-25-pp-p4-inbox-design.md --phase 4 | 0 | block added at TEMPLATE position; `status: picked-up` · `phase: 4` · `hash: ad77aa4`; diff = 7 inserted lines, block only |
| scripts/design.sh status | 0 | 10 designs · 0 drift; P4 row: `picked-up · phase 4` |
| scripts/design.sh pick-up … --phase 4 (re-run) | 1 | refused — "status is 'picked-up' (must be live)" + fix line; idempotency proven |
| node --test tests/*.test.mjs | 0 | 34 pass · 0 fail (baseline 34/34 unchanged) |
| scripts/design.sh status --full (post-commit) | 0 | P4: `picked-up · phase 4 · hash ad77aa4 · merge -`, 0 drift |

- Script: bash + git only, plan-checks.sh/task.sh conventions;
  atomic tmp+rename; unknown flag → exit 1 + usage; definitive
  `0 designs` empty state; fix lines on every refusal; `--check`
  on both mutations; BEE_DESIGN_DIR env seam for Task 4 tests;
  shellcheck clean.
- Deviation (reported in pass-back): drift compares content
  excluding machine blocks (recorded commit vs now), not raw
  hash-vs-hash — a literal hash compare would flag the stamping
  commit itself forever, contradicting Task 4's "flags nothing on
  a clean clone" expectation. Fixture-verified both directions:
  prose addendum → drift; machine-block-only edit → no drift.

**Verdict:** PASS
**Log:** inline above (worktree task/4-design-stamp)

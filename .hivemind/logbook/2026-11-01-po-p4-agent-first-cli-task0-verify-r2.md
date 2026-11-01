# Verify r2 — P4 Task 0: fix round after review r1

**Role:** project-orchestrator (loop) · **Level:** phase (declared) ·
**Date:** 2026-11-01 · **Task branch:** task/4-design-stamp (fix round)

Review r1 (`.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task0-review-r1.md`)
verdict: fix first — 0 blocking, 2 should-fix. Both fixed this round;
re-review WAIVED per the near-verbatim rule (bee-loop step 5): each
fix is the reviewer's own suggested change applied as suggested, and
this record replicates the reviewer's probe below.

## Fix 1 (review SF1): mktemp-0600 mode side effect

`scripts/design.sh` stamp_doc: after mktemp, `chmod --reference="$f"
"$tmp"` preserves the target's mode (mktemp creates 0600). The
already-stamped P4 design doc was restored to 664 by hand (its mode
drift was cosmetic; git tracks no such change).

Probe replicated (scratch git repo, mode-664 seed docs):
`pick-up … --phase 9` → stamped doc stays `-rw-rw-r--`
(before fix: `-rw-------`, per review r1's evidence).

| command | exit | note |
|---|---|---|
| scratch pick-up + `ls -la` | 0 | mode 664 preserved through stamp |
| `bash scripts/design.sh status` (worktree) | 0 | 10 designs · P4 `picked-up · phase 4 · hash ad77aa4`, 0 drift |
| re-run pick-up on P4 doc | 1 | refused: status 'picked-up' (must be live) — idempotency holds post-fix |
| `node --test tests/*.test.mjs` | 0 | 34 pass, 0 fail |
| `bash -n scripts/design.sh` + shellcheck | 0 | clean |

## Fix 2 (review SF2): missing sweep grep in verify r1

Standing-rule sweep, run now and shown (was absent from r1's entry):

    $ grep -rn "design\.sh" skills roles docs scripts bin AGENTS.md README.md
    scripts/design.sh:2:# design.sh — ADR-016 design-doc lifecycle helper…
    (only self-hits — no stale references)

## Re-review waiver

Waived: both fixes are the reviewer's suggested changes applied
near-verbatim; probes replicated above (mode preserved; sweep clean).
No blocking findings existed. Waiver recorded in the plan's task notes
at checkbox-flip.

**Verdict:** PASS (fix round complete)

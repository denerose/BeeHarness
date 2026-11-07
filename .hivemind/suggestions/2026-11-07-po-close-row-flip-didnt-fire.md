# Suggestion — phase close mechanical tail didn't flip the row at P8

**Date:** 2026-11-07
**Project:** BeeHarness
**Role:** project-orchestrator — any role when the keeper asks
**Scope:** harness (bee phase close)

## What happened

Task 2 built the mechanical close tail into `bee phase close`: row flip, design stamps, flag split — the output should show `2 · row` and `2 · designs` lines after the merge step. P8's close output showed the standard 6 steps with no row-flip or design-stamp lines. I flipped the row and stamped the designs by hand afterward (the exact hand-labor T2 was built to eliminate). The output's `next:` line also said `bee phase list shows what remains` rather than the expected `next: commit the phase-row flip`.

Possible causes: the row scan didn't find the P8 row (scans `.hivemind/phases/*.md` for a row starting `| P8 |` — the file is `BeeHarness.md`, first match by sorted filename; TEMPLATE.md sorts after, so it should match); or the row-flip block fires only under conditions the close run didn't meet. The design stamps definitely didn't fire — the three P8-row designs were unstamped until my manual pass.

## Suggestion

Check `bee phase close 8 --check` against the current tree (post-my-manual-flip, the row is now done — you'd need to flip it back to test). If the row scan works but didn't fire at the real close, look for a condition guard that silently skipped it. The design-stamp path (spawning `scripts/design.sh implement`) may have errored silently — the refusal lines are informational, but no refusal note appeared either. This may be a T2 bug that P8's close is the first real-world test of.

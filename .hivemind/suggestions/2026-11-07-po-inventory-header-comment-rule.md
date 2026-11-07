# Suggestion — decisions-inventory header rejected bare key:value lines twice across phases

**Date:** 2026-11-07
**Project:** BeeHarness
**Role:** project-orchestrator — any role when the keeper asks
**Scope:** harness (bee-loop close step)

## What happened

P8's close hit the same decisions-inventory format error P5's close hindsight already documented: `bee phase inventory` rejects bare `phase:`/`plan:`/`count:` header lines — only `#`-prefixed comment lines pass the parser. I burned two iterations converting the header before the inventory minted. The close checklist in bee-loop (landed this phase as Task 9) names the format ("`#`-comment header lines only") but I assembled the file from a template that still used bare key:value headers — the old shape from P4's precedent file.

## Suggestion

bee-loop's close step (step 8) gains one clause after the format spec: "the header block uses `#` comments for every metadata line — bare key:value lines fail the parser." Alternatively, `bee phase inventory` could accept bare metadata lines as header (skip them) instead of rejecting — a two-line parser change that closes the class at the tool level.

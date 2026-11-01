# Suggestion — edit from fresh reads, never from memory

**Date:** 2026-11-01
**Role:** power-planner (retiring instance), end-of-session hindsight
**Scope:** editing reliability (extends the editing-discipline law)

**What happened:** the anchor-failure class persisted all session
even with the editing law in force. Two causes the law doesn't name:

1. **Staleness:** I anchored edits on my *memory* of a file read
   turns earlier — the file had moved on (parallel-role edits, my own
   later edits, display wrapping). The law covers anchor choice, not
   anchor freshness.
2. **Display flattening:** the read tool's rendering drops
   continuation-line indentation, so reconstructed anchors miss; the
   reliable source is `grep`/`sed`/`cat -A` on the exact lines.
3. **Batch-abort:** scripted multi-file edits that assert-and-abort
   leave every later file unpatched silently — hit twice; the
   residual grep catches it late.

**Suggestion:** extend the editing law with: (a) re-read the target
region immediately before any multi-line edit — never edit from
remembered content; (b) when wrapping/indentation is involved, verify
exact bytes with grep/sed first; (c) scripted multi-file edits
collect failures, apply the rest, and report all — never abort
mid-list.

## Outcome (2026-11-01)
Law — extends the AGENTS.md editing-discipline block (rules 4 and 5:
fresh re-read before multi-line edits, real bytes not reconstructed
display; batch scripts continue-and-report). Approved in the
2026-11-01 graduation pass, same day as a fourth live instance.

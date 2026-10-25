**Date:** 2026-10-25
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** Verification effort was miscalibrated at both ends
of the P2 loop. Front end: the plan-reviewer subagent improvised the
highest-value check of the whole loop — mechanically extracting the
plan's verbatim code blocks, assembling them in a sandbox, and running
the suite — which caught two blockers pre-dispatch (node v24 rejects
`node --test <dir>` positional args; a dedupe fixture whose normalized
text could never match). It was an accident of a good brief, not a
standard step. Back end: the round-3 confirmation re-review approved a
fix that was the round-2 reviewer's own suggested regex, with the
verify record already replicating that reviewer's probe method — low
marginal value (~4 min + tokens); rounds 1–2, by contrast, each caught
real bugs and were clearly worth it.
**Suggestion:** Two act-on-able calibrations, same theme — size the
verification to the risk (ADR-004's principle, applied across the
loop):
1. Plan-reviewer gate: when the plan carries verbatim runnable code,
   extract-and-sandbox-run it as a standard External-reality step (add
   one line to bee-plan's gate text or the plan-reviewer skill).
2. bee-loop fix rounds: a post-fix confirmation pass may be waived
   when (a) the fix is the reviewer's own suggested change, applied
   verbatim, and (b) the fix-round verify record replicates the
   reviewer's probe method — record a one-line reason in the verify
   record. Blocking-tier findings always get a real re-review.

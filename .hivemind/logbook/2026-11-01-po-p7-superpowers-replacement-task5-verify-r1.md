# Verify r1 — P7 Task 5: loop-skill folds + determinism lines

**Role:** project-orchestrator (loop) · **Date:** 2026-11-01 · **Task
branch:** task/7-loop-folds @ b595b13 + 3794d80

- Implementation: worker dispatch — etiquette fold in bee-loop +
  bee-review; debug fold (reproduce-before-fix) in bee-loop +
  bee-verify (with the P4-boundary line verbatim per plan);
  Record-step script-owned-state rule + fix-round waiver rule in
  bee-loop; claim-vs-record blocking check before quality judgment
  in bee-review; plan-time determinism rule (rule 8) in bee-plan +
  machine-header + path-tag convention in the template; "currently
  undecided" rephrased durable in bee-review.
- Dispatch-docs verification (task step): pattern was INCOMPLETE —
  nothing referenced the dispatch-brief template or task.sh; gaps
  filled in task-orc.md + the template (3794d80). GLOSSARY
  "dispatch brief" gap reported → filled on task4's branch.
- Loop verify: 34/34 tests; targeted greps land every rule line;
  ephemeral line gone (quoted-example class remains, named in plan);
  worker's added lines carry zero ADR/designs/plans cites.
- Returned plan conflict (resolved by loop): machine-header flat
  paths → folderized from main (committed post-task0).
- Verdict: **PASS**.

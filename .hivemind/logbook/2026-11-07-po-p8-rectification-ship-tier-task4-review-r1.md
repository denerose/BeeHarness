# Review: P8 Task 4 — init settings prune (D6, item 28)

**Role:** project-orchestrator (dispatching loop)
**Reviewer:** bee-review, cold-dispatched
**Plan section:** `.hivemind/plans/2026-11-07-po-p8-rectification-ship-tier.md` Task 4 + D6
**Verify record:** `.hivemind/logbook/2026-11-07-po-p8-rectification-ship-tier-task4-verify-r1.md` (PASS, plan @ d3e191e)
**Diff reviewed:** `git diff d3e191e..HEAD` (748c524 + c13aaea) — bin/bee.js, tests/bee-init.test.mjs, tests/bee.test.mjs, deleted suggestion file

## Verdict

**Approve** — the implementation matches D6's intent on every judgment axis probed; no blocking or should-fix findings.

## Blocking

None.

## Should fix

None.

## Notes

- **Claim-vs-record (first check) passed.** No Task-4 boxes are checked on the branch — consistent with convention: boxes tick at wave-done on the phase spine (T3/T7 all `[x]` first at d3e191e). Verify r1 exists, verdict PASS, anchors the plan @ d3e191e, checks-run: 1 matching the task-4 contract. Nothing claims ahead of its evidence.
- **D6 semantics verified by hand-probe** (beyond the pinned tests): `--check` + hit + dead → exit 0, `would prune:` note, file byte-unchanged; `--check` + miss + dead → exit 1 stays the registration verdict, note on stdout, file unchanged; write hit-path preserves other keys (`theme`, nested objects), drops exactly the dead, single write (no `.tmp-` residue), note names all dead paths; non-string entries (number, object, null) pass through untouched; `skills` absent → no note, no crash. Prune note never changes an exit code in any probed path (bin/bee.js:726-757).
- **Consequential fixture fix verified genuine.** The old `tests/bee.test.mjs:41` fixture `skills: ['~/other/skills']` resolves to a nonexistent path on this machine (probed: dropped + `pruned 1 dead` note under new code), so the old assertion would fail — it implicitly encoded dead-entry-survives semantics. The new fixture creates a live tmp dir, and the test's intent survives intact: other keys (`theme`) preserved, other entries preserved, new entry appended in order. Probing the old fixture against new code confirmed the implementer's claim.
- **D7 disposition correct.** The deleted suggestion file carried its Outcome stamp before deletion (present at d3e191e), deleted in the task commit — stamp + delete as the item landed, Task-1 precedent cited in the commit body. Commit message matches the plan's line verbatim; `Role: task-orc` trailers present on both commits.
- `tests/bee.test.mjs:41-49` — coverage observation, no action demanded: the swap leaves no test where a pre-existing `~/`-form entry survives a WRITE run byte-for-byte (the old fixture was the only one). `already registered exits 0 (tilde entry)` still covers tilde recognition, and live entries copy verbatim regardless of form (`[...live, …]`, bin/bee.js:754), so the code path is identical — trivia, not a gap.
- `bin/bee.js:751-755` — the hit-path prune write normalizes settings formatting (2-space JSON + trailing newline), so a differently-formatted user file is reformatted when a prune occurs. Matches the miss path's long-standing behavior and the plan's "write the pruned settings"; awareness only.

**Evidence:** `node --test tests/bee-init.test.mjs tests/bee.test.mjs` → 36 pass; full suite `node --test tests/*.test.mjs` → 381 pass, 0 fail (worktree `/home/saphron/BeeHarness-task-init-prune`, branch `task/8-init-prune` @ c13aaea).

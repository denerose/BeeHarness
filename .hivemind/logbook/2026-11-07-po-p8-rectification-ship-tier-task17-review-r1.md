# Review: P8 Task 17 — template glossary seed (item 4, D10)

**Role:** task-orc (dispatching loop role; cold-dispatched reviewer)
**Reviewer:** bee-review, cold dispatch, worktree task/8-glossary-seed @ 31ee6fb
**Plan section:** `.hivemind/plans/2026-11-07-po-p8-rectification-ship-tier.md` Task 17 (lines 815–864)
**Verify record:** `.hivemind/logbook/2026-11-07-po-p8-rectification-ship-tier-task17-verify-r1.md` (PASS, on-branch)

## Verdict

Approve — all five judgment areas verified with reproduced evidence; no blocking, no should-fix; two notes.

## Claim vs record

Task 17's plan boxes are unchecked (state-source: checkboxes), so no checked box lacks its record. The `verified` state is backed: verify r1 exists on the task branch (commit 31ee6fb), header-only shape matches the sibling task-11 record, and `checks-run: 1` matches the plan's `checks:` contract entry for task-17 (plan lines 109–112, one command: `node --test tests/bee-init.test.mjs`). Not ahead of evidence.

## Evidence reproduced

- **21 term lines byte-exact vs the plan block.** Programmatic diff of the plan's fenced block (plan lines 824–844) against the constant payload at `bin/bee.js:3990–4010`: all 21 lines identical; the only split-diff artifact is the literal's trailing newline. Shape check passes: every line splits into exactly 3 non-empty ` :: ` parts, `see: -` on all 21, no `ADR-…` anchors (D10's self-contained rule).
- **Survives first `bee glossary add` (two-glossaries rule).** Reproduced in `/tmp` with explicit `--store`/`--view`: seeded a store byte-identical to what scaffold step 6 writes, ran `bee glossary add "local term" …` — the 21 seeded lines and the header survive byte-exact (diff clean), the new term appends at the end (store keeps insertion order, `renderGlossaryStore` at `bin/bee.js:4122` re-emits in parse order), the view regenerates alphabetically sorted. The real `.hivemind` was never touched.
- **Step-6 exists-guard claim.** `step()` at `bin/bee.js:469` returns `exists:` without writing when the path is present; step 6 (lines 557–560) passes `fs.existsSync(…glossary.toon)` as that guard, and the never-re-seeded test pins it (appends a line, re-runs init, asserts `exists:` in output plus byte-equality of the edited store).
- **Disclosed accident (workspace glossary write, restored).** `git diff 980600e..HEAD --name-only` shows exactly three files: `bin/bee.js`, `tests/bee-init.test.mjs`, and the new verify record — no `.hivemind/glossary.toon`, no `skills/GLOSSARY.md`. `git status` clean in both the worktree and the main checkout. The restore held.
- **Tests.** `node --test tests/bee-init.test.mjs`: 16/16 pass (incl. the two new). Full suite `node --test tests/*.test.mjs`: 386/386 pass. `scripts/structure-check.sh <root>`: 0 findings. The new tests match the plan's literal asks — ≥ 21 term lines, `bee-loop` and `keeper` lines verbatim (newline-terminated assertions, so no substring false-positives), never-re-seeded — and follow the file's conventions (`tmp()`, `run()`, explicit `--settings`/`--machine`/`--repo`, no real-store contact).
- The plan's `path=bin/template-glossary-seed.toon` label was correctly treated as a sandbox label only: the block is inlined as `TEMPLATE_GLOSSARY_SEED` (`bin/bee.js:3989`), no stray file in `bin/`.

## Blocking

None.

## Should fix

None.

## Notes

- The "seed survives first add byte-exact" property is not pinned by an automated test — the implementer verified it by smoke (I reproduced it), but nothing in `tests/bee-init.test.mjs` would catch a future seed edit whose gist contains ` :: ` (init would write it fine; `readGlossaryStore` at `bin/bee.js:4095` would then reject the whole store on the first add, demanding a hand-fix). A cheap pinned test — seed, add, assert the 21 lines unchanged — would freeze it. No action demanded.
- The green-fields test asserts `>= 21` (the plan's literal wording): it fails if a term is dropped but passes if the set ever grows past 21. The two verbatim-line assertions partially compensate. No action demanded.

# Review: P8 Task 15 — reorg sweep, session/ → thinking/ (item 1, D3, D11)

**Role:** task-orc (dispatching role; reviewer cold-dispatched)
**Reviewer:** bee-review stage agent, cold dispatch, 600s budget
**Plan section:** [Task 15](../plans/2026-11-07-po-p8-rectification-ship-tier.md)
**Verify record:** [task15-verify-r1](2026-11-07-po-p8-rectification-ship-tier-task15-verify-r1.md) (PASS, plan @ 402d5a5, checks-run: 1)
**Diff reviewed:** `git diff 402d5a5..HEAD` on `task/8-reorg-sweep` (1077bb9 + 93d1b79) — 7 skill renames + 3 asset renames (`skills/session` → `skills/thinking`), `kit:` retags ×7, reference updates in `docs/guidance/how-to-be-a-bee.md` + `skills/GLOSSARY.md`, verify record

## Verdict

**Fix first** — the rename itself is flawless (pure git-mv at 99–100% similarity, all seven skills, every kit retagged, zero `skills/session` references anywhere the plan swept); but the GLOSSARY fix landed in the script-owned rendered view while the store it regenerates from still says `skills/session/` — the edit self-reverts on the next store write.

## Blocking

- `.hivemind/glossary.toon:35` — the `handoff` entry's gist still reads `skills/session/` while the tree has no such folder. Task 15 updated the rendered view (`skills/GLOSSARY.md:47`) by hand, but that view carries the script-owned marker (`skills/GLOSSARY.md:1`: "bee glossary regenerates this file on every store write; hand edits are overwritten"), and `writeGlossary` (bin/bee.js:4151, "Store write + concurrent view regeneration") rewrites the view from the store on every write — so the next `bee glossary add` silently reverts `skills/GLOSSARY.md` to the stale store text, reintroducing a `skills/session` reference into `skills/` after this task's sweep guarantees zero. The store is the only non-history live hit repo-wide (`grep -rn 'skills/session' . --exclude-dir=.git --exclude-dir=node_modules` → `.hivemind/glossary.toon` alone, plus designs/logbook history the plan leaves as written); the plan's sweep list (AGENTS.md docs/ roles/ skills/ bin/ tests/ scripts/) never enumerated the store behind one of its own targets. Suggested fix: hand-fix the store line — `skills/session/` → `skills/thinking/` in `.hivemind/glossary.toon:35` — exactly the procedure the tool's own duplicate error sanctions (bin/bee.js:4266, `glossaryAdd`: "fix: hand-fix the store line if the gist must change (there is no edit path)"). One line; store and view then agree and the regen is stable.

## Should fix

None.

## Notes

- Rename mechanics verified pure: `git diff 402d5a5..HEAD -M --summary` shows 7 skill renames at 99% similarity (each differing by exactly the one `kit:` line) + 3 asset renames at 100%; the rest of the diff is the two reference files and the verify record. Spine merge stays clean.
- All seven skills present in `skills/thinking/` (argue, brainstorm, handoff, hindsight, pickup-handoff, project-update, relay); `test -d skills/thinking -a ! -e skills/session` → exit 0; all 7 `kit:` fields read `thinking`; zero `kit: session` anywhere.
- Pointer depths correct everywhere: all 15 SKILL.md GLOSSARY pointers read `../../GLOSSARY.md` and every one resolves (`test -f` per file) — moved and unmoved alike.
- Reference sweep reproduced: `grep -rn 'skills/session' AGENTS.md docs/ roles/ skills/ bin/ tests/ scripts/` → zero hits. `scripts/structure.map` verified kit-generic (no folder names) — correctly untouched. The GLOSSARY edit was correctly the handoff entry; the `bee- namespace` entry (`skills/GLOSSARY.md:15`) names no folders and stays accurate, as the plan exempted. Contrast: Task 13 landed its term in store AND view via `bee glossary add` — the store is where this task's edit had to land too.
- Suite + structure reproduced: `node --test tests/*.test.mjs` → 386 tests, 386 pass, 0 fail; `bash scripts/structure-check.sh "$PWD"` → 0 findings, exit 0.
- Settings verified folder-agnostic: `~/.pi/agent/settings.json` registers `~/BeeHarness/skills` — the repo skills root, not a kit subfolder — so the rename needs no settings change.
- Task 16 forward-check: the skills/ half (`! grep -rq --include='SKILL.md' 'ADR-[0-9]' skills/`) passes against the new tree. The roles/ half does not — correctly so, since Task 16 runs after this one: the current 10 role-file ADR hits (retired-pp 1, power-planner 3, task-orc 4, project-orchestrator 2) match Task 16's census prediction exactly. The dispatch brief's "Task 16's checks still pass" holds only for the skills/ half; the roles/ half cannot pass until Task 16 lands.
- Claim-vs-record (first check) passed: verify r1 exists (PASS, checks-run: 1); the ledger reads `task-15 · draft · 0/7 steps` — state behind evidence, not ahead; unticked boxes ride the loop's wave-done state moves, the phase's established practice (same as T13's review recorded). The verify record is header-only — the same shape as the task-14 and task-17 records.

**Evidence:** commands as cited, run live in the worktree at 93d1b79; diff archaeology (`git diff -M --summary`, `git show 402d5a5:…`, commit bodies 1077bb9/93d1b79); the glossary write path in `bin/bee.js` (`writeGlossary`:4151, `glossaryAdd` duplicate branch:4260-4268) read at the cited lines.

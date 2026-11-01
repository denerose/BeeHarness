# Verify record: P4 Task 3 — `bee park` (parking lot → script-owned store)

**Role:** project-orchestrator (task-orc dispatch, verify round r1)
**Level:** phase
**Date/time:** 2026-11-01 13:50 +11:00
**Work item state after this record:** implemented → verified (on FAIL: unchanged)

Scope per dispatch: CODE half only — `bee park` family + `bee park
migrate <md> [--check]`, store format, AXI battery, AGENTS/GLOSSARY
reference updates. The LIVE migration (real
`.hivemind/memory/parking-lot.md` → store + pointer stub) is the
dispatcher's, from the main checkout, after this branch merges.

| command | exit | note |
|---|---|---|
| `node --test tests/bee-park.test.mjs` | 0 | 31 pass, 0 fail — AXI battery (bare-call content, empty state, unknown flag/subcommand, `--check` add+resolve, store-format contract, id-series continuation per origin, aggregate header incl. `oldest ?` for unknown ages, truncation + `--full`, idempotent resolve, newline guard, self-correcting errors, round-trip unknown fields, law line in usage) + migration battery vs fixture copy of the repo's lot (read at test time, never hardcoded): every id exactly once, states preserved, the three stale duplicates (PL-004, PL-PO-001, PL-PP-002) resolved-wins + `superseded stale parked duplicate` in `how`, stub replacement, `--check` writes nothing, re-run guard, malformed-entry refusal |
| `node --test tests/*.test.mjs` | 0 | 108 pass, 0 fail (full suite; inbox tests green after the shared store-core refactor) |
| `node bin/bee.js park migrate <tmp>/lot.md --store <tmp>/p.toon` (fixture copy) | 0 | `19 items · 16 parked · 6 resolved · 3 id collisions (resolved wins): PL-PO-001, PL-PP-002, PL-004`; md → pointer stub; hard-wrap joins keep `2026-11-01` / `worktree-scoped` whole |
| `node bin/bee.js park list --store <tmp>/p.toon` | 0 | `13 parked · oldest ?` — migrated open items, correct unknown ages |
| `node bin/bee.js park list` (default store, read-only) | 0 | `0 parked` definitive empty state; live store absent (by design — dispatcher births it) |
| reference sweep (standing rule), grep shown below | 0 | all hits classified |

Reference sweep (task's surface — `parking-lot` references):

```
$ grep -rn "parking-lot\.md" AGENTS.md README.md docs skills bin scripts roles tests
skills/session/bee-brainstorm/SKILL.md:49:   `.hivemind/memory/parking-lot.md` with the keeper. You propose
bin/bee.js:1204:// .hivemind/memory/parking-lot.md):
tests/bee-park.test.mjs:19:  new URL('../.hivemind/memory/parking-lot.md', import.meta.url), 'utf8');
tests/bee-park.test.mjs:35:  const md = path.join(dir, 'parking-lot.md');
```

- AGENTS.md + skills/GLOSSARY.md: zero hits — updated this task to
  point at `.hivemind/memory/parking-lot.toon` + `bee park`
  (resolve law unchanged in meaning).
- `skills/session/bee-brainstorm/SKILL.md:49` — OUT of Task 3's
  named file scope; still functional after live migration (the md
  becomes the pointer stub). Phase-end sweep (plan Task 10) owns it.
- `bin/bee.js:1204` — functional: comment documenting the migrate
  executor's input format.
- `tests/bee-park.test.mjs:19,35` — functional: fixture reads the
  repo's md at test time (stays current by design).
- `grep -rn "parking-lot" skills/ | grep -v GLOSSARY` remaining hits
  (bee-handoff ×2, bee-hindsight ×1) use the generic term, no path.

Sane-output check: migrated counts match the fixture (19 distinct
ids, 16 parked-section entries of which 3 collide → 13 open in list,
6 resolved); collision set equals the plan's named three; ages `?`
honest for unknown `opened` (no fabricated dates). Anomaly check on
first battery run surfaced 4 test-expectation bugs (regex/ids, code
output correct) — fixed in-test, re-run green; no code fix rounds.

**Verdict:** PASS
**Log:** inline above; full suite log at `/tmp/verify-suite.log` (session)

Deviations (reported, with reasons):
1. Store `opened: -` + derived age `?` for migrated items — the md
   lot carries no open dates; fabricating the migration timestamp as
   `opened` would lie about age. Header shows `oldest ?` until the
   first live `add`.
2. Bare `PL-NNN` = origin `bee` id series (early unroleed ids
   PL-001..004 continue as the bee series; other origins mint
   `PL-<ROLE>-NNN` per series) — the reading that satisfies "continue
   the existing numbering" for every series.
3. `how` field is conditional (present only when set) — mirrors
   inbox's `note` deviation, sanctioned by the dispatch brief.
4. Store I/O refactored into a shared core (`readToonStore`/
   `renderToonStore`/`writeStore`; inbox delegates) — pattern-book
   reuse instead of duplication; inbox tests pin the refactor.
5. Store `.hivemind/memory/parking-lot.toon` is NOT committed on
   this branch — the store births from the dispatcher's live
   migration after merge (scope split; same shape as Task 1/2's
   store birth).

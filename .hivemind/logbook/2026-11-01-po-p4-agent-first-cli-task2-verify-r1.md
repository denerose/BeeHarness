# Verify record: P4 Task 2 — migration + rendered views (code half)

**Role:** project-orchestrator
**Level:** phase (plan header) — task's own finished-test: render/report battery green; full suite green
**Date/time:** 2026-11-01 13:12 +11:00
**Work item state after this record:** implemented → verified (code half; the live migration is the dispatcher's half)

| command | exit | note |
|---|---|---|
| node --test tests/bee-render.test.mjs | 0 | 16 tests passed, 0 failed |
| node --test tests/*.test.mjs | 0 | 75 passed, 0 failed (59 baseline + 16 new) |
| bash /tmp/task2-driver.sh (throwaway fixture driver, since removed) | 0 | migration adds 2 → re-run 0 (store byte-identical); render twice → empty diff; escalation line outside region survives; `bee report --check` carries both migrated asks, absolute refs |

Task's finished-test items: migration idempotency ✓ (driver pass 2 adds nothing; regression test asserts store byte-identical), render-twice ✓ (empty diff shown by driver; test asserts byte equality), report --check carries every migrated ask ✓, full suite ✓. RESOLVED-bullet skip exercised in the driver test but owned by the live half.

Reference sweep (standing rule — grep shown):

```
grep -rn "Awaiting keeper" bin tests AGENTS.md README.md docs
→ bin/bee.js 5 hits: section detection, rendered heading, usage, comment — all functional
→ tests 8 hits: fixtures + assertions — functional
→ AGENTS.md 1 hit: the new durable status-surface line — intended (Task 2 scope)
grep -rn "inbox.toon" bin tests AGENTS.md README.md docs   (tests excluded from display)
→ bin/bee.js 5 hits: default paths, Source label, usage, heading — functional
→ AGENTS.md 1 hit: the same status-surface line
grep -rn "FRESH_HEADER\b" bin | grep -v PREFIX → 0 hits (rename left no stale refs)
grep -n "queueBullets" bin/bee.js → present: fallback intact
git status (worktree) → bin/bee.js, tests/bee-render.test.mjs, AGENTS.md only
git status (main checkout) → clean — live surfaces untouched by this dispatch
```

Battery highlights (asserted): region isolation byte-exact outside `<!-- inbox:render -->` under a concurrent edit + store growth; `--check` writes nothing (render and report); empty store → definitive `0 open` region; unknown flag/argument → exit 1 + usage; unbalanced markers → refuse + hand-fix instruction; derivation ordering oldest-first with `[origin]` tags, IN ids, absolute refs; malformed store → structured error, nothing written; store-vs-old-zone ask merges once (no duplicate).

**Deviations (all in-envelope, reasons):**
1. **Scope split honored** — live migration adds, live status render, live keeper-report regen are the dispatcher's half (in-envelope ruling); this branch ships the commands + fixture-based migration driver test only.
2. **normItem strips leading `[role]` tag + date** before merge comparison — without it every migrated store ask would duplicate its old status-bullet line in *Needs the keeper* after the derivation switch (merge semantics preserved, now across the switch).
3. **Fallback = store absent OR no open keeper items** (broader than "absent/empty": covers the mid-migration window while keeper asks still live only in status bullets). `queueBullets` additionally skips HTML-comment lines so render markers never glue to bullets when the fallback parses a rendered region.
4. **`Source:` line parameterized** — merge-regen/fresh headers cite `.hivemind/inbox.toon` when store-derived, `.hivemind/status.md` on fallback; the zone-rules protocol prose is untouched (law text, not this task's).
5. **Render view details** (envelope): addressee groups alphabetical, items oldest-first within groups; full text (no truncation — document view); aggregate `<n> open · oldest <age>` counts not-done items (Task 1 deviation wording honored).
6. **Report line format** `[<origin>] <opened-date> — <text> (<IN-id> · <abs ref>)` — id for `bee inbox done` traceability; ref always absolute (report protocol). Note for the live half: with `--origin status` migration adds the line reads `[status] … — [PP] <bullet>` (double tag: migration provenance + in-bullet attribution — faithful to store data; per-bullet `--origin <role>` is an alternative the dispatcher may prefer).
7. **AGENTS.md edited in the task worktree** per the dispatch ruling (the standing rule routes shared-surface edits through the main checkout; the dispatcher owns the merge).

**Verdict:** PASS
**Log:** inline above

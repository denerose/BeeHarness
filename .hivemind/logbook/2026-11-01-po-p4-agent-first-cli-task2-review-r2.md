# Review: P4 Task 2 — migration + rendered views, round 2 (re-review of fix commit f01209c)

**Role:** project-orchestrator (dispatching loop role per GLOSSARY: Role trailer)
**Reviewer:** reviewer (cold dispatch; did not write this work)
**Plan section:** `.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md` — Task 2, code half only (dispatcher split)
**Verify record:** `.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task2-verify-r2.md` (branch commit f01209c)
**Scope:** fix commit f01209c (`bin/bee.js` + `tests/bee-render.test.mjs`) on `task/4-migrate-views`, judged against the r1 findings it answers

## Verdict

Approve — the r1 blocking finding is resolved and pinned by a regression test that fails under the old trigger; the should-fix is resolved (refusal verified, status untouched); the fix introduces no blocking problem. One should-fix (a stale comment the fix left behind) for the loop's judgment.

Claim-vs-record check (ran first): clean. All six Task 2 checkboxes still unchecked (correct — the loop's to flip); verify r2 present on the branch and backed: both recorded runs reproduced here (`node --test tests/bee-render.test.mjs` → 18 pass; `node --test tests/*.test.mjs` → 77 pass, 0 fail). Worktree clean before and after this review; only this report was written.

## Blocking

(none — the r1 blocking finding is resolved: `bin/bee.js:386` `fromStore = fs.existsSync(storePath)` makes the store the source of truth whenever the file exists; bullet fallback fires only when it is absent. The r1 leak scenario — store present, keeper queue drained, other addressees open, rendered region in status — now derives an empty keeper list; the regression test at `tests/bee-render.test.mjs:330` reproduces that exact shape through a real render run and asserts both leak signatures absent. Traced against the old trigger: `queueBullets` parses the rendered region's view bullets (`## Awaiting keeper (rendered from inbox.toon)` matches its section test; view bullets are not HTML-comment lines), so that test fails pre-fix — it genuinely pins the fix, not just the suite count.)

## Should fix

- `bin/bee.js:369-371` — the derivation comment above `storePath` still describes the trigger the fix replaced: "the inbox store when it carries open keeper items; status bullets otherwise (transition safety until the queues are migrated into the store)". That is the r1-blocking trigger, now contradicting both the code at `:386` and the fix's own comment at `:381-385`; a future maintainer reading top-down could "restore" the trigger from the comment. Suggested fix: delete the three-line block (the comment at `:381-385` already states the semantics), or rewrite as "the inbox store whenever it exists; status bullets only when the store is absent (pre-migration)".

## Notes

- TOCTOU adjudication (dispatcher question 3): `readInbox` at `:375` then `existsSync` at `:386` leaves a microsecond window — a store created between them derives empty-from-store with `Source: inbox.toon`; a store deleted in the window falls back to bullets. Both outcomes are defensible (store-present ⇒ store is truth; store-gone ⇒ bullets are the only source), the CLI is single-writer with atomic writes, and the exists-then-read shape pre-exists at `:357-359` (`reportPath`). No action.
- Fallback-on-absent path unchanged (dispatcher question 3): store absent → `readInbox` returns `{items: []}` on ENOENT → `existsSync` false → bullet parse, identical to pre-fix behavior; the pre-migration window behaves as before (`tests/bee-render.test.mjs:288` still green). Empty-store edge (file present, zero items) now derives empty with store as source — the intended steady-state semantics. Migration-driver test (`:415`) unaffected: its store is non-empty, both triggers agree.
- The two regression tests replicate the r1 probes faithfully (dispatcher question 4): the blocking probe's shape is exact (drained keeper queue — one `done` keeper item plus one open `po` item; region produced by a real `inbox render` run, not a pasted fixture), and the po text deliberately avoids r1's "frobnicator" wording because the report fixture's zone legitimately contains that word — "gimbal" keeps the absence assertions from passing vacuously. The marker probe edits the store text directly; byte-equivalent to what `bee inbox add` produces (add rejects newlines only), so faithful. The flipped transition test (`:306`) asserts the corrected semantics exactly: bullets not parsed, po item absent, `Source` = `inbox.toon`.
- The marker-refusal test (`tests/bee-render.test.mjs:351`) does not assert the status file is untouched on refusal; probe confirms it is (exit 1, no write — the guard at `bin/bee.js:877-880` returns before `renderIntoStatus`). If the guard ever drifts below the write, this test won't notice; one `assert.equal` on unchanged status bytes (mirroring the nothing-written assertion in the malformed-store test at `tests/bee-render.test.mjs:365`) would pin it. Optional.
- Guard scope is right: `inboxRenderView` emits only ids, addressees, ages, text, refs — none legitimately contain a marker, so no false refusals; done items never reach the view, so markers in their text cannot break isolation; `--check` reports the refusal too (guard precedes the check branch). `bee inbox add` still accepts marker text by design — refusal at render with a hand-fix line is the r1-suggested placement.
- r1 notes 1-5 (duplicate regions, normItem strips, suggestions-migration coverage, AGENTS.md transient window, deviations) stand as recorded — the fix did not worsen any of them; not re-litigated.

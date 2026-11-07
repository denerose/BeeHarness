# Review: P6 Task 6 — AXI compliance pass

**Role:** project-orchestrator (stage reviewer, cold dispatch)
**Reviewer:** bee-review r1, workspace `/home/saphron/BeeHarness-task-axi` @ e66d78d
**Plan section:** `.hivemind/plans/2026-11-02-po-p6-productization.md` — Task 6
**Verify record:** `.hivemind/logbook/2026-11-02-po-p6-productization-task6-verify-r1.md` (PASS) · audit table: `.hivemind/logbook/2026-11-02-po-p6-productization-task6-audit.md`

## Verdict

FIX-FIRST — the audit is substantially honest and the fixes verified, but the verify task-move hint actively misleads on the exact path `--record` exists for (blocking), and three should-fix items close the gap between the audit's claims and reality.

## Claim vs record (first check)

Suites re-run by this reviewer, tmp `--store/--machine/--settings/--repo` paths everywhere; no live files or real `~/.bee` touched:

- Five-family check (init, machine, suggest, worktree, agents): **37/37 pass** — matches the audit headline.
- Full suite `node --test tests/*.test.mjs`: **348/348 pass** — matches (330 baseline + 18 new; 18 `+test(` blocks confirmed in the 21a39d6 diff).
- 12 test files in the diff match the audit's fix list exactly.
- Task 6 checkboxes remain unchecked in the plan (states move after review) — correct; tasks 1–5 checked boxes each have verify/review records behind them.
- Gap: the plan (Task 6, step 4) says "record the audit table + fix list in the verify entry body"; the verify record is header-only with `links: -` and the table lives in a sibling file it never references → Should fix #1 below.

## Blocking

- `bin/bee.js:3300-3305` — the verify task-move hint fires on FAIL runs that wrote entries. `--record`'s designed purpose is capturing FAIL rounds (`bin/bee.js:3249` — "not written (FAIL — pass --record to capture this round)"), so on exactly that path verify now ends with `next: bee task move <plan> <task-n> done --record <entry above>` while the entry it points at says `verdict: FAIL` (reproduced live: scoped FAIL + `--record` → exit 1, entry verdict FAIL, hint printed). `bee task move … done` does not check the entry's verdict — only that the path exists (`bin/bee.js:4463-4472`) — so following the hint marks a failed task done with FAIL evidence as its record, corrupting the loop's evidence contract the hint's own comment invokes ("the entry is the evidence bee task move done requires"). Suggested fix: gate the hint on the run not failing — `if (wrote > 0 && !anyFail)` — and add a test: scoped FAIL + `--record` writes the entry, exits 1, and asserts NO `next: bee task move` line (the FAIL fix line already carries the real next step).

## Should fix

- `.hivemind/logbook/2026-11-02-po-p6-productization-task6-verify-r1.md` — the plan's letter puts the audit table + fix list in the verify entry body ("the table IS the deliverable"), and the phase-exit criterion reads "AXI audit table recorded (task 6 verify entry)"; the record is a bare header with `links: -` while the table sits unlinked in `-task6-audit.md`. Suggested fix: append the table (or a fix-list summary plus a pointer) to the verify entry body and set `links:` to the audit record.
- `bin/bee.js:4864` (`bee phase list`) and `bin/bee.js:4621` (`bee guidance list`) — two populated READ surfaces carry trailing next-step pointer lines (`next: bee phase close <phase-id> --check`; `show one: bee guidance show <topic>`), contradicting the plan's own P9 split ("list/read outputs stay lean") that this task audited against. Both pre-date task 6 (phase list at b7383a7:4775, test-pinned at `tests/bee-phase.test.mjs:119`), so the audit table's "no populated list gained a hint" is technically true — but a careful auditor applying the pre-named split owed these a row (fix or explicit ruling) and the gap table has none; the headline "17 gaps · 0 escalated" thereby overstates completeness. Suggested fix: drop both populated-output pointer lines (the empty-state `fix:`/`add one:` lines stay — they are the P5 definitive empty state) and update the pinned assertions; or add explicit "ruled" rows to the audit recording why they stay.
- `bin/bee.js:3725-3727` (`bee logbook compact`) — the phase-close hint prints on real-mode runs that wrote nothing (all entries already compacted: `compacted.length === 0`, pass-2 loop empty), and the new test pins that behavior (`tests/bee-logbook.test.mjs`, "idempotent re-run (all already compacted) still names the close"). This contradicts audit row 11's claim "on real writes only", the audit's own idempotence ruling ("a no-op or preview is a read"), and sibling `stamp`'s guard (`bin/bee.js:3540` — `stamped.length + topped.length > 0`, whose test asserts the no-op run stays lean). Suggested fix: guard compact on `compacted.length > 0` (matching stamp) and flip the test's final assertion; or amend audit row 11 to record the divergence as a deliberate ruling.

## Notes

- Judgment call 1 — worktree hints on stderr: **upheld**. Task 5's spec made create's stdout the bare worktree path (machine contract; `wt=$(bee worktree create …)` would capture two lines otherwise); git chatter already rides stderr in this family; and merge's `phase close ${phaseN}` slice is safe because `worktreePhaseBranch` enforces `/^phase\/[0-9]+$/` before it (`bin/bee.js:5316-5323`). P9 names no stream; family-wide consistency is the right call.
- Judgment call 2 — empty-state "add one:" pointer lines: **upheld**. Verified live: pointers appear only on 0-count outputs (inbox/park/memory/glossary/guidance/phase/design-status); populated inbox, park, memory, glossary, task-show, and design-status outputs are lean. The two populated-read exceptions are the should-fix above.
- Judgment call 3 — logbook index 5-field line: **upheld**. The row is id + role/date/task/verdict; task+verdict are the P4 aggregates the index exists to project, and hiding them behind flags forces the round trip P4 exists to kill. One field past P2's cap under the strictest count, but the audit records the reasoning — a ruling, not a dodge.
- capture/suggest `help` reservation: `bee capture "help"` / `bee suggest "help"` are now un-fileable via the positional (argv cannot distinguish quoted "help"), but the P10 convention reserves `help` in every family, and a clean workaround exists — `bee inbox add keeper "help"` files the identical item (capture and local suggest are wrappers over `inboxAddItem`). Acceptable; optionally add one usage line in CAPTURE_USAGE/SUGGEST_USAGE naming the workaround.
- Hint wording verified: every new hint is one short line; init emits exactly one next line per write run (green-fields → commit hint; idempotent re-run and harness-skip → the `--check` hint; both probed, count = 1) and stays lean on `--check`; REPORT_USAGE/INIT_USAGE flag lists match the flag specs exactly; `help`/misuse/unknown-flag reachability now matches the other families, and top-level `bee help` lists all fifteen.
- Audit pre-fix claims spot-checked against b7383a7 and confirmed: report/init had no help branch and leaked raw parseArgs errors; capture/suggest treated `help` as data; all seventeen claimed fixes are present in the 21a39d6 diff and asserted by tests.

**Verdict: FIX-FIRST** — named findings: Blocking (verify hint on FAIL+`--record` runs) · Should fix (audit table missing from verify entry body; phase-list/guidance-list populated-output pointer lines absent from the audit; compact no-op hint contradicts its own audit row).

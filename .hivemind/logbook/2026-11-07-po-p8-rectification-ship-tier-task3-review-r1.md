# Review: P8 Task 3 — report-regen defect batch (item 24, check-then-apply per D12)

<!-- machine
role: project-orchestrator
date: 2026-11-07T18:05:00+11:00
verdict: fix-first
task: task-3
plan: .hivemind/plans/2026-11-07-po-p8-rectification-ship-tier.md @ fab7a0f
diff: fab7a0f..HEAD (6acd7ec + 4a0566f)
verify: .hivemind/logbook/2026-11-07-po-p8-rectification-ship-tier-task3-verify-r1.md
-->

**Role:** project-orchestrator (dispatching loop's role — dispatched reviewer)
**Reviewer:** cold-dispatched bee-review worker, fresh context
**Plan section:** [Task 3 + D12](/home/saphron/BeeHarness/.hivemind/plans/2026-11-07-po-p8-rectification-ship-tier.md) — worktree copy verified identical to main for Task 3
**Verify record:** [task3-verify-r1](/home/saphron/BeeHarness-task-report-regen/.hivemind/logbook/2026-11-07-po-p8-rectification-ship-tier-task3-verify-r1.md) — PASS, checks-run 1
**Scope reviewed:** `git diff fab7a0f..HEAD` (6acd7ec + 4a0566f) — `bin/bee.js`, `tests/bee-render.test.mjs`, `tests/bee-inbox.test.mjs`, verify record. Tree clean apart from a pre-existing untracked duplicate record (note below).

## Verdict

**Fix first** — no blocking findings; three should-fixes, all small and validated in a /tmp scratch (each proposed fix keeps every pin green). The implementer's escalation candidate is judged REAL and warrants a fix round — details below.

## Claim vs record (mechanical, ran first)

- Verify record exists (PASS, task-3, committed at 4a0566f); reproduced independently: `node --test tests/bee-render.test.mjs tests/bee-inbox.test.mjs` → 55/55; full suite → 369/369.
- No Task 3 boxes checked in the plan (main and worktree identical) — no state claims ahead of evidence; consistent with T1/T2 practice (loop ticks at Record).
- Diff scope matches the machine header's `files:` for task-3 exactly; commit subject matches the plan's named commit.
- D12 record: the commit body records pins-first and "(d) pinned green — already landed, no code change" — consistent with the diff (no change to the header/Source path).

## Blocking

None.

## Should fix

- **`bin/bee.js:904` — the escalation candidate is REAL: the broad em-dash tail strip silently drops distinct old-zone asks.** The rule `.replace(/\s+[—–]\s+\S.*$/, '')` strips from the FIRST mid-text dash, so any old-zone ask sharing a pre-dash prefix with a live store ask collapses to the same key and is dropped from *Needs the keeper*. Reproduced (temp fixture): old-zone `revisit the auth split — option C blocked upstream` was silently DROPPED when the store held `revisit the auth split — gate on the perf numbers first`. This repo's ask texts are em-dash-heavy (the live store's own IN-001 carries two), so the collision shape is plausible, not exotic. Mitigating context: sameAsk's pre-existing substring rule already carried a weaker false-drop class — this widens it to non-substring pairs. Suggested fix (validated in scratch): **drop the rule entirely** — every pin passes without it (55/55; the pinned 24a shapes lose their wrappers via the leading-date, paren, and `· ref:` rules, none needs the dash rule), so it buys nothing pinned and is the only new rule that can eat ask core text. Narrowing to wrapper-shaped tails (`— (IN-…|PL-…|ref:|/…)`) is the conservative variant; either is one line.

- **`bin/bee.js:895-910` — dedupe misses the shape this repo's live report actually accumulated.** An old-zone render-view line `IN-001 · 6s — <text> · ref: /abs` — the exact shape sitting in the live `/home/saphron/BeeHarness/.hivemind/keeper-report.md` Needs zone today (its line 6) — does NOT dedupe against the store-derived line: normItem reduces it to `in-001 · 6s` (the dash rule eats the core text starting at the id/age separator; and even without the dash rule, the `IN-001 · 6s — ` prefix blocks any match). Reproduced with the live line verbatim + the item open: the merged zone carries BOTH lines (2 hits) — the 24a duplicate persists for this shape. Masked on today's live data only because IN-001 is `done`. Suggested fix (validated in scratch: dedupes to 1 hit, 55/55 green): strip the leading render-view wrapper in normItem before the tail rules — `.replace(/^IN-\d{3}\s+·\s+\S+\s+—\s+/, '')`.

- **`bin/bee.js:836-845` — group headers inside multi-group regions still join ask text.** queueBullets closes the open bullet on fence lines and `## ` headings only; inside a region with more than one addressee group (the view's normal shape when >1 addressee has open items), a group header after a bullet JOINS it. Reproduced (temp fixture): derived ask reads `IN-001 · 5d — keeper ask one po (1 open · oldest 2d):`. The fix's own comment (bin/bee.js:836-837) states "the region's view lines (headers, counts) never join an ask" — false for every group header after the first; the pinned test used a single-group region so it passes while the general case leaks. Suggested fix: also close the open bullet on the group-header shape (`/^\S[^(]*\s\(\d+ open · oldest \S+\):$/`). Fallback-only path (store absent + stale region), hence not blocking.

## Notes

- **D12 discipline corroborated beyond the commit-body claim:** the pinned 24b shape was run against the parent commit's `bin/bee.js` (extracted to /tmp) — pre-fix it FAILS exactly as pinned (hand ask before the fence absorbs both headers: `[PP] hand ask, no wrapper 1 open · oldest 5d keeper (1 open · oldest 5d):`), so the (b) fix was genuinely needed; (d) is consistent with no-code-change (the diff touches nothing in the header path). The pins-first *sequence* itself is not independently verifiable — pins and fixes ride one commit — the commit body is the record, matching the T1 review's precedent for stamp mechanics.
- **Untracked duplicate verify-r2** (`.hivemind/logbook/…task3-verify-r2.md`, dated 15s after r1, otherwise identical) sits in the worktree. If swept into the branch it records a second verify round that did not happen. Suggested: delete it before merge; the Record step should not stage it.
- **Refresh wiring probed clean on every specified edge:** unbalanced region → stderr note, exit 0, file byte-unchanged (test-pinned); missing status file → note + exit 0; status present but no region → note, no write; store outside `.hivemind` → status derives to the store's own dir (probe confirmed); park refresh reads the SIBLING inbox store, never the park store (test-pinned); `--check` paths return before any refresh or mutation (probed); `--status` flags resolve absolute; every store path (`storePathOf`, `parkStorePathOf`, report's) resolves absolute before `derivedStatusPath` sees it, so the `/.hivemind/` marker always has its leading slash — no relative-path hole at any entry point.
- **Pre-existing, outside this diff, but the loop will meet it:** done asks persist in the Needs zone — the live zone still carries IN-001's line though the item is `done` (mergeNeeds never prunes old-zone lines lacking a derived match; queueBullets' RESOLVED filter doesn't apply to zone items). Next live `bee report` keeps the stale line; hand-clean or file as a future item.
- Fix validation method: the two normItem fixes were applied to a /tmp copy of `bin/bee.js` and run against the real test files (55/55) plus the live-shape probe — the worktree under review was never modified. All probe artifacts cleaned.

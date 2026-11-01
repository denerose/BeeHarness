# Review: P4 Task 1 — inbox store + `bee inbox` family + `bee capture`

**Role:** project-orchestrator
**Reviewer:** reviewer (cold dispatch; did not write this work)
**Plan section:** `.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md` § Task 1
**Verify record:** `.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task1-verify-r1.md`

## Verdict

**Fix first** — one should-fix (a `--note` value containing a newline corrupts the store); everything else the plan names is present, correct, and verified against its record.

Claim-vs-record (run first): clean. Plan Task 1 boxes unchecked on main (0 `- [x]` — the loop's to flip); the verify record rides the branch as evidence; its claims re-ran true here (24/24 `tests/bee-inbox.test.mjs`, 58/58 full suite, reference sweep 0 hits re-run, `.hivemind/inbox.toon` absent in the worktree); the task branch's two commits touch exactly the three briefed files (bin/bee.js, tests/bee-inbox.test.mjs, the record) with matching commit messages and role trailers.

## Blocking

None.

## Should fix

- `bin/bee.js:697` — `inboxDone` assigns `it.note = f.values.note` with no single-line guard. `bee inbox done IN-001 --note $'a\nb'` exits 0 and writes the note across two lines; the next read of the store fails (`bee inbox: cannot parse … line N is not a field — hand-fix the store, then retry`) — one documented flag makes the whole store unreadable until hand-fixed. The add path already guards this (`bin/bee.js:530-532`, `field values must be single-line`); done's note is the only write path left open. Suggested fix: in `inboxDone`, before assigning, reject `f.values.note` values containing `\n` with the same single-line error (exit 1), and add a regression test (done with a multi-line `--note` → exit 1, store byte-unchanged).

## Notes

- **Deviation 1 — real store not created.** Serves intent: the store format is contract-tested byte-exact against temp-dir stores, Task 2's migration is the plan's own first real add, and creating the real store here would land a fixture item in the live store from a task branch. Accept.
- **Deviation 2 — `note:` appended after `done:`.** Serves intent + ruling 3: the plan's grammar carries `--note <how>` but its verbatim block has no note slot; ruling 3 says fields may be added without breaking views; it mirrors park's `how` (Task 3's field list). Tests cover it (`note: shipped` asserted in store). Accept.
- **Deviation 3 — `<n> open` counts not-done (open+taken) items** (`bin/bee.js:618`, documented `bin/bee.js:404-405`). Accept: deterministic, documented, and the count matches the rows the list actually shows. Hazard flagged for the loop: default rows carry no state column, so over taken-heavy views "N open" can overstate items never yet read — Task 2's render (and any later aging surface) should keep the open/taken distinction visible.
- **Deviation 4 — extra tests beyond the named battery.** Serves intent: the byte-exact store-format test protects the verbatim contract Tasks 2–3 reuse; the age/offset-parsing and unknown-field round-trip tests serve ruling 3 directly. Accept.
- **Branch currency (for the loop's merge step):** `git diff main..task/4-inbox-store` shows a deleted suggestions file and a phases/ change that are NOT task-branch work — main gained `bb108df` after the branch was cut, so those lines are reverse-skew; the merge will be a real merge, not fast-forward.
- **Unknown fields:** preserved through rewrites (ruling 3 holds) but normalized to the end of their block rather than their original position — deterministic, views unaffected; nothing demands position stability.
- Probe results backing the pass: text with colons/`#` round-trips intact; empty and header-only store files both give the definitive `0 items`; ids stay monotonic past IN-999 (IN-1000); `--check` verified write-free on add/done/`list --for`; `add` rejects embedded newlines.

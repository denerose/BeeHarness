# Review: P4 agent-first CLI — Task 8 (structure check + worktree.sh rename)

**Role:** project-orchestrator
**Reviewer:** cold-dispatched stage agent (fresh context), bee-review skill
**Plan section:** `.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md` (Task 8 + standing rules)
**Verify record:** `.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task8-verify-r1.md` (PASS, rides this branch)
**Changed files:** commit 238d89a — `scripts/structure.map`, `scripts/structure-check.sh`, `tests/structure-check.test.mjs`, `scripts/task.sh`→`scripts/worktree.sh` (+ self-refs), `tests/task-sh.test.mjs`→`tests/worktree-sh.test.mjs` (+ refs), `bin/bee.js` (verify wiring), `skills/loop/bee-loop/assets/dispatch-brief-template.md`, `tests/fixtures/parking-lot-v1.md`

## Verdict

Fix first — one should-fix (timeout handling in the verify wiring, re-introducing a lesson the task-5 review already fixed for check commands); everything else reproduced clean, intent matched, all five disclosed deviations adjudicated accepted.

## Claim vs record

Task 8 boxes all unchecked and no `task-8:` ledger lines in the plan's machine block — correct, the loop flips them from this report. The verify record (r1, command-minted machine header + prose body) rides the branch in the same commit as the work; its header (PASS, checks-run 1, plan @ 5a22d47) matches a `--check` re-run byte-for-byte in kind. The commit message matches the plan's prescribed message exactly. All evidence claims reproduced by this review:

- `bash scripts/structure-check.sh .` → `0 findings`, exit 0 — reproduced.
- `node --test tests/*.test.mjs` → 210 tests, 210 pass, 0 fail — reproduced (includes the 9-test structure battery and the renamed worktree tests).
- Escaped sweep `grep -rn "task\.sh" bin scripts tests skills AGENTS.md docs README.md` → zero hits — reproduced. Unescaped plan-literal form → 4 hits, all `bee task show` in `bin/bee.js` (2199, 2373, 2374, 2376) — any-dot false positives exactly as the record classifies; flagged for Task 10's re-grep. `task-sh` → zero hits — reproduced.
- `roles/` additionally swept (outside the plan's path list, checked here): zero hits — no new stale surface the plan missed.

## Blocking

None.

## Should fix

- `bin/bee.js:2045-2053` — the structure branch checks `sr.error` before `sr.signal`, so a timed-out `structure-check.sh` (spawnSync sets `error.code === 'ETIMEDOUT'` AND `signal === 'SIGTERM'`) lands in "cannot run" with the fix line "bee needs scripts/structure-check.sh beside bin/bee.js — restore it or drop the map" — actively misleading for a hang, and the `else if (sr.signal)` "did not finish" branch is unreachable for timeouts. This re-introduces exactly the mislead `runCheckEntry` was reordered to avoid (task-5 review r1, comment at `bin/bee.js:1797-1800`: "a hung command lands in 'did not finish', not the misleading 'make it runnable'"). Suggested fix: mirror `runCheckEntry` — compute `timedOut` (`sr.error?.code === 'ETIMEDOUT'` or signal-with-error) and put the "did not finish — repair or shorten it" message/fix ahead of the generic `sr.error` branch.

## Notes

- Deviation 1 (frozen-fixture edit) — **accepted**: `tests/fixtures/parking-lot-v1.md:217` is parse-input; no park test asserts that string (verified: `tests/bee-park.test.mjs` asserts bodies only for PL-PP-013); the frozen original lives in git at 401e40c; the plan's sweep demands zero hits under `tests/`, which the edit honors honestly. One improvement, no action demanded: the fixture header carries no marker of the divergence — a one-line note ("frozen at 401e40c; task-8 sweep renamed task.sh→worktree.sh in PL-PO-002's body") would keep future readers from assuming byte-history.
- Deviation 2 (script run from `REPO_ROOT` against the plan root, map-existence-gated) — **accepted**: single-sources the matcher, and the adoption story stays "add a map". Exit-2 shapes (not-a-git fallback root, stderr-only failures) are covered by the `sLines.length <= 1` branch — verified by reading, not just by test.
- Deviation 3 (structure findings fail every written entry verdict globally) — **accepted**: mirrors the task-6 link-findings contract exactly (same `anyFail` and `verdict` treatment, same anomalies carriage).
- Deviation 4 (`.pi/handoff-project-orchestrator.md:73,82` still names task.sh) — **accepted**: outside the plan's sweep path list, ephemeral handoff surface regenerated on next handoff. Worth remembering if a later sweep widens past the plan's paths.
- Deviation 5 (map extension: `docs/research/<file>.md`, `.hivemind/suggestions/planned/<file>`) — **accepted**: this is Task 8's own deliberate-extension build step; the edit is recorded in the verify record body with counts (16 misses, two trees), scoped to those trees only.
- The ` #` comment-strip edge (dispatch question) — **unreachable by construction**: patterns are space-separated, so a pattern can never contain a space; any ` #` sequence in a line is therefore always a comment delimiter. Probed: an indented full-line comment (`  # …`) also falls through to the blank check via the ` #'` strip — no finding, no change needed.
- `scripts/structure-check.sh:138,148` — unquoted `${CLASS_PATS[$L]}` in `miss_line`'s display loops undergoes pathname expansion if a map pattern ever contains glob metacharacters (`*?[`), corrupting only the fix line's pattern list (the verdict path uses `read -ra`, which does not expand; probed — `*` is treated as a literal today). Unreachable with the shipped map (`<x>` is the only wildcard). One-word hardening if ever desired: `set -f` around the display loops.
- `tests/worktree-sh.test.mjs:20` — sandbox tmpdir prefix still `bee-tasksh-` after the rename; sweep-invisible (contains neither `task.sh` nor `task-sh`) and cosmetic only (shows up in /tmp during runs). Rename to `bee-worktree-` next time the file is touched.
- Map-miss contract honored: unparseable lines and empty classes are findings with the map's own path and line number (`scripts/structure.map:<n>`), definitive `0 findings` empty state, exit codes 0/1/2 as documented, TOON output shape matches the plan (`path · allowed-homes · fix`). The homes computation correctly excludes no-slash root patterns from "allowed-homes" (probed via the wrong-depth test's shape) — a root-level stray lists every class instead, which reads sensibly.

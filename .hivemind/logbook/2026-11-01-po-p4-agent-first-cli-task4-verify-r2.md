# Verify r2 — P4 Task 4: fix round after review r1

**Role:** project-orchestrator (loop) · **Level:** phase (declared) ·
**Date:** 2026-11-01 · **Task branch:** task/4-design-cli (fix round)

Review r1 (`.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task4-review-r1.md`)
verdict: fix first — 0 blocking, 2 should-fix, 7 notes. Both fixed this
round; re-review WAIVED per the near-verbatim rule: each fix is the
reviewer's suggested change applied as suggested, and both regression
tests replicate the reviewer's probes below. No blocking findings
existed.

## Fix 1 (review SF1): `$`-sequences in titles corrupted the doc

`bin/bee.js` designNew: `text.replace('<Title>', () => title)` — a
replacer function disables `$&`/`` $` ``/`$'` substitution. Regression
test replicates the reviewer's exact probe: title `Costs $& and $'x`
→ created doc's H1 reads `# Costs $& and $'x — design note` verbatim
(r1's probe showed `<Title>` leaking and the title tail spliced).

## Fix 2 (review SF2): `new`'s default dir disagreed with the delegated core

`designDirOf()` now resolves the default from the CWD's git toplevel
(same as scripts/design.sh), refusing outside a repo with a fix line
(`run inside a repo (or set BEE_DESIGN_DIR)`); BEE_DESIGN_DIR still
overrides both halves. Regression tests replicate both probe legs:
from a temp git repo, `new --check` targets THAT repo's designs dir;
from a non-repo dir, exit 1 + fix line. In-repo use unchanged.

| command | exit | note |
|---|---|---|
| `node --test tests/bee-design.test.mjs` | 0 | 13 pass, 0 fail (11 + 2 regression) |
| `node --test tests/*.test.mjs` | 0 | 122 pass, 0 fail (full suite, phase level) |
| `git status` after | clean | only the fix files in this commit |

## Re-review waiver

Waived: both fixes are the reviewer's suggested changes near-verbatim
(replacer fn; cwd-toplevel resolution with refusal); probes replicated
in the regression tests. No blocking findings existed. Waiver recorded
in the plan's task notes at checkbox-flip.

**Verdict:** PASS (fix round complete)

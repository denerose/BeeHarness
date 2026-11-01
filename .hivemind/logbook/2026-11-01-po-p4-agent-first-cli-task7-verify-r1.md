# Verify r1 — P4 Task 7: guidance skeleton + skill folds + task-orc codification

**Role:** project-orchestrator (loop) · **Level:** phase (declared) ·
**Date:** 2026-11-01 · **Task branch:** task/4-guidance

Implemented cold from the plan in the assigned worktree. All seven
plan steps done: `bee guidance list|show` (minimal — no injection
machinery), four topic skeletons, the bee-verify thinning, the
bee-plan rule-4 + checks-pointer additions, the task-orc codification
(+ brief-template line), the skill-review gate run before commit, and
the reference sweep.

## Commands

| command | exit | note |
|---|---|---|
| `node --test tests/bee-guidance.test.mjs` | 0 | 13 pass — AXI battery (bare call lists, `0 topics` empty state over temp dirs, unknown topic → exit 1 + `bee guidance list` fix line, unknown flag → exit 1 + usage, aggregate header, truncation + `--full`, show prints content) |
| `node --test tests/*.test.mjs` | 0 | 201 pass, 0 fail (188 prior + 13 new) |
| `node bin/bee.js guidance` | 0 | live default dir: `4 topics` — cli-writing, how-to-be-a-bee, tdd, triage-distinction |
| `node bin/bee.js guidance show nope` | 1 | `no topic nope — bee guidance list` |
| `node bin/bee.js verify --plan .hivemind/plans/2026-11-01-po-p4-agent-first-cli.md --task 7 --check` | 0 | dogfood preview: `task-7 · test -f docs/guidance/how-to-be-a-bee.md · PASS · 2 files`; links PASS; `--check` so this prose record takes r1 |
| `git status` after all runs | clean | only this task's files (see commit) |

Read-only family honored: guidance commands never write; no live
file touched (safety line 1 — no `--check` needed, verified by
porcelain).

## Reference sweep (grep shown)

```
$ grep -rn "verify-record-template\|verify-record" skills/ bin/ scripts/ tests/ AGENTS.md roles/
(no hits — template deleted with the fold; exit 1)
```

`bee-verify` hits in living docs (bee-loop step 3/7, bee-review
description, GLOSSARY sibling entry) are functional skill-name
references — none point at hand-run verify mechanics the command now
owns. Archival references to the old template inside executed plans
(`.hivemind/plans/2026-10-25-po-bee-cli-stub.md`,
`2026-10-31-po-task-worktree-helper.md`) are records — history stays.

## Skill-review gate (before commit, per the task's step 5)

Cold dispatches per bee-skill-review; **reviewer fallback disclosed**:
no worker-type subagent exists on this dispatch surface (scout /
researcher / visual only) — the codified nested-review split's exact
case, so both task-level reviews ran as cold scout analyses.

- **bee-verify r1:** 3 blocking (BLOCKED verdict the CLI cannot mint;
  anomaly-append vs bee-loop's no-hand-edit rule — mechanism unnamed;
  stale `assets/verify-record-template.md` contradicting the
  command-owned entry shape) + 2 advisories. All three fixed
  near-verbatim per the reviewer's prescriptions: BLOCKED restated as
  the report's verdict; the mechanism named (append to the entry's
  prose-body anomaly slot; machine header stays script territory);
  template deleted. Advisories applied: `--base` clause,
  level-blindness sentence, "the fold" → plain determinism-split
  wording.
- **bee-plan r1:** 1 blocking ("the plan reviewer's sandbox-run reads
  them" — false; `plan-checks.sh --run` runs only `suite:`, verified)
  + advisories. Fixed: clause dropped (checks execution attributed to
  `bee verify` only); advisory applied (task verification command =
  the task's `checks:` entry cmd — one command, both homes). Template
  optionality annotation waived: the template is Task 5's reviewed
  verbatim contract, outside Task 7's file list.
- **Re-review (fresh cold dispatch, both texts):** all dimensions
  PASS both skills, zero blocking, all four fix confirmations
  CONFIRMED. Remaining advisories carry no tier (optional half-line
  on the header/body carve-out; unscoped-write note) — recorded here.

Role-file and brief-template changes are phase-review territory
(keeper sign-off at phase end) — no gate run on them, per the task.

## Deviations (with reasons)

1. **Brief-template line placed twice** — one line in
   `roles/task-orc.md` (plan task bullet lists it among the role-file
   additions) AND one in
   `skills/loop/bee-loop/assets/dispatch-brief-template.md` (design
   note's codification section and the plan machine header's targets
   list both name the template for modify; no other task touches it).
   Both lines say the same thing (dispatcher waits on the pass-back,
   never reads the worktree mid-flight) — both plan surfaces
   satisfied minimally.
2. **Guidance show rejects `/`-bearing topics** (usage error, no path
   traversal) — not named by the plan; sibling id-lookup commands
   never face this input shape, and a stem-taking command should not
   silently read outside its directory. In-envelope (test structure /
   exact wording).
3. **`--full` on list only, not show** — show prints the whole file;
   no truncation exists there, so no `--full` (AXI: fail loud on
   unknown flags).

**Verdict:** PASS

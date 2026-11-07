<!-- machine
role: project-orchestrator
date: 2026-11-07T11:12:00+11:00
verdict: APPROVE
checks-run: node --test tests/bee-init.test.mjs (6/6); node --test tests/*.test.mjs (319/319); hands-on CLI matrix in tmp sandboxes
plan: .hivemind/plans/2026-11-02-po-p6-productization.md @ 0fb5a31
task: task-2
links: .hivemind/logbook/2026-11-02-po-p6-productization-task2-verify-r1.md
-->

# Review: task-2 — init contract (green-fields-first + consumer scaffolding)

**Role:** project-orchestrator (dispatching loop's role — GLOSSARY: Role trailer)
**Reviewer:** cold bee-review dispatch, workspace `/home/saphron/BeeHarness-task-scaffold` (branch `task/6-scaffold`)
**Plan section:** `.hivemind/plans/2026-11-02-po-p6-productization.md` — Task 2
**Verify record:** `.hivemind/logbook/2026-11-02-po-p6-productization-task2-verify-r1.md` (PASS, r1)
**Work under review:** commit 0fb5a31 (`bin/bee.js`, `tests/bee-init.test.mjs`) + verify entry 6b1b285

## Verdict

**APPROVE** — spec-faithful on every review question, both flagged design
decisions judged within plan intent, tests byte-identical to the plan's
verbatim block; nothing blocking, nothing worth a fix round. Four notes
recorded below (one flags a plan-letter gap, not an implementer fault).

## First check: claim vs record

- Plan task-2 boxes: all still unchecked; verify record r1 (PASS) exists
  behind the verified state; commit 0fb5a31's body honestly discloses the
  interrupted dispatch and the orchestrator-run checks. No claim ahead of
  evidence.
- The interrupted dispatch's full-suite step is covered independently: I
  re-ran `node --test tests/bee-init.test.mjs` (6/6) and the full suite
  `node --test tests/*.test.mjs` (319/319 pass) in this worktree. The
  commit-body claim matches my own output.

## Spec fidelity (all verified hands-on, tmp sandboxes only)

Ten scaffold items, in order, exact seed contents — all confirmed:

1. Item order 1–10 exactly as the plan lists them (output verified:
   docs → 8 class dirs in plan order → 2 templates → phase list →
   inbox → glossary → status → config → roles (sorted) → .gitignore).
2. `tests/bee-init.test.mjs` is **byte-identical** to the plan's verbatim
   block (113 lines, difflib compare, zero deltas).
3. Seeds are verbatim AND canonical: `inbox.toon`/`glossary.toon` seeds
   are the CLI's own `INBOX_HEADER`/`GLOSSARY_HEADER` constants
   (`bin/bee.js:869`, `bin/bee.js:3372`) — grep-verified equal to the
   plan's seed blocks (review r1 J4's concern holds).
4. `status.md` and `config.toon` contents match the plan's verbatim
   blocks exactly (cat-verified; `level :: L1` consumer default).
5. Templates copied verbatim (`diff` clean against
   `REPO_ROOT/.hivemind/{phases,designs}/TEMPLATE.md`);
   `phases/<Project>.md` = phases TEMPLATE verbatim, named by the repo
   root's basename (`notes.md` verified).
6. `roles/` copies every harness `*.md` as-is (diff clean per file).
7. `.gitignore`: creates when absent, appends the sessions line when
   missing — verified with a no-trailing-newline file (newline correctly
   inserted), a line-already-present file (reported `exists:`, file
   untouched), and the fresh case.
8. Green-fields: `git init` only, **no first commit** (verified: "does
   not have any commits yet"), exact output line, next-step hint line
   present only when something was scaffolded.
9. Worktree refusal: exact plan string with the main-root path, exit 0,
   and **nothing written** — settings.json untouched (0 skills entries),
   no `.hivemind` in the worktree, no registry entry. Refusal precedes
   every writing step (consumer resolution is first in `cmdInit`,
   `bin/bee.js:517-524`).
10. Harness skip: exact line, skips items 1–10 wholesale (skip returns
    before the per-item loop and before template pre-flight — correct:
    decision 2 skips the scaffold entirely), registry + drift still
    report (ran earlier in `cmdInit`).
11. `--check` writes nothing — verified on a green-fields dir: no `.git`
    created, no `.hivemind`, no registry write; `would scaffold` /
    `would create git repository` vocabulary throughout; exit 1 driven
    by skills NOT registered (P2 rule), as the plan's test documents.
12. Registry/drift strings all exact: registered line, `in sync`,
    `DRIFTED (pull + bee init to re-register)`, `not registered (run
    without --check to add …)` — every one byte-matched against the
    plan's output-string list.

## Judged questions (from the dispatch brief)

**Harness-repo skip by git-common-dir comparison (not path equality) —
WITHIN INTENT.** Decision 2's purpose is protecting the harness's own
law surfaces (AGENTS.md, `.hivemind/`) from injection: a linked worktree
of the harness carries those same surfaces on a task branch, so
scaffolding there would be the same harm — worse, since scaffold output
would ride a task branch toward main. The plan's letter ("when the
resolved consumer repo equals `REPO_ROOT`") read as path equality would
make init refuse inside harness worktrees — exactly where the loop runs
tasks and where task 1's tests execute in-process; registration, drift
reporting, and task 7's dogfood would all break there. A repo's identity
IS its common dir; the implementation reads "the consumer repo equals
REPO_ROOT" as repo identity, and it is the reading under which the
suite passes in worktrees. Verified empirically: init from a harness
worktree prints the skip line, leaves the worktree 100% clean, and the
registry carries ONE entry keyed by the main root.

**Registry keyed by resolved repo root (common-dir dirname) rather than
cwd — WITHIN INTENT.** Task 1 specifies "keyed by absolute repo path";
the repo's path is its root. Keying by cwd would mint a new registry
entry per worktree/subdir run of the same repo (unbounded duplicates);
keying by the resolved root gives one stable entry (verified: runs from
the main checkout, a subdirectory, and a worktree of the same repo all
resolve to a single entry; update-in-place, never duplicate).

**First-registration `in sync` line — REQUIRED BY THE PLAN, not a
deviation.** Task 2's binding verbatim test asserts `/in sync|DRIFTED/`
on a FIRST registration ("registry + drift reported"); task 1's code
alone printed neither on first write. The added line
(`bin/bee.js:248-253`) uses exactly task 1's `in sync` string shape with
registered == head. Drift reporting no longer waits for the second run
— a strict improvement, demanded by the spec.

## Notes

- `bin/bee.js:402-411` — green-fields first run scaffolds `docs/` +
  `.gitkeep` but not `docs/research/`; the references home arrives on
  the SECOND init run (docs/ then exists → research/ scaffolded, output
  `scaffolded docs/research`). This is letter-faithful (plan item 1's
  conditional reads exactly this way, and task 7's adoption doc phrases
  it identically: "docs/ (or docs/research/ if docs/ exists)"), so no
  action — recorded because the test name "second run reports exists
  everywhere" is not literally true for this one item on the first→
  second run transition. If one-run delivery of `docs/research/` is
  ever wanted, that is a plan change (the .gitkeep-survival question
  rides it), not a fix here.
- `bin/bee.js:301` — the main-checkout test is purely lexical
  (`dir.startsWith(root + path.sep)`), inherited verbatim from the
  plan's letter. A linked worktree created INSIDE the main checkout
  (unconventional; `bee worktree create` always makes siblings,
  `bin/bee.js:5005-5008`; the plan's tests use sibling paths) passes
  the test and init silently scaffolds the MAIN checkout while the user
  sits in the worktree (reproduced in a sandbox). Loud, non-destructive
  outside that layout, and the implementer followed the plan's own
  test — this is a plan-letter gap, not an implementation deviation.
  If the loop judges nested worktrees in scope, take it to the keeper
  as an intent-vs-letter question; the stronger detection is comparing
  `git rev-parse --absolute-git-dir` to `--git-common-dir` (differ ⇒
  linked worktree), which subsumes the lexical test.
- `bin/bee.js:406` (and the same posture at the `.hivemind` item) — a
  consumer with a FILE named `docs` crashes with a raw ENOTDIR stack
  (uncaught in `run()`), not a structured error. Loud and
  non-destructive, and the posture matches existing code (the
  `.gitignore` read rethrows non-ENOENT), so no action for this merge;
  a `step()`-level try/catch mapping fs errors to a structured line
  would close it if the AXI pass (task 6) wants it.
- `bin/bee.js:285-301` — `consumerRepoRoot` returns a `dir` field no
  caller reads (only `err`, `refuse`, `root`, `harness`, `greenFields`
  are consumed). Harmless dead field; drop it or put it to work in a
  future touch.

## Verification evidence

All experiments ran in `/tmp` sandboxes with `--machine`/`--settings`/
`--repo` pinned to tmp dirs (a clone stood in for the harness side, so
no live-repo state was touched). Matrix covered: green-fields full
scaffold + seed contents; second-run idempotence; docs-exists variant;
`.gitignore` three variants; `--check` on repo and green-fields; drift
forge + re-register; subdir keying; harness skip from main checkout and
from a worktree (via `--repo` and via cwd); sibling-worktree refusal;
nested-worktree edge; broken-harness pre-flight (structured failure,
zero writes including no `git init` and no registry entry — pre-flight
precedes every write, a strength worth naming).

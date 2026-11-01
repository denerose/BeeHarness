# Plan review — P4 agent-first CLI (round 1)

**Plan:** `.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md`
**Reviewer:** cold dispatch (bee-plan-review, 2026-11-01)
**Core:** `bash scripts/plan-checks.sh` (check mode, then `--run`, then
`--extract`); run from repo root, exit 1 (findings)

## Core output (run first)

- `boxes: 0/61`
- `blocks: 3/3 tagged, 0 untagged`
- 5 prose findings on modify-targets — all pre-existing content, each
  triaged below; none dropped.
- `--run`: `suite: node --test tests/*.test.mjs` → **`suite: pass` —
  vacuous.** The sandbox holds only the three extracted data blocks;
  `node --test` with a zero-match glob exits 0 having run **zero tests**
  (reproduced in a scratch dir: `tests 0`, exit 0). The pass line is a
  property of the core's sandbox, not evidence about the suite. Real
  validation, run in-repo by the reviewer: **34 tests, 34 pass** (node
  v24.20.0). Triage: core limitation, not a plan defect; recorded so the
  `pass` line is not misread.
- `--extract`: sandbox built at `/tmp/plan-checks.z7wldk` (since
  removed); the three blocks inspected/run there — results in the
  sandbox-run dimension. Repo verified clean after every command
  (`git status --porcelain` empty throughout).

### Core prose findings, triaged

| # | Hit | Tier | Triage |
|---|-----|------|--------|
| P1 | `skills/loop/bee-plan/SKILL.md:40` ("X is running", "currently…") | should-fix | Quoted-example class — rule 7's own definition text quoting marker examples, not residue. Waivable. **Waived (PO, 2026-11-01):** pre-existing rule definition text quoting its own markers — editing rule prose is outside this plan's lane; class confirmed by reviewer. |
| P2 | `skills/loop/bee-plan/SKILL.md:41` ("as of today…") | should-fix | Same quoted-example class as P1. Waivable. **Waived (PO, 2026-11-01):** same as P1 — one rule, one waiver. |
| P3 | `AGENTS.md:135` ("currently `docs/AXI.md`, `docs/WRITING-STANDARD.md`") | should-fix | Real staleness risk in a durable law file — and **this plan is what stales it**: Task 7 adds `docs/guidance/`, Task 10 edits AGENTS.md without touching this line. Fix in Task 10 (generalize the parenthetical) or waive. **FIXED in-plan (PO, 2026-11-01):** Task 10's AGENTS.md bullet now generalizes the docs enumeration — the "currently" parenthetical is dropped. |
| P4 | `.hivemind/status.md:268` ("pilot is running" quotation) | should-fix | Dated historical cross-role note (2026-10-25) quoting a long-gone line, in the interim living surface the plan deliberately leaves untouched outside the queue region. Waivable. **Waived (PO, 2026-11-01):** dated historical note, quoted past event — the interim living surface keeps history in place until the decisions inbox replaces it. |
| P5 | `.hivemind/status.md:352` ("pilot bee-loop is running", PL-PO-001 pointer) | should-fix | Same class as P4 — dated note pointing at a resolved lot item. Waivable. **Waived (PO, 2026-11-01):** same class and reason as P4. |

## Judgment findings

### Accuracy

Verified true (spot list): `bin/bee.js` `run(argv)` → `{code,out,err}`,
strict parseArgs, `--check` on mutations, `atomicWrite` tmp+rename;
`scripts/task.sh` and `scripts/plan-checks.sh` exist; design hash
`ad77aa4` (`git log -1 --format=%h` → ad77aa4, exact); persistent
worktree `/home/saphron/BeeHarness-phase3` sits on `phase/4` (spine
claim accurate); `designs/TEMPLATE.md` machine block matches Task 0's
field list; keeper-report header protocol ("Paths absolute (Paseo)")
exists as Task 2 claims; README has a `## Documents` list; phase list
P4 row matches this plan; ADR-016's interim-helper allowance covers
Task 0 exactly; no stale-able `task.sh` references outside Task 8's
sweep set (roles/ clean; `.hivemind/` hits are dated notes, gitignored
sessions, or records history).

- **F1 · BLOCKING · Task 8 / `scripts/structure.map` seed.** The task
  asserts "`0 findings` over this repo (the map covers everything
  tracked)" — false as spec'd. Against `git ls-files` (150 files), the
  seed map misses at least: `.gitignore` (root list has no entry),
  `.pi/handoff-power-planner.md`, `.pi/handoff-project-orchestrator.md`,
  `.pi/handoff.md` (no `.pi` pattern anywhere), `roles/README.md`,
  `roles/power-planner.md`, `roles/project-orchestrator.md`,
  `roles/task-orc.md` (`roles` absent from the root line; no `roles:`
  pattern). It will also miss `.hivemind/inbox.toon` the moment Task 1
  creates it (hivemind root allows only `status.md` /
  `keeper-report.md`), and `.gitkeep` under
  `.hivemind/{logbook,phases,suggestions}/` is ambiguous under `<file>`
  (shell globs don't match dotfiles by default). The verify step is
  unreachable as written; an implementer must invent map extensions the
  plan never sanctions — and several (roles, .pi, inbox.toon at
  hivemind root) are deliberate structure decisions the design wants
  visible. **Fix:** extend the seed map in the verbatim block (root gains
  `.gitignore .pi roles`; add patterns for those trees; hivemind root
  gains `.hivemind/inbox.toon`; state dotfile matching), or add an
  explicit "extend the map to cover everything tracked" step naming
  these entries.
- **F2 · BLOCKING · machine header targets list.** Task 10 modifies
  `README.md` ("documents list only") but `README.md` is absent from the
  header's `targets:`. The header is the core's input contract — the
  omission means README (a durable doc, first-named in the marker rule)
  escapes both the target-existence check and the ephemeral-prose scan.
  **Fix:** add `- README.md (modify)` to the machine block. (Every other
  per-task Files entry cross-checks clean against the header; this is
  the only gap.)
- **F3 · should-fix · Task 3 migration data.** The live parking lot has
  duplicate ids across sections: **PL-004** and **PL-PO-001** each
  appear in *Parked* AND *Resolved* (stale parked copies). The task's
  "every `PL-*` entry … parsed into the store mechanically" plus the
  test "every id … appears in the store with state preserved" is
  ambiguous on a duplicate: which state wins? **Fix:** name the collision
  rule (e.g., store keyed by id, resolved entry wins, the stale parked
  copy noted in `how`), and note the two known duplicates in the task
  text.
- **F4 · should-fix · Task 2 migration.** The live *Awaiting keeper*
  queue contains a RESOLVED-marked bullet (`pp-scripted-edits-verify`).
  "Awaiting keeper bullets → add keeper …" would migrate a resolved item
  as an open ask. `bee report`'s queue parsing already filters
  `RESOLVED` as history. **Fix:** migration applies the same RESOLVED
  skip (or equivalent normalization), stated in the task.

### External reality

Verified: `git merge --no-ff` valid (help lists `--[no-]ff`); `git
ls-files`, `git mv` standard; node v24.20.0 `node --test` runs the
declared suite (34/34 in-repo); strict parseArgs behavior confirmed in
house code (`flags()` catch → exit 1). No standalone findings; F4 is
filed under accuracy as a repo-content fact. The vacuous `--run` pass
is recorded in the core section above.

### Sandbox-run

3/3 blocks tagged; suite not sandbox-reachable (see core section —
vacuous pass; real suite verified in-repo). Extracted blocks run in the
kept sandbox:

- `scripts/structure.map` — exercised against the real tracked-file
  list: **fails its coverage contract cold** (F1). This is the block
  failing before anyone implements it — cheapest here.
- `.hivemind/inbox.toon` — parses cleanly; field set (id · addressee ·
  origin · ref · text · state · opened · taken · done) consistent with
  Task 1's command specs and Task 3's mirror list. No finding. (Note:
  exemplar data, not landing content — the store is born via first
  `add`; harmless since the task text says so.)
- `skills/loop/bee-plan/assets/plan-template.md` fragment — see F5.

- **F5 · should-fix · Task 5 checks block.** Two shape issues in the
  verbatim fragment: (a) it is an *insert-fragment* ("Add to the
  template's machine block") tagged as if it were whole-file content —
  extraction produces a fragment where the real template should be, so
  the sandbox cannot validate the merged result; (b) the placeholder
  `files: [paths that must exist after the task]` is not comma-shaped —
  a YAML flow sequence needs commas, and implementers copying the shape
  may write space-separated lists that `bee verify` then mis-parses.
  **Fix:** comma-shape the placeholder (`files: [<path>, <path>]`); either
  tag the full merged machine block or make the fragment status explicit
  in the infostring/task text.

### Ephemeral prose

Judged per hit — see P1–P5 above. The plan's own prose carries no
ephemeral markers (core scanned the plan's targets; the plan text
itself was read whole — standing rules explicitly fence durable-doc
edits). P3 is the one I would not waive without the Task 10 fix, since
the plan itself creates the staleness.

### Determinism / AXI

Strong overall: script cores are named for design (Task 0), inbox/park
(Task 1/3), verify (Task 5), task state (Task 6), structure check
(Task 8), phase close (Task 9); kept judgments are named where they
exist ("is this output sane" stays with the loop; the loop reads the
verify entry before calling `move … done`; the decision inventory is
agent-assembled, script-formatted). AXI batteries per command map
cleanly onto `docs/AXI.md` (TOON output, 3–4 default fields,
truncation + `--full`, aggregates, definitive empty states,
idempotent mutations, fix-line errors, bare-call content).

- **F6 · should-fix · Task 3 migration executor unnamed.** Task 2's
  migration is "script-driven"; Task 3 says the lot is "parsed into the
  store mechanically" but names no script or command — two careful
  executors would diverge (hand-parse vs script), and the migration
  test needs a repeatable mover to test against a fixture. **Fix:** name
  the executor (one-shot script or e.g. `bee park migrate <md>`),
  consistent with Task 2's pattern.
- **F7 · should-fix · Task 10 boundary grep.** The rule and the command
  don't match: `grep -rn "hivemind\|ADR-" skills/ bin scripts/` will
  hit functional code strings in `bin/bee.js` (`.hivemind` path joins —
  functionality, not citation), while the prose hand-waves the classes
  ("hits allowed only in non-shipped comments? No: zero hits in
  bin/scripts help text; code comments in scripts may cite ADR numbers
  as provenance"). **Fix:** one precise sentence — which surfaces are
  checked, the hit classes (citations vs functionality paths vs
  provenance comments), and the pass condition per class.

### No-globals boundary

**PASS.** Every instrument any step names is bee-native: `scripts/*`,
`bin/bee.js`, `bee-skill-review` (shipped kit), `docs/AXI.md`,
`docs/WRITING-STANDARD.md`, `skills/GLOSSARY.md`, the repo suite. No
step leans on a global skill or global rules file.

## Verdict

**FAIL** — 2 blocking, 10 should-fix (P1–P5, F3–F7).

Blocking, by name:

1. **F1** — Task 8 structure.map seed does not cover the tracked tree;
   the "0 findings" verify is unreachable as written.
2. **F2** — machine header omits `README.md` from targets though Task 10
   modifies it; the header convention the core depends on is incomplete.

Fix or escalate both before execution; blocking findings are never
waived. Should-fix findings may be waived by the receiver with one line
beside the finding above; silence is not a waiver. A re-review after
fixes is a fresh dispatch over the fixed text.

Role: reviewer

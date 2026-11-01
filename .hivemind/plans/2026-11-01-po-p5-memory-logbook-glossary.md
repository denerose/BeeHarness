# Plan: P5 — memory system + logbook hygiene + glossary store

**Date:** 2026-11-01
**Design docs:** `.hivemind/designs/2026-11-01-pp-p5-memory-and-logbook.md` @ 6dc0392 · `.hivemind/designs/2026-11-01-pp-glossary-store.md` @ 6dc0392 — all eight kickoff decisions keeper-ruled one-by-one, 2026-11-01: D1 supersede role-gated w/ provenance · D2 memory ids per-role `ME-<role>-NNN` · D3 `--type` always explicit · D4 stamping fail-loud + hand-fix list · D5 glossary rendered view KEPT, script-owned, regenerated concurrently on every write · D6 conversions tests-only until phase close · D7 first compact covers all closed phases · D8 tidy pass = close-time step on the keeper's word (NOT a plan task). D4's durable record: this header until the p5 design addendum's rectification records it — relayed to PP.
**Validation level:** phase (store-ownership changes — GLOSSARY.md becomes script-owned; keeper sign-off at phase end; matches P4 precedent)
**Detail:** mixed — verbatim contracts for store formats, command grammars, and the header/compaction rules (the interfaces tasks and the gate verify); lean for implementation code (each task names exact files, grammar, behavior, test list; implementer works in-repo with `bin/bee.js` house patterns — four command families `cmdInbox`/`cmdPark`/`cmdDesign`/`cmdVerify` are the patterns to follow)
**Reviewed:** bee-plan-review round 1 FAIL 2026-11-01 (3 blocking, 6 should-fix — `…-plan-review-r1.md`; all fixed). Round 2 FAIL (1 blocking, 4 should-fix — r2 report; all fixed). Round 3 FAIL (1 blocking, 4 should-fix — r3 report; all fixed). Round 4 **PASS** 2026-11-01 (0 blocking, 1 should-fix — r4 report: census-count drift from the review rounds themselves; fixed post-PASS, non-verbatim prose annotation, disclosed here per P4 precedent)

**Phase:** P5 (spine `phase/5`, persistent worktree `/home/saphron/BeeHarness-phase3`)

<!-- machine (ADR-014 mixed-document rule)
phase: P5
validation: phase
state-source: checkboxes below (script-owned via bee task)
design: .hivemind/designs/2026-11-01-pp-p5-memory-and-logbook.md @ 6dc0392
design: .hivemind/designs/2026-11-01-pp-glossary-store.md @ 6dc0392
targets:
  - bin/bee.js (modify)
  - tests/bee-memory.test.mjs (create)
  - tests/bee-logbook.test.mjs (create)
  - tests/bee-glossary.test.mjs (create)
  - scripts/structure.map (modify)
  - .hivemind/glossary.toon (create)
  - .hivemind/logbook/2026-11-01-po-p5-memory-logbook-glossary-task2-verify-r1.md (create)
  - skills/GLOSSARY.md (modify)
  - .hivemind/phases/BeeHarness.md (modify)
checks:
  - id: task-1
    cmd: node --test tests/bee-memory.test.mjs
    expect: exit 0
    files: [bin/bee.js, tests/bee-memory.test.mjs]
  - id: task-2
    cmd: node --test tests/bee-logbook.test.mjs
    expect: exit 0
    files: [bin/bee.js, tests/bee-logbook.test.mjs]
  - id: task-3
    cmd: node --test tests/bee-logbook.test.mjs
    expect: exit 0
    files: [bin/bee.js, tests/bee-logbook.test.mjs]
  - id: task-4
    cmd: node --test tests/bee-glossary.test.mjs
    expect: exit 0
    files: [bin/bee.js, tests/bee-glossary.test.mjs, scripts/structure.map]
  - id: task-5
    cmd: bash scripts/structure-check.sh .
    expect: exit 0
    files: [.hivemind/glossary.toon, skills/GLOSSARY.md]
suite: node --test tests/*.test.mjs
task-1: implemented 2026-11-02T09:08:13+11:00 by project-orchestrator
task-1: verified 2026-11-02T09:18:43+11:00 by project-orchestrator
task-1: done 2026-11-02T09:18:43+11:00 by project-orchestrator record: .hivemind/logbook/2026-11-01-po-p5-memory-logbook-glossary-task1-verify-r2.md
task-2: implemented 2026-11-02T09:08:13+11:00 by project-orchestrator
task-2: verified 2026-11-02T09:18:48+11:00 by project-orchestrator
task-2: done 2026-11-02T09:18:48+11:00 by project-orchestrator record: .hivemind/logbook/2026-11-01-po-p5-memory-logbook-glossary-task2-verify-r2.md
task-3: implemented 2026-11-02T09:29:28+11:00 by project-orchestrator
task-3: verified 2026-11-02T09:38:22+11:00 by project-orchestrator
task-3: done 2026-11-02T09:38:22+11:00 by project-orchestrator record: .hivemind/logbook/2026-11-01-po-p5-memory-logbook-glossary-task3-verify-r1.md
task-4: implemented 2026-11-02T09:29:28+11:00 by project-orchestrator
task-4: verified 2026-11-02T09:38:15+11:00 by project-orchestrator
task-4: done 2026-11-02T09:38:15+11:00 by project-orchestrator record: .hivemind/logbook/2026-11-01-po-p5-memory-logbook-glossary-task4-verify-r2.md
task-5: implemented 2026-11-02T10:12:39+11:00 by project-orchestrator
task-5: verified 2026-11-02T10:12:40+11:00 by project-orchestrator
task-5: done 2026-11-02T10:12:40+11:00 by project-orchestrator record: .hivemind/logbook/2026-11-01-po-p5-memory-logbook-glossary-task5-verify-r1.md
-->

## Shared contract: command grammar (USAGE additions)

One verbatim block, three stanzas — each task adds its stanza to the top-level `USAGE` string in `bin/bee.js` exactly as written here (Task 1: memory · Tasks 2/3: logbook · Task 4: glossary; bare `bee logbook` = `index`, content-first. Note the deliberate seam-flag split: `--logbook` rides in the stanza because all three logbook subcommands share it; `--store`/`--view` stay in per-subcommand help per the park/inbox pattern):

```text path=bin/bee.js
bee memory [list [--type lesson|fact] [--full]]
           | add "<gist>" --type lesson|fact [--ref <path>] [--origin <role>]
           | show <id> [--full]
           | supersede <id> "<gist>" --type lesson|fact [--ref <path>] [--origin <role>]
bee logbook [index [--logbook <dir>]]
           | stamp [--logbook <dir>]
           | compact <phase> [--logbook <dir>]
bee glossary [<term>] [--markdown]
             | add <term> "<gist>" [--see <path>]
             | convert <md>
```

## Task 1: memory store + `bee memory`

**Files:** modify `bin/bee.js` · create `tests/bee-memory.test.mjs`
**Depends on:** nothing
**Provides:** store `.hivemind/memory/memory.toon` (line format below); command `bee memory add|list|show|supersede`; shared helper `originTag(role)` (generalized from `parkOriginTag`, used by park `PL-<tag>-NNN` and memory `ME-<tag>-NNN`)

- [x] Step: generalize `parkOriginTag` → `originTag` (same body: hyphenated names map to word-initial tags, `power-planner` → `PP`; short codes pass through). Park's behavior is unchanged — existing park tests must stay green.
- [x] Step: implement the store + command per the contracts below (grammar: the `bee memory` stanza of the shared USAGE block at the top of this plan, verbatim). Absent store: `list` reports `0 entries` (exit 0); `show` fails loud with the store path. Write commands accept `--check` (preview; never writes — house semantics). Newline guard on gist/ref (house rule). Fail loud on superseding an already-superseded id or an unknown id.
- [x] Step: supersede semantics: new entry gets a fresh id in the CALLING role's series (per `--origin`), `--type` explicit (D3), provenance stamped; the OLD entry's state rewrites to `superseded:<new-id>` in place (atomic write, whole store). Role-gated per D1: any origin may run it; the CLI stamps provenance and that is the audit trail — no extra gate. Internal seam flag `--store <path>` follows the park/inbox house pattern: implemented, listed in `bee memory help`, not in the top-level stanza.
- [x] Step: tests — mirror `tests/bee-park.test.mjs` structure (tmp store via `--store`): default bare series; per-role series via full and short origin; explicit `--type` required (omitting exits 1); field order + zero-padded ids; series continuation from seeded store; supersede rewrites state and mints successor; double-supersede fails; `--check` writes nothing; unknown id fails loud.
- [x] Step: run `node --test tests/bee-memory.test.mjs` — all pass.
- [x] Commit: `add memory store and bee memory command`

Task notes: re-review waived — fix round b89feb5 applied the reviewer's suggested change near-verbatim; verify r2 entry replicates the reviewer's probe (mixed-case provenance); zero blocking findings (APPROVE r1).

Store line format (one line per entry, ` :: ` separators, fields never contain ` :: `):

```text path=.hivemind/memory/memory.toon
ME-PP-001 :: lesson :: <gist: single line> :: pp · 2026-11-01 · <source-ref or -> :: live
ME-002 :: fact :: <gist> :: bee · 2026-11-01 · - :: superseded:ME-003
```

- id: `ME-<tag>-NNN` per D2 (origin `bee` → bare `ME-NNN`); monotonic per series, never reused
- type: `lesson | fact` (D3: always explicit on add)
- provenance: `<origin> · <YYYY-MM-DD> · <ref>` — origin as passed, date + ref stamped/defaults by CLI (`--ref <path>` optional, default `-`)
- state: `live` or `superseded:<id>`; `list` shows live only, `--full` shows all

Usage grammar: the `bee memory` stanza of the shared USAGE block (top of this plan).

## Task 2: logbook headers from birth + `bee logbook stamp` + `bee logbook index`

**Files:** modify `bin/bee.js` · create `tests/bee-logbook.test.mjs`
**Depends on:** nothing (independent of Task 1)
**Provides:** machine headers on every new verify entry (`task:` + `links:` added to the existing block); `bee logbook stamp` (fail-loud legacy stamping, D4); `bee logbook index` (header-derived TOON index)

- [x] Step: extend `verifyEntryText` — existing fields and their order stay exactly (`role`, `date`, `verdict`, `checks-run`, `plan: <path> @ <hash>`); `task: task-<n>` and `links:` (default `-`, the cross-link slot from birth) APPEND after `plan:`. One named test change: the anchored entry-shape regex at `tests/bee-verify.test.mjs:259` gains the two appended fields — its meaning (minted entries carry exactly these fields, in this order) is preserved, its text extends. Every other existing test keeps its meaning untouched.
- [x] Step: implement `bee logbook stamp` per the contract below. The pass runs over a logbook dir (`--logbook <dir>`, default `.hivemind/logbook/`). Task-tier files — matching `^(.+)-task(\d+)-(verify|review)-r(\d+)\.md$` (53 today) — are the stamping targets: the regex yields plan stem, task n, kind, round; role parses from EITHER corpus form (`^\*{0,2}Role:\*{0,2} <role>` — 61 bold, 4 plain at write time; review reports add plain-form out-of-scope files; no match → hand-fix list); date from `git log --format=%cI -1 -- <file>` (strict ISO datetime, the emitter's shape; absent git history → hand-fix list); verdict from an existing machine block or a body line `^\*\*Verdict:\*\* (\w+)` (absent → hand-fix list). Two mint rules: stamped legacy entries carry `checks-run: -` (no countable source exists for past runs; `-` is the house unknown), and `plan: .hivemind/plans/<stem>.md @ <hash>` uses the house hash source — `git log -1 --format=%h -- <plan>` (`-` when the plan has no history). Already-stamped entries missing `task:`/`links:` are TOPPED UP from their filename (the five minted P4 entries gain both). Files NOT matching the regex (17 today: multi-task ranges, phase-level entries, plan/skill-review reports, calibration/dispatch records, the decisions .toon, round-less P1 names) are skipped and reported as out-of-scope — not errors, not hand-fixes; the index covers task-tier entries only. Hand-fix entries are reported with file + missing fields; the pass exits 1 while any remain (D4). Idempotent: nothing to stamp → exit 0.
- [x] Step: implement `bee logbook index`: reads every entry's machine block, outputs one TOON line per entry `file :: role :: date :: task :: verdict`, sorted by filename. Missing `task:` renders as `-` (top-up makes it rare). Derived on demand — writes nothing.
- [x] Step: tests — fixture logbook dir (tmp): filename parse; role stamping from BOTH `Role:` forms (plain + bold); git-dated entry (real `git init` tmp repo — follow `tests/worktree-sh.test.mjs` patterns for git-in-test); hand-fix list on missing role/verdict (exit 1, names files); top-up of a stamped entry missing task/links; non-matching filename skipped and reported (exit unaffected); index output incl. missing-task `-`; stamp idempotence (second run exit 0).
- [x] Step: run `node --test tests/bee-logbook.test.mjs` — all pass.
- [x] Commit: `add logbook stamp and index, headers from birth`

Task notes: re-review waived — fix round 1638cc2 applied the reviewer's three suggested fixes near-verbatim; verify r2 entry replicates all three probes (fence fixture, --check snapshot, help scoping); zero blocking findings (APPROVE r1).

Header contract (the six design fields plus verify-specific `checks-run`; the filename below is the extraction target — the contract applies to every TASK-TIER entry file, named `<plan-slug>-task<n>-<kind>-r<N>.md`). Field order matches the existing emitter; the two new fields append after `plan:`; `date:` is an ISO datetime (emitter's `isoStampLocal`; stamp mints the same shape from git `%cI`):

```text path=.hivemind/logbook/2026-11-01-po-p5-memory-logbook-glossary-task2-verify-r1.md
<!-- machine
role: <role>
date: <ISO datetime>
verdict: <PASS|FAIL|APPROVE|FIX|...>
checks-run: <n>
plan: .hivemind/plans/<slug>.md @ <hash>
task: task-<n>
links: <related entry paths, comma-separated, or ->
-->
```

## Task 3: `bee logbook compact <phase>`

**Files:** modify `bin/bee.js` · modify `tests/bee-logbook.test.mjs`
**Depends on:** task-2 (headers are what entries compact TO)
**Provides:** scripted, idempotent compaction; used at close (Task 5) over every phase closed at close time, per D7 (today: P0–P4 and P7)

- [x] Step: implement per contract: an entry belongs to `<phase>` when its machine block's `plan:` path equals a plan path linked in that phase's row of `.hivemind/phases/<project>.md` — the phase list is the plan↔phase source of truth, so plan files themselves need no machine headers (the six pre-convention P2 entries resolve via their row's plan link). Rows with plan `—` match nothing → compact reports `0 entries`, exit 0 (clean no-op). Missing phase list or row → fail loud naming it. Target entries rewrite to: machine block + blank line + one marker line `compacted at phase close; full text in git history`. Idempotent: an entry whose body is only the marker line is skipped. Compact scans task-tier files (the Task 2 filename regex) — out-of-scope files (phase/plan-review reports, calibration records, round-less names) are never scanned; a scanned task-tier file with no machine block → fail loud, "run `bee logbook stamp` first" (all task-tier files carry blocks after stamp). `--check` lists what would compact, writes nothing.
- [x] Step: tests: compact a fixture phase (entries + phase list + plan-linked rows in tmp root — including a HEADERLESS plan file, proving membership comes from the list, not the plan, and a blockless out-of-scope file proving it is never scanned); marker-only second run exits 0 unchanged; unstamped task-tier file fails loud; `--check` writes nothing; entries of other phases untouched; plan-`—` row reports `0 entries`, exit 0.
- [x] Step: run `node --test tests/bee-logbook.test.mjs` — all pass.
- [x] Commit: `add idempotent bee logbook compact`

Task notes: review r1 APPROVE, zero findings — no fix round, no waiver needed.
Sign-off ruling (keeper, 2026-11-02): fail-loud-first KEPT — an unstamped logbook is a broken precondition, D4-loud beats no-op (decision 2 of 3).

## Task 4: glossary store + `bee glossary` (store + concurrent view)

**Files:** modify `bin/bee.js` · create `tests/bee-glossary.test.mjs` · modify `scripts/structure.map` (add `.hivemind/glossary.toon` to the hivemind root line)
**Depends on:** nothing (independent of Tasks 1–3)
**Provides:** store `.hivemind/glossary.toon`; `bee glossary` lookup/supply/`--markdown`; concurrent view regeneration (D5); the conversion subcommand Task 5 runs at close (D6)

- [x] Step: implement per contracts below. Lookup: exact match → print the line; else unique prefix match → print it; else multiple prefix matches → print all, exit 0; else zero → structured error listing nearest matches (substring hits), exit 1. `--markdown` renders lookup/list output as markdown lines instead of TOON (on-demand human view; the committed view file is a separate artifact). `add` fails loud when the term exists (supply, not update — no update path). Absent store: bare call reports `0 terms`, lookup fails loud. Internal seam flags (`--store`, `--view`) follow the park/inbox house pattern: implemented, listed in per-subcommand help (`bee glossary help`), not in the top-level stanza.
- [x] Step: view regeneration (D5): every store write (`add`, and Task 5's `convert`) regenerates the rendered markdown view atomically — header marker + one `**term** — gist` line + indented `see:` pointers, alphabetical. View path: `--view <path>` overrides; default `<root>/skills/GLOSSARY.md` when `skills/GLOSSARY.md` exists, else `<root>/GLOSSARY.md`. Read-only lookups never touch the view.
- [x] Step: `bee glossary convert <md>`: scripted one-shot from the current `skills/GLOSSARY.md` shape — `- **term** — gist` bullets (46 today), where a bullet's continuation lines (the wrapped prose after the `—`) join into the single-line gist, space-joined, until the next bullet; `see` pointer detection: a trailing `See \`<path>\`.` sentence at the end of the joined gist moves to the `see` field (two bullets carry one today — power-planner, project-orchestrator); all others default `see: -`. Converted gists ride as-is even when long — conversion never editorializes (the P8 template distillation trims later). Fail loud on: duplicate term, unparseable line inside a bullet (hand-fix list, D4 pattern). Headings and prose outside bullets are skipped and reported. Runs against OUR real file only in Task 5 (D6) — tests use fixtures.
- [x] Step: tests: lookup exact/prefix/multi/miss; add duplicate fails; view regenerated on add (content + marker) and not on lookup; convert fixture (clean + duplicate + malformed); `--check` writes nothing; store+view land where expected with `--store`/`--view` overrides.
- [x] Step: run `node --test tests/bee-glossary.test.mjs` — all pass.
- [x] Commit: `add glossary store, lookup, concurrent rendered view`

Task notes: re-review waived — fix round c55eb34 applied the reviewer's two suggested fixes near-verbatim (live-view fence + split assertion); verify r2 replicates the probes; zero blocking findings (APPROVE r1).
Sign-off rulings (keeper, 2026-11-02): FENCE KEPT — GLOSSARY.md is the human view kept current through the real store's write path, never the implicit CLI default of a partial override (decision 1). STORE INSERTION ORDER KEPT — the view is the alphabetical surface (decision 3).

Store line format (design: `term :: gist :: see`; gist at most two lines, CLI adds are single-line):

```text path=.hivemind/glossary.toon
keeper :: the human owner; final authority on decisions :: roles/power-planner.md
inbox :: items waiting on someone :: .hivemind/inbox.toon
```

Usage grammar: the `bee glossary` stanza of the shared USAGE block.

## Task 5: close-time — real conversions, stamp pass, first compact (D6, D7)

**Files:** create `.hivemind/glossary.toon` (converted) · modify `.hivemind/logbook/*` (stamped; closed phases compacted) · modify `skills/GLOSSARY.md` (regenerated view + script-owned marker). The memory store ships at FIRST REAL ADD — no empty file is minted at close (absent store is a designed state: `list` reports `0 entries`).
**Depends on:** task-1, task-2, task-3, task-4
**Provides:** our real stores live; the repo runs on its own P5 tooling

**Runs at phase close — AFTER the keeper's phase-end sign-off, BEFORE `bee phase close 5`, on the phase branch.** Until then our real files stay untouched (D6).

- [x] Step: `bee logbook stamp` over the real logbook (roughly 70 entries; ~65 lack machine blocks; 53 task-tier targets; skip-and-report was 17 at write time — it grows by one per review round of this plan). Expect a GENUINE hand-fix list (D4) of ~25 files, all verdict-line-missing (role parses on every stampable target — the 7 role-less corpus files never reach the hand-fix list: 3 are machine-block top-ups, 4 out-of-scope): hand-fix each named file's missing fields, re-run until exit 0. Hand-fixes are additive machine blocks only — prose bodies unchanged, and hand-fixed blocks follow the same two mint rules as stamped entries (`checks-run: -`; plan hash from the house git source).
- [x] Step: `bee glossary convert skills/GLOSSARY.md` — real conversion; resolve the hand-fix list (duplicate/odd bullets) by hand-deciding the surviving gist (judgment, keeper-adjacent: when two gists conflict, keep the one matching current law and note the conflict in the task's logbook entry). View regenerates; verify the marker line landed and the view is alphabetical.
- [x] Step: `bee logbook compact <P-n>` — the phase id exactly as the phase list's id column shows it (`P2`, `P7`, …) — for every phase closed at close time: P0–P4 and P7 today (D7: ALL closed phases). `--check` first, then run; verify second runs exit 0 (idempotence on real data).
- [x] Step: run `bash scripts/structure-check.sh .` (0 findings — proves the map line from Task 4 covers the real files) and `node --test tests/*.test.mjs` — all pass.
- [x] Step: dogfood the reads once on real stores: `bee logbook index`, `bee glossary keeper`, `bee memory list` (proves the designed absent-store path live: `0 entries`, exit 0) — all exit 0 with sane output.
- [x] Commit: `convert real stores, stamp logbook, compact closed phases`

Task notes: executed under the keeper's phase-end sign-off (rulings recorded at Tasks 3-4 notes); verify r1 PASS (structure 0, suite 307/307); dogfood reads clean; no separate cold review — the sign-off decision inventory covered the close sequence per the plan's phase-exit.

## Phase exit

Suite green (`node --test tests/*.test.mjs`), structure check 0 findings, all five task checks pass, Task 5's real-store conversions done on the phase branch. Keeper phase-end sign-off by decisions (one card per live-alternative call; never a bulk sign-off while disputes remain). Then `bee phase close 5` (from the main checkout: gate → no-ff merge → rest → delete → card → push). The tidy pass (D8) is NOT part of this plan: close-time step on the keeper's word, run with this phase's tooling, governed by the design's sweep criterion ("does carrying it forward teach the right behavior?").

**Determinism split (ADR-014):** everything structural — ids, series, stamps, headers, index derivation, compaction, conversion, view regeneration — is script work, all of it in `bin/bee.js`. Agent judgment kept: gist and term text, what counts as a lesson or fact, conversion hand-fix rulings on conflicting gists. Pruning and curation are the keeper's.

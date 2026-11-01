# Plan: P5 — memory system + logbook hygiene + glossary store

**Date:** 2026-11-01
**Design docs:** `.hivemind/designs/2026-11-01-pp-p5-memory-and-logbook.md` @ 6dc0392 · `.hivemind/designs/2026-11-01-pp-glossary-store.md` @ 6dc0392 — all eight kickoff decisions keeper-ruled one-by-one, 2026-11-01: D1 supersede role-gated w/ provenance · D2 memory ids per-role `ME-<role>-NNN` · D3 `--type` always explicit · D4 stamping fail-loud + hand-fix list · D5 glossary rendered view KEPT, script-owned, regenerated concurrently on every write · D6 conversions tests-only until phase close · D7 first compact covers all closed phases · D8 tidy pass = close-time step on the keeper's word (NOT a plan task)
**Validation level:** phase (store-ownership changes — GLOSSARY.md becomes script-owned; keeper sign-off at phase end; matches P4 precedent)
**Detail:** mixed — verbatim contracts for store formats, command grammars, and the header/compaction rules (the interfaces tasks and the gate verify); lean for implementation code (each task names exact files, grammar, behavior, test list; implementer works in-repo with `bin/bee.js` house patterns — four command families `cmdInbox`/`cmdPark`/`cmdDesign`/`cmdVerify` are the patterns to follow)
**Reviewed:** PENDING

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
  - .hivemind/memory/memory.toon (create)
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
    files: [.hivemind/memory/memory.toon, .hivemind/glossary.toon, skills/GLOSSARY.md]
suite: node --test tests/*.test.mjs
-->

## Shared contract: command grammar (USAGE additions)

One verbatim block, three stanzas — each task adds its stanza to the top-level `USAGE` string in `bin/bee.js` exactly as written here (Task 1: memory · Tasks 2/3: logbook · Task 4: glossary):

```text path=bin/bee.js
bee memory [list [--type lesson|fact] [--full]]
           | add "<gist>" --type lesson|fact [--ref <path>] [--origin <role>]
           | show <id> [--full]
           | supersede <id> "<gist>" --type lesson|fact [--ref <path>] [--origin <role>]
bee logbook [stamp [--logbook <dir>]]
           | index [--logbook <dir>]
           | compact <phase> [--logbook <dir>]
bee glossary [<term>] [--markdown]
             | add <term> "<gist>" [--see <path>]
             | convert <md>
```

## Task 1: memory store + `bee memory`

**Files:** modify `bin/bee.js` · create `tests/bee-memory.test.mjs`
**Depends on:** nothing
**Provides:** store `.hivemind/memory/memory.toon` (line format below); command `bee memory add|list|show|supersede`; shared helper `originTag(role)` (generalized from `parkOriginTag`, used by park `PL-<tag>-NNN` and memory `ME-<tag>-NNN`)

- [ ] Step: generalize `parkOriginTag` → `originTag` (same body: hyphenated names map to word-initial tags, `power-planner` → `PP`; short codes pass through). Park's behavior is unchanged — existing park tests must stay green.
- [ ] Step: implement the store + command per the contracts below (grammar: the `bee memory` stanza of the shared USAGE block at the top of this plan, verbatim). Absent store: `list` reports `0 entries` (exit 0); `show` fails loud with the store path. Write commands take `--check` and never write without it. Newline guard on gist/ref (house rule). Fail loud on superseding an already-superseded id or an unknown id.
- [ ] Step: supersede semantics: new entry gets a fresh id in the CALLING role's series (per `--origin`), `--type` explicit (D3), provenance stamped; the OLD entry's state rewrites to `superseded:<new-id>` in place (atomic write, whole store). Role-gated per D1: any origin may run it; the CLI stamps provenance and that is the audit trail — no extra gate.
- [ ] Step: tests — mirror `tests/bee-park.test.mjs` structure (tmp store via `--store`): default bare series; per-role series via full and short origin; explicit `--type` required (omitting exits 1); field order + zero-padded ids; series continuation from seeded store; supersede rewrites state and mints successor; double-supersede fails; `--check` writes nothing; unknown id fails loud.
- [ ] Step: run `node --test tests/bee-memory.test.mjs` — all pass.
- [ ] Commit: `add memory store and bee memory command`

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

- [ ] Step: extend `verifyEntryText` — existing fields (`role`, `date`, `verdict`, `plan: <path> @ <hash>`, `checks-run`) stay; add `task: task-<n>` and `links:` (default `-`; the field exists so review/verify cross-links have a slot from birth). No existing test may change its meaning — extend, don't rewrite.
- [ ] Step: implement `bee logbook stamp` per the contract below. The pass runs over a logbook dir (`--logbook <dir>`, default `.hivemind/logbook/`): filename regex `^(.+)-task(\d+)-(verify|review)-r(\d+)\.md$` yields plan stem, task n, kind, round; `Role: <role>` line in the body yields role; date from `git log --format=%as -1 -- <file>` (absent git history → hand-fix list); verdict from existing machine block (skip: already stamped) or from a body line matching `^\*\*Verdict:\*\* (\w+)` → hand-fix list when absent. Entries on the hand-fix list are reported with file + missing fields and the pass exits 1 (D4). Idempotent: stamped entries are skipped, exit 0.
- [ ] Step: implement `bee logbook index`: reads every entry's machine block, outputs one TOON line per entry `file :: role :: date :: task :: verdict`, sorted by filename. Derived on demand — writes nothing.
- [ ] Step: tests — fixture logbook dir (tmp): filename parse; skip-if-stamped; Role:-line stamping; git-dated entry (create fixture via a real `git init` tmp repo or commit — follow `tests/worktree-sh.test.mjs` patterns for git-in-test); hand-fix list on missing verdict/role (exit 1, names files); index output; stamp idempotence (second run exit 0).
- [ ] Step: run `node --test tests/bee-logbook.test.mjs` — all pass.
- [ ] Commit: `add logbook stamp and index, headers from birth`

Header contract (the six design fields; the filename below is the extraction target — the contract applies to every entry file, named `<plan-slug>-task<n>-<kind>-r<N>.md`; `plan` keeps its hash suffix, `checks-run` stays as a verify-specific extra):

```text path=.hivemind/logbook/2026-11-01-po-p5-memory-logbook-glossary-task2-verify-r1.md
<!-- machine
role: <role>
date: <YYYY-MM-DD>
task: task-<n>
plan: .hivemind/plans/<slug>.md @ <hash>
verdict: <PASS|FAIL|APPROVE|FIX|...>
links: <related entry paths, comma-separated, or ->
checks-run: <n>
-->
```

## Task 3: `bee logbook compact <phase>`

**Files:** modify `bin/bee.js` · modify `tests/bee-logbook.test.mjs`
**Depends on:** task-2 (headers are what entries compact TO)
**Provides:** scripted, idempotent compaction; used at close (Task 5) over P0–P4 per D7

- [ ] Step: implement per contract: an entry belongs to `<phase>` when its machine block's `plan:` path resolves to a plan whose machine header `phase:` equals `<phase>` (read the plan file; missing plan file → fail loud naming it). Target entries rewrite to: machine block + blank line + one marker line `compacted at phase close; full text in git history`. Idempotent: an entry whose body is only the marker line is skipped. Any target lacking a machine block → fail loud, "run `bee logbook stamp` first". `--check` lists what would compact, writes nothing.
- [ ] Step: tests: compact a fixture phase (entries + their plan files in tmp root); marker-only second run exits 0 unchanged; unstamped target fails loud; `--check` writes nothing; entries of other phases untouched.
- [ ] Step: run `node --test tests/bee-logbook.test.mjs` — all pass.
- [ ] Commit: `add idempotent bee logbook compact`

## Task 4: glossary store + `bee glossary` (store + concurrent view)

**Files:** modify `bin/bee.js` · create `tests/bee-glossary.test.mjs` · modify `scripts/structure.map` (add `.hivemind/glossary.toon` to the hivemind root line)
**Depends on:** nothing (independent of Tasks 1–3)
**Provides:** store `.hivemind/glossary.toon`; `bee glossary` lookup/supply/`--markdown`; concurrent view regeneration (D5); the conversion subcommand Task 5 runs at close (D6)

- [ ] Step: implement per contracts below. Lookup: exact match → print the line; else unique prefix match → print it; else multiple prefix matches → print all, exit 0; else zero → structured error listing nearest matches (substring hits), exit 1. `add` fails loud when the term exists (supply, not update — no update path). Absent store: bare call reports `0 terms`, lookup fails loud.
- [ ] Step: view regeneration (D5): every store write (`add`, and Task 5's `convert`) regenerates the rendered markdown view atomically — header marker + one `**term** — gist` line + indented `see:` pointers, alphabetical. View path: `--view <path>` overrides; default `<root>/skills/GLOSSARY.md` when `skills/GLOSSARY.md` exists, else `<root>/GLOSSARY.md`. Read-only lookups never touch the view.
- [ ] Step: `bee glossary convert <md>`: scripted one-shot from the current `skills/GLOSSARY.md` shape (`- **term** — gist` bullets; `see` pointers where present) → store + view. Fail loud on: duplicate term, bullet not matching the shape (hand-fix list, D4 pattern). Unparseable-but-ignored lines (headings, prose) are skipped and reported. Runs against OUR real file only in Task 5 (D6) — tests use fixtures.
- [ ] Step: tests: lookup exact/prefix/multi/miss; add duplicate fails; view regenerated on add (content + marker) and not on lookup; convert fixture (clean + duplicate + malformed); `--check` writes nothing; store+view land where expected with `--store`/`--view` overrides.
- [ ] Step: run `node --test tests/bee-glossary.test.mjs` — all pass.
- [ ] Commit: `add glossary store, lookup, concurrent rendered view`

Store line format (design: `term :: gist :: see`; gist at most two lines, CLI adds are single-line):

```text path=.hivemind/glossary.toon
keeper :: the human owner; final authority on decisions :: roles/power-planner.md
inbox :: items waiting on someone :: .hivemind/inbox.toon
```

Usage grammar: the `bee glossary` stanza of the shared USAGE block.

## Task 5: close-time — real conversions, stamp pass, first compact (D6, D7)

**Files:** create `.hivemind/memory/memory.toon` (empty-store header line only if the format needs one — otherwise no file until first add) · create `.hivemind/glossary.toon` (converted) · modify `.hivemind/logbook/*` (stamped; P0–P4 compacted) · modify `skills/GLOSSARY.md` (regenerated view + script-owned marker)
**Depends on:** task-1, task-2, task-3, task-4
**Provides:** our real stores live; the repo runs on its own P5 tooling

**Runs at phase close — AFTER the keeper's phase-end sign-off, BEFORE `bee phase close 5`, on the phase branch.** Until then our real files stay untouched (D6).

- [ ] Step: `bee logbook stamp` over the real logbook (70 entries; ~64 lack machine blocks). Expect a hand-fix list (D4): hand-fix each named file's missing fields, re-run until exit 0. Hand-fixes are additive machine blocks only — prose bodies unchanged.
- [ ] Step: `bee glossary convert skills/GLOSSARY.md` — real conversion; resolve the hand-fix list (duplicate/odd bullets) by hand-deciding the surviving gist (judgment, keeper-adjacent: when two gists conflict, keep the one matching current law and note the conflict in the task's logbook entry). View regenerates; verify the marker line landed and the view is alphabetical.
- [ ] Step: `bee logbook compact <n>` for each closed phase P0–P4 (D7) — `--check` first, then run; verify second runs exit 0 (idempotence on real data).
- [ ] Step: run `bash scripts/structure-check.sh .` (0 findings — proves the map line from Task 4 covers the real files) and `node --test tests/*.test.mjs` — all pass.
- [ ] Step: dogfood the reads once on real stores: `bee logbook index`, `bee glossary keeper` — both exit 0 with sane output.
- [ ] Commit: `convert real stores, stamp logbook, compact closed phases`

## Phase exit

Suite green (`node --test tests/*.test.mjs`), structure check 0 findings, all five task checks pass, Task 5's real-store conversions done on the phase branch. Keeper phase-end sign-off by decisions (one card per live-alternative call; never a bulk sign-off while disputes remain). Then `bee phase close 5` (from the main checkout: gate → no-ff merge → rest → delete → card → push). The tidy pass (D8) is NOT part of this plan: close-time step on the keeper's word, run with this phase's tooling, governed by the design's sweep criterion ("does carrying it forward teach the right behavior?").

**Determinism split (ADR-014):** everything structural — ids, series, stamps, headers, index derivation, compaction, conversion, view regeneration — is script work, all of it in `bin/bee.js`. Agent judgment kept: gist and term text, what counts as a lesson or fact, conversion hand-fix rulings on conflicting gists. Pruning and curation are the keeper's.

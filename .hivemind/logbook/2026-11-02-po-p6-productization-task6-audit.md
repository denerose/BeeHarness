# Task 6 audit — AXI compliance pass over every bee command family

Plan: .hivemind/plans/2026-11-02-po-p6-productization.md (Task 6)
Principles: docs/AXI.md (1 token-efficient · 2 minimal schemas ·
3 truncation · 4 aggregates · 5 definitive empty states · 6 structured
errors · 7 ambient context · 8 content first · 9 contextual
disclosure — mutations only, per the plan-time ruling · 10 consistent
help).

Scope: report · init · inbox · park · memory · design · capture ·
logbook · glossary · verify · task · guidance · phase · suggest ·
worktree (15 families). Evidence cited per row: line numbers are
bin/bee.js at the task-6 start (b7383a7) unless a file is named;
✖ = gap (fixed this task), ✔ = compliant, ruled = judged compliant
with reason (no change).

## Gap table (every ✖ was fixed; no row escalated)

| # | family | principle | verdict | evidence | action taken |
|---|--------|-----------|---------|----------|--------------|
| 1 | report | 10 | ✖ | no per-family usage; `bee report help` / `--bogus` returned a raw parseArgs TypeError (cmdReport had no help branch, no usage const) | added REPORT_USAGE + `report help` + reportUsageErr on flag errors |
| 2 | report | 9 | ✖ | write output `bee report: wrote <path>` (L~990) carried no next step | appended `next: surface <path> to the keeper` |
| 3 | init | 10 | ✖ | same as report: raw TypeError on `bee init help` / unknown flag | added INIT_USAGE + `init help` + initUsageErr |
| 4 | init | 9 | ✖ | only the scaffold-touched path printed a next line (L~615); write runs that registered the machine store without scaffolding (idempotent re-run, harness-repo skip L~441) ended bare | every write-mode run now ends with exactly one next line: commit-hint when scaffold touched, else `bee init: next — bee init --check reports registration + drift`; --check stays lean |
| 5 | inbox | 9 | ✖ | `done` output `IN-001 done` (L~1350) — mutation, no hint | inline `— bee inbox render refreshes the status view` |
| 6 | inbox | 9 | ✖ | `render` output `region updated — <path>` (L~1470) — mutation, no hint | appended `next: bee report renders the keeper digest` |
| 7 | park | 9 | ✖ | `resolve` output `PL-001 resolved` (L~1935) — mutation, no hint | inline `— bee park list` |
| 8 | design | 9 | ✖ | scripts/design.sh `implement` echoed only the transition line (terminal transition, no hint) | script appends `next: bee design status shows the family` |
| 9 | capture | 10 | ✖ | `bee capture help` recorded a *thought* named "help" (cmdCapture treated every positional as text) — help unreachable the standard way | `capture help` → CAPTURE_USAGE, exit 0, nothing recorded |
| 10 | logbook | 9 | ✖ | `stamp` success output (counts + stamped:/topped-up: lines) — writes, no hint | appended `next: bee logbook index shows the derived view` on real writes only (not --check, not the 0-work run) |
| 11 | logbook | 9 | ✖ | `compact` success output — rewrites entries, no hint | appended `next: bee phase close <phase> --check` on real writes only |
| 12 | glossary | 9 | ✖ | `convert` output (store:/view: lines) — mutation, no hint | appended `next: bee glossary lists the terms` |
| 13 | verify | 9 | ✖ | runs that wrote logbook entries ended `logbook: <file>` with no next step | one hint when entries were written: `next: bee task move <plan> <task-n> done --record <entry above>` |
| 14 | task | 9 | ✖ | `move` success output (state · ts · plan) — mutation, no hint | appended `next: bee task show <plan-path>` |
| 15 | phase | 9 | ✖ | close card ended at step 6 push — mutation, no hint | appended `next: bee phase list shows what remains` (real runs; --check preview stays lean) |
| 16 | suggest | 10 | ✖ | `bee suggest help` filed a suggestion whose text is "help" | `suggest help` → SUGGEST_USAGE, exit 0, nothing filed |
| 17 | worktree | 9 | ✖ | create/merge/abandon carried no next step | one hint each, on **stderr**: create `next — cd <wt>`, merge `next — bee phase close <n> --check`, abandon `next — create a fresh task branch when the task restarts`. stdout unchanged — create's stdout is the bare worktree path (machine contract; P1 outweighs P9 there, mirroring the plan's own read-surface ruling) |

Headline: 15 families audited · 17 gaps found · 17 fixed · 0 escalated.

## Ruled compliant (recorded judgments, no change)

- **P5 empty states, every list surface** — all print an explicit
  0-line: inbox `0 items` · park `0 parked` · memory `0 entries` ·
  glossary `0 terms` · guidance `0 topics` · phase `0 phases` ·
  logbook index/stamp `0 entries` (+ `nothing to stamp`) · compact
  `0 entries` · task `0 tasks` · verify `0 checks` · design status
  `0 designs` (script) · inbox render region `0 open`. No ambiguous
  empties found.
- **Empty-state "add one:" pointer lines kept** — P5 requires the
  explicit 0-count; the single pointer line is part of that
  definitive empty state (predates this pass, uniform across
  families). The plan's lean ruling governs populated list outputs;
  no populated list gained a hint.
- **P9 idempotence guards** — second `inbox done` / `park resolve`
  stay bare no-op notes (`already done` / `already resolved`), and
  `--check` previews never hint: a no-op or preview is a read.
- **logbook index 5-field line kept** — the line IS the machine
  header projection (P4); splitting fields behind flags would force
  a round trip against P4/P2's purpose.
- **suggest --harness kept** — `triage happens harness-side` is the
  disclosure; no agent-side next command exists to suggest.
- **P10 families already conforming** — inbox, park, memory, design,
  logbook, glossary, verify, task, guidance, phase, worktree all
  carry a per-family usage block; misuse and unknown subcommands
  print it; `<family> help` exits 0 with it; top-level `bee help`
  lists all.
- **P8 content first** — every bare invocation shows live data
  (inbox/park/memory/design/logbook/glossary/guidance/phase list;
  report/init do the work) or legitimately demands its required
  argument (verify --plan, task show, capture/suggest text,
  worktree subcommand). No family dumps help where data exists.
- **P1–P4, P6, P7** — TOON-ish compact lines throughout; list rows
  carry 2–4 default fields with --full escape hatches; truncation
  with size hints (truncText); counts/verdicts ride outputs
  (aggregates first line); strict parseArgs fails loud on unknown
  flags everywhere; init installs integrations (skills
  registration) first and offers on-demand surfaces (glossary/
  guidance pointers in the managed block) after — P7 by
  construction (task 3).

## Fix list (files touched)

- bin/bee.js — rows 1–7, 9–17 (usage blocks, help branches, hint
  lines; behavior otherwise unchanged).
- scripts/design.sh — row 8.
- tests/ — every fix is asserted: bee.test.mjs (report),
  bee-init.test.mjs, bee-inbox.test.mjs (inbox done/render +
  capture help), bee-park.test.mjs, bee-logbook.test.mjs,
  bee-glossary.test.mjs, bee-verify.test.mjs, bee-task.test.mjs,
  bee-phase.test.mjs, bee-worktree.test.mjs, bee-design.test.mjs,
  bee-suggest.test.mjs. 18 new tests; suite 330 → 348.

## Verification

- Task check (five-family suite): 37/37 pass.
- Full suite `node --test tests/*.test.mjs`: 348/348 pass
  (baseline 330 + 18 new).

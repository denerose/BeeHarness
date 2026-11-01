# Handoff — project-orchestrator

**Updated:** 2026-11-01 (night) · **Mode:** refresh handoff, mid-phase
— no parking sweep (the phase is opening, nothing ended).

## Working mode, read first

You are the **project-orchestrator** (mandate:
`roles/project-orchestrator.md`). You run the build track:
bee-plan, the loop, task-orc dispatches, verify/review gates,
phases. Design decisions are NOT yours — but inside a directed
phase, execution judgment is yours: made, recorded, then reviewed
as decisions.

**First action: run the bee-loop on the gated P5 plan.** The
plan passed its gate (four rounds, r4 PASS); the spine `phase/5`
is cut at `1cc1092`; the phase row is claimed. Dispatch Task 1
and Task 2 in parallel (both independent), then T3 (depends T2),
T4 (independent), T5 last (close-time, after keeper sign-off).
Do NOT re-interview the keeper — the kickoff rulings D1–D8 are
recorded in the plan header and bind the loop.

**Card law (keeper-corrected twice, now in the role file):**
multi-decision asks go one card at a time, or ONE block whose
only options are sign-all vs work-through. Phase-end sign-off:
one card per judgment call with a live alternative; never a bulk
sign-off while disputes remain.

## Task state

- **P5 OPEN** (keeper relay 2026-11-01 evening): memory system +
  logbook hygiene + glossary store.
- **Plan:** `.hivemind/plans/2026-11-01-po-p5-memory-logbook-glossary.md`
  — 5 tasks, phase validation, mixed detail, `Reviewed:` stamped
  (r1–r4 arc recorded there; four gate reports in
  `.hivemind/logbook/…-plan-review-r{1..4}.md`).
- **Kickoff ruled:** D1–D8 (supersede role-gated; ME-<role>-NNN
  ids; --type explicit; stamp fail-loud + hand-fix list; glossary
  view KEPT script-owned concurrent; conversions tests-only till
  close; first compact = all closed phases incl. P7; tidy pass =
  close-time on keeper's word). Design addenda carry all but D4 —
  D4 rides the plan header until PP rectifies (relayed).
- **Spine:** `phase/5` cut in `/home/saphron/BeeHarness-phase3`
  at `1cc1092`, tree clean. Sync spine with main before EVERY
  dispatch (standing rule).
- **Pre-pickup seam fixed:** park id generator now maps role
  names to initials (`49c4189`); live entry renamed `PL-PP-014`.
- **Relays out:** two batches to PP on status.md (`f5c8d8d`,
  `417e0d9`) — class-C boundary feedback, seam ack, kickoff
  deltas, P8 numbering flag. PP digested them (`6dc0392`) and
  landed the card-shape law in the role file (`7976ca1`).
- **Calibration standing:** P4's 15 >> 8 signal — front-load
  decisions at dispatch; the kickoff front-loaded 8.

## Boot sequence

1. This file
2. `git pull --rebase --autostash`; re-read changed law files
   (AGENTS.md, roles/, skills/GLOSSARY.md) — PP lands mid-flight
3. `.hivemind/sessions/project-orchestrator.md` — entry 64 is the
   P5 planning+gate account (entries 60–63: pickup, rulings,
   relays)
4. `.hivemind/status.md` — cross-role surface; the [PO] P5 note
   is current
5. `.hivemind/phases/BeeHarness.md` — P5 row: in-progress, plan
   linked, owner claimed
6. The plan itself, whole: `.hivemind/plans/2026-11-01-po-p5-memory-logbook-glossary.md`

## Mechanics (P4-proven, unchanged)

- **Spine:** `/home/saphron/BeeHarness-phase3` on `phase/5`.
  Tasks: `bash scripts/worktree.sh create <phase>-<slug>` FROM
  the phase worktree; **create takes `<phase>-<slug>`, merge
  takes SLUG ONLY**. Close: `bee phase close 5 --root
  /home/saphron/BeeHarness` from main.
- **State moves:** `bee task move <plan> <n> <state> --origin
  project-orchestrator`; done needs `--record <verify-entry>`.
- **Verify records:** `node bin/bee.js verify --plan <plan>
  --task <n> --role project-orchestrator` (scoped success writes).
- **Verify worker commit claims (git log) BEFORE worktree.sh
  merge.** All bee commands take `--check`.
- **NODE_TEST_CONTEXT hazard:** bee's check runners strip it —
  covered in verify and phase-suite paths.
- Dispatch briefs: template at
  `skills/loop/bee-loop/assets/dispatch-brief-template.md`
  (safety lines included). Gate/dispatch budget: 900s +
  write-the-report-anyway instruction.
- Role trailer on every commit. Absolute paths to the keeper.
  Shared surfaces from main checkout, atomic, push promptly.

## Environment notes

- Node 24, suite 240/240 green at `1cc1092`; structure 0
  findings.
- PP was LIVE through this session (landed 6dc0392, 7976ca1
  mid-flight) — expect more; status.md edits commit immediately.
- The logbook now holds this plan's four review reports — they
  are out-of-scope names for stamp (the plan's census clauses
  say so; numbers grow one per review round).
- `bee report` real regen stays gated on the keeper's word
  (ADR-008 interim note).

## Wake prompt — paste into the new context

```markdown
You are the project-orchestrator for BeeHarness, fresh context,
same role (mandate: roles/project-orchestrator.md). Repo:
/home/saphron/BeeHarness — pull --rebase --autostash first.

Pick up in order:
1. .pi/handoff-project-orchestrator.md — P5 open: plan gated,
   spine cut, loop is next
2. .hivemind/sessions/project-orchestrator.md — entry 64 (the
   planning + four-round gate account)
3. .hivemind/status.md — your P5 note is current
4. .hivemind/phases/BeeHarness.md — P5 row claimed
5. The plan whole:
   .hivemind/plans/2026-11-01-po-p5-memory-logbook-glossary.md

Then announce the role and run the bee-loop on the P5 plan:
dispatch Tasks 1+2 in parallel (independent), T3 after T2, T4
independent, T5 close-time only (after the keeper's phase-end
sign-off, before `bee phase close 5`). Kickoff rulings D1–D8 are
in the plan header and bind execution — no re-asking. Sync the
spine (phase/5 in /home/saphron/BeeHarness-phase3) with main
before every dispatch. Front-load execution decisions at each
dispatch; phase-end sign-off is one card per judgment call,
never bulk. The files carry the content; this prompt is the
pointer.
```

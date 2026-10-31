# Handoff — project-orchestrator

**Updated:** 2026-11-01 00:35
**Previous:** 2026-10-25 13:06 (P2-era; much has landed since — trust
this file over that one)

## Working mode — read this before the task state

You are the **project-orchestrator** (mandate:
`roles/project-orchestrator.md`; FORMING — you are the model this role
gets codified from). You run the build track: bee-plan, bee-loop,
task-orc dispatches (ADR-011), verify/review gates, phase tracking
under the ADR-012 topology. Design decisions are NOT yours — escalate
to the keeper (who routes to the power-planner). Announce the role in
your first reply; don't re-interview the keeper.

## Boot sequence (in order)

1. This file
2. `/home/saphron/BeeHarness/.hivemind/status.md` — cross-role surface
3. `/home/saphron/BeeHarness/.hivemind/sessions/project-orchestrator.md`
   — your session memory (entries 1–42; 36–42 are the live ones)
4. `AGENTS.md`, `skills/GLOSSARY.md`, then the phase list
   (`.hivemind/phases/BeeHarness.md`)

## Current State

All assigned work complete and pushed (origin = see `git log`; P3
closed at `355e2a6` + hindsight/handoff commits after).

### Completed this session (2026-10-25 → 11-01)
- **P2**: `bee` CLI stub (`bee report` + `bee init`), 3 review
  rounds, first REAL `bee report` run in production (keeper's word)
- **P2 retrospective** → task-orc design data → **ADR-011 accepted**
  (task-orc, first dispatched role; boundary test = formalization
  gate)
- **P3**: git topology live per ADR-012 (phase/3 spine, task
  worktrees, `scripts/task.sh` create/merge/abandon), dispatch-brief
  template in bee-loop assets, **first task-orc dispatch — boundary
  test HELD** (dispatcher never opened a source file; context cost =
  one digest). Calibration index for PP's codification:
  `.hivemind/logbook/2026-10-31-po-p3-calibration.md`
- Hindsight batches filed (P2: 3 files; P3: 2 files — checkbox
  discipline, pin-cwd safety line); PL-PO-002 parked (bee init
  worktree registration)
- Standing lessons: relays are conveniences, not gates — self-serve
  from ADRs/design/phase queue (keeper correction, entry 41); README
  is not a worklog, README edits are PP's lane (entry 39)

### In Progress
- Nothing mid-flight. Waiting on others:
  - Keeper: task-orc codification go-ahead (routes to PP with the
    calibration index); P3 sampling if wanted (dispatch record +
    boundary verdict are the reads)
  - PP: P4 design (decisions inbox — absorbs status.md + report
    generation into the bee CLI)
  - Queue: P4 (needs PP design), P5 (gated by PL-002 unpark)

### Not Yet Started
- P4/P5 builds; phase-4 spine (roll the persistent worktree from
  phase/3 — see known issues); wrap-scale full-session hindsight

## Key Decisions (this session's, already recorded — don't re-decide)

- ADR-011/012/013 landed and executed; ADR-009 phase queue is the
  forward-planning artifact (propose-next rule applies when the board
  looks empty)
- Boundary discipline for dispatches: dispatcher reads digests +
  logbook + git stat only; running shipped tools is fine, opening
  sources is not
- Per-task checkbox updates only — batch partition-slice edits caused
  an ADR-006 violation on main (repaired `7e8c0a4`; never again)
- Record timestamps: read `date`, never estimate

## Known Issues

- Paseo renders chat-quoted relative paths as links; dot-dir paths
  404 — ABSOLUTE paths to the keeper in chat
- Phase worktree `/home/saphron/BeeHarness-phase3` still has phase/3
  checked out (merged clean); P4 must roll it to phase/4 or re-cut
- Nested dispatch limits: task-orc's subagent surface lacked the
  `worker` type (review fell back to scout) — calibration data in the
  P3 index; PP's codification lane

## Important Files

- `.hivemind/status.md` — cross-role surface; update on change, [PO]
  prefix; commit shared-surface edits immediately (ADR-007 amd 1)
- `.hivemind/sessions/project-orchestrator.md` — your memory
- `.hivemind/phases/BeeHarness.md` — P0–P3 done; P4–P6 queued
- `.hivemind/logbook/2026-10-31-po-p3-calibration.md` — codification
  input for PP
- `skills/bee-loop/assets/dispatch-brief-template.md`,
  `scripts/task.sh` — the P3 tooling

## Environment Notes

- Same as before: denerose-pi identity, `pull --rebase` (autostash
  for the shared checkout's concurrent edits), `Role:` trailers,
  selective staging; `paseo` CLI not on bash PATH
- Node 24 (npm test = `node --test tests/*.test.mjs`); git 2.47.3

## Close-out (ritual split — GLOSSARY: handoff)

Refresh handoff: memory sync only (session file current through
decision 42 + hindsight logged). No parking-lot sweep — work-close
ritual, threads open, board current on status.md.

## Wake prompt — paste into the new context

```markdown
You are the project-orchestrator for BeeHarness, fresh context, same
role (mandate: roles/project-orchestrator.md — the model it gets
codified from; FORMING). Repo: /home/saphron/BeeHarness — pull
--rebase first.

Pick up in order:
1. .pi/handoff-project-orchestrator.md — state of the build track
2. .hivemind/sessions/project-orchestrator.md — your session memory
3. .hivemind/status.md — cross-role surface

Then announce the role and your first move in your first reply — do
not re-interview the keeper. P0–P3 are done; nothing is mid-flight.
The forward queue (P4/P5) and open waits are in the handoff's "In
Progress"; the phase queue is the propose-next source if the board
looks empty. The files carry the content; this prompt is the pointer.
```

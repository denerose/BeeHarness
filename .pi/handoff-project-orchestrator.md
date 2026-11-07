# Handoff — project-orchestrator

**Updated:** 2026-11-07 · **Mode:** keeper-directed handoff, phase closed clean + hindsight filed + all session work landed — no parking sweep (T12-discovery suggestion covers the one gap; no threads in flight).

## Working mode, read first

You are the **project-orchestrator** (mandate:
`roles/project-orchestrator.md`). You run the build track:
bee-plan, the loop, task-orc dispatches, verify/review gates,
phases. Design decisions are NOT yours — but inside a directed
phase, execution judgment is yours: made, recorded, then reviewed
as decisions.

**First action: take the keeper's direction.** The board's next
queued work is **P9** (keeper-secretary — design done, at
`.hivemind/designs/2026-11-01-pp-keeper-secretary.md`). Do not open
a phase without the keeper's word. IN-001 (tier-confirm) is PP's
ask, not yours — leave it.

**Card law (keeper-corrected, in the role file):** one decision per
card, or ONE block whose only options are sign-all vs
work-through-one-by-one; never bulk sign-offs; own-lane work is
never asked (suggestions, inbox, session upkeep — do, disclose
after). **Keeper-facing blocks are final artifacts** — deltas arrive
as standalone addenda, never splice requests.

**Loop law that earned repeats this phase:** blocking review
findings are ALWAYS re-reviewed; should-fixes may be waived only
with a recorded reason (near-verbatim reviewer fix + probe
replicated); after any manual conflict resolution, run the FULL
suite before the merge commit — and grep the plan's `task-N: done`
line count after plan-state unions.

**New this phase (landed in the skills):** the close checklist
rides bee-loop's step 8; the record rule routes box-ticks through
`bee task move`; the dispatch-brief template carries 4 safety
lines + gate budget + relayed-claims; census helper at
`scripts/plan-census.sh`; the session instruments live in
`skills/thinking/`.

## Task state

- **P8 COMPLETE + CLOSED** (merge f2ab9bf; row done; designs
  stamped; tidy pass done). All 29 checklist items dispositioned,
  17 tasks, 22 decisions (13 front-loaded + 9 in-phase;
  front-loading held). Suite 386, structure 0.
- **Session's hindsight: 5 suggestions filed** at
  `.hivemind/suggestions/2026-11-07-po-*.md` — the most
  act-on-able: last-task completeness check (T12 miss),
  reorg-updates-checks-contract (5 stale paths), and
  close-row-flip-didnt-fire (T2's mechanical tail may have a
  bug — P8's close output showed no row-flip or design-stamp
  lines).
- **T12 was discovered unexecuted at T16's review** — dispatched
  late (wave 9), verified + reviewed clean, merged. The miss and
  its fix are recorded in the plan's task notes + the hindsight
  suggestions.
- **Next:** P9 (keeper-secretary) on the keeper's word; P10+
  queued. PP's 10 P5-hindsight suggestions still await triage
  (some may have landed via P8 items; the routed ones are in
  `planned/`).

## Boot sequence

1. This file
2. `git pull --rebase --autostash`; re-read changed law files
   (AGENTS.md, roles/, skills/GLOSSARY.md) — PP lands mid-flight
3. `.hivemind/sessions/project-orchestrator.md` — entries 80-83
   are this session's arc (80 kickoff prep, 81 plan + gate, 82
   waves 1-4, 83 waves 5-9 + close)
4. `.hivemind/status.md` — the P8-complete note carries the queue
5. `.hivemind/phases/BeeHarness.md` — P8 done; P9 next
6. Check `.hivemind/suggestions/` + `bee inbox list` — IN-001
   (tier-confirm, PP's) + the 5 new hindsight items await the
   keeper

## Environment notes

- **Suite 386/386** on main; structure 0 findings.
- **Spine rested:** `/home/saphron/BeeHarness-phase3` detached at
  main (post-P8 close). Sync before cutting `phase/9`:
  `git switch -c phase/9 main` there, then UNSET UPSTREAM.
- **Task worktrees:** `node bin/bee.js worktree create 9-<slug>`
  (merged takes SLUG ONLY). The T4 worktree-merge refusal
  (untracked review report) taught: reviewers commit their reports
  on the task branch — the merge works clean when they do.
- **Dispatch briefs:** the template now carries the gate-budget
  block + relayed-claims line — use it from
  `skills/loop/bee-loop/assets/dispatch-brief-template.md`.
- **Code anchors in briefs:** T2's timeout taught — for tasks
  targeting a large file (bin/bee.js is 5500+ lines), name the
  code region in the brief; the implementer's discovery cost
  halves.
- **Verify invocation:** `bee verify --plan <RELATIVE path>
  --task <n> --role <role> --record` from the TASK worktree;
  absolute plan paths resolve to the main checkout and fail
  files: checks.
- **Known cosmetic:** task move's box-ticking is partial for later
  tasks — state lines are authoritative.
- **P8 hindsight finding worth knowing immediately:** the close
  mechanical tail (row flip + design stamps) may not have fired
  at P8's close — check `bee phase close --check` behavior before
  relying on it at P9 close. Suggestion filed.

## Wake prompt — paste into the new context

```markdown
You are the project-orchestrator for BeeHarness, fresh context,
same role (mandate: roles/project-orchestrator.md). Repo:
/home/saphron/BeeHarness — pull --rebase --autostash first.

Pick up in order:
1. .pi/handoff-project-orchestrator.md — P8 closed + hindsight
   filed + all session work landed; the board waits on the
   keeper's word
2. .hivemind/sessions/project-orchestrator.md — entries 80-83
   (this session's arc: kickoff prep → plan + 3-round gate →
   9-wave loop → close + tidy pass)
3. .hivemind/status.md — the P8-complete note carries the queue
4. .hivemind/phases/BeeHarness.md — P8 done; P9 next
   (keeper-secretary, design ready); P10+ queued

Then announce the role and hold for the keeper's direction — P9
(keeper-secretary) is the queue's next phase, but it opens only on
their word. IN-001 (tier-confirm) is PP's ask, not yours. Five
P8-hindsight suggestions filed — the keeper may triage them
before or alongside P9. Card law and loop law are in the handoff's
working-mode section — read them before your first card. The
files carry the content; this prompt is the pointer.
```

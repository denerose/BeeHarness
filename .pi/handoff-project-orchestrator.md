# Handoff — project-orchestrator

**Updated:** 2026-11-07 · **Mode:** keeper-directed handoff, phase
closed clean + session work all landed — no parking sweep (nothing
open to sweep; no threads in flight).

## Working mode, read first

You are the **project-orchestrator** (mandate:
`roles/project-orchestrator.md`). You run the build track:
bee-plan, the loop, task-orc dispatches, verify/review gates,
phases. Design decisions are NOT yours — but inside a directed
phase, execution judgment is yours: made, recorded, then reviewed
as decisions.

**First action: take the keeper's direction.** The board's next
queued work is **P8** (rectification + ship-tier — keeper-ruled
2026-11-02: P6 first, then P8; P7's out-of-order run was a special
case). Do not open a phase without the keeper's word.

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
line count after plan-state unions (a wave-2 union silently
dropped two state lines this phase; the suite cannot see them).

## Task state

- **P6 COMPLETE + CLOSED** (close merge `b7e7397`; stamp `721c193`;
  pushed; suite 348/348, structure 0). Shipped: full `bee init`
  contract (green-fields scaffold, managed AGENTS.md block,
  consumer config), `~/.bee` machine store + version pins
  (registered-commit + informational drift), `bee suggest`
  (project-local + `--harness` channel), `bee worktree` (fold; the
  script is GONE), AXI pass (15 families, 17 gaps closed), adoption
  doc (`docs/adoption.md`) + dogfood config. 19 decisions; keeper
  sign-off: 3 keep-as-built + cleanup-at-close + PP suggestion.
- **Session's other closed work:** tidy pass D8 (entry 72),
  P6 kickoff (D1-D4, one PP relay pause), plan gated 3 rounds,
  7-task loop (9 cold reviews, 4 blocking fixed), close ceremony.
- **Dogfood cleanup executed:** settings skills pruned to one
  entry; re-register from main went DRIFTED→in-sync live.
- **Next:** P8 on the keeper's word (rectification + ship-tier;
  inputs at `.hivemind/designs/2026-11-01-pp-p8-rectification-inputs.md`,
  13 items + accumulated). P9+ queued. **PP triage pending** on 11
  suggestions (10 P5 hindsight + `2026-11-07-po-settings-skills-lifecycle.md`
  — keeper-directed at close).

## Boot sequence

1. This file
2. `git pull --rebase --autostash`; re-read changed law files
   (AGENTS.md, roles/, skills/GLOSSARY.md) — PP lands mid-flight
3. `.hivemind/sessions/project-orchestrator.md` — entries 71-78
   are this session's arc (71 pickup, 72 tidy, 74 kickoff complete,
   75 plan+gate, 76 wave 1, 77 wave 2, 78 close)
4. `.hivemind/status.md` — the [PO] P6-complete note carries the
   queue
5. `.hivemind/phases/BeeHarness.md` — P6 done; P8 next
   (keeper-ruled), then P9+
6. Check `.hivemind/suggestions/` + status surface — if PP triaged
   (11 open), graduation outcomes may have landed law

## Mechanics (P6-current)

- **Spine:** `/home/saphron/BeeHarness-phase3` (rested, DETACHED at
  main — sync before cutting `phase/<n>`: `git switch -c phase/<n>
  main` there, then UNSET UPSTREAM — a tracking spine could push to
  main). Tasks: `node bin/bee.js worktree create <phase>-<slug>`
  (the script `scripts/worktree.sh` is GONE — merged takes SLUG
  ONLY). Gate/review dispatches get 900s+ and write-anyway.
- **Verify:** `node bin/bee.js verify --plan <RELATIVE plan path>
  --task <n> --role project-orchestrator --record` from the TASK
  worktree (absolute plan paths resolve to the main checkout and
  fail on files: checks). FAIL runs with --record never print the
  task-move hint (P6 fix).
- **Decisions inventory** (close gate): `.hivemind/logbook/<plan-
  slug>-decisions.toon` — `#` comment lines ONLY (bare `phase:`
  lines fail the parser), `id · one-line · source-record-path`
  lines with the MIDDLE-DOT separator (periods fail). Then `bee
  phase inventory <n> --decisions <file>`, then `bee phase close
  <n>` FROM MAIN. After close: flip the row + stamp designs
  (`scripts/design.sh pick-up <doc> --phase <n>` then `implement
  … --merge <hash>`) — the close command does NOT do these.
- **Real machine:** `~/.bee/registry.toon` live (one entry,
  /home/saphron/BeeHarness @ b7e7397); drift line is informational
  (exit 0) by D3. `~/.pi/agent/settings.json` has ONE skills entry
  (pruned at close). Suite writes never touch ~/.bee (task-1
  hygiene: --machine tmp).
- **Known cosmetics:** `bee task move`'s box-ticking is partial for
  later tasks (task-7: 1 of 6 boxes ticked) — state lines are
  authoritative; don't hand-tick script-owned boxes.

## Environment notes

- Node 24; suite **348/348** on main; structure 0 findings.
- P8's sweep VERIFIES what landed in P7's output rather than
  assuming, then applies idempotently — same discipline applies to
  P6's output now that it's on main.
- The close flag fired on decisions count again (19 > ~8) — but
  in-phase rulings were all review-driven, not kickoff gaps; the
  calibration note rides the phase row.
- `bee init` from the harness repo itself: harness-skip line, no
  scaffold; from a worktree of the harness: same (common-dir
  identity — keeper-ruled keep-as-built at P6 close).

## Wake prompt — paste into the new context

```markdown
You are the project-orchestrator for BeeHarness, fresh context,
same role (mandate: roles/project-orchestrator.md). Repo:
/home/saphron/BeeHarness — pull --rebase --autostash first.

Pick up in order:
1. .pi/handoff-project-orchestrator.md — P6 closed + session work
   landed; the board waits on the keeper's word
2. .hivemind/sessions/project-orchestrator.md — entries 71-78
   (this session's arc: pickup, tidy pass, P6 kickoff → plan →
   gate → 7-task loop → close)
3. .hivemind/status.md — the P6-complete note carries the queue
4. .hivemind/phases/BeeHarness.md — P6 done; P8 next
   (keeper-ruled), then P9+

Then announce the role and hold for the keeper's direction — P8
(rectification + ship-tier) is the queue's next phase, but it
opens only on their word. Check whether PP triaged the 11 open
suggestions (10 P5 hindsight + the settings-lifecycle one filed at
close); graduation outcomes may have landed law. Card law and
loop law are in the handoff's working-mode section — read them
before your first card. The files carry the content; this prompt
is the pointer.
```

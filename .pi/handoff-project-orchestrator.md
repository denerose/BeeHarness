# Handoff — project-orchestrator

**Updated:** 2026-11-02 · **Mode:** keeper-directed handoff, phase
closed + hindsight filed — no parking sweep (closing work done).

## Working mode, read first

You are the **project-orchestrator** (mandate:
`roles/project-orchestrator.md`). You run the build track:
bee-plan, the loop, task-orc dispatches, verify/review gates,
phases. Design decisions are NOT yours — but inside a directed
phase, execution judgment is yours: made, recorded, then reviewed
as decisions.

**First action: take the keeper's direction.** The board is
empty of directed work; two open items await the keeper's word —
the **tidy pass** (D8, P5's close-time step, on the keeper's word
only) and the **next phase** (propose-next issued: P8
recommended — gate satisfied, completes before P6, and its
rectification sweep now covers P5's output too). Do not open a
phase or run the tidy pass without the keeper's direction.

**Card law (keeper-corrected, now in the role file):**
multi-decision asks go one card at a time, or ONE block whose
only options are sign-all vs work-through. Phase-end sign-off:
one card per judgment call with a live alternative; never bulk.
**Own-lane work is never asked:** filing suggestions, inbox
adds, session upkeep — do them, disclose after (P5 correction,
entry 68). **Keeper-facing blocks are final artifacts** — never
ask the keeper to edit/splice; deltas arrive as standalone,
correctly-sized addenda.

## Task state

- **P5 COMPLETE** (close merge `f0766ee`; row flipped `1828bbd`;
  both designs stamped implemented; status note `fb2ce04`).
  Shipped: `bee memory`, `bee logbook stamp/index/compact`,
  `bee glossary` + script-owned rendered view (the live-view
  fence: GLOSSARY.md regenerates only via the real store path).
  Close-time done: 59 logbook files stamped (27 hand-fix
  blocks), real glossary converted (46 terms), P0–P4+P7
  compacted. Suite 307/307, structure 0.
- **Hindsight run** (keeper-asked): **10 suggestions filed** at
  `.hivemind/suggestions/2026-11-02-po-*.md` — close-sequence
  codification, decisions-inventory format, union-merge suite
  gate, marker-surgery-is-edit-tool, plan-time census, handoff
  scheduling guard, close-flag kickoff split, relayed-claims
  verification, hindsight-never-asks-to-file, relays-are-final.
  Two relay blocks passed to PP (via the keeper). PP triage
  pending.
- **Standing lessons from the P5 loop** (session entries 60–67,
  the detail lives there): conflict-marker surgery is edit-tool
  work; full suite after any union merge BEFORE committing;
  relayed pass-back claims get verified before entering briefs;
  plan corpus counts get derived, not hand-counted.
- **Board:** P8 ready (P7 done; row says completes before P6);
  P6 next after; P9+ queued. Tidy pass pending (D8).
- **Session corrections this arc:** premature handoff (runs to
  phase completion — context managed by delegation), hindsight
  filing reflex, text-gopher pattern. All logged; the handoff
  scheduling guard suggestion addresses the first structurally.

## Boot sequence

1. This file
2. `git pull --rebase --autostash`; re-read changed law files
   (AGENTS.md, roles/, skills/GLOSSARY.md) — PP lands mid-flight
   (happened repeatedly through P5)
3. `.hivemind/sessions/project-orchestrator.md` — entries 60–68
   are the P5 arc (60 pickup, 62 kickoff, 64 gate, 66 loop,
   67 close, 68 hindsight correction)
4. `.hivemind/status.md` — the [PO] P5-complete note carries the
   propose-next
5. `.hivemind/phases/BeeHarness.md` — P5 row done; P8/P6 rows
   carry their inputs
6. If PP triaged the suggestions (check `.hivemind/suggestions/`
   + status surface) — graduation outcomes may have landed law

## Mechanics (P4/P5-proven)

- **Spine:** `/home/saphron/BeeHarness-phase3` (rested, detached
  at the P5 close merge — sync with main before cutting
  `phase/<n>`: `git switch -c phase/<n> main` there). Tasks:
  `bash scripts/worktree.sh create <phase>-<slug>` FROM the
  phase worktree; **create takes `<phase>-<slug>`, merge takes
  SLUG ONLY**. Close: assemble the decisions inventory FIRST
  (see below), then `bee phase close <n> --root
  /home/saphron/BeeHarness` from main.
- **Decisions inventory** (the close gate demands it): one file
  at `.hivemind/logbook/<plan-slug>-decisions.toon` — `#`
  comment header lines ONLY (bare `phase:` lines fail the
  parser), then `id · one-line · source-record-path` lines; then
  `bee phase inventory <n> --decisions <file>`. After close:
  flip the phase row + stamp designs (`scripts/design.sh
  pick-up <doc> --phase <n>` then `implement … --merge <hash>`)
  — the close command does NOT do these (suggestion filed).
- **State moves:** `bee task move <plan> <n> <state> --origin
  project-orchestrator`; done needs `--record <verify-entry>`.
  Waivers: one-line reason in the plan's task notes.
- **Verify:** `node bin/bee.js verify --plan <plan> --task <n>
  --role project-orchestrator` (scoped success writes; append
  probe evidence to the entry body for fix rounds). Unscoped
  runs write nothing.
- **Merges:** verify worker commit claims (`git log`) BEFORE
  `worktree.sh merge`; union-resolve plan state lines and
  inserted sections with the EDIT TOOL (never sed — P5
  incident); **run the full suite after any manual conflict
  resolution, before the merge commit** (a clean-looking union
  dropped a return statement once; the suite caught it).
- **Dispatches:** brief template + safety lines at
  `skills/loop/bee-loop/assets/dispatch-brief-template.md`;
  gate/review dispatches get 900s + write-the-report-anyway.
  Verify every factual claim in briefs — INCLUDING claims
  relayed from pass-backs.
- Role trailer on every commit. Absolute paths to the keeper.
  Shared surfaces from main checkout, atomic, push promptly.

## Environment notes

- Node 24; suite **307/307** at close; structure 0 findings.
- PP was live through P5 (landed 6dc0392, 7976ca1 mid-flight);
  the hindsight relays are with the keeper for passing —
  PP's codification responses may land while you run.
- `bee report` real regen stays gated on the keeper's word
  (ADR-008 interim note).
- The logbook index now derives from machine headers (64
  entries at close); `bee glossary keeper` and `bee memory
  list` are the dogfood reads.

## Wake prompt — paste into the new context

```markdown
You are the project-orchestrator for BeeHarness, fresh context,
same role (mandate: roles/project-orchestrator.md). Repo:
/home/saphron/BeeHarness — pull --rebase --autostash first.

Pick up in order:
1. .pi/handoff-project-orchestrator.md — P5 closed + hindsight
   filed; two items await the keeper's word
2. .hivemind/sessions/project-orchestrator.md — entries 60-68
   (the P5 arc: pickup, kickoff, gate, loop, close, hindsight)
3. .hivemind/status.md — the P5-complete note carries the
   propose-next (P8 recommended)
4. .hivemind/phases/BeeHarness.md — P5 done; P8 ready (gate
   satisfied, completes before P6)

Then announce the role and hold for the keeper's direction —
the tidy pass (D8, on their word) and/or P8 pickup. Do not open
a phase without direction. Card law and own-lane rules are in
the handoff's working-mode section — read them before your
first card. The files carry the content; this prompt is the
pointer.
```

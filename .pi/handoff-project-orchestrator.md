# Handoff — project-orchestrator

**Updated:** 2026-11-01 (evening) · **Mode:** refresh handoff, phase
closed — no parking sweep (the phase close was the closing work).

## Working mode, read first

You are the **project-orchestrator** (mandate:
`roles/project-orchestrator.md`). You run the build track:
bee-plan, the loop, task-orc dispatches, verify/review gates,
phases. Design decisions are NOT yours — but inside a directed
phase, execution judgment is yours: made, recorded, then reviewed
as decisions.

**First action: propose-next.** P4 closed cleanly; the board is
empty of directed work. Your move is the empty-board move: one
recommendation, never a menu (ADR-009). P5 is the queue's next
(gated on PL-002 unpark — the keeper's word); P8's gate is
satisfied. Do not open P5 without the keeper's direction.

**Standing escalation rules** (adopted 2026-11-01, session entry
53): escalate decisions with live keeper-owned alternatives, two
failed fix rounds, genuine conflicts. Never artifact-reading, never
bundled, never approval-without-alternatives. **One card per
judgment call with a live alternative — never a bulk sign-off**
(keeper correction, P4 close). Directives apply live + recorded.

## Task state

- **P4 DONE** (close merge `1a78a35`, design stamp `4de5126`,
  row flip `828ff09`, status note `6bb7b06`). All 11 tasks shipped
  through the full cycle (task-orc dispatch → cold review → fix
  rounds → near-verbatim re-review waivers). First real
  `bee phase close 4` run — mechanical close worked end to end.
  Dogfood 11/11, suite 238/238, structure 0 findings. 15 decisions
  (under-asked signal: front-load harder next kickoff).
- **Shipped in P4:** `bee inbox/capture/render`, `bee park`
  (parking lot migrated live to `.hivemind/memory/parking-lot.toon`),
  `bee design` (P4 design stamped picked-up → implemented),
  `bee verify` (checks contract + link-check + structure-check),
  `bee task` (state moves with provenance + gated done), `bee
  guidance` (4 topics in `docs/guidance/`), `bee phase`
  (inventory + scripted close), `scripts/structure.map` +
  `scripts/structure-check.sh`, task.sh → worktree.sh rename.
  Stores live: `.hivemind/inbox.toon` (IN-001 open), parking lot
  in `.hivemind/memory/parking-lot.toon`. Status renders from the
  inbox; `bee report` derives from the store.
- **Keeper rulings at close:** class-C accepted + **fed back to PP**
  (may revisit — status surface carries it); task-orc codification
  accepted as written (four surgical lines).
- **Board:** P5 gated on PL-002 (memory system — keeper unparks).
  P8 gate satisfied (P7 done). Phase list carries queue order
  (`.hivemind/phases/BeeHarness.md`).
- **Open waits:** none that gate PO. PP landed several designs
  during P4 (P5 memory, P8 inputs, glossary store, automation
  levels, secretary, feedback channel — all status: live in
  `.hivemind/designs/`). PL-005 keeper-secretary direction is PP's
  lane.

## Boot sequence

1. This file
2. `git pull --rebase --autostash`; re-read changed law files
   (AGENTS.md, roles/, GLOSSARY) before acting — PP lands
   mid-flight (this happened repeatedly during P4)
3. `.hivemind/sessions/project-orchestrator.md` — entries 55-59 are
   the P4 ones; entry 59 has the close account
4. `.hivemind/status.md` — cross-role surface + your P4-done note
5. `.hivemind/phases/BeeHarness.md` — the board (P5 gated, P8
   ready)

## Mechanics (hard-won, updated for P4's tools)

- **Spine:** the persistent worktree is `/home/saphron/BeeHarness-phase3`
  (currently detached at main — rest state). When a phase opens:
  `git switch -c phase/<n> main` there, commit-first-then-branch.
  Tasks: `bash scripts/worktree.sh create <phase>-<slug>` FROM the
  phase worktree; **create takes `<phase>-<slug>`, merge takes
  SLUG ONLY**. Close: `bee phase close <n> --root /home/saphron/BeeHarness`
  from the main checkout (the command does: gate → no-ff merge →
  rest → delete → card → push). Sync the spine with main before
  every dispatch (the P4 plan made this a standing rule).
- **State moves:** `bee task move <plan> <n> <state> --origin
  project-orchestrator` — intermediate states need no record; done
  requires `--record <verify-entry>` (existence-checked). The
  checkbox rewrite + ledger lines are script-owned — never hand-edit.
- **Verify records are command-minted from Task 8 on:**
  `node bin/bee.js verify --plan <plan> --task <n> --role
  project-orchestrator` (scoped success writes; append prose
  evidence to the entry body). Unscoped dogfood writes nothing.
- **Verify worker commit claims (`git log`) BEFORE worktree.sh
  merge** — one dispatch lied by accident (P7 lesson).
- **All bee commands take `--check`** — use it for real-tree
  probing. `--root <path>` is the internal seam for running
  against the real repo from a worktree.
- **NODE_TEST_CONTEXT hazard:** bee's check runners strip it
  (a `node --test` child under a test-runner parent silently
  exits 0 red — P9 discovery, now covered in both verify and
  phase-suite paths).
- Machine headers + path-tagged blocks validated by
  `scripts/plan-checks.sh`; `--run` for suites, `--extract` for
  off-suite blocks.
- Role trailer on every commit. Absolute paths to the keeper in
  chat. Shared surfaces from main checkout, atomic, push promptly.

## Environment notes

- Node 24 (`node --test tests/*.test.mjs`, 238 tests green at
  close); git 2.47.3; bash 5.2.
- The spine worktree `/home/saphron/BeeHarness-phase3` is detached
  at `1a78a35` (the P4 close merge). When the next phase opens,
  cut `phase/<n>` from main (the worktree will need `git switch -c
  phase/<n> main` — it's at the close merge, same commit as main).
- PP may be live in the shared checkout — status.md edits commit
  immediately; keeper report regen: re-read its header protocol
  first, skip while PP mid-session unless needed.
- `bee report --check` for the keeper report; the real regen is
  gated on the keeper's word per ADR-008 (P2 stub note still
  stands — first REAL run gated).

## Wake prompt — paste into the new context

```markdown
You are the project-orchestrator for BeeHarness, fresh context,
same role (mandate: roles/project-orchestrator.md). Repo:
/home/saphron/BeeHarness — pull --rebase --autostash first.

Pick up in order:
1. .pi/handoff-project-orchestrator.md — P4 done; board empty
2. .hivemind/sessions/project-orchestrator.md — entries 55-59 (P4)
3. .hivemind/status.md — cross-role surface + P4-done note
4. .hivemind/phases/BeeHarness.md — the board (P5 gated on
   PL-002, P8 ready)

Then announce the role and propose-next: the board is empty — one
recommendation, never a menu (ADR-009). P5 is the queue's next but
gated on the keeper's PL-002 unpark; P8's gate is satisfied. Your
first card asks which. Do not open a phase without the keeper's
direction. The files carry the content; this prompt is the pointer.
```

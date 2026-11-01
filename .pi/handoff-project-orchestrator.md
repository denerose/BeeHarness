# Handoff — project-orchestrator

**Updated:** 2026-11-01 (late) · **Mode:** refresh handoff, threads
open — no parking sweep.

## Working mode, read first

You are the **project-orchestrator** (mandate:
`roles/project-orchestrator.md`; FORMING — you are the model the
role gets codified from). You run the build track: bee-plan, the
loop, task-orc dispatches, verify/review gates, phases. Design
decisions are NOT yours — but inside a directed phase, execution
judgment is yours, made and recorded, then reviewed as decisions.

**First action: open P4 with the PHASE-START KICKOFF CARD** — its
first use (session entry 53): one self-contained card (phase id,
one-line build, design state hash, gate status) + the front-loaded
decision list, each with alternatives + recommendation. Do not
re-interview the keeper beyond it. Then bee-plan → bee-plan-review
gate (the in-house reviewer — its first gated plan) → loop to
PHASE COMPLETION. Stops only at keeper decision points or genuine
end.

**Standing escalation rules** (entry 53): escalate decisions with
live keeper-owned alternatives, two failed fix rounds, genuine
conflicts. Never artifact-reading, never bundled, never approval-
without-alternatives. Directives apply live + recorded.

## Task state

- **P7 DONE** (merge 46d406a, close 5ca8599; hindsight ×2 filed:
  `suggestions/2026-11-01-po-p7-close-hindsight.md`,
  `suggestions/2026-11-01-po-session-hindsight-signoff.md`).
  Bee-native boundary closed: skilldev/loop/session kits,
  bee-plan-review + plan-checks.sh (--run/--extract), handoff
  pair, folds, namespace. **You are using its outputs right now.**
- **P4 NEXT — decisions inbox.** Design:
  `.hivemind/designs/2026-10-25-pp-p4-inbox-design.md` + its
  2026-11-01 addendum (consume BOTH at planning: born-TOON,
  absorbs status queues + suggestions awaiting-read, `bee task` +
  `bee verify` CLI, ADR-014 storage rules; NO hand conversions
  ahead of tooling). Kickoff decisions to front-load: storage
  shape (one file vs dir; suggestions merge vs sibling), aging/
  staleness, what `bee init` scaffolds — plus the P7 direction's
  fold-order note (thin-verify judgment lines survive; goes in
  P4's plan).
- **Standing rulings from P7 that bind:** all skill-review
  dimension failures BLOCK (does bee-plan-review generalize?
  PP's tier-mapping thread — don't decide unilaterally);
  near-verbatim fix-round waiver; task-branch logbook routing;
  sync-last-write/prompt-last-act; entry checks fold later via
  bee-skill-write (not piecemeal).
- **Open waits:** PP's two AGENTS.md law edits (gate rule →
  bee-plan-review; handoff rule → bee pair — window note on
  status.md stands; if landed, verify law-and-tool agree);
  PL-002 gates P5; P8 gated on P7's tier sort (done — P8 can
  queue after P4-P6 per the phase list).

## Boot sequence

1. This file
2. `git pull --rebase --autostash`; re-read changed law files
   (AGENTS.md, roles/, GLOSSARY) before acting — PP lands mid-
   flight; design moved TWICE during P7 (lesson, entry 50)
3. `.hivemind/sessions/project-orchestrator.md` — entries 43–54
   are the live ones
4. `.hivemind/status.md`, then the P4 design note + addendum

## Mechanics (hard-won)

- Spine: persistent worktree `/home/saphron/BeeHarness-phase3`
  (detached at main — cut `phase/4` there when P4 opens:
  commit-first-then-branch from main). Tasks: `scripts/task.sh`
  FROM the phase worktree; **create takes `<phase>-<slug>`, merge
  takes SLUG ONLY**. Close: REAL merge commit → detach worktree
  at main → `branch -d` (the P3 lesson; scripted close suggestion
  filed).
- Plans carry machine headers + path-tagged verbatim blocks
  (column-0 fences); plan-checks validates them; `--run` for
  suites, `--extract` for off-suite blocks. Machine targets =
  final-state paths.
- Verify worker commit claims (`git log`) BEFORE task.sh merge —
  one dispatch lied by accident (entry 50d).
- Records ride task branches (keeper decision). Shared surfaces
  from main checkout, atomic commits, push promptly. Role trailer
  on every commit. Absolute paths to the keeper in chat.

## Environment notes

denerose-pi identity; Node 24 (`node --test tests/*.test.mjs`,
34 tests green at handoff); git 2.47.3; PP may be live in the
shared checkout — status.md edits commit immediately; keeper
report regen: re-read its header protocol first, and skip while
PP is mid-session unless needed.

## Wake prompt — paste into the new context

```markdown
You are the project-orchestrator for BeeHarness, fresh context,
same role (mandate: roles/project-orchestrator.md; FORMING). Repo:
/home/saphron/BeeHarness — pull --rebase --autostash first.

Pick up in order:
1. .pi/handoff-project-orchestrator.md — P7 done; P4 ready
2. .hivemind/sessions/project-orchestrator.md — entries 43-54
3. .hivemind/status.md — cross-role surface + PP law-edit window

Then announce the role and open P4 with the PHASE-START KICKOFF
CARD (first use of the standing checkpoint — the handoff's
Working-mode section carries the card shape and the escalation
rules; the design note + addendum carry the decisions to
front-load). The keeper has already directed P4; do not re-ask
whether to start. Run to phase completion.

The files carry the content; this prompt is the pointer.
```

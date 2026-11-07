---
kit: loop
name: bee-loop
description: Executes an approved plan through implement → verify → review cycles, tracking states and escalating to the keeper when needed. Use only when explicitly directed ("run the bee-loop on <plan>"). Never infer loop entry from task size or type.
---

# bee-loop

Execute a plan. You run this skill only when the keeper (or a role
directed by the keeper) says to. Read `../../GLOSSARY.md` (the shared bee glossary, sibling of this kit folder) first.

## Setup

1. Read the plan and its design doc (if it has one). If anything in the
   plan conflicts with the design doc, escalate before starting.
2. Create or update the phase list (`.hivemind/phases/<project>.md`,
   project = repo name unless the keeper says otherwise;
   `assets/phase-list-template.md`) — your one tracking file, with an
   `owner` column for claims (GLOSSARY: claim). If the plan header
   carries a phase id, record it there.
3. Confirm the validation level from the plan header. No level stated?
   Ask before starting.

## The cycle, per task

1. **Pick and claim.** Pick the next task whose dependencies are done.
   Before a phase's first dispatch, claim the phase: write your role +
   timestamp in the phase list's `owner` column (GLOSSARY: claim), and
   re-read the phase list before writing again. Tasks are tracked by
   the plan's checkboxes, not the phase list.
2. **Implement** — yourself for small tasks; a subagent when the task is
   self-contained or benefits from isolation (fresh context, parallel
   safety). Independent tasks may run in parallel as subagents; verify
   each result before using it. Dispatched tasks work in task
   worktrees (GLOSSARY: task branch): `bee worktree create
   <phase>-<slug>` — merge takes the slug only. The persistent spine
   worktree (GLOSSARY: phase branch) rests detached at main; cut
   `phase/<n>` there from main (`git switch -c phase/<n> main`) and
   unset upstream immediately — a tracking spine could push to main.
3. **Verify** — run the **bee-verify skill** (sibling skill, see
   GLOSSARY) at the task level. Its logbook entry lands in
   `.hivemind/logbook/`. State the round in the dispatch brief (first
   run is `r1`). `bee verify --plan <relative plan path> --task <n>
   --role <role> --record` runs from the task worktree; absolute
   plan paths resolve to the main checkout and fail the `files:`
   checks.
4. **Review** — dispatch the **bee-review skill** on the finished work
   (fresh subagent when available; hand it the plan path, task id,
   changed files, and logbook entry path). Reviewer briefs carry the
   etiquette lines: findings cite evidence (file and line), no
   re-design essays — a finding names the problem and a concrete
   fix, not a preferred redesign — and tiered findings only
   (bee-review's three tiers). Review rounds count independently of
   verify rounds — the first review is `r1`. In a solo session with
   no separate reviewer, review the work yourself and say so in the
   review report — the evidence trail matters more than who wrote it.
5. **Fix rounds** — if review or verify fails: reproduce the failure
   first — run the failing check and see it fail; a fix proposed on
   an unreproduced failure is a guess. Then fix, re-verify,
   re-review. Evidence before assertions: no failure is cleared
   without the re-run's output in the record. A round is one fix
   attempt plus its re-runs; the initial failure is not a round.
   Maximum two rounds. Still failing? Escalate. Re-runs write
   versioned logbook entries — the round suffix increments (`-r2`,
   GLOSSARY: logbook versioning). A post-fix confirmation re-review
   may be waived when both hold: the fix is the reviewer's own
   suggested change applied near-verbatim, and the fix-round verify
   record replicates the reviewer's probe — it runs the check the
   reviewer used to find the finding. Record a one-line waiver
   reason in the plan's task notes. Blocking findings are always
   re-reviewed — no waiver.
6. **Record** — check off the task in the plan, update the phase list,
   commit. Stage only the files this task touched — its code changes,
   its logbook entries, the plan and phase-list updates; never `git add -A`.
   Carry a `Role:` trailer (GLOSSARY). Never hand-edit state a script
   owns: when a script owns a piece of state (checkboxes it checks off,
   lists it generates, files it rewrites), you move it by running the
   script — never by editing the state directly. Check off
   exactly the current task's boxes at its commit — never batch
   checkbox edits across task or section boundaries (a partition
   slice sweeps everything downstream); checked boxes are state
   claims and land with their own evidence. Where `bee task` owns
   a state line, the state line is authoritative; the script's
   box-ticking is cosmetic. Records ride the task branch with the
   task's diff and reach main at merge; from other checkouts,
   mid-flight records read via `git show <branch>:<path>`.
7. Repeat until the plan is done, then run **bee-verify at the phase
   level** (GLOSSARY: validation level — the full suite the plan lists)
   and report to the keeper.
8. **Close** — the checklist, in order: assemble the decisions
   inventory (`#`-comment header lines only, `id · one-line ·
   source-record-path` entries, middle-dot separators) → `bee phase
   inventory <n> --decisions <file>` → `bee phase close <n>` (gates,
   merges, flips the phase row, stamps designs, counts front-loaded
   vs in-phase decisions) → the status note for the phase → the tidy
   pass where the keeper's word directs one (bootstrap-noise paydown
   with the P5 tooling — standing authority, no per-step ask;
   disclose after) → report to the keeper.

## States

Every task moves `draft → implemented → verified → reviewed → done`.
You (the loop) move items between states, and each move needs its
record in `.hivemind/logbook/`: a verify entry to leave *implemented*,
a review report to leave *verified*. If you catch yourself advancing a
state without the entry, stop and go back.

## Escalate when

- The plan conflicts with the design doc, or reality conflicts with
  both.
- Two fix rounds didn't clear a failure.
- A decision needs authority you don't have.
- The task is done but a follow-on decision appeared (park it or ask).

Escalating = ask_user card with a recommendation, record the answer
where it applies — in the plan (task-scoped) or the phase list
(phase-scoped) — then continue. Asking is cheap; guessing is not.

## Bootstrap note

Until an automated orchestrator exists this skill runs inside a
session — today, the project-orchestrator's. Same rules, no exceptions
— the manual version is the pilot for the automated one.

## Boundaries

- No designing, no silent edits to plans or design docs.
- Never both implementer and reviewer for the same task when a separate
  reviewer is available.
- Never enters itself.

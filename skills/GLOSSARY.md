# Bee glossary

Short list of terms the bee skills use. Defined here once; skills link
here instead of re-explaining. If a word is not in this file, do not use
it as a term of art.

- **keeper** — the human owner. Final authority on every decision that
  matters; the only one who unparks parking-lot items or amends design
  docs.
- **role** — a named mandate for an agent session (authority, working
  style, entry conditions, continuity), defined in `roles/` in the
  BeeHarness plugin. Assumed by direction from the keeper or a
  handoff — never inferred from the work's shape.
- **skill** — a procedure: how a class of work gets done. Roles are
  agents (the noun); skills are instruments roles lean on (the verb).
  A skill never belongs to a role — bee-brainstorm serves the keeper's
  design sessions whoever runs them; bee-loop serves whoever holds the
  explicit direction. Routing of skills to roles lives in role
  mandates (adjustable defaults), never in the skill itself. A role's
  kit may grow (task-orc: bee-loop first among equals); skills stay
  role-agnostic.
- **role** — a named agent spec in `roles/`: mandate plus attributes
  (entry, escalation, workspace, lifespan, continuity — ADR-010).
  First-class roles (power-planner, project-orchestrator) take keeper
  direction and keep session files; dispatched roles (task-orc,
  reviewer, implementer — minted in P3) are spawned by other roles,
  escalate upward through their dispatcher, and remember via records
  unless their file overrides. Not every role is first-class.
- **power-planner** — the shaping role: discussion, architecture,
  decisions, design docs; co-creates design docs with the keeper. See
  `roles/power-planner.md`.
- **project-orchestrator** — the building role: bee-plan, bee-loop,
  subagents, gates, phase list. Consumes design docs read-only (scribe
  edits only with the keeper's explicit consent); escalates design
  conflicts to the keeper. See `roles/project-orchestrator.md`.
- **hivemind** — the `.hivemind/` folder in a repo. Holds all the
  working files the agents produce: `decisions/` (ADRs), `designs/`,
  `plans/`, `phases/`, `suggestions/`, `memory/`, `records/`,
  `sessions/` (gitignored), `status.md` (cross-role surface), and
  `keeper-report.md` (the keeper's zoned digest).
- **ADR** — architecture decision record, one file per decision, in
  `.hivemind/decisions/`. Written with the global `adr` skill.
- **design doc** — the document that says what we're building and why,
  for work big enough that one design guides several plans. Lives in
  `.hivemind/designs/`. Written together with the keeper; read-only for
  everyone else. Conflicts between a plan and its design doc always go
  to the keeper.
- **plan** — the step-by-step document a loop executes. Lives in
  `.hivemind/plans/`, named `YYYY-MM-DD-<pp|po>-<slug>.md` (role
  initials, ADR-007). Written by bee-plan,
  reviewed by the global `plan-reviewer` skill before execution.
- **phase list** — the loop's one-line-per-phase tracking file,
  `.hivemind/phases/<project>.md` (project = repo name unless the keeper
  says otherwise). The only file the loop updates to track its own
  progress.
- **records** — `.hivemind/records/`. The evidence files: verify records
  and review reports, named `<plan-slug>-task<N>-verify-r<N>.md` and
  `<plan-slug>-task<N>-review-r<N>.md` (round suffix per ADR-007; review
  rounds count independently of verify rounds). States move on these.
- **bee-verify / bee-review** — sibling skills in this same folder.
  bee-verify runs checks and writes a verify record; bee-review judges
  quality and writes a review report. The loop calls them; they never
  call each other.
- **parking lot** — `.hivemind/memory/parking-lot.md`. Deferred
  decisions with an unpark condition. Any agent may propose adding an
  item; only the keeper removes or resolves one.
- **validation level** — how much checking a stage gets, set in the
  plan: `task` (run what changed), `merge` (task checks plus the
  project's standard suite), `phase` (the full suite the plan lists),
  `release` (phase checks plus anything extra the plan demands).
  More risk, more checking.
- **work-item states** — `draft → implemented → verified → reviewed →
  done`. The loop moves items between states, using records in
  `.hivemind/records/` as evidence; verify/review only produce the
  records.
- **escalate** — stop and ask the keeper (ask_user card, with a
  recommendation), then record the answer where it applies: in the plan
  (task-scoped) or the phase list (phase-scoped). Used for: plan/design
  conflicts, two failed fix rounds, anything outside your authority.
  Ask hygiene: one decision per ask, with a recommendation — option
  sets spanning different kinds of work return the decision load to
  the keeper (ADR-009).
- **bee-loop** — the plan → implement → verify → review cycle, run by
  the `bee-loop` skill. Entered only when the keeper or a directed role
  says so; never inferred from task size.
- **Role trailer** — a `Role: <role>` line in commit messages and
  record/report headers saying which role produced the work (ADR-007).
- **escalation envelope** — every ask_user card states: role, context
  (plan/phase), the question, and where the answer will be recorded.
  One decision per card, recommendation first (ADR-009).
- **status surface** — `.hivemind/status.md`: open escalations, ADRs
  awaiting the keeper's flip, cross-role notes. Both roles read it at
  session start; interim until the decisions inbox exists.
- **record versioning** — verify/review records carry a round suffix
  (`…-task3-verify-r2.md`); records made in worktrees always land in
  the main checkout's `.hivemind/records/`.
- **thread-close** — the mid-session ritual when a thread of work
  completes but the session continues: update the session log, offer
  durable bits for promotion (offer-first), park any new deferrals,
  then recommend the next move from the board. Trigger is felt
  completion ("this thought is done"), not time or topic change.
  Light by design — two minutes, no gate.
- **relay** — passing work or context between different roles (e.g.
  power-planner → project-orchestrator). Two modes: **gated** — a
  short keeper-passed prompt (the keeper gates *direction*); and
  **ambient** — the shared surfaces (status surface, keeper report)
  carry each role's state, and roles pick up each other's context
  without the keeper relaying anything (validated 2026-10-25,
  keeper-valued). The design doc is the relay artifact. Not a
  handoff.
- **handoff** — same role, fresh context: the `handoff`/`pickup-handoff`
  skill pair and the `.pi/handoff-<role>.md` files they write. Ends
  with a memory sync (session state current) and a **wake prompt** the
  keeper pastes into the new context — but no parking-lot sweep: that
  is a work-close ritual, never part of a refresh.
- **phase branch** — `phase/<n>`: the project-orchestrator's
  integration spine (ADR-012). PO works it in a persistent worktree;
  task branches merge here; phase end is a tiered review into main.
  Two-size resets: task (delete branch + worktree) vs phase (abandon
  the branch; main untouched — keeper's word).
- **task branch** — `task/<phase>-<slug>`: one worktree per task-orc
  dispatch, off the phase branch. Records ride it; the diff is the
  review artifact (ADR-012).
- **dispatch brief, safety lines** — three standing lines every
  brief for a write-capable agent carries (P2 near-miss: a reviewer
  ran `bee report` flagless and wrote the live keeper report):
  (1) tool defaults may write to live files — always pass `--check`
  or explicit output paths, and verify with `git status` after;
  (2) live shared surfaces (`status.md`, `keeper-report.md`) are
  concurrently edited by a parallel role — never stash or restore
  them, leave others' modifications untouched;
  (3) if a live file was touched by accident — `git restore` it
  immediately, verify porcelain clean, and disclose it in the report.
- **dispatch** — a role sending work down to a subagent within its own
  mandate (orchestrator → implementer). Gated by the loop, not the
  keeper.
- **claim** — the phase list's `owner` column: role + timestamp written
  before dispatching a task; re-read before writing.

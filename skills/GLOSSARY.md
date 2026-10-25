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
  `sessions/` (gitignored).
- **ADR** — architecture decision record, one file per decision, in
  `.hivemind/decisions/`. Written with the global `adr` skill.
- **design doc** — the document that says what we're building and why,
  for work big enough that one design guides several plans. Lives in
  `.hivemind/designs/`. Written together with the keeper; read-only for
  everyone else. Conflicts between a plan and its design doc always go
  to the keeper.
- **plan** — the step-by-step document a loop executes. Lives in
  `.hivemind/plans/`, named `YYYY-MM-DD-<slug>.md`. Written by bee-plan,
  reviewed by the global `plan-reviewer` skill before execution.
- **phase list** — the loop's one-line-per-phase tracking file,
  `.hivemind/phases/<project>.md` (project = repo name unless the keeper
  says otherwise). The only file the loop updates to track its own
  progress.
- **records** — `.hivemind/records/`. The evidence files: verify records
  and review reports, named `<plan-slug>-task<N>-verify.md` and
  `<plan-slug>-task<N>-review.md`. States move on these.
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
- **bee-loop** — the plan → implement → verify → review cycle, run by
  the `bee-loop` skill. Entered only when the keeper or a directed role
  says so; never inferred from task size.
- **Role trailer** — a `Role: <role>` line in commit messages and
  record/report headers saying which role produced the work (ADR-007).
- **escalation envelope** — every ask_user card states: role, context
  (plan/phase), the question, and where the answer will be recorded.
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
- **relay** — passing work between different roles (e.g. power-planner
  → project-orchestrator), usually as a short keeper-gated prompt; the
  design doc is the relay artifact. Not a handoff.
- **handoff** — same role, fresh context: the `handoff`/`pickup-handoff`
  skill pair and the `.pi/handoff-<role>.md` files they write. Ends
  with a memory sync (session state current) and a **wake prompt** the
  keeper pastes into the new context — but no parking-lot sweep: that
  is a work-close ritual, never part of a refresh.
- **dispatch** — a role sending work down to a subagent within its own
  mandate (orchestrator → implementer). Gated by the loop, not the
  keeper.
- **claim** — the phase list's `owner` column: role + timestamp written
  before dispatching a task; re-read before writing.

# Bee glossary

Short list of terms the bee skills use. Defined here once; skills link
here instead of re-explaining. If a word is not in this file, do not use
it as a term of art.

- **keeper** — the human owner. Final authority on every decision that
  matters; the only one who unparks parking-lot items or amends design
  docs.
- **hivemind** — the `.hivemind/` folder in a repo. Holds all the
  working files the agents produce: `decisions/` (ADRs), `designs/`,
  `plans/`, `phases/`, `suggestions/`, `memory/`, `sessions/` (gitignored).
- **ADR** — architecture decision record, one file per decision, in
  `.hivemind/decisions/`. Written with the global `adr` skill.
- **design doc** — the document that says what we're building and why,
  for work big enough that one design guides several plans. Lives in
  `.hivemind/designs/`. Written together with the keeper; read-only for
  everyone else. Conflicts between a plan and its design doc always go
  to the keeper.
- **plan** — the step-by-step document a loop executes. Lives in
  `.hivemind/plans/`. Written by bee-plan, reviewed by the global
  `plan-reviewer` skill before execution.
- **phase list** — the orchestrator's one-line-per-phase tracking file,
  `.hivemind/phases/<project>.md`. The only file the loop updates to
  track its own progress.
- **parking lot** — `.hivemind/memory/parking-lot.md`. Deferred
  decisions with an unpark condition. Any agent may propose adding an
  item; only the keeper removes or resolves one.
- **validation level** — how much checking a stage gets, set in the
  plan: `task` (run what changed), `merge`, `phase` (full suite), 
  `release`. More risk, more checking.
- **work-item states** — `draft → implemented → verified → reviewed →
  done`. Each move needs its evidence: verify output or review signoff.
- **escalate** — stop and ask the keeper (ask_user card), then record
  the answer. Used for: plan/design conflicts, two failed fix rounds,
  anything outside your authority.
- **bee-loop** — the plan → implement → verify → review cycle, run by
  the `bee-loop` skill. Entered only when the keeper or a directed role
  says so; never inferred from task size.

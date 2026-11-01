<!-- glossary view — script-owned: bee glossary regenerates this file on every store write; hand edits are overwritten -->

**ADR** — architecture decision record, one file per decision, in `.hivemind/decisions/`. Written with the global `adr` skill.

**AXI** — the ten agent-first CLI principles; the binding list lives in `docs/AXI.md`. Every `bee` command follows them (ADR-014).

**bee capture** — `bee capture "<thought>"`: file a thought to the keeper's inbox without leaving the thread. Sugar for an inbox add; routing stays conversational.

**bee design** — `bee design new|pick-up|implement|status`: the design-doc lifecycle as CLI (ADR-016's transitions). Machine blocks are script territory; the CLI never edits them by hand.

**bee task** — the scripted half of state-keeping: moves work items between states with provenance, refusing a move that lacks its evidence record.

**bee verify** — the scripted half of verification: runs the plan header's `checks:` contract and mints the logbook entry. Whether the output is sane stays agent judgment.

**bee- namespace** — the `bee-` prefix marks the shipped kit: the bee-* skills under `skills/`, grouped in kit folders (every SKILL.md carries a `kit:` field). Ad-hoc and repo-local skills never take the prefix; it marks what ships with the harness at a glance.

**bee-loop** — the plan → implement → verify → review cycle, run by the `bee-loop` skill. Entered only when the keeper or a directed role says so; never inferred from task size.

**bee-native** — lives in the BeeHarness repo and ships with it. The loop and bee-built work may depend only on bee-native instruments plus the foundations (Pi, Paseo, subagents extension; ADR-015). Global skills and the global AGENTS.md are never dependencies.

**bee-plan-review** — the plan gate before the loop executes a plan: scripted core (plan-checks.sh) plus judgment on six dimensions; tiered findings; never fixes. `skills/loop/`.

**bee-skill-review** — the design-quality gate for skill documents; every dimension failure blocks; never fixes. `skills/skilldev/`.

**bee-skill-write** — the authoring skill: drafts and revises bee skills (artifact test, front-matter registry, determinism split, draft → cold-test → review → sign-off). `skills/skilldev/`.

**bee-verify / bee-review** — sibling skills in the loop kit folder. bee-verify runs checks and writes a verify entry; bee-review judges quality and writes a review report. The loop calls them; they never call each other.

**claim** — the phase list's `owner` column: role + timestamp written before dispatching a task; re-read before writing.

**cold read** — reading a document with no context beyond the document and its named references — no drafting conversation, no session memory. A cold reader is who skills are written for; a cold dispatch sends one. Basis of comprehension tests and review independence.

**design doc** — what we're building and why, for work big enough that one design guides several plans. Lives in `.hivemind/designs/`; co-authored with the keeper, read-only below; plan/design conflicts go to the keeper. Lifecycle-stamped (ADR-016): `live` → `picked-up` → `implemented`; after pickup, dated addenda only.

**determinism test** — if two careful people following the same rules would produce the same result, the work is a script; if they would differ, it needs an agent (ADR-014).

**dispatch** — a role sending work down to a subagent within its own mandate. Gated by the loop, not the keeper.

**dispatch brief** — the contract a dispatcher sends a dispatched agent: plan path (absolute), phase id, validation level, escalation envelope, workspace, and the pass-back shape (a done-ness digest — paths, never contents). Template: `skills/loop/bee-loop/assets/dispatch-brief-template.md`.

**dispatch brief, safety lines** — the standing lines every brief for a write-capable agent carries: write-defaults awareness (`--check` / explicit outputs), concurrent shared surfaces (never stash or restore others' edits), accident recovery (restore, verify clean, disclose), pinned working directories (absolute `cwd`/`-C`). Full text lives in the dispatch-brief template.

**escalate** — stop and ask the keeper (ask_user card, with a recommendation), then record the answer where it applies: the plan (task-scoped) or the phase list (phase-scoped). Used for plan/design conflicts, two failed fix rounds, anything outside your authority. Card shape — one decision, self-contained, options, recommendation — is law in both role files.

**escalation envelope** — every ask_user card states: role, context (plan/phase), the question, and where the answer will be recorded. One decision per card, recommendation first (ADR-009).

**handoff** — same role, fresh context: the `bee-handoff`/`bee-pickup-handoff` pair (`skills/session/`) and the `.pi/handoff-<role>.md` files they write. Ends with a memory sync and a **wake prompt** for the keeper — but no parking-lot sweep: that is a work-close ritual, never part of a refresh. Mid-session counterpart: thread-close.

**hivemind** — the `.hivemind/` folder in a repo. Holds all the working files the agents produce: `decisions/` (ADRs), `designs/`, `plans/`, `phases/`, `suggestions/`, `memory/`, `logbook/`, `sessions/` (gitignored), `inbox.toon` (the inbox store), `status.md` (cross-role surface), and `keeper-report.md` (the keeper's zoned digest).

**inbox** — `.hivemind/inbox.toon`, the script-owned store of items waiting on someone (`bee inbox add|list|show|done`). One addressee per item, open → taken → done. The status surface's awaiting-keeper queue and the keeper report's keeper asks render from it; new note traffic and awaiting-read suggestions ride it instead of hand-written queues.

**keeper** — the human owner. Final authority on every decision that matters; the only one who unparks parking-lot items or amends design docs.

**logbook** — `.hivemind/logbook/`. The loop's written account of its own work: verify entries and review reports, named `<plan-slug>-task<N>-verify-r<N>.md` / `-review-r<N>.md`. Claims don't move states — these documents do (ADR-006).

**logbook versioning** — verify and review entries carry a round suffix (`…-task3-verify-r2.md`); entries made in worktrees ride the task branch and reach main at merge (ADR-007 amendment 2).

**parking lot** — `.hivemind/memory/parking-lot.toon` (`bee park add|list|show|resolve`). Deferred decisions with an unpark condition. Any agent may propose adding an item; only the keeper resolves one (`bee park resolve` is keeper-gated by law).

**phase branch** — `phase/<n>`: the project-orchestrator's integration spine (ADR-012). Worked in a persistent worktree; task branches merge here; phase end is a tiered review into main. Two-size resets: task (delete) vs phase (abandon; keeper's word).

**phase list** — the loop's one-line-per-phase tracking file, `.hivemind/phases/<project>.md` (project = repo name unless the keeper says otherwise). The only file the loop updates to track its own progress. Each row links its plan and the design docs the phase consumes — the list is the queue's source of truth; status notes are transient.

**plan** — the step-by-step document a loop executes. Lives in `.hivemind/plans/`, named `YYYY-MM-DD-<pp|po>-<slug>.md` (ADR-007). Written by bee-plan, reviewed by bee-plan-review before execution.

**power-planner** — the shaping role: discussion, architecture, decisions, design docs; co-creates design docs with the keeper.
  see: `roles/power-planner.md`

**project-orchestrator** — the building role: bee-plan, bee-loop, subagents, gates, phase list. Consumes design docs read-only; escalates design conflicts to the keeper.
  see: `roles/project-orchestrator.md`

**README** — the repo's front door: durable description only. Never a work log — live state belongs to the phase queue, the keeper report, the status surface. The test: if a sentence can go stale, it doesn't belong (ownership: ADR-007 amendment 1).

**relay** — passing work or context between different roles. Two modes: gated (a short keeper-passed prompt — the keeper gates direction) and ambient (shared surfaces carry each role's state; roles pick up each other's context without the keeper relaying). The design doc is the relay artifact. Not a handoff.

**role** — a named agent spec in `roles/`: mandate plus attributes (entry, escalation, workspace, lifespan, continuity — ADR-010). Assumed by direction from the keeper or a handoff — never inferred from the work's shape. First-class roles take keeper direction and keep session files; dispatched roles are spawned by other roles and remember via their work's logbook. Not every role is first-class.

**Role trailer** — a `Role: <role>` line in commit messages and record/report headers saying which role produced the work (ADR-007).

**skill** — a procedure: how a class of work gets done. Roles are agents (the noun); skills are instruments (the verb). A skill never belongs to a role — routing lives in role mandates, never in the skill. Skills stay role-agnostic.

**status surface** — `.hivemind/status.md`. The awaiting-keeper queue renders from the inbox (`bee inbox render` writes a marked region); open escalations and cross-role notes remain its prose. Both roles read it at session start; interim until the decisions inbox replaces the whole surface.

**structure check** — `scripts/structure-check.sh`: every tracked file must match `scripts/structure.map`, the allowed-structure manifest (data, not code — one pattern per line); misses are findings with fix lines. Per-repo capability: a repo adopts it by adding a map; `bee verify` runs it when one exists.

**task branch** — `task/<phase>-<slug>`: one worktree per task-orc dispatch, off the phase branch. Logbook entries ride it; the diff is the review artifact (ADR-012).

**thread-close** — the mid-session ritual when a thread completes but the session continues: update the session log, offer durable bits for promotion (offer-first), park new deferrals, recommend the next move from the board. Trigger is felt completion; two minutes, no gate.

**TOON** — token-oriented notation: the token-lean, line-oriented format for structured data exchanged with agents; the storage and emission format for agent-facing surfaces (ADR-014). Humans get rendered views.

**validation level** — how much checking a stage gets, set in the plan: `task` · `merge` · `phase` · `release`. More risk, more checking.

**work-item states** — `draft → implemented → verified → reviewed → done`. The loop moves items between states, each move needing its evidence in `.hivemind/logbook/`.

# BeeHarness — AGENTS.md (work in progress)

Always-applicable rules for any agent working in this repo. Identity and
values live in `SOUL.md` — planners should read it fully; implementers
may skim it. This file is the operational layer: what applies on every
task.

This repo IS the pi plugin: top-level `skills/` is the single source of
truth for all bee-* skills (registered machine-wide via
`~/.pi/agent/settings.json`). Edit skills here; never copy them
elsewhere.

## Memory ownership

- `.hivemind/sessions/<role>.md` (one file per role, role name in the
  filename) is the agent's own working memory. Write it freely at each
  decision point; it retires with the session.
- `.hivemind/decisions/` (ADRs) are records of the keeper's actual
  decisions about long-term direction. Create one only on the keeper's
  word or an accepted offer. An answer in conversation is not a
  decision — when unsure whether something was decided, ask.
- The same gate covers every durable record: ADRs, project memory,
  parking-lot entries.

## Current mode: DESIGN

We are designing the harness before building it. Right now:

- Discussions produce **documents** — never implementation without an
  approved plan (focus discipline).
- Every design decision worth keeping becomes an **ADR** once agreed
  (use the `adr` skill). Unrecorded decisions are lost decisions.
- Drafts are cheap: when context is sufficient, produce a concrete
  draft to react to instead of asking more questions. Refine together.

## Work modes (all opt-in — never auto-escalate ceremony)

- **Direct work** — talk/ask/small changes; normal norms; no gates.
- **Design mode** — interactive, human-gated shaping; ends with a
  parking-lot loop-back gate.
- **Bee-loop** — the orchestrated pipeline; entered ONLY by explicit
  direction.

## Rules of engagement

- **Behavior documents stay generic** (keeper direction 2026-10-25;
  the writing standard in `docs/WRITING-STANDARD.md` carries the full
  text): skills,
  rules, role files, and templates contain NO task-specific
  examples, dated stories, or current-work narratives — placeholders
  and generic actors only. Future agents must not inherit this
  week's context. Specifics live in the records (ADRs, logbook,
  session logs); that is their job.
- **Plain language, shared vocabulary** (keeper direction
  2026-10-25): jargon must be something the hive and the keeper
  *share* — the keeper's own shorthand is fine in moderation (mirror
  it), but agents never coin new phrases or shorthand the keeper
  wouldn't understand. When explaining a technique, the plain
  version comes first; anything after it is detail, not fluff
  padding.
- **Self-contained asks** (keeper direction 2026-10-25): the
  keeper's attention spans days, not turns — never assume memory of
  earlier conversation. Every choice put to the keeper (card or
  prose) carries its own context: a few plain sentences of what it's
  about, the options, the recommendation. An ask that needs the
  reader to remember isn't ready to ask.
- **Clickable links to the keeper** (keeper direction 2026-10-25):
  whenever surfacing something the keeper might want to read or act
  on — in chat, the keeper report, or cards — give the **absolute
  path** (e.g. `/home/saphron/BeeHarness/…`). Paseo renders
  repo-relative dot-directory paths as broken links. Paths inside
  files stay correct repo-relative; keeper-facing surfaces go
  absolute.
- **Plan review gate:** before dispatching the first implementer on
  any plan containing verbatim code blocks (source, tests, config,
  compose, SQL), run the `plan-reviewer` skill and resolve every 🔴
  finding before dispatch; waive 🟡 only with a one-line recorded
  reason; re-review any task whose verbatim code changed after
  review. Depth scales with plan size — small plans get a single
  Accuracy + External-reality pass, large plans get all dimensions —
  but the gate is never skipped (not for detail, not for cost, not
  for waiting humans: the P1 run shipped eight). Lives here since
  PL-004, not in global law.
- Ask one question at a time, and **always recommend** — never a bare
  menu. Use the `ask_user` tool (Paseo card) for decisions.
- Verify every factual claim (call sites, tool names, paths) before
  dispatching subagents.
- Evidence over assertion: no "done"/"works" claim without verification
  output. Reproduce bugs before fixing them.
- **Editing discipline for living documents** (keeper direction
  2026-10-25): three standing rules —
  (1) the edit tool REPLACES text, it never inserts: when adding a
  line or block near existing text, anchor the match on a unique
  line that will remain (a section header, or the first line of the
  following block) and repeat it inside the replacement — anchoring
  on the target line's own text silently deletes it. Read the exact
  lines before writing the match; a failed match is the warning
  working — re-read, don't re-guess.
  (2) Prefer whole-file rewrites over scripted patches (sed/python)
  for session files, glossaries, and parking lots; script only for
  many-file mechanical changes, and chain the verification grep in
  the same command — output shown, not assumed.
  (3) After any multi-file sweep, grep for residuals BEFORE
  committing — not after.
- Commit messages: short imperative, ≤10 words.
- When context runs short, run a handoff (`handoff` skill); resume with
  `pickup-handoff`. A handoff ends with a memory sync (session state
  current) — NOT a parking-lot sweep. Sweeps belong to closing work
  (brainstorm loop-back, session close, phase gates), when something
  actually ended. Every handoff's final step: give the keeper a
  **wake prompt** for the successor (fenced markdown: who it is, how to
  pick up) — the files carry the content; the prompt is the pointer.
- When a thread of work completes mid-session (**thread-close**,
  GLOSSARY): update your session log, offer durable bits for promotion,
  park new deferrals, then recommend the next move. Either party may
  trigger it. Applies to every role — with each role's own instruments
  (planner: session log + board; loop: the Record step).

## Layout & continuity (bootstrap conventions until the harness MVP)

<!-- adr-path: .hivemind/decisions -->

- `.hivemind/` holds all hive working docs and ephemera, each class
  with one purpose: `decisions/` (ADRs — *why it's this way*;
  keeper's) · `designs/` (*what to build*; PP + keeper) · `plans/`
  (*how*; bee-plan writes, reviewer gates) · `phases/` (*when/next* —
  the queue) · `logbook/` (*what actually happened* — the loop's
  verify/review accounts; claims don't move states, these do) ·
  `suggestions/` (the inbox — any role + keeper) · `memory/` (deferred
  decisions: the parking lot) · `sessions/` (live role memory,
  gitignored) · `status.md` (cross-role surface) · `keeper-report.md`
  (keeper's zoned digest, ADR-008).
- Repo documentation: `AGENTS.md`, `README.md`, `SOUL.md` stay at
  the root; every other standalone document lives in `docs/`
  (currently `docs/AXI.md`, `docs/WRITING-STANDARD.md` — new
  standards and guides go there, not the root).
- Session memory: `.hivemind/sessions/<role>.md` — one file per
  active role (role name in the filename), updated at each decision
  point; re-read yours after compaction/fork/new session.
- Parking lot: `.hivemind/memory/parking-lot.md` — any agent may
  propose parking; ONLY the keeper unparks or resolves. Brainstorms end
  with a loop-back gate over it.
- Scrappy continuity is sanctioned (ADR-001 amendment): session memory
  may hold project knowledge until the harness lands. Nothing gets built
  with the harness before MVP.

## Tooling constraints

- Pi and Paseo coupling is welcome everywhere.
- The subagents extension may be extended but must never depend on us.
- Superpowers skills are reference material during bootstrap: learn the
  patterns, write our own — never import or depend on them.
- **Bee-native boundary (ADR-015):** the loop and bee-built work
  depend only on bee-native instruments plus the foundations (Pi,
  Paseo, subagents extension) — never on global skills or the global
  AGENTS.md; those are the keeper's ephemeral personal kit. A fresh
  checkout plus the default setup must basically run the harness.
- **Agent-first CLI (ADR-014):** the `bee` CLI and every agent-facing
  surface follows the ten AXI principles (`docs/AXI.md`) — and prefer
  scripts over skills for deterministic work: if two careful people
  following the same rules produce the same result, it is a script.
  Storage follows the primary reader: agent-primary stores go TOON,
  mixed documents carry a machine header with a prose body, and
  keeper-facing views render to prose. Never hand-convert a store
  ahead of the tool that owns it.

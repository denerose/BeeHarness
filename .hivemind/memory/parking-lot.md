# Parking lot — BeeHarness

Deferred decisions. Session-independent: survives compaction, session
death, and model switches. The power-planner brainstorm process ends with
a loop-back gate over this file. Any agent may propose parking an item;
only the keeper unparks or resolves.

Format: `PL-NNN — item — context/recommendation — unpark when`

Parked items may carry open questions — discussing them is the unpark
work; filing roles keep them open (no inline answers, no pre-tilting
recommendations beyond what the keeper already directed).

## Parked

- **PL-002 — memory tooling specifics** — target recorded in ADR-001
  amendment: headers-as-index storage; `bee memory` CLI as derived layer
  (role-gated writes, proposals queue, provenance stamps); continuity
  spec + plan shelved as design input — review with keeper when the
  memory tooling build begins (harness build phase).
- **PL-004 — global AGENTS.md overreach cleanup** — existing global
  AGENTS.md hardcodes planner behaviors (ask_user-first questioning) as
  if law; probably one agent's self-instructions accreted. With keeper:
  strip mode-specific behavior (roles own it now), keep mode-neutral
  law, add explicit rule that global AGENTS.md changes need keeper
  authorization — unpark next session touching global config or when
  harness rules land.
- **PL-PO-001 — stale ephemera in durable docs (pilot #1 post-mortem)** —
  the pilot's implementation agent wrote "the first pilot bee-loop is
  running" into README.md — a durable, human-facing doc — and it went
  stale the same day. The plan embedded the sentence verbatim,
  plan-reviewer passed it, bee-review flagged it only as a note (no
  round). Living state has homes (session memory, phase list, status
  surface); the README is not one. Keeper direction: look into how and
  why this happened and how to prevent it. Recommendation: examine each
  gate (bee-plan rule against ephemeral status prose in durable docs;
  review-tier guidance that time-sensitive content in durable docs is
  should-fix, not note) — unpark when the keeper wants the doc-hygiene
  pass designed.
- **PL-PP-001 — link hygiene across harness documents** — keeper hit
  "No file found" following a doc link surfaced from status.md
  (path was missing its `.hivemind/` prefix); separately, Paseo
  renders dot-directory paths (`.hivemind/…`) as chat links that 404
  (PO-verified). Two failure classes: wrong paths written in files,
  and paths that are right but unrenderable in chat. Keeper direction:
  review harness-wide and pick a skill/rule/tool. Recommendation:
  interim rule now (absolute paths in keeper-facing chat/reports;
  repo-relative in files), then a link-check at bee-verify time when
  the CLI lands, possibly a small lint skill before that — unpark
  when the keeper wants the pass, or with the PL-002 tooling build.
- **PL-PP-002 — artifact taxonomy: records vs designs vs decisions**
  — keeper question (2026-10-25): what separates `.hivemind/records/`
  (verify/review evidence) from `designs/` (what to build) and
  `decisions/` (ADRs, what was decided) — and why do the three
  classes exist at all? Recommendation: a purposes line per artifact
  class in GLOSSARY (each entry answers "why this class exists"),
  possibly a purposes column in the design doc's artifacts map —
  unpark at the next GLOSSARY/design-doc pass or when the keeper
  wants the conversation.
- **PL-PP-003 — `bee` CLI help surfaces, guidance injection, session
  rules** — keeper direction (2026-10-25), related to the
  superpowers-replacement todo on the keeper's list: (a) help for
  HUMANS and help for AIs as CLI surfaces (agents invoke `bee` too —
  machine-parseable guidance, e.g. the GLOSSARY/ADR graph queryable);
  (b) using-bee-harness guidance injection — session-start guidance
  for repos with the harness (AGENTS.md-like, bee-managed); (c) review
  or add start/end-of-session rules (wake prompts, thread-close,
  status reads — bee-assisted rituals). KEEPER CLARIFICATION
  (2026-11-01): `bee init` is ONCE PER PROJECT (the hivemind
  wiring import) — session-start context and role-pickup updates
  are a SEPARATE tool, designing here; machine-level registration
  (the P2 stub's current behavior) splits out to install/setup at
  the P6 init contract. Recommendation: design with
  the P4 CLI lane, alongside the capture tool (see keeper's
  suggestion `2026-10-25-keeper-quick-thoughts-capture.md`) — unpark
  when P4 opens or the keeper wants the design session.
- **PL-PP-004 — conference notes awaiting Power Planner discussion** —
  keeper took conference notes (2026-10-31); full per-topic detail in
  `designs/2026-10-31-conference-notes-power-planner.md`. Topics:
  agent signals/guides (backpressure; validation scripts, arch tests;
  per-task tailoring; keeper to supply curated links), deterministic
  over inference for BeeHarness, arch tests (Roslyn for C#, TS option
  TBD; all/some/none question), OpenAPI-first + contract tests,
  StackQL (research first), AXI principles (axi.md — maybe into
  SOUL), Arazzo specs, auto-PR with human deployment audit — unpark
  when the Power Planner session on these topics happens.
- **PL-PP-005 — logbook & project-record lifecycle: cleanup and
  compaction** — keeper direction (2026-10-25): when and how do
  logbook entries (and related project records) get cleaned up or
  compacted? Open question preserved for the unpark session: maybe a
  skill or a role specifically for cleanup/compaction at set stages
  in the cycle (the keeper's hypothesis — not settled) — unpark with
  the P4 CLI design or productization (P6), or when the keeper wants
  the conversation. Related: PL-002 (memory tooling), the capture
  suggestion.
- **PL-PP-006 — distill ADR-referenced rules into bee behavior
  guidance (universal vs project)** — keeper direction (2026-11-01):
  our docs carry the real rules as "ADR-blah" pointers — fine while
  we learn; before shipping to other projects, capture the rules we
  want to keep as actual how-to-be-a-bee guidance (using the
  harness, agents' help, top-level behavior rules), sorted into
  rules for ALL projects vs rules specific to this repo
  (project/machine-specific rules stay here). Feeds P8 (which
  strips the references) and PL-PP-003 (the guidance injection
  carries the universal set); the template glossary covers
  vocabulary — this covers rules. Open for the session: the form
  (one shipped guide vs injected guidance vs per-skill rule text),
  the home, and the sort itself — unpark with P8/P6 planning or
  when the keeper wants the distillation session.
- **PL-PP-007 — project mapping and architecture navigation docs
  (built-as-we-build)** — keeper direction (2026-11-01, from the
  explore discussion): this repo has many ADRs but little
  architectural documentation — a side effect of agent-tooling work
  (little code to map); product projects (real C#/TS codebases) WILL
  need navigation plans. That is the worth-capturing part of the
  dropped explore concept, in a new context: maps written as the
  project is BUILT, growing with the code — never retroactive
  exploration. Open for the unpark session: the form (a living
  architecture map in `.hivemind/`? a per-stack guidance section?
  maintained at phase gates or by the loop's record steps?), the
  layer split (designs say what to build; the map says what
  exists), and when it starts (first product project). Related:
  PL-PP-006, the `bee guidance` direction — unpark when the first
  product project needs orientation or the keeper wants the design
  session.
- **PL-PP-008 — AI observability and agent hooks** — keeper
  direction (2026-11-01): a discussion to have — observing agent
  work (what events, what signals, what surfaces) and hooks (which
  extension/session/dispatch events the harness can hang
  observability on). Open for the unpark session, filed open: what
  "observability" means for this hive (metrics from the structured
  stores? logs? dashboards?); which hook points exist today (pi
  extension hooks, session start/end, dispatch lifecycle) vs. which
  we'd need; how it relates to the signals-and-guides thread
  (PL-PP-004 topic 1, awaiting curated links) and to ADR-014's
  machine-readable records making observation possible in the
  first place — unpark when the keeper wants the conversation, or
  alongside the signals/guides session.
- **PL-PP-009 — a lightweight keeper-secretary role (capture and
  track only)** — keeper direction (2026-11-01): a new top-level
  role, much lighter than the existing two — literally takes short
  directions and notes from the keeper and keeps track of them;
  nothing else. Might be a shared parking-item type; might end up
  using the same suggestions model internal agents use. Open for
  the unpark session, filed open: the store (parking lot vs
  suggestions vs its own — likely shaped by the P4 inbox + capture
  tooling once their kinks are worked out); attributes per ADR-010
  (standing vs on-call; continuity is probably records-only — the
  store IS the memory); relation to the keeper's quick-thoughts
  capture suggestion (the role may reduce to the capture skill +
  simple routing — which bucket a note lands in — in a dedicated
  context; note: "triage" in that suggestion means routing, NOT the
  keeper's interactive triage skill — terminology friction flagged
  2026-11-01, "routing" is the capture meaning from now on); what
  "keeps track" means — aging,
  surfacing, the keeper's list — KEEPER NOTE (2026-11-01): the
  PP+keeper design session is wanted; sequence it after P4 works
  out the parking/suggestions kinks (the live inbox + `bee
  capture` are the secretary's substrate), then get the role into
  the next relevant phase once designed — unpark when the keeper
  brings it back, after parking/suggestions mechanics are proven.
- **PL-PP-010 — a rubber-duck skill and a "do-I-need-the-keeper"
  skill** — keeper direction (2026-11-01): two candidate skills.
  Rubber-duck: externalize and examine one's own reasoning before
  deciding/proceeding. Do-I-need-the-keeper: helps an agent see
  when it is about to make a decision that is not its to make —
  likely users: project-orchestrator, planners (though they have
  the plan reviewer), maybe task-orcs; probably HOOKED into the
  loop somehow, still TBD. Open for the unpark session, filed
  open: form and kit placement (loop/session/roles?) for each;
  where the hook points land in the loop (Record step? deviation
  handling? stop-and-return triggers?); relation to existing
  instruments (escalation envelope, plan reviewer, bee-argue);
  whether they ship or stay harness-build tools — unpark when the
  keeper brings it back (natural moment: after P7's skill-building
  practice).
- **PL-PP-011 — mistake-fixing guidance or skill, role-specific** —
  keeper direction (2026-11-01, from the P7 post-pickup incident):
  agents will make mistakes; plan a tool or skill for guidance on
  FIXING one — with ROLE-SPECIFIC variants, because mistake scope
  and impact differ radically (a task-orc mistake is worktree-
  scoped and resets cheaply; an orchestrator mistake may span a
  phase and consumed inputs; a planner mistake is law/records that
  OTHER ROLES MAY HAVE CONSUMED — recovery must verify consumer
  state, never assume it, and reconcile idempotently). Open for
  the unpark session, filed open: form (one skill with role
  sections vs per-role guidance); the universal spine (disclose →
  assess blast radius via git/status/consumer check → fix the
  record → reconcile consumers → log the lesson); hooks into the
  loop or verify; relation to safety lines and the two-size resets
  — unpark when the keeper wants the session or with the
  roles-writing guidance work. CALIBRATION INPUT (2026-11-01, P7
  sign-off arc): the escalation rules are this skill's decision
  table — escalate a decision with a live keeper-owned alternative
  (direction/law/tiering), after two failed fix rounds, on genuine
  conflict; never as artifact-reading, bundled mega-questions, or
  approval-without-alternatives. Full arc in
  `suggestions/2026-11-01-po-session-hindsight-signoff.md`.
- **PL-PO-002 — `bee init` from a worktree registers the worktree's
  skills dir** — surfaced by P3's first dispatch: `bee init` derives
  the skills path from its own location, so running it from any
  worktree would register that worktree's `skills/` instead of the
  main checkout's. Behavior unchanged in P3 (only test expectations
  were made location-neutral). Open question for the keeper: should
  `bee init` resolve the main checkout via `--git-common-dir` like
  `scripts/task.sh` does? — unpark when the keeper rules on
  worktree-aware registration (natural home: a later `bee` CLI phase).

## Resolved

- **PL-PO-001 — stale ephemera in durable docs (pilot #1 post-mortem)**
  — resolved 2026-10-25 (keeper-directed doc-hygiene pass). How/why:
  the README carried a literal `Status:` field (structural magnet);
  no gate had a rule against ephemeral prose in durable docs (each
  assumed another's job); live state had thinner homes at P1 (no
  keeper report yet). Prevention, all three gates fenced: README
  restructured (no status field; durable-pointer guard block at top;
  keeper sign-off restated), bee-plan rule 7, bee-review should-fix
  tier, global plan-reviewer External-reality line (ephemeral prose
  in durable docs = 🔴). Plus: live state now has mature homes
  (phase queue, keeper report, status surface). Collateral: design
  doc's own status line refreshed. Keeper note recorded: global
  skills are transitional — BeeHarness replaces most; plan-reviewer
  may be pulled in-house as a bee-native copy.
- **PL-PP-002 — artifact taxonomy: records vs designs vs decisions**
  — resolved 2026-10-25 (keeper session): purposes now written per
  class in the design doc's artifacts map and AGENTS.md (why / what /
  how / when / what-happened / inbox / deferred / live / surface /
  digest); `records/` renamed `logbook/` (ADR-013) — the class is the
  loop's written account of its own work; the ADR =
  "decision-record" collision dissolved.
- **PL-004 — global AGENTS.md overreach cleanup** — resolved 2026-10-25
  (keeper picked "strip both" via routing card): ask_user-first
  questioning and the plan-review gate removed from the global file;
  gate relocated to this repo's AGENTS.md + bee skills; ask_user
  retry-error rule kept globally as tool mechanics; guard added —
  global AGENTS.md changes need the keeper's explicit authorization.
  Note: the global file lives outside this repo — untracked by its
  git; the guard rule is its protection.

- **PL-003 — "handoff" term overload (ADR-001 rule 7)** — resolved
  2026-10-25, keeper picked **relay** for cross-role work passing.
  Vocabulary now: relay (role↔role, keeper-gated) · handoff (same-role
  context refresh, the skill pair) · dispatch (role→subagent).
  GLOSSARY carries all three; pollution swept (design doc, README,
  planner session); orc to sweep its own echoes via status.md.

- **PL-001 — machine-global git identity** — resolved 2026-10-18 via
  ADR-002: global identity is now `denerose-pi`; keeper authorship via
  explicit `--author`.

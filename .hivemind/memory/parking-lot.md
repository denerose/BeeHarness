# Parking lot — BeeHarness

Deferred decisions. Session-independent: survives compaction, session
death, and model switches. The power-planner brainstorm process ends with
a loop-back gate over this file. Any agent may propose parking an item;
only the keeper unparks or resolves.

Format: `PL-NNN — item — context/recommendation — unpark when`

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
  status reads — bee-assisted rituals). Recommendation: design with
  the P4 CLI lane, alongside the capture tool (see keeper's
  suggestion `2026-10-25-keeper-quick-thoughts-capture.md`) — unpark
  when P4 opens or the keeper wants the design session.
## Resolved

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

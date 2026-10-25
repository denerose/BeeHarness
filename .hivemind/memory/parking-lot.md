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
- **PL-003 — "handoff" term overload (ADR-001 rule 7)** — rule 7 (and
  its echoes in AGENTS.md + continuity spec/plan) uses "handoff" for
  two things: the context-refresh skill ritual (`handoff`/`pickup-handoff`:
  same task, fresh context) and passing work on to the next agent or
  task state. Valid in its original context; collides in practice — a
  fresh session hit the confusion at pickup. GLOSSARY defines neither
  sense. Recommendation: keep "handoff" for the skill pair only; rename
  the other sense (e.g. "session close" / "task relay") or add GLOSSARY
  entries disambiguating both, then sweep the echoes — unpark when the
  keeper picks the vocabulary, ideally with skills review and before
  the pilot bee-loop leans on the term.

## Resolved

- **PL-003 — "handoff" term overload (ADR-001 rule 7)** — resolved
  2026-10-25, keeper picked **relay** for cross-role work passing.
  Vocabulary now: relay (role↔role, keeper-gated) · handoff (same-role
  context refresh, the skill pair) · dispatch (role→subagent).
  GLOSSARY carries all three; pollution swept (design doc, README,
  planner session); orc to sweep its own echoes via status.md.

- **PL-001 — machine-global git identity** — resolved 2026-10-18 via
  ADR-002: global identity is now `denerose-pi`; keeper authorship via
  explicit `--author`.

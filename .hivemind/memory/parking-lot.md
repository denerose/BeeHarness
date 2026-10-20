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
  memory tooling build begins (harness build phase). Scope added
  2026-10-20: settle the ADR-vs-project-memory boundary at this review.
  Alternatives were considered and declined (keeper: routing is added
  complexity with no evidence yet); both genres stay as-is. Revisit
  earlier only via the pain valve.
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

- **PL-001 — machine-global git identity** — resolved 2026-10-18 via
  ADR-002: global identity is now `denerose-pi`; keeper authorship via
  explicit `--author`.

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

## Resolved

- **PL-001 — machine-global git identity** — resolved 2026-10-18 via
  ADR-002: global identity is now `denerose-pi`; keeper authorship via
  explicit `--author`.

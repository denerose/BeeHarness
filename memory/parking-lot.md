# Parking lot — BeeHarness

Deferred decisions. Session-independent: survives compaction, session
death, and model switches. The power-planner brainstorm process ends with
a loop-back gate over this file. Any agent may propose parking an item;
only the keeper unparks or resolves.

Format: `PL-NNN — item — context/recommendation — unpark when`

## Parked

- **PL-001 — machine-global git identity** — currently `denerose-bee
  <denerose noreply>`, which attributes agent commits to the keeper;
  recommendation was flip global to `denerose-pi` machine-wide since
  human-authored commits use explicit `--author` — unpark when we
  formalize the git identity model (ADR) or before other repos rely on
  the global config.

## Resolved

_(moved here with a one-line resolution and where it landed — ADR/doc link)_

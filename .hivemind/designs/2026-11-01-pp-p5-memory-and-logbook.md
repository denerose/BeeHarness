# P5 — memory system + logbook hygiene — design note

<!-- machine
status: live
phase: -
hash: -
merge: -
-->

**Date:** 2026-11-01
**Status (prose mirror):** live — shape and all three decisions ruled
by the keeper in conversation, 2026-11-01 (write model amended:
scripted tooling wherever possible).

## The problem

PL-002's recorded target (headers-as-index storage, derived CLI
layer) was superseded by ADR-014's born-TOON rule — the index IS the
format now. The logbook keeps growing (the ephemera budget,
PL-PP-005), and the bootstrap exception (project knowledge living in
session memory) needs its retirement path. P5 builds the memory
system and the logbook hygiene mechanics together.

## The design

**Standing write model (keeper ruling, 2026-11-01 — applies to every
bee store):** scripted tooling wherever possible. Status changes,
timestamps, ids, headings, state — script-owned. Agents call the CLI
and provide only the free text of an update. Agents touch as few
files as possible. Deterministic before inference.

**1. Memory store — `.hivemind/memory/memory.toon`.** One line per
entry:

    id :: type :: gist :: provenance :: state

- types: `lesson` (agent-learned, promoted from sessions) and `fact`
  (project knowledge). Parking (bee park) and suggestions (bee
  inbox) already have their own stores — memory is the agents'
  durable descriptive voice; keeper decisions live in ADRs.
- `provenance`: role + date + source-ref, stamped by the CLI.
- supersede, never delete: a retired entry names its successor;
  git holds history, current-state reads stay cheap.

**2. `bee memory` — CLI-mediated writes (AXI-bound):**

- `bee memory add "<gist>" [--type lesson|fact]` — the CLI stamps
  id/type-default/provenance/state; the agent supplies only text.
- `bee memory list|show <id>` — TOON output; content-first bare
  call.
- `bee memory supersede <id> "<gist>"` — state move, script-owned.
- Roles add with provenance; the keeper prunes and curates. No
  proposals queue. `--check` on every write command; fail loud.

**3. Logbook machine headers.** Entries carry
`role :: date :: task :: plan :: verdict :: links` — emitted by
`bee verify` from birth for new entries; existing entries are
stamped mechanically at migration (one scripted pass). The logbook
index derives from headers; no regex over prose.

**4. Compaction at phase close.** Once a phase merges, older
verify/review rounds collapse to index lines; full text stays in
git. `bee logbook compact <phase>` — scripted, idempotent, `--check`.
The logbook's job is moving states; after merge, detail is history.

**5. The tidy pass.** Runs at P5 close, on the keeper's word, using
this tooling — pays down the bootstrap noise (PL-PP-005's trigger:
TOON v1 live at P4 close).

**Sweep criterion (keeper direction, 2026-11-01 — carries into the
session-clean-up skill/tool whenever it is built):** records are
not just noise and cost — retained history SHAPES down-chain
behavior; stale precedent legitimizes drift. So the test for every
kept record is not only "is this unresolved?" but **"does carrying
it forward teach the right behavior?"** — prune obsolete role
models and stale precedent along with open items. This criterion
governs the tidy pass, the PL-PP-013 session-memory sweep, and any
future cleanup skill or tool.

**Out of scope:** session-memory migration (PL-PP-013, post-P8
sweep); parking lot and suggestions mechanics (P4); rules/AGENTS
(law files are human-primary, untouched by store tooling).

**Determinism split:** everything structural — ids, stamps, state,
headers, compaction, index derivation — is script work. What counts
as a lesson or fact, and the gist text, are agent judgment. Pruning
and curation are the keeper's.

## Open questions

None blocking. (Whether `supersede` is role-gated or keeper-gated
settles in use — lean role-gated with provenance, keeper prunes.)

## Feeds

P5 (the row links this note; PL-002's gate lifts); PL-PP-005
(mechanics land here, pass at P5 close); PL-PP-013 (post-P8
migration target); ADR-014 (the write model is its write-path face).

## Addendum (2026-11-01, P5 kickoff rulings — pending rectification)

- **D1:** `bee memory supersede` is ROLE-GATED with provenance
  (keeper prunes) — settles the note's open question as leaned.
  Follow-up (keeper): the session-ender and clean-up skills carry
  the right permissions to tidy up without annoying the keeper
  (P8 inputs, item 16).
- **D2:** memory ids are per-role: `ME-<role>-NNN`.
- **D3:** `bee memory add` takes `--type` ALWAYS explicit.
- **D7:** the first `bee logbook compact` covers ALL closed phases.
- **D8:** the tidy pass is a close-time step on the keeper's word,
  not a plan task.

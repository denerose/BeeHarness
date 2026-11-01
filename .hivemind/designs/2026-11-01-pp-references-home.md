# References home (PL-PP-012) — design note

<!-- machine
status: live
phase: -
hash: -
merge: -
-->

**Date:** 2026-11-01
**Status (prose mirror):** live — both recommendations approved by
the keeper in conversation, 2026-11-01; slot semantics extended by
keeper direction the same day.

## The problem

Guiding research had no home: review notes held their sources
inline ("reference held here until…"), and nothing said where a
consuming project's own guiding references (its tax rules, its
veganism guides) would live or how guidance would reach them.

## The design

Two layers, split by the shipping test (build-time content never
ships; the mechanism does):

1. **Build-time library — `docs/research/` (this repo only).** One
   file per source: what it is, where it came from, its class, and
   where we applied it. Classes are declared per entry and the
   library never holds law — a *lens* guides judgment (four
   pillars, Böckeler); a *law source* records provenance only (AXI
   — law lives at `docs/AXI.md`). Applied work stays in `designs/`;
   library entries point at it. Curation: any role adds entries
   during work it did, provenance-stamped; the keeper prunes, never
   gates additions — references are not decisions. No machine
   headers until P4's store patterns exist (no hand conversions
   ahead of tools, ADR-014).

2. **The shipped slot.** `bee init` scaffolds the same shape in
   consuming projects: an empty `docs/` folder where none exists, a
   `docs/research/` subfolder where `docs/` already exists
   (idempotent check-and-do, same semantics as machine
   registration). Guidance topics cite paths in it — a topic is a
   bundle of rules + patterns + pointers (guides-and-sensors
   review); rules stay in the project's rules layer, guiding
   references stay in the slot. Lens and law never merge
   structurally: the slot cannot hold law.

Keeper direction (2026-11-01): Bee may be opinionated about repo
structure across the keeper's hives — the consuming projects are
the keeper's own hobby and portfolio projects under one owner, so
structural consistency is enforced, not merely suggested. This
stance stands behind the slot and behind the structure check
shipping as a per-repo capability.

**Determinism split:** the scaffolding and any future
reference-index are script work (`bee init`, the structure check);
what counts as a guiding reference, and where guidance topics cite
one, is authoring judgment.

## Open questions

None open. Entry-format details (front fields, aging, TOON) settle
when P4's store patterns land; existing entries migrate then if
needed.

## Feeds

P6 (init contract — the scaffolding semantics); P4 (guidance
skeleton: topics cite `docs/research/` — rides ambient status; the
P4 note is hash-pinned and was not edited post-pickup);
PL-PP-006 (distilled rule text cites these sources; the sources
never ship); the structure check (same opinionated-structure
stance, per-repo capability).

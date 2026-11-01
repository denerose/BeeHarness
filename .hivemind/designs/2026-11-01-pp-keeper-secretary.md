# Keeper-secretary (KS) — design note

<!-- machine
status: live
phase: -
hash: -
merge: -
-->

**Date:** 2026-11-01
**Status (prose mirror):** live — designed with the keeper
2026-11-01. This was P9's design session, run early; the build
stays at P9 (substrate proves out at P4/P5 first).

## The problem

Keeper thoughts arrive faster than design sessions. They carry
direction-weight — but had no capture path that is cheap enough to
not side-track the live session, and agent suggestions are the wrong
trust model for them (propose→curate treats the keeper's own notes
as ideas awaiting adoption; they are pending direction awaiting the
keeper's placement).

## The design

**Substrate (some of the same tooling, deliberately):** the P4
inbox store with `origin=keeper` entries; `bee capture` the write
path; views rendered from the store. No new store.

**The weight is structural, not behavioral:**

- keeper-origin items are a class apart — pinned above agent items
  in every view, never auto-resolved, never aged out, resolved only
  by the keeper (in conversation counts);
- the keeper report carries a *Keeper's notes* zone, derived from
  origin, under the same persistence rules as *Keeper's list*;
- the phase-kickoff checklist and both roles' session-start include
  a keeper-notes check — parked thoughts surface as pending
  direction at the gates that matter, never mid-thread.

**No side-track, two paths:**

- *mid-session*: the keeper drops an aside to whoever is live; the
  running role executes one `bee capture "<thought>" --origin
  keeper` and acknowledges in one line (the trio pattern, tooled);
- *standalone*: the KS context itself.

**The role (keeper ruling):** KS is a role — a minimal wrapper,
minted now — because the keeper runs one workspace tab each for PP,
PO, and KS; parity keeps the workflow domain and the structure in
line. Continuity is records-only (the store is the memory; no
session file unless use demands one) plus shared-tree discipline
(the parallel-context convention). Interim until `bee capture`
lands: the Keeper's-list and conversation conventions carry it.

**Determinism split:** capture, store, views, and the report zone
are script work; routing a note (todo / deferral / design agenda /
direct work) is conversation; resolution is the keeper's alone.

## Open questions

None blocking. (KS session file only if use demands; supersede
machanics inherit the inbox's.)

## KS tooling extension — `bee report review` (keeper direction
2026-11-01: plan and design)

**The keeper's report walk.** `bee report review` emits a digest of
the KEEPER-OWNED zones (Keeper's list, Keeper's notes): each item
with age, cross-references (parking ids, commit hashes, inbox
ids), and evidence-marked resolution candidates where they exist —
a list item whose parking item already resolved; a note whose
phase landed. KS walks the digest with the keeper conversationally;
each resolution is the keeper's word, recorded through the store
commands (`bee inbox done`, `bee park resolve`, keeper's-list
marks); regen refreshes the report after the walk. ADR-008 zone law
holds throughout: merge-never-drop, resolution keeper-only (in
conversation counts).

**Stale handling:** `--stale` flags aged items (threshold
calibratable); flags only — nothing is ever auto-dropped or aged
out.

**Evidence attachment:** every resolution stamp carries date +
conversation-origin + refs — the audit trail lives in the store,
the report renders it.

**Lane boundary:** keeper-owned zones are KS's to walk. Agent zones
(Needs the keeper / Changed / Worth a sample) regenerate from the
store; KS flags hygiene there (stale notes, one-note-per-thread
violations) for the owning role — never edits them.

**Explain-and-research mandate line** (keeper addition,
2026-11-01): no new command — KS reads the rendered views
(`bee inbox list`, the status board) and explains status, progress,
and next steps from them; a digest command only if use demands one.

**Build:** P9, with KS's other tooling; depends on P4 Task 2's
store-derived report.

## The keeper report, repurposed (keeper direction, 2026-11-01)

The original report — ADR-008's zoned interim surface (agent
sections regenerating from status.md, the keeper's list, the regen
protocol) — is STALE and its purpose is outdated: the PP/PO stream
split, self-contained asks, and the phase list as source of truth
replaced its daily-driver role. Its FUTURE: **the secretary's
tracker — the human-readable render of all the TOON tracking**
(inbox, parking, phases, logbook index, design stamps). Design
FRESH once the CLI is ready, with KS's build here at P9: do not
salvage the old format, zones, or regen protocol — ADR-008's
interim-report clause is amended at the rebuild. Interim: the
stale markdown stands untouched; P4 Task 2's store-derived render
is the bridge, not the destination.

## Feeds

P9 (the build: tooling around the minted role); P4 (the capture
command, the report zone, and the kickoff check ride existing
builds); PL-PP-009 (resolves here).

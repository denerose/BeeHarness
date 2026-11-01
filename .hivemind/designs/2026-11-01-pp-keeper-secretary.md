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

## Feeds

P9 (the build: tooling around the minted role); P4 (the capture
command, the report zone, and the kickoff check ride existing
builds); PL-PP-009 (resolves here).

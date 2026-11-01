# Harness feedback channel — design note

<!-- machine
status: live
phase: -
hash: -
merge: -
-->

**Date:** 2026-11-01
**Status (prose mirror):** live — shape approved by the keeper in
conversation, 2026-11-01; local-only ruling the same day.

## The problem

Suggestions today are per-repo: each hivemind holds its own
`.hivemind/suggestions/`, and only this repo's agents feed ours.
When other repos run the harness, their agents will have feedback
about the harness itself — nowhere to put it. Outside agents must
never write into this repo.

## The design

**Two feedback streams, kept separate.** (1) Suggestions about a
project's own work stay in that project's hivemind (the per-repo
class; the P4 inbox absorbs them there). (2) Feedback about the
harness itself goes to a shared machine-level channel.

**`bee suggest`** writes both: default target is the project-local
inbox; `--harness` targets the shared channel. Entries are lean
TOON from a template baked into the command — numbered index,
provenance stamps (repo, role, date, context digest). The command
is scaffold-class tooling (computational feedforward).

**The shared channel: a machine state dir** — `~/.bee/`
(name follows the final harness/CLI name, TBC at P6) — holding:

- `~/.bee/suggestions/<project-repo-name>/NNNN-<slug>.toon` — the
  harness feedback inbox, one folder per consuming project;
- machine registration (the P2 stub's check-and-do concept
  generalizes into this store);
- the registry of harnessed repos on this machine;
- version pins (installed vs available).

The per-machine store complements the per-repo `.hivemind/`.
Distribution stays git: the repo is the source of truth; an update
is pull + re-register.

**Curation gate.** Promotion from the shared folder into this
repo's suggestions inbox happens at hindsight/triage, as a
harness-side decision, keeper-gated — never automatic, and no
outside agent writes here directly. Propose→curate trust stands.

**Local only (keeper ruling, 2026-11-01).** No GitHub issues
mirror now; reconsidered only if a public face is ever wanted
(natural moment: P6 packaging thinks about publication).

**Determinism split:** entry creation, numbering, templating,
cross-project listing = script work; what counts as a good
suggestion and which get promoted = judgment (hindsight/triage).

## Open questions

None open. (GitHub mirror: closed as "not now, reconsider if
needed." Dir name: rides the harness-name decision at P6.)

## Feeds

P6 (init contract + packaging — the command and the store land
there); the capture design (`bee capture`, P4 — sibling
command, same store patterns); hindsight passes (the triage side
reads across the shared folder).

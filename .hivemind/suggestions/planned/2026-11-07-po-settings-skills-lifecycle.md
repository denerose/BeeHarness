# Suggestion: settings skills entries have no lifecycle — init appends, nothing ever prunes

**Filed:** 2026-11-07 · project-orchestrator (keeper-directed at the P6 close — card 4)
**Routes to:** power-planner (design question)

## The problem

`bee init` registers the harness skills path in
`~/.pi/agent/settings.json` (append-only). Nothing ever removes an
entry. The P6 dogfood (run from a task worktree, as the loop
mandates) registered the worktree's skills path; once the worktree
was removed at merge, that entry dangled — a dead path in the
machine's pi settings, hand-deleted at close (keeper-approved,
executed and verified: 2 → 1 entries).

This will recur: every worktree-based dogfood or in-worktree init
run leaves the same residue. The drift line self-heals the REGISTRY
(re-register updates in place); settings have no counterpart.

## The design question

Should settings registration gain a lifecycle? Candidate shapes
(not exhaustive, PP's call):
- an `--unregister` verb on init (or a `bee init --prune` that drops
  entries whose paths no longer exist);
- worktree-aware registration from the start (register the common
  dir's skills path only — one entry per repo, like the machine
  registry's root-keying);
- or leave it manual and document the close-time cleanup.

Related: the machine registry already solved the same problem by
keying on the repo root (P6 review D14) — the settings skills array
could follow the same identity rule.

## Notes

- Ties into the automation-levels design (L1+ repos will run init
  routinely — residue compounds).
- P8's ship-tier sweep touches init's contract; if this changes
  registration semantics, P8 should know before it freezes docs.

## Outcome (2026-11-07)
Routed to P8 item 28 with PP's design answer: init's check-and-do
prunes dead entries (paths that no longer exist drop on the next
run) — self-healing, symmetric with the registry drift line, no new
verb. Keeper-approved at P8 planning or build.

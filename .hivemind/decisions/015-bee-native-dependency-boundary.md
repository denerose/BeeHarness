# ADR 015: the bee-native boundary — what BeeHarness may depend on

**Date:** 2026-11-01
**Status:** Accepted (keeper direction, determinism/AXI session);
amended same day — git-identity reclassified (below)

## Context

The keeper works across machines and will spin up fresh BeeHarness
checkouts. The keeper's personal kit — global skills (plan-reviewer,
adr, handoff/pickup-handoff, plan, …) and the global AGENTS.md — is
ephemeral: other agents may change or delete any of it, and it exists
for harness-less work, not for the harness. Behavior docs and gates
currently name several of these instruments (inventory:
`designs/2026-11-01-pp-skill-authoring-kit.md`).

## Decision

**If the bee loop or bee-built work depends on it, it must be
bee-native** — it lives in the BeeHarness repo (skills/, roles/, bin/,
docs, rules) and ships with it.

- **Allowed foundations:** Pi, Paseo, the subagents extension — the
  keeper's default machine setup.
- **Not dependencies:** global skills and the global AGENTS.md. No
  gate, ritual, or skill of the harness may require one.
- **Fresh-machine test:** from a repo checkout plus the default
  setup, the harness basically runs — `bee init` registers the
  plugin, `.hivemind/` scaffolds per repo, the loop and the record
  discipline work. "Basically" is deliberate: niceties may lag; the
  core loop may not.
- The keeper keeps the global kit for harness-less work; it simply
  never appears in the harness's dependency chain.

## Consequences

- The hardcoded global-skill references (plan-reviewer gate, adr
  skill, handoff pair, the plan template's reviewer stamp) are
  boundary violations, not just stale-name risks. They close with the
  P7 replacement migration — each build finishing only when its
  references update.
- **Machine settings are followed, not forked.** Some things the
  harness reads from the machine SHOULD change harness behavior when
  the machine changes them. The git identity rule in the global
  AGENTS.md is the example: if the machine's expected git behavior
  for agents changes, harness users on that machine follow the new
  rule — copying it into repo law would fork it and drift. The
  boundary therefore runs between *procedures* (bee-native; global
  changes never silently alter harness behavior) and *machine
  settings* (ambient; the harness follows the machine). Where
  exactly that line sits is found in use, refined with the keeper as
  cases come up — not settled in advance.
- New bee work is checked against this boundary at plan review — no
  global-skill dependencies in anything the loop runs.
- The ADR-writer and handoff-pair homes (P7 open items) are required
  by this boundary, not optional.

## Alternatives considered

- **Vendor the globals into the repo:** copies drift, and the
  keeper's kit evolves separately for harness-less work. Rejected —
  build bee-native replacements instead (P7).
- **Pin the globals as documented dependencies:** they are ephemeral
  by nature; pinning an ephemeral thing is a false guarantee.
  Rejected.

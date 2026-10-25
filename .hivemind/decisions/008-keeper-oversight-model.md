# ADR 008: Keeper oversight model — authority, not attention

**Date:** 2026-10-25
**Status:** Proposed (power-planner, keeper direction in session 2026-10-25;
keeper approved the shape in conversation — flip when read, or amend)

## Context

Every keeper-facing artifact to date carries an implicit reading duty:
the design doc says "keeper ratifies by read", the status surface lists
items "awaiting keeper read". The keeper rejected that model
(2026-10-25): reading every owned document every time does not scale,
and empirical circle-back ("we fix it when tests break") is the real
verification loop. Oversight must survive on authority and sampling,
not on full-file attention.

## Decision

**The keeper owns by authority, not by attention.** Five pieces:

1. **No duty-reads.** Nothing demands the keeper's read. The keeper
   report (below) is the one standing digest, read whenever the keeper
   chooses; status.md stays the agents' cross-role surface (roles link
   it in chat, absolute path, when they update it).
2. **Digests, not files.** Anything handed to the keeper arrives as a
   few lines: what changed, what's risky, and only if needed a decision
   with a recommendation. Full files stay one click away.
3. **Silence accepts.** Low-risk artifacts become effective unless the
   keeper objects by their next session. Explicit yes still required
   for a short list: SOUL.md, global rules (AGENTS.md at any level),
   role mandates, anything irreversible (merges, deletions, protected
   pushes), and direction changes. ADRs recording keeper decisions
   still flip Proposed → Accepted only on the keeper's word; this ADR
   cannot bootstrap its own silence-acceptance.
4. **Sampling over read-all.** The keeper opens full documents by mood,
   not duty, checking whether the review gates (plan-reviewer,
   bee-review, testers) caught what they would. Misses recalibrate the
   gates, not the reading load.
5. **Tests are the day-to-day review.** The loop's verify/review gates
   and circle-back-when-broken do the checking; breakage in use traces
   back to the gate that should have caught it.

**Keeper report** — the digest surface: `.hivemind/keeper-report.md`,
**zoned** (keeper direction: it is the keeper's to-do list, not a
pure derived view): *Keeper's list* — the keeper's come-back items,
keeper-owned; roles add on the keeper's word, mark done only when the
keeper resolves (in conversation counts), never drop for staleness;
the keeper may edit the file directly. *Needs the keeper* (decision
asks
with recommendations — may be empty), *Changed since last report*
(≤5 lines), *Worth a sample* (optional) — agent-maintained,
regenerated freely from status.md. All paths absolute (Paseo-safe).
Refreshed by whichever role changes status.md or resolves something
with the keeper, at session start if stale, and on request. ask_user
cards remain the interrupt mechanism; the report is the batch digest.
Interim: maintained by hand; the `bee` CLI automates it later
(`bee report`).

## Consequences

- "Ratify by read" language in the design doc's status line and the
  status surface is superseded; design doc amended on flip.
- Keeper attention concentrates on explicit-yes gates and sampling.
- Hive asks in the report trace to status.md (no drift); *Keeper's
  list* is keeper voice by design — persistence beats freshness there.
  Git history of the report doubles as a change log.

## Alternatives considered

- **Keeper reads everything** — rejected: does not scale, misallocates
  attention from direction-setting to proofreading.
- **Escalations-only oversight (no standing report)** — rejected for
  now: the keeper wants a single artifact to open at will; cards alone
  are interrupts, not a batch view.
- **Decisions inbox now (build it)** — deferred: same destination, but
  the report is the cheap interim that shapes the inbox's output
  format by dogfooding (parked with the CLI build, PL-002 lane).

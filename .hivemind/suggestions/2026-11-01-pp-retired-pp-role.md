# Suggestion: a 'retired-PP' role for post-handoff quick fixes

**Date:** 2026-11-01
**Role:** power-planner (keeper direction, in-session)
**Scope:** roles system / handover resilience

**What happened:** Handoffs compress by design, and small things get
lost in the compression — a stale line, a missed file, a broken
pointer. Today the fix path is a full power-planner wake: handoff +
session memory + status surface + queue. That is a heavy context load
for a small repair, and the alternative — another role fixing
planner-owned artifacts — crosses write-ownership lanes.

**Suggestion (the keeper's):** a **'retired-PP'** role — a lightweight
planner persona for quick fixes that don't merit the full wake: fix
the lost thing, record it, retire again. Under the one-role concept
(ADR-010) it grades attributes down rather than adding a new class.

**Keeper constraints (2026-11-01, same session):**

- **Entry:** an explicit prompt from the keeper inside an existing
  session/context — never a fresh session, never a dispatch.
- **Authority:** only on the keeper's say-so — no role summons it, no
  self-triggering.
- **Host:** only a session whose agent was previously the
  power-planner.

**Open questions (filed open; the design session answers them):**

- Name — 'retired-PP' is the keeper's coinage; keep it or find the
  plainer name at design time?
- Boundary — which artifacts may it touch: live surfaces only, or
  planner-owned durable records too? Where does its write authority
  stop (ADRs and design docs presumably stay keeper-gated)?
- Relation to the flexibility principle (roles are defaults, not
  walls) — does it replace small cross-role edits, or formalize them?
- Does it read the retired predecessor session files
  (`power-planner-<date>.md`)? The lost thing often lives there.

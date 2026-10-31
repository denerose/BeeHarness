# ADR 014: deterministic-first, agent-first surfaces (AXI)

**Date:** 2026-11-01
**Status:** Accepted (keeper's word, determinism/AXI design session;
conference-notes topics 2 and 6, PL-PP-004)

## Context

The harness's procedures live as skills — instructions agents follow —
including work that is pure bookkeeping: running named checks, moving
work-item states, updating checkboxes, citing records. The P3 evidence
separated the classes cleanly: the two scripted artifacts (`bee
report`'s zoned merge, `scripts/task.sh`) ran the whole phase with zero
bookkeeping incidents, while the one agent-maintained state surface
(plan checkboxes) produced the phase's only blocking bug — boxes
checked for work not done. Meanwhile the `bee` CLI grows through
P4–P6, and the keeper directed: prefer deterministic tools wherever
possible, keep inference for genuine judgment or variability, and make
the CLI follow the ten AXI principles (axi.md; the list lives in
`AXI.md`).

## Decision

**1. Scripts before skills — the determinism test.** If two careful
people following the same rules would produce the same result, it is a
script; if they would differ, it needs an agent. Scripts own state,
structure, checks, and derived views; agents own drafting, judgment,
dispatch, and conversation. Skills lose their clerical work and keep
their thinking.

**2. Storage follows the primary reader — the three-way rule.**

- **Stores go lean.** Agent-primary stores — the decisions inbox,
  memory, the parking lot, suggestions, dispatch briefs and pass-back
  digests — are stored in TOON (token-oriented notation). The human's
  door into them is a rendered view, a digest, or an on-demand
  explanation from an agent: digests-not-files (ADR-008) extended from
  the oversight model to storage itself.
- **Mixed documents carry a machine header and a prose body.**
  Logbook entries (role, date, verdict, record links), plans
  (validation level, phase, task state, targets), ADRs (number,
  status), role files (the six ADR-010 attributes — schema-checkable
  by script), skill front matter (with a TOON index over the
  registry). Indexes and verdict lookups derive mechanically instead
  of regex-scanning prose.
- **Views render for humans.** The keeper report, the status board,
  and anything the keeper reads directly stays rendered prose.
- **Exception:** relay prompts stay human-readable — the keeper gates
  relays and tweaks each one.
- **Format calls:** TOON is both the storage format for lean stores
  and the emission format for agent-facing CLI output. XML rejected —
  unambiguous delimiting is the header block's job, at 2–3× the token
  cost. Verify output is structured (counts, pass/fail, failures-only
  detail) — no raw terminal dumps into logbook entries.

**3. The bee CLI is AXI-bound.** Every `bee` subcommand and every
agent-facing surface follows the ten principles in `AXI.md` (linked
from README, AGENTS.md, SOUL.md). The P2 stub already satisfies the
structured-errors principle (strict flags, exit codes, `--check`,
idempotent `init`, no prompts); P4 onward bakes in the rest. Bare `bee`
shows live state, not help.

**Named moves (consequences of the test applied):**

- `bee verify` runs a plan's checks and emits the structured logbook
  entry; agent judgment shrinks to anomalies.
- Work-item state moves and checkbox updates become script-owned
  (`bee task`, P4) — an agent can still misstate, but it can no longer
  accidentally mark done what has no record.
- Plan-gate mechanical checks (paths exist, commands run, counts
  match, no ephemeral prose in durable docs) script into the in-house
  reviewer core.
- `bee suggest` and quick-thoughts capture are templated writes,
  born-lean.
- P4's inbox is born-TOON and absorbs the suggestions' awaiting-read
  state; the parking lot converts when its subcommand owns the
  mutations; P5 memory is born-TOON (PL-002's headers-as-index
  compromise dissolves — the index is the format); ambient session
  guidance (PL-PP-003) is born-lean.
- **No conversions by hand ahead of tooling** — the interim stance
  holds; stores go lean when their `bee` subcommand lands.

## Consequences

- The view layer becomes load-bearing: rendered views and digests are
  the human's window into lean stores. Rendering gains robustness — a
  parser over TOON replaces regexes over hand-written markdown.
- Every judgment task stays agentic (review, brainstorm, hindsight,
  argue, dispatch, adjudication); nothing is lost, only de-cluttered.
- Determinism compounds: each move turns "hope the agent followed the
  rule" into "the rule is the code."
- Phase queue updated (P4/P5/P6 rows); CLI-writing and AXI skills and
  rules are drafted in P4.

## Alternatives considered

- **Emission-only TOON** (lean views, all storage human-readable):
  preserves raw-file readability everywhere but pays a human-format
  tax on stores the keeper reads only through digests and sampling.
  Rejected on keeper push — storage follows the primary reader.
- **XML for structure:** unambiguous delimiting at 2–3× token cost;
  the machine-header block covers the same need. Rejected.
- **Status quo** (skills keep their own bookkeeping): P3's checkbox
  incident against zero script incidents, same hive, same period.

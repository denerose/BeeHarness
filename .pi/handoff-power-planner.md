# Handoff — power-planner

**Updated:** 2026-10-25 (second session; supersedes the wake-test
handoff of the same day)
**Note:** per-role handoff (ADR-007). Refresh, not close — memory
sync only, no parking-lot sweep performed, deliberately.

## Working mode — read this first

Resume **POWER-PLANNER** (mandate: `roles/power-planner.md`).
Conversation first: prose exploration, no cards while exploring
(cards crystallize a ready decision, one at a time, recommendation
first); in rapid dialogue, recommendations ride in prose — the
keeper's next message stands as the decision. Draft early; always
recommend; park rather than press. First action on wake: announce the
resumed role and your first move, then CONTINUE THE CONVERSATION —
never re-interview the keeper.

**Communication law (new this session, in AGENTS.md + GLOSSARY
writing standard — read both before speaking):** plain language,
SHARED jargon only (the keeper's shorthand fine in moderation, never
agent-coined phrases); every ask to the keeper is SELF-CONTAINED (a
few plain sentences of context — the keeper's attention spans days,
not turns); behavior documents stay GENERIC (no task-specific
examples or dated stories — placeholders only); when explaining, the
plain version comes first.

## Where we are

- **ADRs 001–013** current. The recent six: 008 keeper oversight
  (no duty-reads; digests; silence accepts; zoned keeper report),
  009 forward planning (planned rows in the phase queue; propose-next
  rule), 010 one role concept (six attributes; lifespan declared,
  continuity derived), 011 task-orc (first dispatched role; boundary
  test: dispatcher never opens source files), 012 git topology
  (main = governance + surfaces; `phase/<n>` spine in PO worktree;
  `task/…` worktrees; two-size resets), 013 logbook rename
  (`.hivemind/logbook/`, not records/ — purposes per class in the
  design doc map).
- **P3 design COMPLETE** (schema + contract + topology). Execution
  pending: PO picks it via propose-next after P2 closes.
- **P4 design note written**:
  `.hivemind/designs/2026-10-25-pp-p4-inbox-design.md` — the inbox
  as single waiting-state home; views-not-copies; interim stance:
  the status notice board is the interim, NO extensions.
- **bee-argue skill** born + cold-tested (`skills/bee-argue/`).
- **PO parallel**: P2 (`bee` CLI stub) mid-flight in the shared tree
  — expect its commits between your turns; never sweep its in-flight
  files (stage by name only).
- Keeper report + status surface live and current; PO has ~5 open
  cross-role items riding ambient pickup (ADR-004 skill updates,
  task-orc dogfood, phase worktree setup, role-file sweep, logbook
  saves) — that's the known interim weakness; evidence, not a bug to
  patch by hand.

## Threads (recommended order)

1. PO escalations / P2→P3 transition support (propose-next should
   fire when P2 closes; P3's first worktree may want the keeper's
   hand)
2. Keeper's-list sessions: superpowers + global skills replacement
   review (plan-reviewer may move in-house as bee-native); harness
   name
3. Suggestions inbox (~20 files): keeper samples at will; if asked
   to prioritize, act first on `pp-scripted-edits-verify` (recurred
   three times after filing)
4. Parked: PL-002, PL-PP-001, PL-PP-003 (CLI help surfaces),
   PL-PP-004 (conference notes — a keeper↔PP discussion),
   PL-PP-005 (logbook cleanup/compaction)

## Key files

- `.hivemind/sessions/power-planner.md` — decision log 1–63; re-read
  after any context break
- `.hivemind/status.md` — read at every wake (ADR-007); the [PP→PO]
  notes carry the open cross-role items
- `.hivemind/keeper-report.md` — zoned (Keeper's list persists,
  NEVER drop it in a regen; protocol lives in the file header)
- `.hivemind/decisions/` 001–013 · `.hivemind/designs/` (governing
  doc + P4 note) · `.hivemind/phases/BeeHarness.md` (the queue)
- `skills/GLOSSARY.md` (terms + writing standard) · `roles/` (incl.
  `task-orc.md`) · `AGENTS.md` (rules of engagement)

## Environment notes

- Commit discipline (ADR-007 + amendments): stage owned files BY
  NAME (never `add -A`; PO shares this tree with in-flight edits);
  `pull --rebase` blocks on a dirty tree — check `git fetch` +
  `main..origin/main` instead; push promptly; `Role: power-planner`
  trailer. Claim-with-commit: cite the hash when telling the keeper
  a record changed.
- Absolute paths to the keeper in chat/report (Paseo dot-dir links
  404); repo-relative inside files.
- Corrections apply at the keeper's STATED scope, then stop.
- **Known hazard — the edit tool replaces, it never inserts** (five
  occurrences this session): when ADDING a line or block near
  existing text, anchor `oldText` on a unique line that will REMAIN
  (a section header, or the following block's first line) and repeat
  it inside `newText` after your addition. Anchoring on the target
  line's own head silently deletes it. Companion failure: editing
  from remembered line-wraps — read the exact lines first
  (`sed -n 'N,Mp' file`) before writing `oldText`. If an edit call
  fails to match, that is the warning working — re-read, don't
  re-guess. (This is why `pp-scripted-edits-verify` is the urgent
  suggestion.)
- `.pi/handoff.md` (generic) is superseded; per-role files rule.

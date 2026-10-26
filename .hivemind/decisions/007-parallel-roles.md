# ADR 007: Parallel roles — partition, ownership, attribution

**Date:** 2026-10-25
**Status:** Accepted (keeper direction, design session 2026-10-25)

## Context

Roles now run in parallel: power-planner and project-orchestrator have
worked the same repo simultaneously since 2026-10-18. A concurrency
review (2026-10-25) found the design separates *authority* well but has
no *serialization*: identifiers are allocated by look-then-increment
(proven collision: duplicate PL-003, renumbered in 42a6a42), one working
tree and branch serve all roles with no commit protocol (unpushed
commit batches racing; `add -A` can sweep a sibling's in-flight edits),
every role commits as one identity (provenance collapse — SOUL's
transparency value cannot be met), one shared handoff file, and no
cross-role visibility of open escalations or pending ADR approvals.

## Decision

**Partition before coordination** — namespaces and ownership instead of
locks; coordination machinery only if partitioning is proven insufficient.

1. **Role-prefixed identifiers.** Parking lot: `PL-PP-NNN` /
   `PL-PO-NNN` (existing PL-001..004 keep their numbers). ADR numbers:
   power-planner allocates by default; the orchestrator may allocate
   when creating (scribe work); collisions resolve by renumber-on-merge.
   Plan/design/suggestion slugs carry role initials (`pp-`/`po-`).
2. **One tree, commit discipline** (no per-role branches yet): stage
   only files your role owns — never `git add -A`; `pull --rebase`
   before push; push promptly after each commit batch; a rejected push
   means re-read what landed, never force.
3. **Write ownership** (extends ADR-003; includes the keeper-consented
   scribe exception, 2026-10-20, commit e36b8e4):

   | artifact | writer |
   |---|---|
   | `.hivemind/decisions/` | power-planner drafts (`Proposed`); keeper flips to `Accepted`; orchestrator scribe-edits small mechanics (typos, paths, status) — substantive decisions never |
   | `.hivemind/designs/` | power-planner + keeper |
   | `AGENTS.md`, `skills/GLOSSARY.md` | power-planner (keeper authorization for AGENTS.md); others propose |
   | `.hivemind/plans/`, `phases/`, `records/` | project-orchestrator |
   | parking-lot appends | any role (role-prefixed IDs); resolve/unpark keeper-only |
   | `.hivemind/suggestions/` | any role |
   | `roles/` | power-planner, codified from observed models |
   | `skills/` | power-planner designs; orchestrator implements via plans |

4. **Attribution.** Commits carry a `Role: <role>` trailer; records and
   reports state their producing role. The git identity stays single
   (ADR-002).
5. **Escalation envelopes.** Every ask_user card states: role, context
   (plan/phase), the question, and where the answer will be recorded.
6. **Shared status surface (interim).** `.hivemind/status.md`: open
   escalations, ADRs awaiting the keeper's flip, cross-role notes. Both
   roles read it at session start and update it on change. Replaced by
   the decisions inbox when that exists.
7. **Session memory.** One holder per role file; takeover = rename the
   predecessor to `<role>-<date>.md` and note it in the fresh file.
8. **Handoffs.** Per-role: `.pi/handoff-<role>.md`.
9. **Records.** Versioned filenames (`…-task3-verify-r2.md`); records
   produced in worktrees always land in the main checkout's
   `.hivemind/records/`, never only on a task branch.
10. **Loop claims.** The phase list gains an `owner` column; claim
    (role + timestamp) before dispatch; re-read before write.
11. **Flexibility principle.** Roles are defaults, not walls: small
    cross-role edits that spare the keeper window-switching are allowed
    (scribe edits, marked with the Role trailer); substantive authority
    never crosses. The harness suits the keeper's workflow first; role
    clarity serves that, not the reverse.

## Alternatives Considered

### Per-role branches or worktrees for the roles themselves
**Pros:** hard isolation.
**Cons:** merge ceremony on every doc edit; the roles mostly touch
disjoint files once ownership (rule 3) exists. Revisit if discipline
fails.

### Lock files / claim protocols everywhere
**Pros:** no collisions by construction.
**Cons:** mechanism before need; the proven collision class (IDs) is
solved cheaper by prefixes.

### Serialize the roles (one agent at a time)
**Cons:** contradicts the parallel requirement; wastes the keeper's
time.

## Consequences

### Positive
- No coordination machinery to build or maintain; collisions become
  structurally rare; provenance restored without touching ADR-002's
  identity model; keeper friction stays low (scribe + flexibility).

### Negative
- Discipline is rule-based until tooling can enforce it; `status.md` is
  manual and can go stale; ADR renumber-on-merge remains possible.

## Affected Areas

- All `.hivemind/` namespaces; commit habits of both roles;
  `skills/bee-loop` (claims, records), `skills/bee-plan` and
  `bee-hindsight` (slugs); `roles/` continuity protocols; GLOSSARY.

## Amendment 1 (2026-10-25): root files, shared surfaces, layout completeness

**Status:** Accepted (keeper direction, oversight session 2026-10-25:
"I don't want to be writing anything by hand" — roles write, the
keeper signs off)

1. **Root-file ownership** — rule 3's table gains:

   | artifact | writer |
   |---|---|
   | `SOUL.md` | power-planner drafts and updates, in collaboration with the keeper; changes land only on the keeper's sign-off |
   | `README.md` | power-planner and project-orchestrator both amend; changes land only on the keeper's sign-off |

   README.md joins ADR-008's explicit-yes list (that list extends
   here); SOUL.md was already on it.
2. **Shared-surface atomicity** (codifies the orchestrator's working
   fix, 2026-10-25): edits to files both roles maintain — `status.md`,
   the keeper report's agent zones — commit immediately in their own
   commit, never left uncommitted: `git add` stages whole files and
   can sweep a sibling role's in-flight line. Line-prefix attribution
   is the provenance that survives sweeps.
3. **Layout completeness:** the `.hivemind/` holdings lists (repo
   AGENTS.md Layout section, GLOSSARY "hivemind", design doc
   artifacts map) must be exhaustive — `records/`, `status.md`, and
   `keeper-report.md` included. Applied alongside this amendment.

## Amendment 2 (2026-10-25): branches arrive (scoped)

**Status:** Accepted (with ADR-012, git topology)

Rule 2's "one tree, no per-role branches yet" now means: **one shared
checkout for governance and surfaces** (PP's work, PO's surface edits,
keeper relays — the partition discipline unchanged); **build work
branches** per ADR-012: `phase/<n>` integration (PO, persistent
worktree) and `task/<phase>-<slug>` per dispatch. Rule 9's worktree
records clause becomes: **records ride the task branch and reach main
no later than the work they evidence** (at merge); mid-flight, read
via `git show <branch>:<path>`.

## References

- ADR-002 (identity — amended today), ADR-003 (pipeline — amended
  today), ADR-006 (states/records), concurrency review 2026-10-25
  (worker subagent findings F1–F14)

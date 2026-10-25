# ADR 010: One role concept, graded by attributes

**Date:** 2026-10-25
**Status:** Accepted (keeper direction in the P3 brainstorm; final shape
picked by card — "declare lifespan, derive continuity by default")

## Context

P3 opened with the keeper's question: does the hive need a second
orchestrator — a project-level role plus a task-level one running the
plan/implement/verify/review loop? The session first answered with two
classes (expensive peer "roles" vs cheap dispatched "personas") and the
keeper rejected that split: roles don't have to be expensive; PP and PO
are first-class because they are built that way, not because
first-class-ness defines "role." A class boundary breeds the same
confusion as other taxonomy seams (see PL-PP-002).

## Decision

**One role concept.** Every role is a file in `roles/` declaring
attributes; PP/PO are the maximum configuration, not the definition.
Six attributes:

1. **mandate** — what it does, where it stops
2. **entry** — who may invoke it: the keeper (first-class) or named
   roles (dispatched); dispatched role files embed their dispatch brief
3. **escalation** — to the keeper, or one hop up through the
   dispatcher; dispatched roles never open keeper-facing cards
4. **workspace** — main checkout, or a worktree (role spawn ties
   directly into the git strategy)
5. **lifespan** — standing or per-dispatch (**the declared line**)
6. **continuity** — session file or records-only. **Derived by
   default**: standing → session, per-dispatch → records-only. Going
   off-diagonal (standing + records-only, or per-dispatch + session)
   is an explicit override line in the role file — a visible act, not
   a silent default.

**Slot-file rule** (per-dispatch + session override): the session file
belongs to the role — the slot — not the instance; concurrent
instances append, never overwrite.

Dispatched roles mint as ordinary role files: task-orc, reviewer, and
implementer arrive in P3 as this family; today's ad-hoc subagent
briefs become proper role specs; role files are cold-readable and
testable the way skills are (bee-skill-tester).

Task-level orchestration is therefore **two levels, one concept**:
PO drives dispatched task-orc roles via bee-loop; task-orc feeds back
through records (which land in the main checkout, per ADR-007) and a
summary; PO finalizes — integration, merge, phase-list transition.

**Revisit trigger:** if no off-diagonal role exists by the end of P3,
drop the override mechanism and collapse to lifespan-only — with
evidence, not speculation.

## Consequences

- Minting a common role = mandate + entry + lifespan; the rest derives.
- Zombie configurations (accidentally standing-but-memoryless) are
  impossible to bless silently.
- The keeper's interrupt surface stays PP + PO (escalation attribute).
- Worktree mechanics become part of role spawn; the git strategy
  designs against attribute 4.
- Minting a new task-level role costs a file, not a governance
  ceremony.

## Alternatives considered

- **Two classes (peer roles vs dispatched personas)** — rejected:
  double structure, class-boundary confusion.
- **Two orchestrator roles (peer task-orc)** — rejected: forces
  keeper-gated relays at implementation altitude, or invents ungated
  role-to-role relays (unproven concurrency territory).
- **Continuity-only / lifespan-only / both-equal** — argued by three
  dispatched workers; the asymmetric synthesis won (keeper's card).

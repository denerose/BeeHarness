# task-orc — dispatched role

First dispatched role minted under ADR-010; contract per ADR-011
(P2 post-mortem data). Minimal by design — formalization waits on the
boundary test.

## Attributes (ADR-010)

- **entry:** project-orchestrator, via bee-loop dispatch
- **escalation:** one hop up — stop-and-return; never cards the keeper
- **lifespan:** per-dispatch (declared)
- **continuity:** derived — records-only; no session file
- **workspace:** worktree per dispatch (ADR-012) — branch
  `task/<phase>-<slug>` off the phase branch; records ride the branch

## Mandate

Run ONE plan's bee-loop (implement → verify → review) per dispatch,
cold from the plan — never from dispatcher context. Stop and return at
two failed fix rounds with an escalation package: question + context +
recommendation. Bounded to the plan's scope; deviations allowed but
always reported with reasons (intent judgment stays project-level).

## Dispatch brief (embedded — the dispatcher fills this in)

- plan path
- phase id
- validation level (from the plan header)
- escalation envelope: what this role decides alone vs. what it returns
- the three safety lines (GLOSSARY: dispatch brief, safety lines)

## Pass-back (end of work)

A done-ness digest ONLY: tasks complete; verify/review verdicts with
record paths; commit hashes; plan/phase-list state; deviations with
reasons; escalation and parking/suggestion candidates. Record paths,
never contents — if the return carries what the records carry, the
context win is zero.

## Boundary test (formalization trigger — ADR-011)

The dispatcher never opens source files; it reads only records and
deviations. While that holds, this file stays minimal.

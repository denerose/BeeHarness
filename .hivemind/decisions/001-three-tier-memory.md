# ADR 001: Three-tier memory for continuity

**Date:** 2026-10-18
**Status:** Accepted

## Context

Sessions die: context windows fill (Pi auto-compacts), models switch,
sessions fork or simply end. Design knowledge produced during planning was
held only in conversation and vanished with it. We need a continuity
layer that survives context loss without clogging future work, layered on
Pi's native compaction/session features — never replacing them.

A second failure mode: "come back to xyz" items raised mid-discussion and
then lost, or worse, lingering as noise after resolution.

## Decision

Memory has three tiers distinguished by **lifetime**, plus a formal
parking lot:

| Tier | Location | Lifetime | Content |
|---|---|---|---|
| Session | `<repo>/.hivemind/sessions/session.md` (gitignored) | live during work-in-flight, retired at end | where we are, current thread, immediate state |
| Project | `<repo>/.hivemind/memory/` (committed) | life of the project | project knowledge, state, pointers; never duplicates ADRs |
| Harness | `~/.pi/agent/memory/` | life of the machine | the user, the machine, cross-project workflow knowledge |
| Parking lot | `<repo>/.hivemind/memory/parking-lot.md` (committed) | until resolved | deferred decisions, session-independent |

Rules:

1. **Promotion, not duplication.** At handoff/retirement, session state is
   promoted: durable knowledge → project/harness memory; deferred
   decisions → parking lot; the rest discarded.
2. **Session memory is live.** Updated at each decision point; re-read
   after compaction, model switch, fork, or new session. Handoffs
   (written at end) are the cross-session artifact; session memory is the
   during-session one.
3. **Descriptive vs normative.** Memory holds what's true (facts,
   lessons); AGENTS.md files hold what to do (rules). Existing mixed
   content migrates gradually — no big-bang migration.
4. **Write-trust.** Planners write memory directly; implementers propose
   entries in completion reports (a planner curates); the human prunes.
5. **Loading.** One pointer line in each AGENTS.md → that level's
   `INDEX.md`; shards loaded on demand. Zero code until proven
   insufficient.
6. **Parking lot authority.** Any agent may propose parking; only the
   human unparks or resolves. The brainstorm process ends with a
   loop-back gate over the parking lot.
7. **Handoff sync.** Every handoff ends with a memory sync + parking-lot
   sweep. The existing `handoff`/`pickup-handoff` skills stay generic.

## Alternatives Considered

### Everything in AGENTS.md
**Pros:** always auto-loaded, zero new machinery.
**Cons:** rules drown in facts; file grows unboundedly; can't separate
session-transient from durable.

### Auto-injected memory via extension from day one
**Pros:** guaranteed loading.
**Cons:** code before the need is proven; injection of large content
wastes context; YAGNI.

### Two tiers (session + one global memory)
**Pros:** simpler.
**Cons:** project knowledge and machine/user knowledge have different
owners, lifetimes, and visibility — mixing them makes both worse.

## Consequences

### Positive
- Nothing learned dies with a session; nothing resolved clogs the future.
- Works today with zero code; each tier is just markdown.
- Clean authorship story per tier.

### Negative
- Harness memory (~/.pi/agent/memory/) is outside any git repo — no
  versioning or backup yet (accepted; revisit if it grows valuable).
- Discipline is rule-based, not enforced — agents may forget to sync;
  the extension phase can add enforcement.

### Neutral
- `.bee/` naming is provisional, tied to the project name TBC.

## Affected Areas

- `<repo>/.hivemind/sessions/session.md`, `<repo>/.hivemind/memory/` — created
- `~/.pi/agent/memory/` — created
- `~/.pi/agent/AGENTS.md`, `<repo>/AGENTS.md` — pointer lines added
- `~/.pi/agent/skills/memory/` — new skill encoding the rituals

## Amendment (2026-10-18): discovery model and implementation timing

1. **Discovery (supersedes rule 5):** headers-as-index — every shard
   opens with `Read when:` + summary; the catalog is a *property of the
   shards*, not a second artifact. No separate INDEX.md. Pointers target
   the directory.
2. **CLI as derived layer:** `bee memory list|search|show|add|propose`,
   `bee park` — views/curators over plain-markdown storage, never owners
   of it. Derived catalogs can't drift. Write-trust enforced via
   `PI_SUBAGENT_AGENT` role gate (`add` refuses implementers → points at
   `propose` queue); provenance stamped per entry; unpark stays human
   (the CLI runs as the agent; no `unpark` command exists).
3. **Implementation deferred to the harness build:** storage + CLI +
   skill + pointers land together and are dogfooded from day one — no
   transitional system. **Bootstrap exception:** builders run scrappy
   continuity (session file + parking lot + ADRs); session memory may
   hold project knowledge until the harness exists, promoted on landing.
4. **Pain valve:** if bootstrap debt hurts before the build, promote into
   rough `memory/` shards ad hoc — pain is the trigger, not foresight.
5. **Final locations (ADR-005 amendment):** session state →
   `.hivemind/sessions/`; project memory → `.hivemind/memory/`.
6. **Terminology (2026-10-25, resolves PL-003):** rule 7's "handoff"
   means the same-role context-refresh skill pair only. Cross-role work
   passing is a **relay**; role→subagent is a **dispatch** (GLOSSARY).
7. **Ritual split (2026-10-25, keeper correction):** rule 7's
   "memory sync + parking-lot sweep" bundled two rituals. A handoff
   (context refresh — crash, fork, weird context; work continues) ends
   with a memory sync ONLY. The parking-lot sweep belongs to closing
   work — brainstorm loop-back, session close (the promote ritual),
   phase gates — when something actually ended.

## References

- Continuity spec: `.hivemind/designs/2026-10-18-continuity-layer.md`
- ADR 002 (git identity) — unrelated but same phase

# Roles

A role is a named mandate for an agent session: its authority, working
style, entry conditions, and its own continuity protocol (how it hands
off, wakes, and survives compaction). Roles live here in the plugin and
are assumed by direction — an agent knows which role it holds because
the keeper (or a handoff/session state) says so, never because a task
"feels like" one.

Behavior that belongs to a role lives **here**, not in global AGENTS.md
files. Global law stays mode-neutral; roles make mode-specific behavior
findable and reviewable.

Current roles:

- `power-planner.md` — top-level design partner (validated in the
  BeeHarness bootstrap sessions)

Planned roles (design pending, orchestration phase): orchestrator,
implementer, task reviewer, phase reviewer.

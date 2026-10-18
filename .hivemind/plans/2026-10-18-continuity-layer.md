# Continuity Layer Implementation Plan

> **STATUS (2026-10-18): SHELVED — design input only, not for execution.**
> Bootstrap exception (ADR-001 amendment): builders run scrappy
> continuity; the real memory system (headers-as-index storage +
> `bee memory` CLI as derived layer) ships with the harness build.
> Task 4 (PL-001 git identity) was extracted and executed separately.
> Seeds, skill text, and rituals below are ready-made input for that
> build.

> **For agentic workers:** This plan executes **manually** — power-planner
> + keeper, no orchestrator exists yet (it is the pilot artifact future
> loops will be measured against). Before execution, run the
> `plan-reviewer` skill (plan review gate). Steps use checkbox syntax for
> tracking. No implementation happens before keeper approval of spec+plan.

**Goal:** Stand up the three-tier memory system, parking-lot conventions,
loading chain, and memory skill — content only, zero code.

**Architecture:** Markdown shelves + INDEX files loaded via AGENTS.md
pointer lines (auto-load chain), one global skill encoding rituals,
handoff-sync as a rule. See spec for formats and ADR-001 for rationale.

**Tech Stack:** Markdown, git, existing pi auto-load of AGENTS.md.

**Spec:** `.hivemind/designs/2026-10-18-continuity-layer.md`

## Global Constraints

- Zero extension/CLI code in this phase.
- Verified facts only in harness memory (cite source if from a doc).
- `handoff`/`pickup-handoff` skills remain untouched.
- Repo commits authored by `denerose-pi` (machine default).
- Global-file edits (`~/.pi/agent/…`) are minimal and exactly as quoted.

---

### Task 1: Project memory shelf + AGENTS.md wiring

**Files:**
- Create: `memory/INDEX.md`
- Modify: `AGENTS.md` (pointer, adr-path marker, handoff-sync, memory rule)

**Interfaces:**
- Produces: `memory/INDEX.md` referenced by AGENTS.md; `.hivemind/decisions/` marker
  consumed by the `adr` skill.

- [ ] **Step 1: Create `memory/INDEX.md`**

```markdown
# BeeHarness memory — index

Rule: planners write, implementers propose, keeper prunes. Decisions live
in ADRs (`.hivemind/decisions/`) — memory points at them, never restates them.

| shard | summary |
|---|---|
| parking-lot.md | deferred decisions awaiting loop-back; only the keeper unparks |
```

- [ ] **Step 2: Edit `AGENTS.md`** — three changes.

(a) After the intro paragraph (ends "...what applies on every task."),
insert:

```markdown
<!-- adr-path: .hivemind/decisions -->

Project memory: read `memory/INDEX.md` and follow it before planning or
executing work in this repo.
```

(b) Replace the handoff bullet:

```markdown
- When context runs short, run a handoff (`handoff` skill) rather than
  guess; resume with `pickup-handoff`. Every handoff ends with a memory
  sync and parking-lot sweep (`memory` skill promote step).
```

(c) Replace the "Until the memory system exists" bullet with:

```markdown
- Memory: read `memory/INDEX.md` before work; rituals live in the
  `memory` skill (write/propose/promote/park).
```

- [ ] **Step 3: Verify** — `memory/INDEX.md` exists; `grep -n "adr-path\|memory/INDEX" AGENTS.md` shows both; table file referenced (`.hivemind/memory/parking-lot.md`) exists.

- [ ] **Step 4: Commit** — `git add memory AGENTS.md && git commit -m "add project memory index and wire AGENTS rules"`

### Task 2: Harness memory shelf + global pointer

**Files:**
- Create: `~/.pi/agent/memory/INDEX.md`, `machine.md`, `user.md`, `workflow.md`
- Modify: `~/.pi/agent/AGENTS.md` (one section, after `# Global Rules`)

**Interfaces:**
- Produces: the INDEX the global pointer targets; shards per spec format.

- [ ] **Step 1: Create `~/.pi/agent/memory/INDEX.md`**

```markdown
# Harness memory — index

Rule: planners write, implementers propose, keeper prunes. Read the
shards you need, not everything.

| shard | summary |
|---|---|
| machine.md | accounts, credentials posture, paths, tools on this machine |
| user.md | how the keeper likes to work — lessons, dated |
| workflow.md | cross-project conventions: mandates, memory tiers, modes |
```

- [ ] **Step 2: Create `~/.pi/agent/memory/machine.md`**

```markdown
# Machine

- 2026-10-18 — GitHub: `denerose-pi` (agent account; scopes repo,
  workflow, gist, read:org; gh active account) and `denerose` (keeper's
  own; lacks workflow scope; agents never use it). Pushes via HTTPS +
  gh credential helper; github.com ssh host key absent from known_hosts.
- 2026-10-18 — Git identity (global): `denerose-pi
  <285322498+denerose-pi@users.noreply.github.com>`. Keeper-authored
  commits: `--author "denerose <109723086+denerose@users.noreply.github.com>"`
  (BeeHarness ADR-002).
- 2026-10-18 — agent-browser: `~/.pi/agent/bin/agent-browser`, Chrome
  under `~/.agent-browser/browsers` (per subagents README).
- 2026-10-18 — pi: `/usr/lib/node_modules/@earendil-works/pi-coding-agent`
  (+ docs/ there). Sessions, compaction, `/fork` `/clone` `/tree` are
  native — never rebuild them.
- 2026-10-18 — subagents ext: `~/.pi/agent/extensions/subagents`
  (scout/researcher/worker/visual; paseo daemon localhost:6767, password
  `~/.paseo/daemon-password`; direct-pi fallback). Extend, never couple.
```

- [ ] **Step 3: Create `~/.pi/agent/memory/user.md`**

```markdown
# User (keeper) — working style

Newest last. Lessons only — observed and confirmed, not assumed.

- 2026-10-18 — Draft-early, refine-together: when context is sufficient,
  produce a concrete artifact to react to instead of more questions.
- 2026-10-18 — Greenfield/project brainstorms are conversations first;
  question cards only when crystallizing decisions (power-planner mode —
  top-level only, by direction). Normal planner work keeps card
  discipline (one question at a time, always recommend).
- 2026-10-18 — Always recommend; alternatives get one-line justifications.
- 2026-10-18 — Defers decisions to a parking lot rather than resolving
  under pressure; expects a loop-back gate at the end of brainstorms.
- 2026-10-18 — Wants decisions recorded (ADRs) and state visible (session
  file) — transparency is a value, not a nicety.
```

- [ ] **Step 4: Create `~/.pi/agent/memory/workflow.md`**

```markdown
# Workflow conventions (cross-project)

- 2026-10-18 — Mandates: each agent tier has a mandate; decisions outside
  it escalate early, with a recommendation. Terminology per BeeHarness
  SOUL. Formal contract pending.
- 2026-10-18 — Memory: three tiers (session `.bee/session.md` live;
  project `<repo>/memory/`; harness here). Promotion at handoff; parking
  lot for deferrals (keeper unparks). Full rules: BeeHarness ADR-001.
- 2026-10-18 — Brainstorm modes: power-planner (conversational) vs
  normal planner (cards). Power-planner is a directed role, never a
  subagent.
```

- [ ] **Step 5: Edit `~/.pi/agent/AGENTS.md`** — insert directly after the `# Global Rules` heading:

```markdown
## Harness memory

Before planning or executing work in any project, read
`~/.pi/agent/memory/INDEX.md` and follow it. Every handoff ends with a
memory sync and parking-lot sweep (the `memory` skill).
```

- [ ] **Step 6: Verify** — `ls ~/.pi/agent/memory/` shows 4 files; `grep -n "memory/INDEX" ~/.pi/agent/AGENTS.md` hits; every shard named in INDEX exists.

- [ ] **Step 7: No commit possible** (outside any repo) — noted as accepted risk in ADR-001.

### Task 3: Memory skill

**Files:**
- Create: `~/.pi/agent/skills/memory/SKILL.md`

**Interfaces:**
- Consumes: tier locations + formats from spec/ADR-001.
- Produces: skill invocable by description match in any project.

- [ ] **Step 1: Create `~/.pi/agent/skills/memory/SKILL.md`**

```markdown
---
name: memory
description: Manages three-tier memory (session/project/harness) and the parking lot. Use before planning or executing work (read), when learning something durable (write/propose), at handoff or session end (promote), and when deferring a decision (park).
---

# Memory rituals

Tiers: session `<repo>/.bee/session.md` (live, gitignored) · project
`<repo>/memory/` · harness `~/.pi/agent/memory/`. Index at each shelf.
Decisions live in ADRs, not memory. Rule: planners write, implementers
propose, keeper prunes.

## Read
Before planning or executing work: read the harness INDEX and the
current project's INDEX; load only shards you need. After compaction,
model switch, fork, or session start: re-read `.bee/session.md` first.

## Write (planners)
Add dated entries to shards; keep INDEX lines current; one topic per
shard, kebab-case names. Verified facts only.

## Propose (implementers)
Never write memory directly. End completion reports with a
"memory candidates" list; a planner curates them in.

## Promote (handoff / session end)
1. Durable knowledge from session → project or harness shards.
2. Unresolved deferrals → project parking lot (with context,
   recommendation, unpark condition).
3. Update `.bee/session.md` to retired state or remove it.
Run this as the last step of every handoff.

## Park
Append to `<repo>/.hivemind/memory/parking-lot.md`:
`PL-NNN — item — context/recommendation — unpark when`.
Any agent may propose parking; only the keeper unparks or resolves.
The brainstorm process ends with a loop-back gate over the parking lot.
```

- [ ] **Step 2: Verify** — file exists with frontmatter intact (name+description); description mentions all four trigger verbs (read/write/promote/park contexts).

### Task 4: Resolve PL-001 (apply ADR-002)

**Files:**
- Modify: global git config; `.hivemind/memory/parking-lot.md`

- [ ] **Step 1: Flip global identity**

```bash
git config --global user.name "denerose-pi"
git config --global user.email "285322498+denerose-pi@users.noreply.github.com"
```

- [ ] **Step 2: Verify** — `git config --global user.name` → `denerose-pi`; `git config --global user.email` → `285322498+denerose-pi@users.noreply.github.com`.

- [ ] **Step 3: Move PL-001 to Resolved in `.hivemind/memory/parking-lot.md`** — under "## Resolved" add:

```markdown
- **PL-001 — machine-global git identity** — resolved 2026-10-18 via
  ADR-002: global identity is now `denerose-pi`; keeper authorship via
  explicit `--author`.
```

and delete the parked entry.

- [ ] **Step 4: Commit** — `git add .hivemind/memory/parking-lot.md && git commit -m "resolve PL-001: global git identity per ADR-002"`

### Task 5: End-to-end verification

- [ ] **Step 1:** All paths from Tasks 1–4 exist (`ls` each).
- [ ] **Step 2:** Both pointer chains resolve: `grep memory/INDEX AGENTS.md ~/.pi/agent/AGENTS.md` → 2 hits; each INDEX's shards all exist.
- [ ] **Step 3:** `git log --format='%an <%ae>' -3` → all `denerose-pi`.
- [ ] **Step 4:** True load test is the keeper's next fresh session — flag it: if the global pointer line isn't visible in a new session's instructions, report back (fallback: `AGENTS.override.md` or extension later).
- [ ] **Step 5: Final commit** if anything moved — else confirm clean tree (`git status`).

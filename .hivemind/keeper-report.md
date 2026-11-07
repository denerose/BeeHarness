# Keeper report

**Generated:** 2026-11-01 14:32 by bee report (merge regen) · **Source:** `.hivemind/status.md`

**Zones and rules — read before regenerating this file:** *Keeper's
list* is the keeper's own — roles add items on the keeper's word,
mark done only on the keeper's resolution (in conversation counts),
and NEVER drop or overwrite it in a regen. *Needs the keeper*,
*Changed since last report*, and *Worth a sample* are
agent-maintained: regenerate freely from status.md, MERGING items
from both roles (never silently dropping the other role's asks).
Headings carry no pronouns. Paths absolute (Paseo). The keeper may
edit any zone directly. (ADR-008 + ADR-007 amendment 1.)

## Keeper's list

(the keeper's come-back items — they persist until the keeper
resolves them; the keeper may edit freely or just say the word)

- Harness name still TBC.
- Review superpowers AND our global skills with PP — plan how we
  replace their functionality with bee-native equivalents (keeper:
  BeeHarness intends to replace most global skills; the global
  plan-reviewer may be deleted — pull it in-house as a bee-native
  copy when that happens). Related parked design: PL-PP-003 (CLI
  help surfaces + guidance injection + session rules). Session
  inputs ready (2026-11-01):
  /home/saphron/BeeHarness/.hivemind/designs/2026-11-01-pp-skill-authoring-kit.md
  — first PO builds are the bee-skill-write + bee-skill-review
  pair; two-tier kit (core ships, meta dormant) proposed, pending
  this session.
- Two-lane suggestions in consuming projects (discuss with PP) —
  consuming repos will have both project-specific suggestions and
  bee-related feedback; the hive files its own project suggestions
  in its own hivemind, bee feedback escalates via the planned
  shared channel (`~/.bee/suggestions/`). Check the design keeps
  both first-class →
  /home/saphron/BeeHarness/.hivemind/designs/2026-11-01-pp-harness-feedback-channel.md
- Role-gate lifecycle actions (discuss with PP, keeper thought
  2026-11-02): PO must NOT be able to edit the phases directly —
  status changes go through the CLI only. Current state (verified
  2026-11-02): task states inside plans are already CLI-mediated
  (`bee task move`, P4) and the pattern exists — script owns
  structure, agents supply text (`bee memory`, P5) — but the phase
  rows in /home/saphron/BeeHarness/.hivemind/phases/BeeHarness.md
  are still hand-edited (`bee phase` lists/inventories/closes; no
  status move) and nothing enforces who may write what. The bigger
  ask: role gates across the design > plan > implement lifecycle —
  which actions (phase flips, task moves, plan approval, record
  writes) are gated to which role, and what enforces it. P6 (in
  progress) is the natural consumer of the answer.
- Edit authority by role (joins the role-gate note above; discuss
  with PP, keeper thought 2026-11-07): KS gets SOME edit
  authority, but ONLY when triggered by the keeper as an explicit
  skill call or command — no autonomous edits (this is the working
  pattern from the 2026-11-01→07 sessions: keeper says
  regen/note/restore, KS edits). PP gets LESS — maybe even NO —
  code or config edit authority: locked down to planning and
  design documents plus its own memories (session file, memory
  store). Extends the role-gate design from “which actions are
  gated” to “which file classes each role may write, and what
  enforces it.” Role files:
  /home/saphron/BeeHarness/roles/keeper-secretary.md ·
  /home/saphron/BeeHarness/roles/power-planner.md
- Ephemera commit volume — QUESTION for PP (keeper thought
  2026-11-07): are we committing WAY too much ephemera? Pros and
  cons need a real discussion. The CON side is visible: 7 commits
  on keeper-report.md alone across 11-01→11-07, most
  single-list-item note edits; task-checkoff commits add more; the
  history reads as conversation, not milestones. The PRO side is
  structural: parallel contexts (PP/PO/KS share one checkout) rely
  on shared surfaces being committed-current — the
  immediate-commit rule for shared files and ambient pickup both
  depend on it. Already-existing limits: sessions/ are gitignored
  (one ephemera class excluded); logbook tidy passes exist
  (PL-PP-005). The question: which commit classes earn history,
  and is the fix habits, .gitignore, squash-at-phase-close, or
  accept the noise? Joins the role-gate/edit-authority notes for
  the same PP session.

## Needs the keeper

1. IN-001 · 6s — confirm the tier ruling: bee-plan-review stays TIERED (all-block is skill-review-specific) — PP's answer pending your confirmation · ref: /home/saphron/BeeHarness/.hivemind/status.md

## Changed since last report

- **P4 executing** — inbox store born and live
  (`/home/saphron/BeeHarness/.hivemind/inbox.toon`; the tier ask
  migrated in as IN-001; the parking lot migrated to the
  script-owned TOON store). Tasks 2–4 checked off; task 5
  (plan-checks dogfood) in flight.
- **P5 designed** — memory + logbook + glossary store:
  `/home/saphron/BeeHarness/.hivemind/designs/2026-11-01-pp-p5-memory-and-logbook.md`
  (memory.toon, `bee memory`, logbook machine headers + compaction;
  PL-002 resolved) and
  `/home/saphron/BeeHarness/.hivemind/designs/2026-11-01-pp-glossary-store.md`
  (`bee glossary`, noun grammar). GLOSSARY slimmed to definitions now.
- **Phase queue grew** — P9 (secretary build-out: `bee capture`,
  origin-keeper note class, report zone) and P10 (work-type guidance,
  per-type init defaults, and the guides-and-sensors missing bits:
  backpressure, sensor state history, managed exceptions) appended at
  `/home/saphron/BeeHarness/.hivemind/phases/BeeHarness.md`.
- **Keeper-secretary minted** — role designed
  (`/home/saphron/BeeHarness/.hivemind/designs/2026-11-01-pp-keeper-secretary.md`,
  PL-PP-009 resolved); role file live at
  `/home/saphron/BeeHarness/roles/keeper-secretary.md`. This report
  regenerated by KS.
- **Three P6 rulings recorded** — green-fields init (creates git if
  none; PL-PO-002 resolve relayed), managed AGENTS.md block for
  guidance injection, distribution = the repo referenced in place
  (no packaging step; update is pull).
- **Smaller** — PP identity sharpened (design records, not tooling);
  hindsight suggestions filed (parallel machinery, boundary-spanning
  edits) in `/home/saphron/BeeHarness/.hivemind/suggestions/`.

## Worth a sample

- ADR-011 + the first dispatched role file, minted and minimal:
  `/home/saphron/BeeHarness/.hivemind/decisions/011-task-orc-first-dispatched-role.md`
  and `/home/saphron/BeeHarness/roles/task-orc.md`
- ADR-010 — the role schema (fresh, shapes everything P3 builds):
  `/home/saphron/BeeHarness/.hivemind/decisions/010-one-role-concept-graded-attributes.md`
- ADR-009 — forward planning + propose-next:
  `/home/saphron/BeeHarness/.hivemind/decisions/009-forward-planning-phase-queue.md`
- The live phase queue, first time it's ever been full:
  `/home/saphron/BeeHarness/.hivemind/phases/BeeHarness.md`

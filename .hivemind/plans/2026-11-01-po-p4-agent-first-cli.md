# Plan: P4 — agent-first CLI build-out (decisions inbox + work-item state + verify + AXI)

**Date:** 2026-11-01
**Design doc:** `.hivemind/designs/2026-10-25-pp-p4-inbox-design.md` @ ad77aa4 (note + 2026-11-01 addendum + kickoff decision list items 1–7 — all seven keeper-ruled at kickoff, 2026-11-01)
**Validation level:** phase (recommended — multi-build phase with law-touching edits and a keeper sign-off gate; the design names keeper gates)
**Detail:** mixed — verbatim contracts for stores, formats, and command grammars (the interfaces later tasks and the gate verify); lean for implementation code (each task names exact files, grammar, behavior, and its test list; implementer works in-repo with the design note, `docs/AXI.md`, and `bin/bee.js` house patterns — review gates check the result)
**Reviewed:** bee-plan-review round 1 FAIL 2026-11-01 (2 blocking, 10 should-fix — `.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-plan-review-r1.md`); both blocking + 6 should-fix fixed in-plan, 4 should-fix waived with reasons beside their findings in the report. Round-2 dispatch TIMED OUT before writing its report; its six verified findings (docs/research map miss; phase/4 behind main; skills/ sweep unreachable as written; bee.js:158 outside named classes; three lot duplicates not two; two sweep-modified files missing from targets) were recovered from its transcript, re-verified by the planner, and fixed in-plan; fresh round-2 dispatch pending

**Phase:** P4 (spine `phase/4`, persistent worktree `/home/saphron/BeeHarness-phase3`)

<!-- machine (ADR-014 mixed-document rule)
phase: P4
validation: phase
state-source: checkboxes below (script-owned when bee task lands, Task 6)
design: .hivemind/designs/2026-10-25-pp-p4-inbox-design.md @ ad77aa4
targets:
  - scripts/design.sh (create)
  - .hivemind/designs/2026-10-25-pp-p4-inbox-design.md (modify)
  - .hivemind/inbox.toon (create)
  - .hivemind/memory/parking-lot.toon (create)
  - .hivemind/memory/parking-lot.md (modify)
  - scripts/structure.map (create)
  - scripts/structure-check.sh (create)
  - scripts/worktree.sh (create)
  - scripts/task.sh (modify)
  - bin/bee.js (modify)
  - tests/bee-inbox.test.mjs (create)
  - tests/bee-park.test.mjs (create)
  - tests/bee-design.test.mjs (create)
  - tests/bee-verify.test.mjs (create)
  - tests/bee-task.test.mjs (create)
  - tests/bee-phase.test.mjs (create)
  - tests/structure-check.test.mjs (create)
  - tests/worktree-sh.test.mjs (create)
  - tests/task-sh.test.mjs (modify)
  - skills/loop/bee-loop/assets/dispatch-brief-template.md (modify)
  - skills/session/bee-brainstorm/assets/design-doc-template.md (modify)
  - docs/guidance/how-to-be-a-bee.md (create)
  - docs/guidance/cli-writing.md (create)
  - docs/guidance/tdd.md (create)
  - docs/guidance/triage-distinction.md (create)
  - skills/loop/bee-verify/SKILL.md (modify)
  - skills/loop/bee-plan/SKILL.md (modify)
  - skills/loop/bee-plan/assets/plan-template.md (modify)
  - roles/task-orc.md (modify)
  - skills/GLOSSARY.md (modify)
  - AGENTS.md (modify)
  - README.md (modify)
  - .hivemind/status.md (modify)
  - .hivemind/keeper-report.md (modify)
  - .hivemind/phases/BeeHarness.md (modify)
suite: node --test tests/*.test.mjs
-->

## Kickoff rulings (keeper, 2026-11-01 — binding for every task)

1. Scope = all seven filed kickoff items as filed (items 1–6 of the
   design note's list + item 7, structure check).
2. Inbox store = one script-owned TOON file.
3. Aging = visible only (age column + oldest-age aggregate); NO
   threshold/flag/expiry now — but the schema must not block a later
   keeper-escalation surface or an auto reviewer (stable ISO
   timestamps, provenance on every write, stable ids).
4. `bee verify` + all check output adopt two sensor patterns now:
   failing checks emit self-correction instructions (agent-facing
   output), and every check wraps output in the normalized AXI
   shape. Sensor state history and backpressure are LATER work
   (P5/P6), not this phase.
5. Standing directives riding this plan: `scripts/task.sh` →
   `scripts/worktree.sh` rename (keeper-directed; "task" is reserved
   for the work-item state machine); bee-verify skill thins toward
   `bee verify` with its judgment lines surviving.

## Execution decisions (made at planning, reviewed as decisions)

- **Command families.** The design's CLI sketch names `bee task add
  <role>` for inbox items; the keeper's rename note reserves
  `bee task` for the P4 work-item state machine. Resolution: inbox
  items get the `bee inbox` family (`add/list/show/done` +
  `bee capture`); `bee task` = work-item state moves only. Both
  rulings are honored; the sketch line predates the reservation.
- **Design stamp timing.** ADR-016 stamps `picked-up` at the spine
  commit via script; no script exists at phase open. Resolution:
  Task 0 builds the interim helper (`scripts/design.sh`, permanent
  as the mechanical core) and stamps this design as its first act.
  The freeze until then is this plan's `design:` header field — the
  gate verifies the match.
- **Migration scope.** Retro-migration covers the two queue states
  the design names (status awaiting-keeper bullets; suggestions
  awaiting-read). Historical cross-role notes stay in status.md
  history (git); NEW cross-role note traffic rides the inbox going
  forward. Nothing else moves.

## Standing rules for every task

- **AXI from birth** (`docs/AXI.md`): every subcommand ships its
  compliance checks in the same task — bare-call content (live
  data, not help), definitive empty states ("0 items"), unknown
  flag → exit 1 + usage, `--check` (never write) on every mutating
  command, `--full` wherever truncation exists, aggregates in list
  output, structured errors. Compliance tests join
  `tests/*.test.mjs`.
- **Agent-facing output** (kickoff ruling 4): every failing check
  or error emits what to do next, not just the finding.
- **Atomic writes** (house pattern): mutations via tmp+rename; no
  partial writes to live stores.
- **Provenance on every mutation** (design): role + ISO timestamp
  recorded in the store from birth.
- **Worktree discipline** (ADR-012): build tasks run in
  `task/p4-<slug>` worktrees cut from `phase/4` via
  `scripts/task.sh` (renamed `worktree.sh` in Task 8 — use the
  current name until then); records ride the task branch; shared
  surfaces (status.md, phases/, plans/, GLOSSARY, AGENTS) are
  edited from the main checkout, atomic commits, push promptly.
  **Spine currency:** main moves mid-flight (shared surfaces,
  parallel-role landings) — before every dispatch, sync `phase/4`
  with main (merge main into the spine; never force), so task
  trees never run stale against the plan they execute.
- **No ephemeral prose in durable docs** — GLOSSARY/AGENTS/skills
  edits are durable content only (writing standard;
  `docs/WRITING-STANDARD.md`).
- Every task's finished-test includes its reference sweep — the
  build is not finished until stale references are gone (grep
  shown in the task's verify entry).
- Safety lines for every write-capable dispatch (GLOSSARY: dispatch
  brief, safety lines).

## Task 0: interim design helper + stamp this phase's design

**Files:** create `scripts/design.sh`; modify
`.hivemind/designs/2026-10-25-pp-p4-inbox-design.md` (machine block
only — added by the script, never by hand)
**Depends on:** nothing
**Provides:** `design.sh pick-up <doc> --phase <n>` /
`implement <doc> --phase <n> --merge <hash>` / `status [--full]` —
the mechanical core `bee design` (Task 4) wraps; the P4 design
stamped `picked-up`

- [ ] Write `scripts/design.sh` (bash, stdlib only; modeled on
  `scripts/plan-checks.sh` conventions): reads/writes the machine
  block defined in `.hivemind/designs/TEMPLATE.md` (`status:`,
  `phase:`, `hash:`, `merge:` between `<!-- machine` and `-->`).
  `pick-up` adds the block if missing (idempotent), stamps
  `status: picked-up`, `phase:`, `hash:` = `git log -1 --format=%h
  -- <doc>`; refuses if status is not `live` (exit 1 + reason +
  fix instruction). `implement` stamps `status: implemented` +
  merge hash; refuses unless current status is `picked-up`.
  `status` lists doc · state · phase for every doc in
  `designs/*.md` (definitive "0 designs" if none), and flags drift:
  recorded hash ≠ current `git log -1` hash → `drift: pending
  rectification` (addenda after pickup are legal; the flag points
  at them, never blocks). `--check` supported on mutations.
- [ ] Run it: `scripts/design.sh pick-up
  .hivemind/designs/2026-10-25-pp-p4-inbox-design.md --phase 4` —
  expected: machine block added, `status: picked-up`,
  `hash: ad77aa4`. Verify `scripts/design.sh status` shows it.
- [ ] Verify: `bash scripts/design.sh status` lists all designs;
  re-running pick-up exits 1 with the not-live reason (idempotency
  proven); `node --test tests/*.test.mjs` still green.
- [ ] Commit: `add design.sh, stamp P4 design picked-up`

## Task 1: inbox store + `bee inbox` family + `bee capture`

**Files:** create `.hivemind/inbox.toon` (via first add),
`tests/bee-inbox.test.mjs`; modify `bin/bee.js`
**Depends on:** nothing (parallel with Task 0)
**Provides:** `bee inbox add|list|show|done`, `bee capture`, the
store format Tasks 2–3 reuse

- [ ] Implement in `bin/bee.js` (house patterns: `run(argv)` →
  `{code,out,err}`, strict parseArgs, `--check` on mutations,
  atomicWrite):
  - `bee inbox add <addressee> <text> [--origin <role>] [--ref <path>]`
    — appends the next id `IN-NNN` (zero-padded, monotonic).
  - `bee inbox list [--for <addressee>] [--full]` — TOON view;
    default 3–4 fields (id · addressee · age · one-line text,
    text truncated ~60 cols with size hint); `--full` shows
    origin/ref/state/timestamps. Header aggregate:
    `<n> open · oldest <age>` (ages from ISO timestamps, e.g.
    `3d`). Definitive empty state: `0 items`.
  - `bee inbox show <id> [--full]` — unknown id: exit 1, `no item
    IN-999 — bee inbox list` (self-correction form).
  - `bee inbox done <id> [--note <how>]` — idempotent (done on a
    done item: no-op + note, exit 0); stamps `done:` timestamp.
  - `bee capture "<thought>"` — sugar for `add keeper <thought>
    --origin capture` (minimal per kickoff item 3; routing stays
    conversational).
- [ ] Store format `.hivemind/inbox.toon` — verbatim contract:

```text path=.hivemind/inbox.toon
# inbox — items waiting on someone (agent store; views render from here)
id: IN-001
addressee: keeper
origin: po
ref: -
text: rule the inbox aging design
state: open
opened: 2026-11-01T12:00:00+11:00
taken: -
done: -
```

  One blank line between items; `state: open → taken → done`;
  `taken:` stamped by `list --for` reads only (no claim command
  this phase — claims stay in the phase list per GLOSSARY).
  `origin` defaults to `bee` when no `--origin` passed.
- [ ] Schema-for-later (ruling 3): timestamps always ISO 8601 with
  offset; ids never reused; no field deleted this phase. A later
  escalation flag or auto-reviewer pass adds fields without
  breaking views.
- [ ] AXI compliance tests (`tests/bee-inbox.test.mjs`): bare
  `bee inbox` = list (content first); empty store → `0 items`;
  unknown flag → exit 1 + usage; `--check` add writes nothing
  (store absent after); done idempotent; aggregate header present;
  truncation + `--full` difference; capture lands as IN-item with
  origin `capture`. Run against a temp-dir store (env var or flag
  for store path — `bee inbox --store <path>` internal flag is
  fine if documented in usage).
- [ ] Verify: `node --test tests/bee-inbox.test.mjs` green; full
  suite green.
- [ ] Commit: `add inbox store, bee inbox family, capture`

## Task 2: migration + rendered views (status board + keeper report derive from the store)

**Files:** modify `.hivemind/inbox.toon` (migrated items),
`.hivemind/status.md`, `.hivemind/keeper-report.md`, `bin/bee.js`
**Depends on:** Task 1
**Provides:** `bee inbox render` (status.md derived section),
`bee report` sourcing *Needs the keeper* from the store

- [ ] Add `bee inbox render [--check]` to `bin/bee.js`: renders the
  open-items view (by addressee, oldest first, ages) into a marked
  region of `.hivemind/status.md` between `<!-- inbox:render -->`
  and `<!-- /inbox:render -->` (region created if absent, placed
  under a `## Awaiting keeper (rendered from inbox.toon)` heading
  replacing the hand-written queue section); never touches text
  outside the region (concurrent-edit safety for the shared
  surface).
- [ ] Migration (one-shot, script-driven — mechanical, no judgment
  per item): status.md *Awaiting keeper* bullets →
  `add keeper <bullet> --origin status --ref <suggestion path if
  cited>`, SKIPPING bullets marked RESOLVED (same convention as
  `bee report`'s queue parsing — resolved items are history, not
  asks); suggestions awaiting-read (each file in
  `.hivemind/suggestions/` not marked read/resolved in its body or
  the queue) → `add keeper <title line> --origin suggestion --ref
  <file>`. Then `render`. The old hand-written queue section is
  replaced by the rendered region; the rest of status.md
  (escalations, notes) stays as-is — note traffic goes to the
  inbox going forward, history stays in git.
- [ ] `bee report`: *Needs the keeper* derives from the store
  (open items addressed `keeper`, oldest-first, absolute paths per
  the report's header protocol — re-read the protocol in
  `.hivemind/keeper-report.md` before touching it) instead of
  parsing status bullets; merge-regen semantics (never drop the
  keeper's list, merge both roles' asks) preserved. Run
  `bee report --check` in the task; the real regen happens from
  the main checkout at merge per the standing protocol.
- [ ] AGENTS.md: the status-surface description line for the
  awaiting-keeper queue points at the rendered region (durable
  content only — no narratives).
- [ ] Verify: migration idempotent (re-run adds nothing — dedupe on
  same normalized text); render twice = identical output (diff
  shown); `bee report --check` output carries every migrated ask;
  full suite green.
- [ ] Commit: `migrate queues into inbox store, render status and report views`

## Task 3: `bee park` (parking lot becomes a script-owned store)

**Files:** create `.hivemind/memory/parking-lot.toon`,
`tests/bee-park.test.mjs`; modify `.hivemind/memory/parking-lot.md`
(becomes a pointer stub), `bin/bee.js`
**Depends on:** Task 1 (store patterns)
**Provides:** `bee park add|list|show|resolve`; the converted lot

- [ ] Implement per the design note's `bee park` section:
  `add "<item>" [--context …] [--unpark-when …]` mints the next
  `PL-<role>-NNN` continuing the existing numbering (role from
  `--origin`, default `bee`; open questions ride context verbatim);
  `list [--full]` (id · one-line · age · unpark-when truncated;
  header `<n> parked · oldest <age>`); `show <id> [--full]`;
  `resolve <id> [--how …]` stamps resolution date + how. Store
  format mirrors `inbox.toon` (field names: id, item, context,
  unpark-when, origin, opened, resolved, how). Resolve is
  keeper-gated by law (AGENTS/GLOSSARY carry it — no mechanical
  agent bypass exists, and none is added).
- [ ] Implement `bee park migrate <md> [--check]` (the named
  executor for the one-shot conversion; fixture-testable): parses
  every `PL-*` entry from the old markdown (open AND resolved —
  nothing leaves the views) into the store mechanically (id, item
  text, context lines, unpark condition, resolved date+how where
  present); history stays in git. **Collision rule:** the store is
  keyed by id; when an id appears in both Parked and Resolved
  (three such exist today: PL-004, PL-PO-001, PL-PP-002 — stale
  parked copies), the RESOLVED entry wins and the stale parked
  duplicate is recorded in that entry's `how` line (`superseded
  stale parked duplicate`). Replace
  `.hivemind/memory/parking-lot.md` body with a three-line pointer
  (store path + `bee park list` + keeper-gate line) — durable text,
  no narratives.
- [ ] AGENTS.md + GLOSSARY parking-lot references point at the
  store and command (the memory-ownership law line itself is
  unchanged in meaning).
- [ ] AXI compliance tests (`tests/bee-park.test.mjs`): same battery
  as Task 1 (empty state, unknown flag, `--check`, `--full`,
  aggregate, idempotent resolve) + migration test: run `bee park
  migrate` against a fixture copy of the old markdown — every id
  appears in the store exactly once with state preserved, and the
  three duplicate ids resolve per the collision rule (resolved
  wins, `how` notes the superseded duplicate).
- [ ] Verify: full suite green; `bee park list` shows the migrated
  open items with correct ages.
- [ ] Commit: `convert parking lot to script-owned store`

## Task 4: `bee design` (CLI surface over the Task-0 core)

**Files:** create `tests/bee-design.test.mjs`; modify `bin/bee.js`,
`scripts/design.sh` (drift detection refinements if the CLI needs
them)
**Depends on:** Task 0
**Provides:** `bee design new|pick-up|implement|status` — ADR-016's
transitions as CLI

- [ ] Thin CLI wrappers in `bin/bee.js` over `scripts/design.sh`
  (the script stays the mechanical core — determinism split; the
  CLI adds `bee design new "<title>"` = copy
  `.hivemind/designs/TEMPLATE.md` to
  `.hivemind/designs/YYYY-MM-DD-<slug>.md` with title/date filled,
  refusing to overwrite). Machine blocks remain script-only
  territory — the CLI never edits them directly, only via the
  script.
- [ ] AXI compliance tests: `bee design status` lists with state
  + drift flags (definitive empty state over an empty temp dir);
  `new` refuses existing path; unknown flag exits 1; mutations
  `--check`.
- [ ] Verify: `bee design status` flags nothing on a clean clone of
  this repo (the P4 design shows `picked-up · phase 4`); full
  suite green.
- [ ] Commit: `add bee design CLI over design.sh core`

## Task 5: plan-header check contract + `bee verify`

**Files:** create `tests/bee-verify.test.mjs`; modify `bin/bee.js`,
`skills/loop/bee-plan/assets/plan-template.md`
**Depends on:** nothing (parallel track; needs Task 0's stamp only
at dogfood time)
**Provides:** `bee verify --plan <path> [--task <n>] [--check]` —
header-driven checks + structured logbook entry emission

- [ ] Settle the plan-header field contract (the design note's open
  question — this is the interface `bee-plan` writes and
  `bee verify` reads). The template's machine block — the whole
  `<!-- machine … -->` region — becomes exactly (replace, not
  insert into; the rest of the template file is unchanged):

```text path=skills/loop/bee-plan/assets/plan-template.md
<!-- machine
phase: <phase id, e.g. P1>
validation: task | merge | phase | release
state-source: checkboxes below
targets:
  - exact/path/file.ext (create)
  - exact/path/file.ext (modify)
checks:
  - id: task-<n>
    cmd: <command proving the task's step>
    expect: exit 0
    files: [<path>, <path>]
suite: <the command that proves the plan's work, e.g. node --test tests/*.test.mjs>
-->
```

  One `checks:` entry per task (id = `task-<n>`); `cmd` and
  `files` optional individually but at least one required;
  `expect: exit 0` is the only form this phase. This plan's own
  header gains its `checks:` block in the same task (dogfood — the
  gate and every later verify run read it).
- [ ] Implement `bee verify`: parses the plan header; `--task <n>`
  runs just that task's checks, default runs all; each check →
  TOON line `task-<n> · cmd · PASS|FAIL · <note>`; every FAIL
  carries a self-correction line (`fix: <what to run or repair>`)
  — agent-facing output per ruling 4. Exit 1 on any FAIL.
  File-existence checks list missing paths with fix instructions
  (`place it or fix the path`). Link-check (kickoff item 4): for
  docs changed in `git diff --name-only <base>..HEAD` (base =
  `main` by default, `--base` overridable), every markdown link to
  a repo-relative path is resolved; broken ones are FAILs with the
  fix line.
- [ ] Logbook emission: on success (or with `--record`), `bee
  verify` writes `.hivemind/logbook/<plan-slug>-task<N>-verify-<rN>.md`
  with a machine header (role, date, verdict, checks-run count,
  plan path + hash) and a prose body ONLY for anomalies (empty
  body = clean run); round suffix `-rN` continues the existing
  series (next free N for that task). Writes are atomic;
  `--check` previews. ADR-006 invariant: the entry IS the evidence
  — states never move without it.
- [ ] AXI compliance tests: bare `bee verify` with no plan → exit 1
  + fix instruction; empty checks → definitive `0 checks`; FAIL
  output includes a `fix:` line (asserted); `--check` writes no
  logbook file; suite-green run emits a clean entry against a
  fixture plan.
- [ ] Verify: `bee verify --plan .hivemind/plans/2026-11-01-po-p4-agent-first-cli.md`
  against this plan's own checks block (dogfood; expect PASS once
  earlier tasks land, partial until then — the task's own
  finished-test requires all-PASS).
- [ ] Commit: `add bee verify, plan-header check contract`

## Task 6: `bee task` (work-item state moves, script-owned)

**Files:** create `tests/bee-task.test.mjs`; modify `bin/bee.js`
**Depends on:** Task 5 (header contract), Task 1 (store patterns)
**Provides:** `bee task move|show` — plan checkboxes become
script-owned state

- [ ] Implement `bee task move <plan-path> <task-n> <state>` where
  state ∈ `draft|implemented|verified|reviewed|done` (GLOSSARY:
  work-item states). The command: rewrites the task's checkbox
  lines (`- [ ]` ⇄ `- [x]` for done; intermediate states recorded
  in a `state:` ledger appended to the plan's machine block
  region — `task-3: verified 2026-11-01T… by po`), records
  provenance (role from `--origin`, default `bee`; ISO timestamp),
  refuses unknown task numbers and backwards moves with exit 1 +
  fix instruction. Idempotent: moving to the current state = no-op
  note, exit 0. `--check` supported.
- [ ] No agent can mark done what has no record: `move … done`
  requires a matching verify entry path (`--record <path>`,
  existence-checked) which is stamped into the ledger line. The
  script cannot judge the record's content — that stays the loop's
  judgment (named here: the loop reads the entry before calling
  the move).
- [ ] AXI compliance tests: unknown task → exit 1 + fix line;
  backwards move refused; idempotent re-move; `--check` writes
  nothing; done without `--record` refused; checkbox rewrite
  asserted byte-exact on a fixture plan.
- [ ] Verify: full suite green.
- [ ] Commit: `add bee task state moves with provenance`

## Task 7: `bee guidance` skeleton + skill folds + task-orc codification

**Files:** create `docs/guidance/how-to-be-a-bee.md`,
`docs/guidance/cli-writing.md`, `docs/guidance/tdd.md`,
`docs/guidance/triage-distinction.md`; modify `bin/bee.js`,
`skills/loop/bee-verify/SKILL.md`, `skills/loop/bee-plan/SKILL.md`,
`roles/task-orc.md`
**Depends on:** nothing (parallel; law-touching — keeper sign-off at
phase end)
**Provides:** `bee guidance list|show`, the four topic skeletons,
the P7-directed folds, surgical task-orc additions

- [ ] `bee guidance list` / `bee guidance show <topic>` reading
  `docs/guidance/*.md` (topic = filename stem); AXI battery same
  as siblings (empty state over a temp dir, unknown topic → exit 1
  + `bee guidance list` fix line, bare call lists). Minimal — no
  injection machinery (that is P6's init contract).
- [ ] Four topic skeletons, lean (this phase grows the skeleton,
  later phases grow content — each file: purpose, when to use,
  core rules, pointers). `how-to-be-a-bee` (session rituals:
  wake, status read, thread-close, handoff — the GLOSSARY terms,
  self-contained); `cli-writing` (AXI for subcommands: the
  compliance battery every command ships, TOON output rules,
  atomic writes, provenance); `tdd` (test-first discipline for
  script/CLI work, the house `node --test` patterns);
  `triage-distinction` (reproduce-then-fix vs feature work; when
  debugging skill applies). Generic actors only; no ADR citations
  (shipping test applies — these ship).
- [ ] bee-verify skill thins toward `bee verify` (P7 fold-order
  note: mechanical steps point at the command; the judgment lines
  SURVIVE — "is this output sane" stays agent text). bee-plan
  gains the rule-4 strengthening (self-contained-task standard:
  every task carries files/depends/provides + verification
  command; cold-dispatchability is the test) and the
  checks-contract pointer (its template changed in Task 5).
- [ ] `roles/task-orc.md` surgical additions per the design note's
  codification section (keeper-accepted 2026-11-01, hindsight-
  gated): deviation envelope (repairs to the plan's own exit
  criteria are in-envelope and ride the pass-back); boundary
  reading (running shipped tooling is dispatch mechanics, not
  source-reading); nested-review split (task-level fallback
  reviews disclosed; merge/phase reviews dispatched by the
  loop-runner at depth 1); brief-template line (what the
  dispatcher does while the dispatch runs). Role file stays
  MINIMAL — no expansions beyond these.
- [ ] Skill revisions run the bee-skill-review gate (cold dispatch)
  before this task's commit; findings fixed or escalated per the
  review skill's rules. Role-file changes are phase-review
  territory (keeper sign-off).
- [ ] Verify: `bee guidance list` shows four topics; full suite
  green; grep shows no stale references to the thinned
  bee-verify steps.
- [ ] Commit: `add guidance skeleton, fold verify/plan skills, codify task-orc`

## Task 8: structure check (manifest map) + worktree.sh rename

**Files:** create `scripts/structure.map`, `scripts/structure-check.sh`,
`tests/structure-check.test.mjs`, `tests/worktree-sh.test.mjs`;
modify `scripts/task.sh` (renamed — content moves),
`bin/bee.js` (verify wiring)
**Depends on:** Task 5 (verify wiring)
**Provides:** the pillar-2 structure rule over this repo, shipped
as a capability; the keeper-directed rename

- [ ] `scripts/structure.map` — the allowed-structure manifest,
  data not code (verbatim seed covering everything `git ls-files`
  tracks today plus this phase's planned files; extended
  deliberately via map edits — exceptions are visible, never
  suppressions):

```text path=scripts/structure.map
# allowed structure — one pattern per line; <x> = one segment.
# <file> matches dotfiles too (.gitkeep, .gitignore); a segment
# wildcard never crosses "/".
root: .gitignore README.md AGENTS.md SOUL.md package.json bin docs roles skills scripts .pi
bin: bin/<file>.js
pi: .pi/handoff.md .pi/handoff-<role>.md
roles: roles/<file>.md
skills: skills/GLOSSARY.md skills/<kit>/<name>/SKILL.md skills/<kit>/<name>/assets/<file>
hivemind: .hivemind/status.md .hivemind/keeper-report.md .hivemind/inbox.toon
hivemind: .hivemind/<class>/<file>  # class: decisions designs plans phases logbook suggestions memory sessions
docs: docs/<file>.md docs/guidance/<file>.md
scripts: scripts/<file>.sh scripts/structure.map
tests: tests/<file>.test.mjs tests/fixtures/<file>
```

  The seed covers everything tracked at plan-gate time plus this
  phase's planned files. Structure is living: new trees land
  mid-flight (they did during this plan's own gating) — Task 8's
  build step includes running the check over the repo and
  extending the map deliberately for anything tracked that misses
  (the map edit IS the recorded decision; a miss is never
  ignored, never suppressed).

- [ ] `scripts/structure-check.sh <root>`: walks tracked files
  (`git ls-files`), matches each against the map; every miss is a
  finding WITH a fix instruction (`place it in <class>, or extend
  the map deliberately`); output TOON `path · allowed-homes ·
  fix`; exit 1 on any miss; definitive `0 findings` when clean.
  Map misses (unparseable line) are findings too.
- [ ] Wire into `bee verify` (runs it when a structure map exists;
  skips with a note when not — other repos adopt by adding a map)
  AND into the suite (`tests/structure-check.test.mjs`: fixture
  tree with a stray file → finding + fix line asserted; clean
  tree → `0 findings`).
- [ ] Keeper-directed rename: `git mv scripts/task.sh
  scripts/worktree.sh`, update its self-references, the test file
  (`tests/task-sh.test.mjs` → `tests/worktree-sh.test.mjs` via git
  mv, path updates inside), and every living reference
  (`grep -rn "task.sh" bin scripts tests skills AGENTS.md docs
  README.md` → zero stale hits; records/ADRs keep the old name as
  history).
- [ ] Verify: `bash scripts/structure-check.sh .` → `0 findings`
  over this repo (the map covers everything tracked); full suite
  green including the renamed worktree tests.
- [ ] Commit: `add structure check with manifest map, rename task.sh to worktree.sh`

## Task 9: phase close + decision-count calibration

**Files:** modify `bin/bee.js`; create `tests/bee-phase.test.mjs`
**Depends on:** Task 5 (logbook emission patterns), Task 6 (state
ledger)
**Provides:** `bee phase close` — scripted close mechanics (the P3
lesson + the filed suggestion) + the decision-count flag

- [ ] `bee phase inventory <n> --decisions <file>` writes the
  phase's decision inventory to
  `.hivemind/logbook/<plan-slug>-decisions.toon` (one line per
  decision: `id · one-line · source-record-path`) — agent-assembled
  content (the sign-off inventory is judgment), script-owned
  format.
- [ ] `bee phase close <phase-id> [--check]` performs the scripted
  close (each step refuses + explains when preconditions fail —
  agent-facing output): (1) verify phase branch exists and its
  tree passes the suite; (2) real merge commit `phase/<n>` → main
  (never fast-forward — the P3/P7 lesson; `git merge --no-ff`);
  (3) rest the persistent worktree detached at main; (4) delete
  the phase branch (`-d`, fully-merged only); (5) count the
  decisions file lines, emit the close card line
  `decisions: <n>` + calibration flag when n > 8:
  `under-asked kickoff — front-load harder next phase` (threshold
  calibratable later; rulings/fix-round-waivers counted, waivers
  included — a waiver is a decision); (6) push main. `--check`
  prints the plan without touching git.
- [ ] Tests: `--check` mode over a fixture repo (temp git dir):
  refuses close with unmerged work (exit 1 + fix line); the
  merge-commit shape asserted (two parents); decision count +
  flag emitted at 9 fixture decisions, silent at 8; suite-gate
  failure blocks close.
- [ ] Verify: full suite green. P4's own close (phase exit, below)
  is this command's first real run.
- [ ] Commit: `add bee phase close with decision-count calibration`

## Task 10: reference sweep + phase exit

**Files:** modify `skills/GLOSSARY.md`, `AGENTS.md`,
`README.md` (documents list only), `.hivemind/phases/BeeHarness.md`
**Depends on:** Tasks 1–9
**Provides:** the phase-end sweep; phase exit criteria

- [ ] GLOSSARY vocabulary entries (definitions + pointers only, no
  law): `inbox` (the store + views + what it absorbs), `bee
  capture`, `bee park` (store; keeper-gated resolve), `bee
  design` (ADR-016 transitions as CLI), `bee verify` /
  `bee task` (one line each — the determinism split they embody),
  `structure check` (manifest map; per-repo capability). Rewrite
  the `status surface` entry: queues render from the inbox;
  escalations/notes remain its prose (interim until the decisions
  inbox replaces the whole surface).
- [ ] AGENTS.md durable updates: parking-lot line → store +
  `bee park` (resolve stays keeper-only); the plan-review-gate
  rule gains the checks-contract mention (plans carry `checks:`
  headers; `bee verify` reads them); status-surface line for the
  rendered region (Task 2); the Layout section's `docs/`
  enumeration generalizes — drop the exhaustive "currently"
  parenthetical (standards and guides live in `docs/`, discoverable
  there). No narratives, no state prose.
- [ ] Reference sweep, grep shown: no stale `parking-lot.md`
  reads, no stale `task.sh` (already zero from Task 8 — re-grep),
  no skill text pointing at hand-run verify steps that `bee
  verify` now owns. Boundary grep with named hit classes, split
  by pattern:
  - `grep -rn "hivemind" skills/` → hits are FUNCTIONAL surface
    references (skills naming the `.hivemind/` surfaces they
    operate on — the harness's own layout); each hit is classified
    functional in the sweep's verify entry; a hit that cites a
    `.hivemind/` path as authority ("see <our record>") rather
    than as an operating surface is a finding.
  - `grep -rn "ADR-" skills/` → hits allowed ONLY inside
    `skills/GLOSSARY.md` as provenance pointers (the recorded
    glossary design: definitions + pointers, law lives in the
    ADRs). Any `ADR-` hit in a SKILL.md or asset is a finding; the
    one today (`bee-brainstorm/assets/design-doc-template.md`, an
    example value) is placeholder-ized in this task (`ADR-<n>`
    form).
  - `grep -rn "hivemind\|ADR-" bin scripts` → hits allowed ONLY
    as (a) functional default paths inside code strings (e.g.
    `.hivemind/status.md` as `bee report`'s input), (b) provenance
    comments in code (`# ADR-016 …`), or (c) provenance prose
    inside generated-output templates (`bee report`'s header
    protocol cites ADR-008 by design — rendered output, not help
    text). Usage/help text and error strings carry zero hits.
  Every hit is classified (a)/(b)/(c)/functional/GLOSSARY-pointer
  in the sweep's verify entry; an unclassifiable hit is a finding,
  not a pass.
- [ ] Full suite + structure check + `bee verify` over this plan's
  checks block: all green, evidence in the logbook.
- [ ] Phase-end (orchestrator, from main checkout): decision
  inventory → keeper sign-off cards (law-touching: task-orc file,
  bee-verify/bee-plan skill text, AGENTS/GLOSSARY edits — rulings
  applied as fix rounds) → `bee phase close 4` (first real run;
  its output rides the final mechanical close card).
- [ ] Commit: `sweep references, close P4`

## Phase exit

- `node --test tests/*.test.mjs` green (includes every AXI
  compliance battery, structure check, worktree rename tests).
- `bash scripts/structure-check.sh .` → 0 findings.
- `bee verify --plan .hivemind/plans/2026-11-01-po-p4-agent-first-cli.md`
  → all checks PASS (dogfood).
- The store is live and sourced: status.md renders from the inbox;
  `bee report`'s Needs-the-keeper derives from it; the parking lot
  is script-owned; the P4 design stamped `picked-up` → `implemented`
  at close (`bee design implement`, merge hash recorded).
- Keeper sign-off on the law-touching texts (decision cards, one
  decision each, alternatives + recommendation).
- Real merge `phase/4` → main via `bee phase close 4`; decision
  count emitted with the close card.

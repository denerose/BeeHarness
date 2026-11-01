# Skill authoring kit — design note

**Date:** 2026-11-01
**Status:** COMPLETE P7 design input (replacement session ran
2026-11-01). This note carries BOTH slices: the meta pair (decided,
buildable) and the superpowers/global replacement design (session
decisions below — builds, folds, guidance system, drops, tier sort).
PO plans P7 from this note.

## The problem

Skill-authoring law had no home: the GLOSSARY writing standard
accumulated authoring rules beyond its cross-document scope, and the
one authoring instrument (bee-skill-tester) got misused for design
judgment it is not built for — comprehension is the question, not
taste. Skill review today is comprehension-testing only; nothing
reviews a skill for design soundness.

## Decided (keeper direction, 2026-11-01)

- **Build `bee-skill-write` and `bee-skill-review`** as bee-native
  skills, NOT roles — the native replacement for superpowers'
  writing-skills. PO delivers both through its workplan.
- **bee-skill-write** carries the authoring craft: skill structure
  and front matter; "is a skill even the right artifact" (vs script,
  role-file line, GLOSSARY entry); the determinism split for skills
  (wrap judgment around a scripted core; name the judgment kept); the
  draft → cold-test → review → sign-off lifecycle; registry index.
- **bee-skill-review** is the design-quality gate the tester is not:
  procedure soundness, scripts-first compliance, duplication,
  invariants (role-agnostic, ambient pickup), ADR consistency, scope.
  Cold-dispatch pattern; reports findings, never fixes; tiered like
  ADR-004.
- **GLOSSARY is vocabulary only** (cleaned 2026-11-01: the writing
  standard moved to `docs/WRITING-STANDARD.md`; standards live as
  their own documents); new authoring law lives in the skill.
- **bee-skill-tester stays comprehension-only.**

## Proposed (input to the replacement session — not decided)

- **Two-tier kit.** Core (brainstorm, plan, loop, verify, review,
  hindsight, argue — ships to every harnessed repo) vs meta
  (skill-write, skill-review, skill-tester, role-codification
  instruments — dormant, not advertised, for product repos). One
  source of truth holds (skills/ registered machine-wide); the tier
  lives in what `bee init` advertises. Rationale: most harness users
  build product/apps (C#/.NET or Bun/TS), not AI tooling.
- **Tiered superpowers migration.** Replaced capabilities get sorted
  per tier rather than wholesale (e.g. systematic-debugging reads
  core; writing-skills is meta).
- **Product-kit gap = stack validation profiles** — where the
  determinism law lands for users: C#/.NET (Roslyn analyzers, arch
  tests), Bun/TS (equivalent TBD) — conference-notes topics 3+4.
  Determinism law ships to all repos; AXI binds tool-building only.
- **Roles/governance tier** — same question one level up (ship the
  workflow, keep the self-development model opt-in); designed with
  the init contract (P6).

## Open questions

- Naming (bee-skill-write / bee-skill-review, or better).
- Review-tier mapping to ADR-004 levels; when keeper sign-off applies
  (law-touching skills).
- Sequencing: replacement session first, or the meta pair built early
  (they unblock authoring) with the session sorting the rest.
- Whether the tier split stays logical (advertised vs dormant) or
  becomes physical (subdirectories, tiered registration) at P6.

## Hardcoded global-skill references (2026-11-01 review)

Behavior docs name three global instruments that will be replaced.
None has a bee-native equivalent yet, so the references are not wrong
 today — but each replacement build must also update its references;
the build is not finished until they point at the new skill (keeper,
2026-11-01). These are also violations of the bee-native dependency
boundary (ADR-015): the loop must not depend on the keeper's
ephemeral global kit.

- **`plan-reviewer`** — AGENTS.md (plan review gate rule); bee-plan
  SKILL (three mentions, plus the plan template's `Reviewed:` line,
  which stamps the name into every plan); bee-review (two scope
  notes); GLOSSARY (plan entry); bee-hindsight; bee-skill-tester.
- **`adr` skill** — AGENTS.md (design-mode bullet); power-planner
  role file; GLOSSARY (ADR entry). DECIDED (2026-11-01): NOT a
  replacement target — ADR-writing is harness-BUILD process tooling
  on the keeper's kit; the loop never depends on it. These
  references describe our construction process and stay. If shipped
  users ever get decision-record guidance, it rides the PL-PP-006
  distillation, not a shipped skill.
- **`handoff` / `pickup-handoff`** — AGENTS.md (handoff rule);
  GLOSSARY (handoff entry). The handoff rituals are already
  bee-native; only the scaffolding skill pair is global. No
  bee-native pair planned yet — same session decides.
- **`plan` skill** — bee-plan carries two "this is not the global
  plan skill" notes; they go stale harmlessly when that skill is
  replaced and update then.

Existing plans and records keep their mentions — history stays as
written.

## Loop-skill updates (ADR-014, PO lane)

Recorded here so it outlives the status note that first carried it
(2026-11-01):

- **bee-plan:** the determinism test applies at plan time —
  deterministic work is assigned to scripts, and the plan names the
  judgment each agent step keeps; plans carry the machine header
  (validation level, phase, task state, targets — ADR-014's
  mixed-document rule).
- **bee-verify:** thins toward `bee verify` once the CLI lands (P4);
  the agent's judgment shrinks to "is this output sane."
- **bee-review:** runs the mechanical claim-vs-record check (checked
  boxes vs logbook entries, states vs evidence) before quality
  judgment.
- **bee-loop:** the Record step never hand-edits state a script owns.
- **The in-house plan reviewer (P7)** gains determinism/AXI
  dimensions: plans for tooling show scripts-first and AXI-compliant
  surfaces, and no global-skill dependencies (ADR-015).

## Two glossaries (keeper direction, 2026-11-01)

- **Our working GLOSSARY** (`skills/GLOSSARY.md`) stays ours: the
  plugin's vocabulary, ADR anchors allowed, maintained as the
  reference layer for work in this repo.
- **The template glossary** ships with the plugin: seeded by `bee
  init` into a new repo with the core bee terms written
  self-contained (rule text inline, no ADR anchors, no references
  into our working documents), extendable by the user project with
  its own terms. Shipped skills point at the PROJECT's glossary,
  never ours. Produced in P8; scaffolding lands with the P6 init
  contract.

## Replacement-session decisions (2026-11-01, keeper)

Accepted: review-etiquette fold (into bee-loop + bee-review) ·
dispatch pattern ships as task-orc/dispatch documentation · tier sort
as proposed (core = bee-* set; meta = authoring kit + dispatch
docs; structurally-replaced ship as nothing) · reviewer dimensions
confirmed (accuracy, external reality, sandbox-run, ephemeral prose,
determinism/AXI, no-globals boundary — self-contained text) ·
handoff pair confirmed (bee-native, mirrors the current ritual).

NEW DIRECTION — `bee guidance`: a CLI command returning guidance
per topic — task types (cli work, test work, C#, TypeScript,
backend, frontend…), work-mode guidance (how to be a bee, scraped
from using-superpowers — its strongest aspect), and distinctions
(the keeper's triage is human+AI together; in-loop triage inside an
automated bee-loop is different — guidance carries both). TDD
guidance rides here too. `--help` stays; users are encouraged to
seek guidance on available topics. Feeds PL-PP-003 (its likely
design home) and the P4/P6 CLI lanes.

Under discussion: explore (item 4). RESOLVED: explore does NOT ship
— most keeper work is fresh projects; repo-orientation content
lives in the per-stack guidance files (TypeScript, frontend,
backend, dotnet…); the keeper's own global explore covers occasional
older-project injections (keeper's kit, not the harness's). ALL
numbered session items resolved; slice 2's design is complete in
this note.

## The shipping test (keeper, 2026-11-01 — governing rule for slice 2)

A preferred behavior is replaced only when it lives in a SHIPPED
component — skill text, guidance injection, template glossary,
scaffolded rules. A rule that lives only in an ADR is not yet
replaced. ADRs are build-time records; their content propagates to
shipped homes before shipping, or the behavior is lost. Consequences:
no shipped component cites our ADRs; shipped instruments carry their
rules as self-contained text; ADR-writing itself is build-process
tooling on the keeper's kit — nothing ships for it.

## Scope guard + bootstrap order (added 2026-11-01, pre-P7)

- **Replacement means independence, not cleanup:** the harness stops
  *depending on* the keeper's global kit; the kit itself is not
  deleted, edited, or "tidied" — it stays as the keeper's personal
  set for harness-less work. What happens to any global after
  replacement is the keeper's call alone.
- **Bootstrap order for the meta pair:** bee-skill-tester (exists)
  covers comprehension for the first builds; the first quality
  review uses the cold-dispatch pattern from P3; once bee-skill-
  review exists it reviews everything after — the kit dogfoods from
  its third build on.

## Skill organization (decided 2026-11-01 — not deferred to P6)

The shipped kit grows (meta pair, role tools, ad-hoc skills
accumulate); maintainers and customizing repos need the core
visible at a glance. Two layers, both now:

- **Kit folders** (pi discovers SKILL.md recursively — verified):
  `skills/loop/` (bee-loop, bee-plan, bee-verify, bee-review) ·
  `skills/thinking/` (bee-brainstorm, bee-hindsight, bee-argue) ·
  `skills/skilldev/` (bee-skill-write, bee-skill-review when built,
  bee-skill-tester — the tools that work ON the skill kit) ·
  `skills/roles/` (role-specific tools, starting with the
  phase-kickoff skill). GLOSSARY stays at `skills/` root, shared.
  File-structure names stay precise (skilldev, not "authoring" or
  "meta" — those are conversation shorthand at most).
- **`kit:` front-matter field** on every SKILL.md (values: loop,
  thinking, skilldev, roles) — machine-readable grouping feeding
  the future `bee skills` index, init advertising, and P8 tier
  work.
- **Namespace rule:** the `bee-` prefix marks the shipped kit (all
  folders); ad-hoc and repo-local skills never take it.

Execution: P8 — THE RECTIFICATION PHASE (keeper direction: never
interrupt in-flight work; plan a rectification instead). P8 runs
after P7 closes and absorbs everything that accumulated after P7's
pickup in one sweep: entry-discipline application to the meta pair,
this reorganization (moves, front matter, the `../GLOSSARY.md`
sibling-pointer fixes → `../../GLOSSARY.md`, doc references), and
the ship-tier cleanup. Never an in-flight phase's task: edits to
consumed inputs don't land, and the reorg touches the same files
in-flight work holds. Post-P7 is the cheaper sweep regardless:
the meta pair lands once, directly into `skilldev/`. Open for the
P6 init contract, deliberately: how a repo customizes or overrides
a kit skill.

## Entry discipline lives in the skill (keeper direction, 2026-11-01)

A skill that never gets called isn't worth its storage cost. Agents
bias toward acting directly; permissive wording ("a tool, not a
rule"; "the common right move is still…") licenses silent skipping.
Compensation — strict rules, clear wording, at the skill level:

- Every DISCRETIONARY skill — one where using it is a judgment
  call and sometimes the answer is legitimately no (bee-argue,
  bee-hindsight, future judgment tools) — carries its own
  **"should you use this skill?"** gate: criteria stated so that
  meeting them means USE IT, and skipping requires naming, out
  loud, which entry condition fails. Never a silent default.
  Pipeline stages (trigger = position in the loop) and
  externally-gated skills (trigger = explicit direction or a
  declared mode) carry their trigger conditions instead — a gate
  there would be noise.
- **Two layers (keeper, 2026-11-01):** the entry check governs
  SELF-initiated use — conservative judgment, not every
  consideration. A KEEPER invocation (their verb — "argue", "park",
  "handoff" — the skill's name, or direct direction) IS the entry
  decision, already made: recognition, not evaluation. Not using a
  skill the keeper explicitly called is the failure mode; skipping
  a marginal fork never was.
- The entry judgment stays with the agent — but the skill text
  makes skipping an explicit, reasoned exception rather than the
  path of least resistance.
- Applies to existing skills at P7's sweep (bee-argue's permissive
  Notes lines are the first candidate for rewording); becomes part
  of bee-skill-write's authoring standard.

## Keeper mid-P7 rulings (2026-11-01 decision cards — SUPERSEDE the
post-pickup design sections below where they conflict)

- Task-branch logbook routing; handoff pair → session kit; ALL
  skill-review dimension failures block; sync-last-write /
  prompt-last-act kept; **entry checks dropped** (the gate idea
  folds into bee-skill-write's authoring standard later — the
  entry-discipline section below is design input to that fold, not
  live law). Mid-review directive: review findings are disputable;
  disputes escalate; blocking stands until ruled.
- Folder name: PO built `skills/session/` from the design it had
  absorbed; PP's later thinking/ rename never reached it. Which
  name stands is OPEN for the keeper (P8 reconciles either way).

## Phase-kickoff skill — full design input arrived (2026-11-01, PO
sign-off retrospective)

The phase-kickoff skill (roles kit) now has its shape from
practice: it guides PO through the two standing checkpoints its
role file carries — the KICKOFF CARD (self-contained header: phase
id, one-line build, design state, gate status; then the
front-loaded decision list, every open question with alternatives
+ recommendation, ruled up front) and the SIGN-OFF INVENTORY
(decision inventory after review/verify; one card per judgment
call with a live alternative; rulings as fix rounds; a final
mechanical close card with the merge summary; calibration — an
inventory much over ~8 decisions means the phase was under-asked
at kickoff). Build when P4 opens so its first formal use dogfoods;
  the close-side flag — `bee` counts the phase's recorded decisions
  and flags over-threshold inventories as under-asked kickoffs — is
  designed into P4 and lands with the close step
(PO runs the manual version at P4 open regardless). Two
honesty-loop reinforcements from the same retrospective:
deliverables ship IN the reply that claims them (claim-with-commit
  discipline — third recurrence class, suggestion already in the
inbox); the loop now verifies git log before every task merge —
  determinism candidate: the task-merge helper verifies claimed
  commit hashes mechanically (P4 `bee task` design input).

## Sequencing notes (2026-11-01 audit)

P7 depends on nothing in P4/P5/P6 — dependencies run the helpful
way (P4 dogfoods the meta pair; P4's plans get the new reviewer).
Three coordination items, none blocking:

- **Fold order:** if P7 lands before P4, the etiquette/debug folds
  sit in bee-loop/bee-verify BEFORE P4's thinning — the thinning
  preserves the judgment lines the folds added (mechanics move to
  the CLI; judgment text stays in the skill).
- **Gate-rule law edit:** when the in-house reviewer lands, the
  AGENTS.md plan-review gate rule is rewritten to point at it — a
  PP rules edit riding PO's build, per the sweep inventory.
- **Registry index optional:** the meta pair defines front-matter
  conventions; a `bee skills` index command is P4/P6 CLI work if
  wanted — never a blocker.

No further design needed — PO can plan P7 from this note on the
keeper's direction.

## Feeds

Keeper's list (superpowers + global skills replacement session); PO
workplan (the pair, then the migration); PL-PP-003 (the guidance
injection that does the advertising); P8 ship-tier cleanup (shipped
skills must carry their own rule text — no references to our ADRs or
working documents).

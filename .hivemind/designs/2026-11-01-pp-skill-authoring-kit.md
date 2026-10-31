# Skill authoring kit — design note

**Date:** 2026-11-01
**Status:** PARTIAL P7 input, by design. This note covers the
meta-pair slice (skill-write/skill-review — decided, buildable) plus
the reference inventory and propagation lists. It does NOT contain
the superpowers + global skills replacement design — that is
produced by the keeper's-list replacement session (capability
inventory, core/meta tier sort, migration plan) and does not exist
yet. Do not infer or invent it from this note.

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

## Feeds

Keeper's list (superpowers + global skills replacement session); PO
workplan (the pair, then the migration); PL-PP-003 (the guidance
injection that does the advertising); P8 ship-tier cleanup (shipped
skills must carry their own rule text — no references to our ADRs or
working documents).

# Skill authoring kit — design note

**Date:** 2026-11-01
**Status:** partial. Pieces marked **decided** carry keeper direction
from the 2026-11-01 determinism session; pieces marked **proposed**
are inputs to the superpowers-replacement session (keeper's list), not
decided. Nothing is built — PO delivers through its workplan; the
power-planner does not draft skills.

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
  role file; GLOSSARY (ADR entry). No bee-native ADR writer planned
  yet — the replacement session decides its home.
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

## Feeds

Keeper's list (superpowers + global skills replacement session); PO
workplan (the pair, then the migration); PL-PP-003 (the guidance
injection that does the advertising).

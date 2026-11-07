# Skill authoring kit — design note

**Date:** 2026-11-01 · **Consolidated:** 2026-11-07 (P8 item 15,
first use of ADR-016's consolidation discipline — superseded
sections collapsed into their successors; history in git)

**Status:** historical design record, current as consolidated. The
live P8 work rides the rectification inventory
(`2026-11-01-pp-p8-rectification-inputs.md`).

## The problem

Skill-authoring law had no home: the GLOSSARY writing standard
accumulated authoring rules beyond its cross-document scope, and
the one authoring instrument (bee-skill-tester) got misused for
design judgment it is not built for — comprehension is the
question, not taste. Nothing reviewed a skill for design soundness.

## Decided (keeper direction, 2026-11-01)

- **`bee-skill-write` and `bee-skill-review`** are bee-native
  skills, not roles — the native replacement for superpowers'
  writing-skills. Shipped at P7 into `skills/skilldev/`.
- **bee-skill-write** carries the authoring craft: structure and
  front matter; the artifact test (skill vs script vs role-file
  line vs glossary entry); the determinism split (wrap judgment
  around a scripted core, name the judgment kept); draft →
  cold-test → review → sign-off; registry conventions.
- **bee-skill-review** is the design-quality gate the tester is
  not: procedure soundness, scripts-first, duplication, the
  invariants, scope. Cold-dispatched; reports, never fixes. Every
  dimension failure BLOCKS (keeper, mid-P7); findings are
  disputable — disputes escalate, blocking stands until ruled.
- **GLOSSARY is vocabulary only** (the writing standard lives at
  `docs/WRITING-STANDARD.md`); **bee-skill-tester stays
  comprehension-only.**
- **Two-tier kit, tier sort as proposed:** core (the bee-* working
  set) ships and is what `bee init` advertises; meta (the
  skilldev kit + dispatch docs) ships dormant, not advertised.
  Structurally-replaced superpowers ship as nothing. Stack
  validation profiles (Roslyn for C#/.NET, Bun/TS TBD) are the
  product-kit gap — P10's row carries them.
- **Kit organization:** kit folders (`loop/`, `thinking/`,
  `skilldev/`, `roles/` — `thinking/` ruled 2026-11-01; P8's sweep
  renames `session/` → `thinking/` with references), the `kit:`
  front-matter field, and the `bee-` namespace rule (shipped kit
  only). Repo-override mechanics were P6 init-contract material.
- **Plan-review tiers ruled (2026-11-01):** both reviewers stay AS
  BUILT — skill-review all-blocking, plan gate two-tiered — with
  the escalate-to-keeper appeal confirmed as the release valve.

## The shipping test (keeper, 2026-11-01 — governing rule)

A preferred behavior is replaced only when it lives in a SHIPPED
component — skill text, guidance injection, template glossary,
scaffolded rules. A rule that lives only in an ADR is not yet
replaced; ADRs are build-time records. No shipped component cites
our ADRs; shipped instruments carry their rules as self-contained
text. ADR-writing itself is build-process tooling on the keeper's
kit — nothing ships for it.

## Scope guard

Replacement means independence, not cleanup: the harness stops
*depending on* the keeper's global kit; the kit itself is the
keeper's — what happens to any global after replacement is the
keeper's call alone.

## Replacement outcomes (as landed)

- **P7 shipped:** the meta pair (skilldev/), the in-house plan
  reviewer (`bee-plan-review` + plan-checks.sh, six dimensions,
  self-contained text), the bee-native handoff pair, etiquette and
  debug folds, kit folders + front matter + namespace.
  Reference sweeps landed with each build — the plan-reviewer and
  handoff global references are gone; the `adr` skill's references
  stay by design (build-time tooling, never a loop dependency).
- **P4–P6 shipped:** `bee guidance` with its first topics; the
  phase-kickoff practice (kickoff card + sign-off inventory,
  decision-count calibration at `bee phase close`); the
  loop-skill thinnings (determinism at plan time, verify thinning
  to the CLI, mechanical claim-vs-record before judgment).
- **`bee guidance` (keeper direction):** per-topic guidance — task
  types, how-to-be-a-bee, the interactive-vs-in-loop triage
  distinction, TDD. Explore does NOT ship (fresh projects
  dominate; per-stack files carry orientation; the keeper's global
  explore covers older repos — keeper's kit).

## Entry discipline (keeper direction, 2026-11-01)

A skill that never gets called isn't worth its storage cost;
permissive wording licenses silent skipping. Compensation, at the
skill level:

- Every DISCRETIONARY skill carries its own "should you use this?"
  gate: meeting the stated criteria means USE IT; skipping
  requires naming, out loud, which condition fails. Pipeline
  stages and externally-gated skills carry trigger conditions
  instead.
- **Two layers:** the gate governs SELF-initiated use only. A
  KEEPER invocation (their verb, the skill's name, direct
  direction) IS the entry decision — recognition, not evaluation.
- Mid-P7 ruling folded in: the standalone entry-check idea was
  DROPPED — this discipline is authoring input to bee-skill-write
  (its standard carries it), not a separate instrument. The
  two-layer rule is live in the power-planner role file.

## Two glossaries (keeper direction; P6 outcome folded in)

- **Our working GLOSSARY** stays ours: vocabulary, ADR anchors
  allowed, build-time reference. (Store-converted at P5;
  `bee glossary` reads it.)
- **The template glossary** ships self-contained (no ADR anchors,
  user-extendable), produced at P8. P6 outcome: consumer stores
  seed HEADER-ONLY (empty, day-one-usable) — core-term seeding
  rides the template's production and the update path.

## Feeds

P8 rectification inventory (the sweep this note's history
executed from); PL-PP-003 (guidance surfaces); P10 (stack
profiles, full guidance system).

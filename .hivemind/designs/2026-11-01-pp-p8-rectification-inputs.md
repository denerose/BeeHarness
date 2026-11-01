# P8 rectification — consolidated build inputs — design note

<!-- machine
status: live
phase: -
hash: -
merge: -
-->

**Date:** 2026-11-01
**Status (prose mirror):** live — consolidates every known P8 input
in one place (keeper direction: bucket-3 suggestions must sit in
design specs for PO to pick up). P8's row in the phase list stays
the summary; this note is the checklist. Routed-but-unbuilt
suggestion files live in `suggestions/planned/` and are deleted
once their fix lands (keeper ruling 2026-11-01).

## The design

P8 = THE RECTIFICATION PHASE: after P7 it verifies what landed,
applies the rest idempotently, then ship-tier cleanup + template
glossary. Consolidated inputs:

**Standing (already ruled):**
1. Reorg sweep — `skills/session/` → `skills/thinking/` (keeper
   ruling 2026-11-01) + kit-folder front matter consistency.
2. Entry-discipline application to the meta pair (should-you-use
   gates for discretionary skills; skip = name the failed condition
   out loud).
3. Ship-tier cleanup — shipped skills + GLOSSARY carry self-contained
   rule text; zero references to our ADRs/designs/plans/.hivemind
   paths (ADR-015's user-side face).
4. Template glossary — bee init seeds the project's own glossary,
   self-contained core terms, user-extendable (two-glossaries rule).
5. bee-handoff pair fix — wake prompt delivered IN CHAT as a fenced
   block, mandatory (keeper ruling 2026-11-01: instrument fix, no
   AGENTS edit).

**Skill pass (from the 2026-11-01 suggestions graduation — each
suggestion file carries its Outcome pointing here):**
6. bee-hindsight: the five fixes (generalized Inputs; "any role,
   keeper-requested" vocabulary; sixth question "what worked?";
   slug format `YYYY-MM-DD-<role>-<slug>.md`; list new suggestions
   in status under Awaiting keeper). File:
   `planned/2026-10-25-pp-hindsight-skill-fixes.md`.
7. bee-brainstorm step 4 ownership filter ("a decision is what the
   keeper decided, not what the conversation concluded"). File:
   `planned/2026-10-25-po-brainstorm-ownership-filter.md`.
8. bee-plan rule 3 / plan template: grep expectations as minimums
   unless the exact count IS the contract. File:
   `planned/2026-10-20-verify-expectations-as-minimums.md`.
9. bee-loop Record step: interim checkbox rule (check exactly the
   current task's boxes at its commit; never batch across task
   boundaries) — dies structurally once `bee task` owns state.
   File: `planned/2026-11-01-po-per-task-checkbox-discipline.md`.
10. Dispatch-brief template: return-contract line (finished brief
    only, no working transcripts) + the pin-cwd line mirroring the
    GLOSSARY fourth safety line (the GLOSSARY half landed
    2026-11-01; its origin file was deleted after landing). File:
    `planned/2026-11-01-pp-researcher-briefs-final-only.md`.

**Script pass:**
11. plan-checks.sh: an existing file at a create-target on a
    completed plan reports `exists` (satisfied), not noise —
    ancestor walk keeps flagging missing paths. File:
    `planned/2026-11-01-po-p7-close-hindsight.md`.
12. Test convention: no hardcoded checkout-derived paths in tests
    (derive from the test's own location); consider a worktree
    suite run at merge level in `bee verify`. File:
    `planned/2026-10-31-po-no-hardcoded-checkout-paths-in-tests.md`.

**Design input:**
13. Design-note consolidation at rectification boundaries —
    superseded sections collapse into their successor; history
    stays in git. Extends ADR-016's addendum discipline; P8 is its
    first user (start with the skill-authoring-kit note). File:
    `planned/2026-11-01-pp-design-note-consolidation.md`.

**Determinism split:** items 1, 5, 11, 12 are script work; 2–4, 6–10
are skill-text authoring (judgment over shipped-law text); 13 is a
process design PP applies with the keeper's word.

## Open questions

None blocking. (P8's own sequencing is PO's planning call at P8
open; this note is the input inventory, not a plan.)

## Feeds

P8 planning (PO); the phase list's P8 row; ADR-015/016 (boundary
and lifecycle); this note's suggestion files (each carries its
Outcome).

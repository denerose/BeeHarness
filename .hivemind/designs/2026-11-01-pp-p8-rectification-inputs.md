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
3. Ship-tier cleanup — shipped skills + GLOSSARY carry
   self-contained rule text; strip AUTHORITY CITATIONS (references
   to our ADRs/designs/plans/.hivemind paths). Keep FUNCTIONAL
   references — usage/help text naming destination paths, error
   fix-lines naming operating surfaces — rewording them degrades
   the tool (keeper Class-C ruling at P4 close, decision D14; the
   ADR-015/boundary sweep wording may revisit to name the
   distinction).
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
13. Gate budget (P4 hindsight): cold-dispatched gate reviews get
    900s + "write the report even if incomplete" as the default —
    dispatch-brief template line. File:
    `planned/2026-11-01-po-p4-hindsight-gate-budget.md` (or its
    slug).
14. Plan-size guard (P4 hindsight): non-blocking size note in
    plan-checks.sh output above ~500 lines so the dispatcher sees
    the gate cost. File:
    `planned/2026-11-01-po-p4-hindsight-plan-size-guard.md` (or
    its slug).

**Design input:**
15. Design-note consolidation at rectification boundaries —
    superseded sections collapse into their successor; history
    stays in git. Extends ADR-016's addendum discipline; P8 is its
    first user (start with the skill-authoring-kit note). File:
    `planned/2026-11-01-pp-design-note-consolidation.md`.

**Session instruments:**
16. Session-ender and clean-up skills carry the right permissions
    to tidy up without annoying the keeper (P5 kickoff D1
    follow-up, keeper: supersede/write authority scoped so
    close-time tidying needs no per-step ask).
17. Close sequence + decisions inventory (P5 hindsight): extend
    `bee phase close` to mint the decisions-inventory file (a
    defined, parseable format — P4's example no longer parses),
    flip the phase row, and run the design stamps mechanically;
    the close checklist lands in bee-loop's close step. Files:
    `2026-11-02-po-close-sequence-checklist.md`,
    `2026-11-02-po-decisions-inventory-format.md`.
18. Plan-time corpus census (P5 hindsight): a census helper in
    bee-plan's assets — counts, role-form coverage, regex reach
    scripted at plan time so the gate judges interpretation only
    (three of P5's four gate rounds were hand-counted corpus
    facts, partly wrong). File:
    `2026-11-02-po-plan-time-corpus-census.md`.
19. bee-handoff pre-write gate (P5 hindsight): before compiling,
    confirm this is a same-role refresh the role file's continuity
    law permits — if the role law says delegate-harder or
    crash-recovery-only, that law wins; say so and stop. File:
    `2026-11-02-po-handoff-scheduling-guard.md`.
20. Close-flag calibration (P5 hindsight): count kickoff-ruled and
    in-phase decisions separately in `bee phase close` — the
    under-asked signal flags low kickoff front-loading, not
    review-driven extras. File:
    `2026-11-02-po-close-flag-counts-kickoff-separately.md`.
21. Loop-kit mechanics sweep (P5 hindsight observation): any
    mechanic that appears in a handoff but in no skill or script
    is a codification gap by definition — sweep PO's handoff
    Mechanics section (verify minting shapes, worktree.sh arg
    asymmetry, spine sync rule) into the durable homes at this
    pass.
22. LAW CLAUSE (keeper-authorized in principle, planned not
    landed — PP lands it at P8): union-merge suite gate, into
    AGENTS commit discipline — "after manually resolving merge
    conflicts, run the full suite before committing the merge;
    git's union splice can silently drop lines when two regions
    share an ending." File:
    `planned/2026-11-02-po-union-merge-suite-gate.md`.
23. LAW CLAUSE (keeper-authorized in principle, planned not
    landed — PP lands it at P8): editing-law scope, into the
    AGENTS editing block — "the editing discipline covers all
    files, not only living documents: scripted patches to source
    files (marker surgery included) verify the region's exact
    bytes first and chain a parse-or-test check in the same
    command." File:
    `planned/2026-11-02-po-marker-surgery-edit-tool.md`.

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

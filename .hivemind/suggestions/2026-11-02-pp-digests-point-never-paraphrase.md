# Suggestion — digests point, never paraphrase

**Date:** 2026-11-02
**Project:** BeeHarness
**Role:** power-planner (self-directed hindsight, session close)
**Scope:** repo (docs/WRITING-STANDARD.md)

## What happened

The target-state section took two keeper corrections in a row: my
first draft stored work state (the phase list's job — a second
stale-able surface); my second restated law the ADRs already carry
("don't our ADRs already cover most of this?" — they did). Both
failures were the same move: a digest that DUPLICATES its sources
instead of pointing at them. Same family as the GLOSSARY bloat
(twice), the role template, and the parallel-machinery corrections.

## Suggestion

One line in `docs/WRITING-STANDARD.md`:

> Digests, views, and summaries POINT at their sources — an aim
> names where the law lives; it never paraphrases the rule. One
> source of truth; anything restated will drift.

Applies to target-state sections, review notes, status digests,
and any future view. The comparison is computed at read time;
the digest stays static.

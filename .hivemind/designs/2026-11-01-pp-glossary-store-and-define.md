# Glossary store + `bee define` — design note

<!-- machine
status: live
phase: -
hash: -
merge: -
-->

**Date:** 2026-11-01
**Status (prose mirror):** live — approved by the keeper in
conversation, 2026-11-01, with the GLOSSARY slimming.

## The problem

The glossary is agent-looked-up vocabulary, but it lives as prose
markdown — regex-fragile for tools, and welcoming to creeping law
(twice now). A future `bee define <term>` needs a script-navigable
source, and the shipped template glossary (P8) needs the same shape.

## The design

**Store — `.hivemind/glossary.toon`** (per-project; ours doubles as
the dogfood instance and the content source for the P8 template
glossary). One line per term:

    term :: gist :: see

- `gist` — at most two lines; the whole answer for most lookups.
- `see` — pointers to whatever carries the term's law (role files,
  standards, templates).
- **No detail field, deliberately:** an entry that needs more than a
  gist is law in the wrong place. The format itself is the
  anti-bloat gate — the same discipline the 2026-11-01 slimming
  enforced by hand.

**Command — `bee define`** (AXI-bound, like every `bee` command):

- `bee define <term>` — exact match, then prefix match; TOON output.
- bare `bee define` — lists terms (content-first).
- unknown term — structured error with nearest matches, exit 1,
  fail loud.
- `--markdown` — renders a human-readable view on demand.
- Read-only, idempotent, no prompts.

**Conversion** — scripted one-shot at the build phase (P6), same
pattern as parking-lot.toon at P4: no hand conversion ahead of
tools. The markdown file retires at conversion; views render on
demand thereafter.

**Determinism split:** store reads, matching, rendering, and the
conversion are script work; what counts as a term and gist quality
are judgment.

## Open questions

None blocking. (Whether the rendered markdown view is ever
committed anywhere, or purely on-demand, settles in use at P6.)

## Feeds

P6 (`bee define` + the conversion; init seeds consumer stores in
the same format); P8 item 4 (template glossary distills from the
store, ships the same format); PL-PP-003 (the queryable-vocabulary
half of help surfaces).

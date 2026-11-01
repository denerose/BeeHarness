# Glossary store + `bee glossary` — design note

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
(twice now). A vocabulary-lookup command needs a script-navigable
source, and the shipped template glossary (P8) needs the same
shape.

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

**Command — `bee glossary`** (AXI-bound; noun-grammar like every
`bee` command — keeper ruling 2026-11-01: `glossary` over `define`):

- `bee glossary <term>` — exact match, then prefix match; TOON
  output.
- bare `bee glossary` — lists terms (content-first).
- unknown term — structured error with nearest matches, exit 1,
  fail loud.
- `bee glossary add <term> "<gist>" [--see <path>]` — CLI-mediated
  write per the standing write model (script stamps; agent
  supplies text).
- `--markdown` — renders a human-readable view on demand.
- Read-mostly: add/supersede is the whole write path — supply, not
  update; no state machine, nothing compacts.

**Conversion** — scripted one-shot at P5 (with the other stores),
same pattern as parking-lot.toon at P4: no hand conversion ahead of
tools. The markdown file retires at conversion; views render on
demand thereafter.

**Determinism split:** store reads, matching, rendering, and the
conversion are script work; what counts as a term and gist quality
are judgment.

## Open questions

None blocking. (Whether the rendered markdown view is ever
committed anywhere, or purely on-demand, settles in use at P5.)

## Feeds

P5 (the command + the conversion — the stores phase; keeper ruling
2026-11-01: glossary tooling rides with memory/logbook); P6 (init
seeds consumer stores in the same format); P8 item 4 (template
glossary distills from the store, ships the same format);
PL-PP-003 (the queryable-vocabulary half of help surfaces).

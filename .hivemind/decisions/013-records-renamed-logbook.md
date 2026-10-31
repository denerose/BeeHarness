# ADR 013: records/ renamed logbook/

**Date:** 2026-10-25
**Status:** Accepted (keeper direction — vocabulary session; closes
PL-PP-002's documentation gap)

## Context

"records" collided with ADR — literally "architecture decision
*record*" — making `decisions/` and `records/` read as one category.
The keeper rejected "evidence" as the replacement: a superpowers-ism
("evidence over assertion") with research connotations — things
gathered externally — not the keeper's word for the hive's account of
its own work.

## Decision

**The folder is `.hivemind/logbook/`** (renamed from `records/`;
history preserved via git mv). Its documents are **logbook entries**:
the loop's written account of its own work — verify entries and review
reports. A logbook names the account character: dated, signed,
append-only (a new round is a new entry, never a rewrite).

- Live documents updated in the rename commit: GLOSSARY (logbook and
  logbook-versioning entries), AGENTS.md and the design doc's
  artifacts map (which now carry a **purpose per class** — why /
  what / how / when / what-happened / inbox / deferred / live /
  surface / digest), the bee-loop/verify/review/hindsight skills'
  paths and terms, role files, the keeper report.
- ADR bodies and dated artifacts keep their original wording; every
  reference to `records/` or "records" in them **reads as `logbook/`**
  after this ADR. The "Record step" (the loop's write-it-down step)
  keeps its name — it now writes the logbook.
- A purpose line per artifact class is now standing law (the map), so
  the taxonomy is written, not folkloric.

## Alternatives considered

- **history/** — keeper's first candidate; broad (ADRs are history
  too) and brushes git's own "history."
- **evidence/** — rejected: superpowers-ism; research connotation
  (gathered externally), wrong claim for self-authored work accounts.
- **verdicts/** — rejected by the keeper: implies outcomes/judgment,
  but the folder's purpose is the account, not the verdict inside it.

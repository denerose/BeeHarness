# Suggestion — boundary-spanning edits: repeat the next entry's header, or split

**Date:** 2026-11-01
**Project:** BeeHarness
**Role:** power-planner (session hindsight)
**Scope:** harness (editing discipline; extends AGENTS rule 1)

## What happened

Parking-lot sweep, 2026-11-01: removing the PL-PP-009 entry, the
oldText ended at the START of the next entry's header
("- **PL-PO-002") and the replacement did not repeat it — the edit
replaced the header with a spurious duplicate of a third entry,
orphaning PL-PO-002's body. Fourth edit failure of the class this
project; the first where the fresh-read law was in force and the
READ was fresh — the constructed newText was wrong, not the
oldText. Failure conditions: a long turn, a multi-part edit, and an
oldText that ends at another entry's boundary.

## Suggestion

Extend the editing law's rule 1 with one sentence:

> An oldText that ends at the boundary of the NEXT entry (its
> header line) must repeat that header byte-exact inside the
> replacement — or the edit is split so no oldText crosses an
> entry boundary at all.

The split is the safer default on long turns; the repeat rule is
the repair when spanning is unavoidable.

**Date:** 2026-10-25
**Project:** BeeHarness
**Role:** keeper
**Scope:** harness
**What happened:** Ideas arrive faster than design sessions. Today's
trio (superpowers review, CLI help surfaces, this) came mid-session as
quick thoughts the keeper wanted captured without ceremony. Current
capture works — the Keeper's list takes todos, talking to a role takes
the rest — but it depends on a live role session; there is no
lightweight standalone way for the keeper to park a thought or todo
from anywhere, and no home for half-formed ideas that are not yet
suggestions, todos, or parking-lot items.
**Suggestion:** Design a capture mechanism for the keeper's quick
thoughts and todos — likely a variation on the suggestions intake:
(1) a `bee` CLI command (working name `bee thought`/`bee note` —
naming at design time) that appends to a reviewable inbox with a
provenance stamp; (2) a very small keeper-facing skill usable in a
separate lightweight session to add thoughts/todos/human-suggestions
without opening a full role session; (3) conversational guidance
built in — the keeper will sometimes talk to it (ramble, refine,
triage), so it should route captures to their homes: keeper's list,
suggestions inbox, parking lot, or keeper decision. Triage rules and
the inbox's relationship to `.hivemind/suggestions/` are design
questions for the session. Related: PL-PP-003 (CLI surfaces).

**Friction noted (keeper, 2026-10-25):** when a todo or suggestion
carries a question as part of its content ("discuss whether…",
"review or add…"), the asking and discussion of that question IS the
thing to do — it is not a question for the capturing agent to answer
now, nor to pre-resolve with embedded recommendations that tilt the
future session. The capture skill's triage guidance must preserve
such questions open until their design session. Same rule noted in
the parking lot's format line.

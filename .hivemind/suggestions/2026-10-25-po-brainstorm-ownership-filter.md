**Date:** 2026-10-25
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** The founding orchestrator run over-recorded twice in
one day (2026-10-20): a Q&A verdict was written into PL-002's scope as
if decided, then reverted on keeper correction. Root pressure:
bee-brainstorm step 4 says "Record decisions as ADRs as they are
agreed. Don't batch them to the end" — with no ownership filter, an
agent mid-discussion reads every conversational landing as "agreed."
The fix landed as law (memory-ownership sections, AGENTS.md) but the
skill text still carries the unfiltered instruction.
**Suggestion:** Amend bee-brainstorm step 4 to carry the filter:
"Record keeper decisions as ADRs as they are agreed — a decision is
what the keeper decided, not what the conversation concluded; when
unsure, offer first (GLOSSARY: memory ownership)." Link the GLOSSARY
term instead of restating the rule.

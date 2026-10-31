**Date:** 2026-11-01
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** At the 2026-11-01 orchestrator handoff, the wake
prompt was embedded in the handoff file but not pasted into the chat.
The keeper rejected that: the wake prompt is the pointer the keeper
must copy into the next context — it has to be delivered where the
keeper is, as a fenced block, every time. (The ritual text in
AGENTS.md says "give the keeper a wake prompt"; the global handoff
skill's step 5 does not make in-chat delivery explicit, so it
depended on the agent remembering.)
**Suggestion:** Amend the global handoff skill (step 5 / rules):
the wake prompt is delivered TWICE — written into the handoff file
(for durability) AND pasted in-chat as a fenced markdown block (for
the keeper to copy). In-chat delivery is mandatory, not optional;
a file reference is not delivery. Same for the repo AGENTS.md
handoff-ritual line: name the fenced in-chat block explicitly.

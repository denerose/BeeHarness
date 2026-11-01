**Date:** 2026-11-02
**Project:** BeeHarness
**Role:** project-orchestrator
**Scope:** harness
**What happened:** The P5 close gate failed twice on the decisions-inventory file: first because no format documentation exists anywhere (I reverse-engineered from P4's `…-decisions.toon`), second because P4's own header style (`phase: P5` bare lines) doesn't parse under today's `bee phase inventory` — only `#`-prefixed comment lines are skipped. The parser's error message teaches the line shape but not the header rule; the P4 precedent actively misleads.
**Suggestion:** Document the format at the point of failure: `bee phase help` (and the inventory usage block) should show a complete valid example — `#` comment header lines + `id · one-line · source-record-path` entries — or add `bee phase inventory --scaffold <phase>` that emits a valid skeleton (header comments + one sample line) to fill. Also worth a test pinning the parser's comment rule so P4-style headers are a known-rejected shape.

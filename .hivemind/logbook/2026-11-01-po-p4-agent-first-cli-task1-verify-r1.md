# Verify record: P4 Task 1 — inbox store + `bee inbox` family + `bee capture`

**Role:** project-orchestrator
**Level:** phase (plan header) — task's own finished-test: `node --test tests/bee-inbox.test.mjs` green; full suite green
**Date/time:** 2026-11-01 12:47 +11:00
**Work item state after this record:** implemented → verified

| command | exit | note |
|---|---|---|
| node --test tests/bee-inbox.test.mjs | 0 | 24 tests passed, 0 failed |
| node --test tests/*.test.mjs | 0 | 58 tests passed, 0 failed (full suite) |

Reference sweep (standing rule — grep shown):

```
grep -rn "bee inbox\|bee capture\|inbox.toon" AGENTS.md README.md docs roles skills bin scripts tests
  (excluding bin/bee.js implementation + tests/bee-inbox.test.mjs)
→ 0 hits — no living doc/skill/role references the inbox yet; GLOSSARY/status-surface updates are Task 2/10 scope by design. No stale references.
ls .hivemind/inbox.toon → absent (correct — the real store is created by Task 2's migration adds, not this task; all test runs used --store temp paths)
git status → only bin/bee.js + tests/bee-inbox.test.mjs touched
```

Store-contract evidence (battery asserts byte-exact): header line, field order (id/addressee/origin/ref/text/state/opened/taken/done), blank line between items, zero-padded monotonic IN-NNN ids, ISO timestamps with local offset, unknown fields preserved on rewrite (schema-for-later, ruling 3). `taken:` stamped by `list --for` reads only; `--check` withholds it.

**Verdict:** PASS
**Log:** inline above

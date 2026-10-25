# Verify record: [task/phase name]

(Save as `.hivemind/records/<plan-slug>-task<N>-verify-r<N>.md`)

**Role:** [producing role — GLOSSARY: Role trailer]
**Level:** task | merge | phase | release
**Date/time:** YYYY-MM-DD HH:MM
**Work item state after this record:** implemented → verified (on FAIL: unchanged)

| command | exit | note |
|---|---|---|
| make test | 0 | 42 passed |
| npx tsc --noEmit | 0 | — |

**Verdict:** PASS | FAIL | BLOCKED
**Log:** [path or "inline above"]

(BLOCKED = the declared checks can't be run. Say what's missing.)

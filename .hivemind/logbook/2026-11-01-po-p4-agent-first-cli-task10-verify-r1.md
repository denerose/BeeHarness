<!-- machine
role: project-orchestrator
date: 2026-11-01T16:20:07+11:00
verdict: PASS
checks-run: 1
plan: .hivemind/plans/2026-11-01-po-p4-agent-first-cli.md @ 95350a8
-->

Task 10 sweep work (task-orc dispatch, worktree task/4-sweep). Edits:
six GLOSSARY additions/rewrites (inbox, bee capture, bee design, bee
verify, bee task, structure check; status-surface rewrite; parking-lot
entry names the park family; hivemind enumeration gains inbox.toon),
AGENTS durable updates (checks-contract mention in the plan-review
gate; docs/ enumeration generalized; suggestions gloss "the inbox" →
"improvement proposals" — naming collision with the real inbox store,
disclosed), README documents list gains guidance/, and two sweep fixes
(bee-brainstorm SKILL parking-lot.md read → `bee park list`;
design-doc-template ADR example values → `ADR-<n>`/`ADR-<m>`
placeholders; bee.js migrate comment "live" → "legacy").

## Reference sweep (greps shown, post-fix)

Sweep 1 — stale parking-lot.md reads:

    $ grep -rn "parking-lot\.md" bin scripts skills AGENTS.md README.md docs
    bin/bee.js:1234:// .hivemind/memory/parking-lot.md):

One residual, classified: functional documentation of `bee park
migrate`'s LEGACY parse input (the command still parses that format;
comment wording fixed live→legacy this task). The stale skill read is
gone (bee-brainstorm now walks `bee park list`).

Sweep 2 — task.sh, escaped true-dot form:

    $ grep -rn "task\.sh" bin scripts tests skills AGENTS.md docs README.md
    [no output]

Zero hits — Task 8's rename holds. The plan's unescaped form
(`grep -rn "task.sh"`) shows only `bee task show` any-dot false
positives (the Task 8 note's warning, reproduced here deliberately).

Boundary A — `grep -rn "hivemind" skills/` (excl. GLOSSARY): 15 hits,
ALL classified functional operating-surface references (skills naming
the .hivemind/ surfaces they read/write: sessions, suggestions,
phases, plans, logbook). Zero hits cite a .hivemind path as authority.
Markdown-link citations of .hivemind paths in skills/ (the
link-checker's parse class): zero.

Boundary B — `grep -rn "ADR-" skills/`: GLOSSARY hits = provenance
pointers (allowed by design). Outside GLOSSARY, one hit:

    skills/session/bee-brainstorm/assets/design-doc-template.md:5:
    **Governed by ADRs:** [list, e.g. ADR-<n>, ADR-<m>]

Placeholder (this task's fix — was ADR-003, ADR-006); a generic form,
not a citation of a real record.

Boundary C — `grep -rn "hivemind\|ADR-" bin scripts`: 44 hits, all
classified. (b) provenance comments in code: bee.js:5-7,1424,1632;
design.sh:2,10; worktree.sh:2,170. (c) provenance prose in generated
output: bee.js:212 (bee report header protocol, ADR-008 by design).
(a) functional paths: default store/report/logbook paths in code and
their usage-line documentation (bee.js:381-3118 passim), fix-line
error strings naming operating surfaces (1976,2391,2508,2524 —
self-correction instructions per ruling 4, not authority citations),
the render regex (315), the structure map itself (structure.map:9-11),
and the migrate legacy-format comment (1234). Zero hits cite a record
as authority in help/usage/error surfaces.

## Evidence

- Full suite: `node --test tests/*.test.mjs` → 238 tests, 238 pass,
  0 fail.
- Structure check: `bash scripts/structure-check.sh .` → `0 findings`.
- Dogfood (unscoped, writes nothing):
  `node bin/bee.js verify --plan .hivemind/plans/2026-11-01-po-p4-agent-first-cli.md`
  → `11 checks · 11 pass · 0 fail` (tasks 0–10 all PASS; links · 48
docs · PASS; structure · map · PASS · 0 findings); logbook confirmed
  unwritten (porcelain clean over .hivemind/logbook/).
- This entry: scoped task-10 run with `--role project-orchestrator`,
  body appended by hand (sweep evidence per dispatch brief).

Phase-end steps (decision inventory, keeper sign-off cards,
`bee phase close 4`, `bee design implement`) are the loop's, from the
main checkout after this branch merges — not in this entry's scope.

## Class-C deviation — recorded by the loop (review r1 SF3)

The plan's boundary letter says "Usage/help text and error strings
carry zero hits"; the shipped CLI carries `.hivemind` hits in
usage text (destination paths) and error fix-lines (self-correction
examples) — all naming operating surfaces, zero authority
citations. **Ruling recorded: ruling-4 fix lines and usage
destination documentation naming default operating paths are class
(a) functional references.** Rewording them would degrade
self-correction output; the sweep's purpose (no authority
citations) is met.

# Review: P5 Task 1 — memory store + `bee memory`

Role: cold-dispatched reviewer (bee-review)
**Plan section:** /home/saphron/BeeHarness/.hivemind/plans/2026-11-01-po-p5-memory-logbook-glossary.md — Task 1
**Work under review:** commit `1576704` on `task/5-memory-store` (bin/bee.js modified, tests/bee-memory.test.mjs created — exactly the task's Files contract, no scope creep into Tasks 2–4)
**Verify record:** .hivemind/logbook/2026-11-01-po-p5-memory-logbook-glossary-task1-verify-r1.md (PASS, checks-run: 1 = the plan's task-1 checks contract)

## Claim vs record (first check) — pass

Task 1 boxes unchecked; machine-header state `task-1: implemented` is not ahead of its evidence (commit + verify r1 exist). Commit message matches the plan's `Commit:` line verbatim, with Role trailer. Verify record backs the pass.

## Evidence run by this review

All commands run in the task worktree at `1576704`:

- `node --test tests/bee-memory.test.mjs` — 23/23 pass
- `node --test tests/bee-park.test.mjs` — 34/34 pass (park neutrality held)
- `node --test tests/*.test.mjs` — 263/263 pass
- Live probe: `bee memory add … --origin Power-Planner` → exit 0, id `ME-PP-001`, store line `ME-PP-001 :: lesson :: probe gist :: power-planner · 2026-11-02 · - :: live`
- USAGE stanza diffed against the plan's shared block: verbatim match modulo the block's uniform 2-space base indent

## Findings

### Blocking

None.

### Should fix

- `bin/bee.js:1623` and `bin/bee.js:1745` — the provenance origin is lowercased before storing (`provenance: \`${origin.toLowerCase()} · …\``), contradicting both the plan's words ("origin as passed", plan line 90) and the implementer's disclosed interpretation call, which claims the origin is stored "AS PASSED verbatim" with "park's lowercase normalization NOT applied to provenance text". The code does apply that normalization — the same fold park uses for its origin field (`bin/bee.js:1134`). The disclosed call matches the plan; the implementation matches neither. Every test origin is lowercase, so no test pins either behavior (the as-passed assertion in the supersede test passes identically under both). For real role names (all lowercase in this repo) the store is unaffected; the problem is the corner plus the inaccurate record. Suggested fix: build both provenance strings from `origin` as passed (keep `origin.toLowerCase()` for the id series at :1618/:1740 — `originTag` uppercases regardless), and add one mixed-case-origin test pinning the behavior; alternatively keep the fold and correct the disclosed call in whatever record carries it — but code, disclosure, and plan words must agree before merge.

### Notes

- The store carries a `#` header line beyond the plan's entry-line format block — house-consistent (park/inbox stores carry headers; the parser skips `#` and blank lines; the seeded-store tests write it). No action.
- The mint-entry literal and provenance template are duplicated between `memoryAdd` (bin/bee.js:1617–1626) and `memorySupersede` (bin/bee.js:1739–1748); a shared minter helper would keep them in sync. House code tolerates this scale of duplication; no round demanded.
- AXI spot-check: principles 1–6, 8–10 all honored (TOON list lines, 3-field default schema, `truncText` size hints with `--full` escape, pre-computed counts, definitive `0 entries`, fail-loud unknown flags, bare call = list, next-step suggestions, per-subcommand help listing the `--store` seam). Principle 7 N/A.

## Judged dimensions

- **Plan intent:** matches. Grammar stanza verbatim; store line format exactly as contracted (` :: ` five fields, zero-padded `ME-<tag>-NNN`, `superseded:<id>` states); absent store → `0 entries` exit 0; `show` fails loud naming the store path; `--check` on both write commands, never writes (tested at store-byte level); newline guard on gist/ref extended with the ` :: ` line-format guard; fail-loud double-supersede (naming the successor to supersede instead) and unknown id.
- **Supersede semantics:** correct. Successor mints in the calling role's series via `--origin`; old entry's state rewrites in place (position preserved, successor appends — tested line-by-line); whole-store atomic write via the house `atomicWrite` (temp+rename); D1's no-extra-gate ruling honored and documented in `MEMORY_USAGE`; D2 per-role ids and D3 explicit `--type` enforced on add and supersede alike.
- **parkOriginTag → originTag:** behavior-neutral confirmed — same body, both park call sites updated, no residual references, park suite 34/34.
- **Test coverage vs the plan's named list:** all nine named cases present (default bare series; per-role via full and short origin; `--type` required on add and supersede; field order + zero-padding; series continuation from seeded store; supersede rewrite + successor; double-supersede; `--check` writes nothing; unknown id), plus structure mirroring bee-park.test.mjs and extras (truncation, `--type` filter, corrupt-store hand-fix, origin validation, AXI battery).
- **Undisclosed deviations:** one — the provenance case-fold above (the header-line note is house-consistent, not a deviation).

VERDICT: APPROVE

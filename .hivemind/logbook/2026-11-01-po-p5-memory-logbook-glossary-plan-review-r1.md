Role: cold-dispatched plan reviewer

# Plan review r1 — P5: memory system + logbook hygiene + glossary store

**Plan:** `.hivemind/plans/2026-11-01-po-p5-memory-logbook-glossary.md`
**Date:** 2026-11-01 · **Reviewer:** cold dispatch per `skills/loop/bee-plan-review/SKILL.md`
**Basis:** mechanical core + whole-plan read + claim-by-claim verification against the repo (evidence below; commands run, not recalled).

## Mechanical core (scripts/plan-checks.sh)

- Plain run: `boxes: 0/28` · `blocks: 4/4 tagged, 0 untagged` · `checks: clean` · exit 0. No core findings to triage. Machine header carries phase, validation, state-source, targets (create/modify marked), per-task checks, suite — both gate conventions met.
- `--run` run: `suite: pass` — **vacuous, do not cite as evidence.** The sandbox holds only the plan's four extracted blocks (a USAGE stanza, two store-format samples, one header-contract sample); there is no `tests/` in it. Verified directly: running `node --test tests/*.test.mjs` inside the `--extract` sandbox matched 0 test files and exited 0.
- Sandbox-run judgment: **N/A, with reason.** All four blocks are interface contracts (usage text, store line formats, machine-header format) — data, not executable code. No meaningful cold run exists; the plan's real executable verification is the per-task `node --test` checks against implementer-written tests. The blocks are internally consistent with their own field rules (no ` :: ` inside fields; provenance uses ` · `; the header block is well-formed machine syntax) — but its content mismatches the live emitter, which is finding B1.

## Judgment findings

### Blocking

**B1 — header-contract block contradicts the existing emitter and the pinned test (accuracy).**
Plan line 102 + the contract block (lines ~110–122) vs `bin/bee.js:1955–1966` (`verifyEntryText`) and `tests/bee-verify.test.mjs:259`. Today's emitter writes fields in the order `role, date, verdict, checks-run, plan`, with `date:` as a full local ISO datetime (real entry `2026-11-01-po-p4-agent-first-cli-task6-verify-r1.md` carries `date: 2026-11-01T14:40:44+11:00`). The plan's contract block orders them `role, date, task, plan, verdict, links, checks-run` with `date: <YYYY-MM-DD>`. An implementer following the verbatim contract (it is the declared extraction target and "applies to every entry file") must reorder `plan` ahead of `verdict` and change the date format — which breaks the anchored regex at `tests/bee-verify.test.mjs:259` (`/^<!-- machine\nrole: bee\ndate: \S+\nverdict: PASS\nchecks-run: 1\nplan: \S+ @ -\n-->\n$/`) — while line 102 simultaneously forbids exactly that ("No existing test may change its meaning — extend, don't rewrite"). The plan self-contradicts; the implementer cannot satisfy both. **Fix:** pick one and say it — either (a) keep the existing order and append `task:`/`links:` (update the contract block to match), or (b) declare the contract's order canonical and explicitly name the `bee-verify.test.mjs:259` assertion as the one test whose text changes (lifting the "don't rewrite" rule for it). Also name the canonical date format and how the five existing datetime-dated entries reconcile.

**B2 — stamp's filename regex misses 17 of 70 real files; behavior for them is unspecified (accuracy / spec gap).**
Plan line 103 defines the pass over a logbook dir via `^(.+)-task(\d+)-(verify|review)-r(\d+)\.md$`; Task 5 (line 164) then says stamp "over the real logbook (70 entries …)" and "re-run until exit 0". Census of `.hivemind/logbook/`: 17 of 70 files do not match the regex — multi-task ranges (`…-task1-3-review-r1/2/3.md`, `…-task1-2-review/verify-r1.md`), phase-level entries (`…-phase-review-r1.md`, `…-phase-verify-r1.md` × 2 phases), other records (calibration, dispatch, `…-decisions.toon`), plan-review/skill-review reports ×3, and round-less P1 entries (`readme-roles-refresh-task1-review.md`, `…-task1-verify.md`). (This review's own filename is in the plan-review class — the plan's process mints files its own regex cannot stamp.) The plan never says whether non-matching files are skipped, reported, or hand-fix-listed; "re-run until exit 0" is reachable only if they're skipped, which the plan doesn't state, and the header contract "applies to every entry file". The implementer must invent policy at close time, on real data, after keeper sign-off. **Fix:** one sentence in Task 2 — files not matching the regex are skipped and reported as out-of-scope (exit unaffected) — plus the same statement folded into Task 5's expectations; or define allowed `task:` values for the out-of-shape kinds and put them on the hand-fix list.

**B3 — stamp's role parse names the minority form; the corpus convention is bold (accuracy).**
Plan line 103: "`Role: <role>` line in the body yields role". Census: 61 of 70 entries carry `**Role:** <role>` (bold markdown), 4 carry plain `Role: `, 7 carry neither. A literal `^Role: ` parse auto-stamps 4 files and hand-fix-lists ~61 files that do state a role — inflating the close-time hand-fix pass from a genuine ~30-file list (7 role-less + 25 verdict-less, union ≤ 32) to nearly the whole logbook, and building a parser for a form that barely exists. **Fix:** spec the parse for both forms (e.g. `^\*{0,2}Role:\*{0,2}\s*(\S+)`), and note in Task 5 the expected genuine hand-fix scale (role-less 7, verdict-less 25).

### Should fix

**S1 — `--check` sentence inverts house semantics (accuracy).** Plan line 76: "Write commands take `--check` and never write without it" — reads as *writes require `--check`*, the opposite of the house rule (`bin/bee.js` USAGE: "`--check` never write; report what would happen"; park/inbox write by default) and of the plan's own test list ("`--check` writes nothing"). Fix: reword to "write commands accept `--check` (preview; never writes)".

**S2 — D4 is recorded in neither design addendum (accuracy / traceability).** Plan header claims "all eight kickoff decisions" citing the two designs @ 6dc0392; the p5 addendum records D1/D2/D3/D7/D8, the glossary addendum D5/D6 — seven. D4 (stamping fail-loud + hand-fix list) lives only in the plan header and `.hivemind/sessions/project-orchestrator.md` (gitignored session memory). Both addenda say "pending rectification". The implementer isn't misled (D4's content appears twice in the plan body), but a keeper ruling whose only durable record is a plan header is fragile. Fix: add D4 to the p5 design addendum, or note in the plan where D4 is recorded.

**S3 — compact scope omits P7, which is closed (accuracy vs recorded ruling).** Plan lines 127/166 scope Task 5's compact to "P0–P4 (D7)", but D7 as recorded says "the first compact covers ALL closed phases", and the phase list marks P7 done (owner stamp 2026-11-01 02:50, before P5's pickup at 17:38). Closed-at-close-time is P0–P4 **and P7**. Fix: scope to "all phases closed at close time (today: P0–P4 and P7)" or record why P7 stays out.

**S4 — "the current file names none" is false for two glossary bullets (accuracy).** Plan line 142; `skills/GLOSSARY.md:28,32` — the power-planner and project-orchestrator bullets end with wrapped "See `roles/….md`." sentences. The converter's "see pointers where a bullet names one" defines no detection syntax, rests on the false none-claim, and the plan's own store example (line ~148) shows a populated `see` field. Fix: either define pointer detection (e.g. trailing "See `<path>`." sentence → `see`) or state plainly that prose See-sentences ride into the gist and `see` defaults `-` for all 46.

**S5 — the five already-stamped entries can never conform (accuracy, minor).** Plan line 103 skips "already stamped" entries; the five minted P4 verify entries (task6 r1/r2, task8, task9, task10) carry the old five-field blocks without `task:`/`links:` and datetime dates — skipped forever while the contract "applies to every entry file"; `index` must then tolerate a missing `task`. Fix: have stamp top up already-stamped entries missing `task`/`links` from the filename, or name the waiver and the index behavior.

**S6 — bare `bee logbook` behavior unspecified (determinism/AXI).** Grammar stanza (plan lines ~20–25) makes `stamp` optional (`[stamp …] | index | compact`), so bare `bee logbook` parses as valid with no defined output — against AXI 8 (content-first; `bee memory`'s bare call is defined as list) and AXI 10. Fix: require a subcommand or define bare = `index`.

## Dimension notes

- **Accuracy** — B1, B2, B3, S1–S5. All other checked claims held (ledger below).
- **External reality** — verified by running: `git log --format=%as -1 -- <file>` returns `YYYY-MM-DD`, rc 0 (two entries tested); `node --test` works, full suite **240/240 pass** (green baseline for the plan's phase-exit claims); `bash scripts/structure-check.sh .` → 0 findings; `/home/saphron/BeeHarness-phase3` exists (detached @ 1a78a35 — the `phase/5` spine is not yet created; that is loop pickup work, the plan names it as convention only); `bee phase close` exists (`cmdPhase`). No findings beyond those above.
- **Sandbox-run** — N/A with reason (see core section); the vacuous "suite: pass" is reported precisely so nobody mistakes it for evidence.
- **Ephemeral prose** — core scanned all modify-targets clean; judgment concurs. "(46 today)" (line 142) lives inside a plan — a record, not a durable behavior document — no finding.
- **Determinism/AXI** — the split is declared and true to ADR-014 and both designs: every structural step (ids, series, stamps, headers, index, compaction, conversion, view regeneration) is assigned to `bin/bee.js`; agent judgment is named (gist/term text, lesson-vs-fact, conversion conflict rulings). AXI present in the contracts: definitive empty states ("0 entries", "0 terms"), structured errors with exit codes, `--check` on writes, idempotent stamp/compact, content-first bare calls. Residue: S1 (misleading `--check` prose), S6.
- **No-globals boundary** — clean. Every named instrument is bee-native (`bin/bee.js`, `tests/`, `scripts/`, git, node) or a foundation (keeper sign-off cards). No global skill or global rules file appears anywhere in the plan.

## Verified-claims ledger (claims that held)

- `bin/bee.js`: `atomicWrite` (:21), top-level `USAGE` (:27), `parkOriginTag` (:1051, word-initial mapping, short codes pass through), `verifyEntryText` (:1955, five fields in a machine block), `run(argv)` dispatching all seven command families — all as the plan describes (order nuance feeds B1).
- `tests/bee-park.test.mjs`: tmp store via `--store` + `run()` helper — the mirror claim holds. `tests/worktree-sh.test.mjs`: real `git init` in mkdtemp with config + seed commit — the cited git-in-test pattern exists.
- `scripts/structure.map`: `.hivemind/<class>/<file>` covers `memory/memory.toon`; the hivemind root line does **not** cover `.hivemind/glossary.toon` — the plan's map addition is needed and correctly placed.
- `skills/GLOSSARY.md`: 46 `- **term** —` bullets, multi-line wrapped gists — count claim exact.
- `.hivemind/logbook/`: 70 entries, exactly 64 lacking `<!-- machine` — both plan numbers exact.
- Design docs exist and are the cited `6dc0392` versions with the kickoff addenda (minus D4 — S2). Plan targets: all modify-targets exist, create-target parents exist (core exit 0).
- Plan's D1/D2/D3/D5/D6/D7/D8 operationalizations match the recorded rulings (D7 scope gap = S3); glossary store format and lookup semantics match the design incl. the D5 supersession (view kept, regenerated on write) and D6 (tests-only until close).

VERDICT: fail — blocking findings B1 (header-contract block vs existing emitter + pinned test), B2 (stamp regex misses 17 of 70 real files, behavior unspecified), B3 (role parse names the form 4 files use, not the 61 that carry it).

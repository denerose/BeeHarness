# Plan review — P4 agent-first CLI (round 2)

**Plan:** `.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md` (as fixed at commit `356d6f8`)
**Reviewer:** cold dispatch (bee-plan-review, 2026-11-01 — round 2; did not write the plan)
**Core:** `bash scripts/plan-checks.sh <plan>` (check mode), run from repo root, exit 1 (findings)

## Core output (run first)

- `boxes: 0/61`
- `blocks: 3/3 tagged, 0 untagged`
- 5 prose findings on modify-targets — the same five r1 findings (P1–P5),
  all already dispositioned in the r1 record; waivers/fix notes verified
  present in the r1 report. None dropped; none re-litigated.
- `--run` not re-run this round: r1 established the sandbox suite pass is
  vacuous (sandbox holds only extracted data blocks; zero-match glob exits
  0). Real validation, run in-repo by this reviewer: **34 tests, 34 pass**
  (`node --test tests/*.test.mjs`). The vacuous-pass triage stands as r1
  recorded it.
- Repo verified clean (`git status --porcelain` empty) after every command.

### Core prose findings, triaged (r1 dispositions verified, carried)

| # | Hit | Tier | Disposition (r1 record, verified present) |
|---|-----|------|-------------------------------------------|
| P1 | `skills/loop/bee-plan/SKILL.md:40` | should-fix | **Waived (PO, r1):** quoted-example class — rule text quoting its own markers. |
| P2 | `skills/loop/bee-plan/SKILL.md:41` | should-fix | **Waived (PO, r1):** same class as P1. |
| P3 | `AGENTS.md:135` | should-fix | **Fixed in-plan (r1):** Task 10 generalizes the docs enumeration; the "currently" parenthetical is dropped. Plan text verified to say so. |
| P4 | `.hivemind/status.md:280` (was :268 — surface grew, concurrently edited) | should-fix | **Waived (PO, r1):** dated historical quotation in the interim living surface. |
| P5 | `.hivemind/status.md:364` (was :352) | should-fix | **Waived (PO, r1):** same class and reason as P4. |

## Round-2 fix verification (the six recovered findings)

All six verified against the repo, not against the planner's claims:

- **G1 (structure.map seed vs tracked tree) — fix VERIFIED as the
  extension mechanism, with one residual (R1 below).** The plan's seed was
  matched against `git ls-files` (155 tracked files, one-segment wildcard
  semantics, dotfiles included, per the seed's own comment): misses exactly
  **3** — `docs/research/{axi-principles,boeckeler-guides-and-sensors,
  four-pillars-of-a-harness}.md`. The seed does NOT cover them; the fix is
  that Task 8's build step explicitly runs the check over the repo and
  extends the map deliberately for anything tracked that misses ("the map
  edit IS the recorded decision") — that step exists in the plan, so the
  `0 findings` verify is reachable and map extension is sanctioned, not
  invented. Residual prose contradiction filed as R1.
- **G2 (spine currency) — VERIFIED.** Standing rule present in the plan
  ("Spine currency: … before every dispatch, sync `phase/4` with main
  (merge main into the spine; never force)"), and the spine was actually
  synced: `git -C /home/saphron/BeeHarness-phase3 log --oneline -1` →
  `356d6f8`, identical to main and to the plan's last commit.
- **G3 (Task 10 sweep classes vs reality) — VERIFIED exact.** Today:
  `grep -rn "ADR-" skills/` → **16** hits, **15** in `skills/GLOSSARY.md`,
  **1** in `skills/session/bee-brainstorm/assets/design-doc-template.md:5`
  (an example value — the plan calls it exactly that and directs
  placeholder-izing it in Task 10). `grep -rn "hivemind" skills/` → **28**
  hits; all 17 non-GLOSSARY hits spot-checked: every one is a functional
  surface reference (skills naming the `.hivemind/` paths they operate
  on); none cites a record as authority. The plan's classes match reality.
- **G4 (bee.js:158 outside old classes) — VERIFIED.** `bin/bee.js:158`
  cites ADR-008 (+ ADR-007 amendment 1) as provenance prose inside the
  `FRESH_HEADER` generated-output template; the plan's new class (c)
  ("provenance prose inside generated-output templates — rendered output,
  not help text") covers it. All other bin/scripts hits classify too:
  `bee.js:3`, `task.sh:2`, `task.sh:170` are provenance code comments
  (class b); the 5 `hivemind` hits in bin/scripts are functional paths in
  code strings (class a). No unclassifiable hit today.
- **G5 (parking-lot duplicates) — VERIFIED: three, as the plan now
  says.** Live lot: PL-004, PL-PO-001, PL-PP-002 each appear in both
  Parked and Resolved — exactly three duplicates, no fourth. Plan names
  all three and the Task 3 test asserts the three resolve per the
  collision rule (resolved wins, `how` notes the superseded duplicate).
- **G6 (sweep-modified files missing from targets) — VERIFIED.** Both
  `skills/loop/bee-loop/assets/dispatch-brief-template.md (modify)` and
  `skills/session/bee-brainstorm/assets/design-doc-template.md (modify)`
  are in the machine header's targets and exist on disk; the core's
  target-existence check passed (no target findings).

The r1 fixes were also re-checked in the fixed text: F1 (seed + sanctioned
extension), F2 (`README.md (modify)` now in targets), F3 (collision rule
named, resolved wins), F4 (RESOLVED skip stated in Task 2's migration),
F5 (Task 5's block is now an explicit whole-region replace with
comma-shaped `files: [<path>, <path>]`), F6 (`bee park migrate` named as
the executor), F7 (sweep split by pattern with per-class pass conditions).

## Judgment findings

### Accuracy

Design doc read whole; hash pin verified (`git log -1 --format=%h` →
`ad77aa4`, exact). Kickoff ruling 1's "all seven filed kickoff items"
matches the design's seven-item list; Task 7's four task-orc additions
match the design's codification section; Tasks 3–9 map onto the design's
`bee park`, determinism build-out, and structure-check shape. The plan's
`bee inbox` resolution of the design's `bee task add <role>` sketch is
documented in-plan as an execution decision honoring the keeper's rename
ruling (kickoff ruling 5) — surfaced, not hidden; no escalation needed.
G1–G6 verified above; spine, worktree, template, and header-protocol
claims from r1 re-confirmed where the plan text still makes them.

- **R1 · should-fix · Task 8 / seed coverage prose contradicts itself.**
  The seed block's parenthetical claims coverage of "everything `git
  ls-files` tracks today", and the paragraph after it claims "everything
  tracked at plan-gate time" — but the same paragraph admits trees landed
  mid-flight "during this plan's own gating", and the facts bear that out:
  `docs/research/` landed at 12:14 (`8ae6965`), the plan fix that wrote
  both sentences landed at 12:31 (`356d6f8`), and the seed misses those 3
  tracked files. Both coverage claims were stale when written. Not
  blocking: the extension step in the same task is the operative rule, it
  makes the verify reachable, and an implementer who hits the 3 misses is
  directed, not stranded. **Fix:** reconcile the two sentences — one claim,
  matching the extension paragraph (e.g., "seed covers everything tracked
  at seed-writing time plus this phase's planned files; Task 8's build
  step extends the map for anything tracked that misses").

### External reality

Suite runs as declared (34/34 in-repo, node --test). Nothing new this
round presumes unverified external behavior; r1's external checks (git
flags, parseArgs strictness, house patterns) still stand — the fixed text
added no new commands. No findings.

### Sandbox-run

3/3 blocks tagged. `--run` vacuous (r1-recorded; in-repo suite is the
evidence). The seed block was run cold this round in effect: its pattern
semantics were executed against the real tracked tree (the matcher above)
— it behaves exactly as the plan's extension paragraph predicts, misses
and all. `inbox.toon` and the plan-template block: r1 ran/verified them;
substance unchanged. No new sandbox failures.

### Ephemeral prose

Core hits = P1–P5, dispositioned above. The plan's own "three such exist
today" (Task 3) and the Task 8 "today" parenthetical live in a dated plan
(the parking lot is converted in the same task; nothing goes stale) — the
latter is filed under accuracy as R1 because it is a coverage contract,
not narrative. Durable-doc edits the plan directs (Tasks 2/3/10) remain
durable-content-only. No new findings.

### Determinism / AXI

Every deterministic step has a named script core (design.sh, the
inbox/park stores + migrate, bee verify/task, structure-check.sh with the
map as data, bee phase close, guidance listing); kept judgments are named
(is-this-output-sane stays agent text; the loop reads the verify entry
before `move … done`; sweep hit classification is judgment recorded in
the verify entry with "unclassifiable = finding"). AXI batteries per
subcommand map onto `docs/AXI.md`'s ten principles (bare-call content,
definitive empty states, unknown-flag exit 1, `--check`, `--full`,
aggregates, fix lines as contextual disclosure). Map extension on a miss
is a deliberate recorded decision — judgment by design, visible. No
findings.

### No-globals boundary

**PASS.** Every instrument named is bee-native: `scripts/*`, `bin/bee.js`,
`tests/*`, the shipped skills (loop/session/skilldev kits), GLOSSARY,
`docs/AXI.md`, `docs/WRITING-STANDARD.md`, role files, the repo suite.
Task 7's gate is bee-skill-review (shipped kit). No step leans on a
global skill or the global AGENTS.md.

## Verdict

**PASS** — 0 blocking; 1 new should-fix (R1).

The six recovered round-2 findings are all fixed in-plan and verified
against the repo. R1 is a prose reconciliation inside Task 8 (two
sentences disagree about what the seed covers; the extension paragraph is
the operative truth) — fix at the planner's convenience before or during
execution; it does not block, because the task's own build step already
directs the implementer through exactly the situation the stale
parenthetical misdescribes. The five core prose findings carry their r1
dispositions (four waived with recorded reasons, one fixed in-plan).

Role: reviewer

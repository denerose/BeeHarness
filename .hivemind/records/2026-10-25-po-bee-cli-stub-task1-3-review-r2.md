# Review: bee CLI stub — Tasks 1–3 (fix round 1 re-review)

**Role:** project-orchestrator
**Reviewer:** bee-review stage agent (dispatched by project-orchestrator, round 2)
**Plan section:** `/home/saphron/BeeHarness/.hivemind/plans/2026-10-25-po-bee-cli-stub.md` Tasks 1–3 + fix round 1 (commit 288dcc5)
**Verify record:** `/home/saphron/BeeHarness/.hivemind/records/2026-10-25-po-bee-cli-stub-task3-verify-r2.md` (PASS)

## Verdict

**Fix first** — both r1 findings are resolved and verified (4-regen byte-stability across all header forms; RESOLVED queue bullets no longer asks; backticks kept), but the new restamp regex leaves a stale `**Source:**` duplicate on wrapped stamps, and the live report's *current* header has exactly that form.

## r1 findings — resolution status

- **Blocking (restamp regex decay) — RESOLVED, verified by experiment.** Probes in `/tmp` (4 consecutive regens each, explicit `--status`/`--report`, whole-file compare modulo stamp): wrapped-plain-continuation header, fresh file, and fixture report all byte-stable runs 1→4; blank line after the stamp survives; a `**`-starting protocol line directly after the stamp survives (the exact line the old regex ate first). The new 3-regen test (`tests/bee.test.mjs:159`) also covers this.
- **Should fix (RESOLVED queue bullets as asks) — RESOLVED, verified.** Queue bullet containing `RESOLVED` (`bin/bee.js:224`) is not derived as an ask; old-zone items containing RESOLVED are *kept* (tool never drops, role prunes — per contract and verify r2). Live `report --check` derives no RESOLVED asks. Test at `tests/bee.test.mjs:176`.
- **Note (backtick drop) — RESOLVED, verified.** Backticked tokens rewrite to backticked absolute paths (`bin/bee.js:236`); suite asserts it.

## Blocking

None.

## Should fix

- `bin/bee.js:338` — the restamp regex refuses any continuation line starting with `**`, so a stamp wrapped *before* its `**Source:**` token leaves the Source line behind as a stale duplicate. Probe A (and a live `report --check` at 15:36): a header of `**Generated:** … ·` / `**Source:** \`.hivemind/status.md\`` becomes `**Generated:** <stamp> · **Source:** …` followed by the orphaned `**Source:** \`.hivemind/status.md\`` line — duplicated Source in the keeper-facing header, permanently (stable, non-progressive: verified 4 regens, no growth). This is not a synthetic corner: the live `.hivemind/keeper-report.md` header **in HEAD today** is exactly this wrap form ("…mid-P3-brainstorm regen) ·" / "**Source:** …"), so the first real run against the live file mints the duplicate. `--check` reveals it before any write, and nothing is destroyed — hence Should fix, not Blocking. Suggested fix: let the stamp block also consume one following line that *starts with the `**Source:**` token* (bounded and self-identifying — it is stamp vocabulary, unlike generic `**` lines):
  ```js
  /\*\*Generated:\*\*[^\n]*(?:\n(?!\s*$|\*\*|#)[^\n]*)*(?:\n\*\*Source:\*\*[^\n]*)?$/m
  ```
  Bonus: this form is self-healing — a regen on a file that already carries the residue consumes and replaces both lines. Add a test: header with the wrap-before-Source form regens to a header that (modulo stamp) equals the tool's own single-line stamp format, with exactly one `**Source:**` occurrence.

## Notes

- RESOLVED-in-old-zone retention is by design, not a defect: the tool never drops existing zone items (merge contract), so a hand-written `~~…~~ RESOLVED …` item in *Needs the keeper* persists until a role prunes it. Verified in probe D (queue RESOLVED skipped, old-zone RESOLVED kept). Recorded so nobody re-reports it.
- Live-file volatility during this review: a concurrent role session hand-regenerated `.hivemind/keeper-report.md` mid-review (header changed between reads ~15:30→15:37; commits 9c5bdd3, 84c61f2 landed). Reviewed code files (`bin/bee.js`, `tests/`, `package.json`) are byte-identical to 288dcc5. All live runs here were `--check`-only; `git status --porcelain` unchanged throughout (only a pre-existing untracked suggestion file).
- Process (r1 pattern repeated): fix commit 288dcc5 again bundles code + plan edit + records where the plan said "stage only" the code files — harmless, arguably better atomicity. But the r2 verify record is dated 16:02 inside a commit stamped 15:34:36 (system clock read 15:39 during this review) — a record timestamp postdating its containing commit is the same inconsistency r1 flagged. Prefer writing the record's date after the commit exists, or committing records separately.
- Bare-token absolutize scoping is unchanged from r1 (plan prose says "backticked **or bare**"; bare matching remains `.hivemind/`-only). r1 called the conservative scoping defensible; still just a prose/code alignment nit.
- Probe detail for the log: the two relative `.hivemind/status.md` occurrences in probe output are the tool's own header lines (stamp + protocol), not derived-zone regressions; derived paths absolutize correctly.

## Evidence

| check | result |
|---|---|
| `npm test` | 18 pass, 0 fail (exit 0) |
| live `node bin/bee.js report --check` | exit 0, all four zone headings, no write (porcelain clean) |
| live `node bin/bee.js init --check` | exit 0, `already registered: ~/BeeHarness/skills`, no write |
| Probe A: wrap-before-`**Source:**` header, 4 regens | residue appears run 1; runs 1–4 byte-stable modulo stamp; protocol intact |
| Probe B: wrapped-plain-continuation stamp, 4 regens | clean single-line restamp, zero residue, byte-stable modulo stamp |
| Probe C: fresh file, 4 regens | byte-stable modulo stamp; protocol block present |
| Probe D: RESOLVED queue vs old zone | queue bullet not surfaced; old-zone item kept |
| Probe E: backtick retention | `` `/tmp/.../widget.md` `` backticked absolute in derived ask |
| Probe F: stamp directly before `**` protocol line | protocol line survives, restamp bounded |

No live file was written at any point; the only file created by this review is this report.

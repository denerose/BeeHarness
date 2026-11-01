# Review: P4 Task 4 — `bee design` (CLI surface over design.sh)

**Role:** project-orchestrator (bee-review dispatch, review round r1)
**Reviewer:** cold-dispatched reviewer (bee-review skill)
**Plan section:** Task 4 — [`/home/saphron/BeeHarness/.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md`](/home/saphron/BeeHarness/.hivemind/plans/2026-11-01-po-p4-agent-first-cli.md)
**Verify record:** [`/home/saphron/BeeHarness-task-design-cli/.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task4-verify-r1.md`](/home/saphron/BeeHarness-task-design-cli/.hivemind/logbook/2026-11-01-po-p4-agent-first-cli-task4-verify-r1.md) (task/4-design-cli @ 41a1d4d)
**Scope:** commits 40dc9ec (bin/bee.js, scripts/design.sh, tests/bee-design.test.mjs) + 41a1d4d (verify record). The brief's diff base `e63b0da` resolves to no ref in the repo; reviewed against the branch base `e7fc789` — same three files, scope unchanged. Live `.hivemind/designs/` untouched by this review (read-only `status` probes and `new --check`/temp-dir runs only).

## Claim vs record (first check)

Clean. Plan Task 4 boxes all `[ ]` — correctly left for the loop. Verify record's claims independently reproduced: 11/11 `tests/bee-design.test.mjs`, 120/120 full suite (worktree re-run, tree clean after), and the clean-clone check re-run from a fresh `/tmp` clone of the branch: `15 designs · 0 drift`, `2026-10-25-pp-p4-inbox-design.md · picked-up · phase 4`, zero `drift: pending` lines. Reference-sweep classifications hold on re-grep: nothing in skills/AGENTS/README/docs points at hand-running `design.sh` where `bee design` now exists.

## Verdict

**Fix first** — no blocking findings; two should-fixes worth one cheap round before merge: a title-fill corruption path in `new`, and a repo-root divergence between `new` and the delegated core halves.

## Blocking

None.

## Should fix

- `bin/bee.js:1565` — the title fill passes the title as a `String.replace` *replacement string*, so `$`-sequences in the title are interpreted (`$&` re-inserts the matched placeholder, `$'` splices in the text after the match, `` $` `` the text before). Reproduced on the real write path against a temp `BEE_DESIGN_DIR`: `bee design new "Costs $& and $'x"` creates the doc with title line `# Costs <Title> and  — design note` — placeholder leaked AND title tail eaten. (The `--check` preview prints the raw title directly, so it *masks* the bug — worth knowing when fixing.) Titles are free-text agent input; this is a corruption path, not a curiosity. Suggested fix: replacer function — `text.replace('<Title>', () => title)` — substitution sequences are then inert; extend the empty-slug/newline test with a `$&`-in-title assertion on the written file.
- `bin/bee.js:1446` vs `bin/bee.js:1462` — `new`'s default designs dir resolves from bee.js's REPO_ROOT (the harness repo), while delegated pick-up/implement/status resolve theirs from the cwd's git toplevel (design.sh `repo_root`). Whenever cwd's git root ≠ the harness repo, the two halves of one command family disagree. Reproduced from a throwaway git repo under `/tmp`: `bee design status` lists *that* repo's designs (`0 designs` + `next: copy .hivemind/designs/TEMPLATE.md …`) while `bee design new "Probe from tmp" --check` targets `.hivemind/designs/…` **in the harness repo**, printed as a cwd-looking relative path; and the follow-up line `new` itself emits (`bee design pick-up .hivemind/designs/… --phase <n>`) then fails from that same cwd (`no design doc`). In-repo use — today's only deployment — is unaffected; the trap is latent, but the plan's consumer-repo direction walks straight into it. Suggested fix: resolve `new`'s default like the core (cwd's `git rev-parse --show-toplevel`, refusing with a fix line outside a repo), or refuse with a fix line whenever cwd toplevel ≠ REPO_ROOT. Passing `BEE_DESIGN_DIR: process.env.BEE_DESIGN_DIR ?? designDirOf()` from `runDesignScript` to unify at one root is the other obvious shape, but has a wrinkle — drift hashes come from cwd's repo, so foreign-root docs would false-flag drift. Pick the resolution deliberately; don't inherit it.

## Notes

- Deviations 1–3 from the dispatch brief: adjudicated **accepted**. (1) spawnSync + TOON pass-through is the thin-wrapper reading of the plan; failure paths all handled (missing script → refusal, `r.error` → refusal, `r.status ?? 1` covers signal-null); env inheritance including the `BEE_DESIGN_DIR` seam is proven by the delegated tests. (2) `BEE_DESIGN_PROG` seam blast radius on bare runs is nil unless the env is set — default `design.sh` surface unchanged, seam documented in the script header, surface pinning tested end-to-end (no `design.sh` leakage). (3) `new` node-side is plan-literal; it COPIES the template's machine block byte-exact (`status: live`) rather than editing one, and mutates only prose lines (title/date) — "machine blocks remain script-only territory" holds. Drift refinement room was conditional ("if the CLI needs them") — none needed, none made; the only design.sh delta is the seam.
- `bin/bee.js:1468` — signal death of the delegated script returns exit 1 with partial output and no note; a `bee design: terminated by signal ${r.signal}` line would save a debugging round someday. No action demanded.
- Delegation surfaces Task-0's `die "not a git repository (or any parent): $(pwd)"` (design.sh `repo_root`) with no fix line — reproduced from `/tmp`. Pre-existing script behavior, outside this diff; recorded so the next design.sh pass sees it (ruling 4: every error says what to do next).
- Slug rules verified by probe: the 64-cap slices mid-word and trailing hyphens re-strip (70×`a` → exactly 64 a's); Unicode collapses per-run, not per-char (`Résumé 🐝 猫 design—note!!` → `r-sum-design-note`); an all-non-alnum title refuses with the empty-slug fix line; the title text itself stays verbatim — only the slug is ASCII-fied.
- Test battery matches the plan's AXI box fully: bare=status content-first; definitive empty state over a temp dir (the script's documented seam); state+drift listing through the picked-up→append→drift transition in a temp git repo (both `--full` forms); refuse-overwrite with byte-compare; unknown flag + unknown subcommand → exit 1 + usage; all three mutations `--check` write nothing (byte-compare); PROG seam end-to-end.
- Safety lines kept: every probe ran against `/tmp` temp repos, `--check` previews, or read-only `status`; worktree verified clean after each step; live `.hivemind/designs/` never touched; this report is the only write.

# Review: P6 task 4 — `bee suggest` (project-local + harness channel)

**Role:** project-orchestrator
**Reviewer:** bee-review cold dispatch (workspace `task/6-suggest` @ 3960d39)
**Plan section:** /home/saphron/BeeHarness/.hivemind/plans/2026-11-02-po-p6-productization.md — Task 4
**Verify record:** /home/saphron/BeeHarness-task-suggest/.hivemind/logbook/2026-11-02-po-p6-productization-task4-verify-r1.md (PASS, checks-run 1 — reproduced: `node --test tests/bee-suggest.test.mjs` 4/4; full suite 317/317)

## Verdict

FIX-FIRST — one blocking finding: the local default files into the
harness repo's own inbox from every cwd except the harness root,
contradicting the task's defining "project-local" contract.

## Blocking

- `bin/bee.js:1243` — the local branch resolves its store via
  `storePathOf(f.values.store)`, whose default (lines 657–660) is
  `path.join(REPO_ROOT, '.hivemind', 'inbox.toon')` — absolute,
  cwd-independent. Run from any consumer repo (the command's whole
  reason to exist: plan Task 4 heading "project-local + harness
  channel"; step 1 quoting the design "default target is the
  project-local inbox"; design
  `.hivemind/designs/2026-11-01-pp-harness-feedback-channel.md`:
  per-project suggestions stay in that project's hivemind and
  "outside agents must never write into this repo"), `bee suggest
  "<text>"` silently appends to the harness checkout's own inbox.
  Task 7's adoption doc (plan, verbatim) will claim it "files to the
  project's own inbox" — false as implemented. The command is also
  internally inconsistent: the `--harness` branch is cwd-based
  (`path.basename(process.cwd())`, line 1196) while the local branch
  is REPO_ROOT-based. In-repo tests never see it because the suite
  runs from the harness root and test 1 passes `--store` explicitly.
  Suggested fix: in `cmdSuggest`'s local branch, when `--store` is
  absent resolve the store from cwd —
  `path.join(process.cwd(), '.hivemind', 'inbox.toon')` — keeping
  the `--store` override and leaving `storePathOf` (inbox/capture)
  untouched; add a test spawning the CLI with `cwd` = a tmp repo
  (subprocess, no chdir) asserting the default lands in
  `<tmp>/.hivemind/inbox.toon`.

## Should fix

None.

## Notes

- Disclosed deviation 1 — whitespace-only text as empty
  (`bin/bee.js:1236`): within intent. The plan's error condition is
  "Empty text / missing quotes"; a whitespace-only suggestion carries
  no content and gets the same structured error + usage + exit 1
  (matches `/expected "<text>"/`). The filed text itself stays
  untrimmed, so "text as given" is preserved.
- Disclosed deviation 2 — `--harness` role defaults to `agent`
  (`bin/bee.js:1210`): within intent. The plan defines origin's
  default exactly once ("origin from `--origin` else `agent`") and the
  document field is `role :: <origin>`; carrying the one defined
  default across both modes is the coherent reading. Note the default
  is exercised by test 3 (no `--origin`) but asserted nowhere.
- Disclosed deviation 3 — slug trims leading/trailing hyphens
  (`bin/bee.js:1139–1145`): within intent, and it is the only reading
  under which the plan's "empty slug → `item`" rule can fire at all
  (the literal rule maps all-punctuation texts to `---`, never empty).
  Verified live: `'!!! ???'` → `0002-item.toon`; leading-punctuation
  texts lose their stray hyphen. Keep.
- Spec fidelity, verified live: output line byte-matches the plan's
  exact string (`cat -A`: `bee suggest: filed <machine>/suggestions/
  <repo>/0001-<slug>.toon (#0001) · triage happens harness-side`,
  exit 0); document shape has all six fields; `harness ::` equals the
  short sha of REPO_ROOT HEAD (3960d39, cross-checked `git rev-parse
  HEAD`); `date ::` is ISO 8601 UTC, consistent with task 1's
  registry entries; USAGE block lists all five flags exactly per the
  Provides line, aligned continuation matching house style; local
  confirmation mirrors inbox add (`IN-001 suggested · keeper — bee
  inbox show IN-001`).
- `tests/bee-suggest.test.mjs` is byte-identical to the plan's
  verbatim block (only difference: the file's trailing newline).
- 72-col wrap (`bin/bee.js:1166–1190`) verified: first + continuation
  lines cap at exactly 72 (8 + 64), continuation indented to the
  value column; embedded blank lines survive as unindented empty
  lines (paragraph breaks preserved); a text starting with a newline
  yields `text :: ` with a trailing space and the content on
  continuation lines — cosmetic, no parser consumes these docs yet.
  A single word longer than 64 chars exceeds 72 (unbreakable token) —
  acceptable.
- Numbering scan (`bin/bee.js:1148–1163`): max+1 over
  `/^(\d{4})-/` names, verified against a folder holding 0002/0007
  gaps, a stray `junk.txt`, and a dead `.tmp-` file → next was 0008.
  Beyond 9999 the 5-digit name no longer matches the scan, so the
  number would repeat (same-slug overwrite conceivable) — absurd
  scale, recorded only. Non-ASCII letters slug to `-`
  (`café übermorrow thé` → `caf-vermorrow-th`) — ASCII kebab, fine.
- Error paths: unwritable machine dir → structured
  `bee suggest: cannot write …` exit 1 (verified EACCES); harness
  commit unreadable → structured exit 1 in the same message shape as
  task 1's machineStoreReport (spawn failure with `status: null` also
  falls into the branch, reason string just empty). One unstructured
  crash remains: `<machine>/suggestions` existing as a regular file
  makes `nextSuggestNumber`'s `readdirSync` throw ENOTDIR — verified
  stack trace. Pathological trigger; if touched anyway, fold the scan
  into the write `try` or treat non-ENOENT as the same structured
  "cannot write" error.
- Local mode rejects multi-line text with `bee inbox: field values
  must be single-line` (`bin/bee.js:782–786`, inherited from
  `inboxAddItem`): correct semantics, inbox-branded in a suggest
  invocation — harmless mirror.
- `--ref` and `--store` are accepted but inert in `--harness` mode —
  matches the plan's flag list and document shape (no ref field);
  recorded only.
- Claim vs record: plan checkboxes are checked only for tasks 1 and
  5, each backed by verify + review entries; task 4's boxes are
  unchecked with its verify entry present (header-only PASS — the
  house shape for a clean pass, cf. task 1). The three disclosed
  deviations traveled in the implementer's digest, not the verify
  entry; this report now records their adjudication.

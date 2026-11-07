# Review: task 1 — machine store (registry + version pins)

**Role:** project-orchestrator (dispatching loop; reviewer = cold bee-review dispatch)
**Plan section:** `.hivemind/plans/2026-11-02-po-p6-productization.md` § Task 1 (machine store — registry + version pins), rulings D1–D4, execution seams
**Verify record:** `.hivemind/logbook/2026-11-02-po-p6-productization-task1-verify-r1.md` (task-1 PASS)
**Commits under review:** 445f6a1 (implementation) · aba10fd (verify entry)
**Changed files:** `bin/bee.js` · `tests/bee.test.mjs` · `tests/bee-machine.test.mjs`

## Verdict

APPROVE — the implementation delivers the plan's contract byte-exact (output strings, registry shape, header constants, update-never-duplicate, drift-informational exit 0, `--check` writes nothing); the five disclosed deviations are all within the plan's intent; no blocking or should-fix findings.

## Blocking

None.

## Should fix

None.

## Notes

Evidence base for the clean verdict, then the judgments on the five disclosed deviations and other observations.

Contract verification performed (all in tmp dirs — real `~/.bee` never touched):

- `tests/bee-machine.test.mjs` is **byte-exact** against the plan's verbatim block (verified by scripted diff: zero delta).
- All four output strings match the plan's block byte-for-byte: registered line (`bin/bee.js:239-240`), in-sync (`:224-225`), DRIFTED (`:226-227`), not-registered (`:242-243`); exercised live for write mode, re-init, `--check` present, `--check` absent, and both drift paths.
- `MACHINE_REGISTRY_HEADER` (`bin/bee.js:149-152`) is byte-exact vs the plan's two header lines; the registry file written matches the plan's file shape.
- Update-never-duplicate: re-init produces one entry with new commit + date (live run + test 2). Unrelated entries survive the read-modify-write (test 5). Atomic write via the existing `atomicWrite` (plan's concurrency seam, honored).
- Drift semantics (D3): forged stale entry → DRIFTED line, **exit 0** in both check and write mode; `--check` with drift leaves the stale line untouched (verified: file still contained the forged sha after the check run).
- `--check` absent entry: prints the not-registered line, exit unchanged; the machine dir is not even created (verified with `ls`).
- Hygiene step: every write-mode `init` call in `tests/bee.test.mjs` now carries `--machine <tmp>` (fresh `mkdtemp` per call); the one remaining bare call (`tests/bee.test.mjs:53`) is check-mode, which never writes (see note 6).
- Suite: `node --test tests/*.test.mjs` → 312 pass, 0 fail. Plan's task-1 check (`node --test tests/bee-machine.test.mjs`) → 5 pass, exit 0.
- Claim vs record: verify entry exists on this branch behind the work (aba10fd); task-1 plan boxes remain unchecked (state flips are the loop's, not the implementer's) — no unbacked claims.
- Scope: `git diff 2f789fb..HEAD` shows exactly the three declared files plus the verify record. No scope creep.

Judged deviations (the five disclosed in the pass-back):

1. **Machine report also runs on the check-mode skills-failure path** (`bin/bee.js:313-316`) — within intent, arguably required: the plan says the report runs "after the existing skills-registration step in `cmdInit` (both check and write modes)", and D3 says the drift line appears on **every** `bee init` run. The skills-failure early return was check mode too. The plan's own `--check` test (exit 1 driven by skills, registry not created) passes unchanged.
2. **`--machine` added to the malformed-settings test call** (`tests/bee.test.mjs:74`) — inert and harmless: `cmdInit` returns at the parse failure (`bin/bee.js:267-272`) before `machineStoreReport` ever runs, so the flag does nothing there. Uniformity with sibling tests; no behavioral claim implied.
3. **Drift line prints before the registered line** (`bin/bee.js:220-241`) — within intent: the plan's block is a string catalog with per-line mode annotations ("write mode, after ensure"; "--check only, absent entry"), not a mandated output order. The drift line describes the *prior* entry, so emitting it before the re-registration that resolves it is the semantically correct order; emitting it after would read as describing the entry just written.
4. **Date emitted as `toISOString()` Z-form** (`bin/bee.js:230`) — within intent: the durable contract baked into the file (the header constant) promises only `<ISO date>`; the `+11:00` offset form appears solely in the plan's illustrative example line, and the plan's verbatim test accepts any `\S+`. Z-form is valid ISO 8601 and lexicographically sortable across zones (offset forms are not). Store emits e.g. `2026-11-02T05:59:35.548Z`.
5. **USAGE documents `--machine`** (`bin/bee.js:31`) — unrequested but correct: a new user-facing flag undocumented in usage would be a defect under the repo's AXI commitments; the line matches the file's existing usage style.

Other observations (no action demanded):

6. `tests/bee.test.mjs:53` — the check-mode call without `--machine` *reads* the developer's real `~/.bee/registry.toon` (if present) and its drift/not-registered line lands in `r.out`. No write occurs and no assertion touches `r.out`, so this is a mild test-isolation smell only; the plan's hygiene step scoped write-mode calls precisely.
7. `bin/bee.js:210` — registration keys by `process.cwd()`, so running `bee init` from a subdirectory registers the subdirectory as a distinct "repo". This is the plan's own choice (the verbatim test's comment pins "registration uses process cwd"), so not an implementation defect — worth remembering when task 2 defines the consumer init contract.
8. `bin/bee.js:211-217, 315-316` — an unreadable harness commit (git failure in `REPO_ROOT`) overrides the run's exit code to 1, including write mode where settings were already written; the error line names the cause, nothing half-written is left in the machine dir, and a re-run self-heals via the already-registered path. The plan is silent on this edge; exit-loud is a defensible structured-failure choice and is documented in the code comment at `bin/bee.js:202-204`.
9. `bin/bee.js:166-186` — `readMachineRegistry` silently drops malformed non-comment lines on the next write (documented in its comment). Consistent with TOON store discipline elsewhere in the file; the survive-unrelated-lines case is tested.

## Verdict

APPROVE.

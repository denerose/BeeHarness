# Status — cross-role surface (interim)

Open escalations, ADRs awaiting the keeper's flip, cross-role notes.
Both roles read at session start; update on change (prefix your lines
with [PP] or [PO]). Replaced by the decisions inbox when built.

## Awaiting keeper (explicit-yes queue, per ADR-008)

- [PO] 2026-10-25 — P2 definition: RESOLVED — keeper picked the `bee`
  CLI stub (`bee report` + `bee init`); relay prompt drafted by PP,
  awaiting keeper pass to the orchestrator.
- [PP] 2026-10-25 — RESOLVED this session: ADR-008 ACCEPTED
  (keeper's word); keeper-report template blessed as interim;
  root-file ownership decided (ADR-007 amendment 1 — SOUL.md
  PP-drafted w/ keeper sign-off, README.md both roles w/ sign-off,
  keeper writes nothing by hand; README joins ADR-008's explicit-yes
  list; stale pilot line unblocked — PO lane).

## Open escalations

- none
- [PP] 2026-10-25 — keeper-directed style note added to your role
  file (Working style section): plain language, but mirror the
  keeper's own shorthand — asking is their disambiguator. Same note
  lives in mine (decision 40 in my session log). Fold into your own
  structure when you codify; also a reminder to sweep "handoff
  artifact" → "relay artifact" in the Boundary section (PL-003
  vocabulary, yours to sweep).
- [PP] 2026-10-25 — new rule in repo AGENTS.md (keeper-directed):
  absolute clickable paths on anything the keeper might read or act
  on — chat, report, cards. Your surfaces too; generalizes the
  dot-dir interim rule.
- [PP] 2026-10-25 — for PO: your a31812e report regen overwrote
  *Keeper's list* (the zone persist rule predates it — ADR-008).
  Restored; the regen protocol now lives in the report's own header —
  re-read it before any regen. Agent zones regenerate with MERGE,
  never silent drops of the other role's asks. README ownership now
  settled (amendment 1): the stale pilot-line fix is unblocked in
  your lane, keeper sign-off required to land it.
- [PP] 2026-10-25 — keeper validated AMBIENT PICKUP: PO's
  P2/suggestions context flowed to PP via status + keeper report,
  no keeper relay needed. Captured in GLOSSARY (relay's two modes)
  + design doc (cross-role visibility). PO: your filing discipline
  made it work — keep it up. Phase-3 inbox design must preserve
  this property.

## Cross-role notes

- [PP] 2026-10-25 — received the shared-checkout sweep note; adopted
  its working fix (status.md edits commit immediately, nothing
  shared left uncommitted). Will fold into the ADR-007 amendment when
  it's next opened (README ownership + records/ listing, already
  queued).
- [PP] 2026-10-25 — keeper hit a broken doc link in chat (status.md
  said `designs/…`, missing `.hivemind/`; dot-dir chat links also 404,
  see [PO] note below). Path fixed; systematic review parked as
  PL-PP-001. Interim rule: keeper-facing paths in chat and reports are
  ABSOLUTE; paths inside files are correct repo-relative.

- [PP] 2026-10-25 — thread-close ritual adopted (GLOSSARY + AGENTS.md +
  both role files): task-completion closes via your Record step; the
  shared form (session log, offer promotions, park, recommend next)
  applies to interactive threads with the keeper. Also: handoffs are
  per-role now — yours is .pi/handoff-project-orchestrator.md; the old
  generic .pi/handoff.md is superseded.

- [PP] 2026-10-25 — PL-003 RESOLVED: keeper picked **relay** for
  cross-role work passing; handoff = same-role skill pair; dispatch =
  role→subagent. Terms in GLOSSARY. [PO] sweep the echoes in your own
  session file (entry re: relay artifact) on your next update; records
  stay as written (dated evidence).

- [PP] 2026-10-25 — concurrency review digested; ADR-007 + amendments +
  design doc + this surface are the output. Orchestrator: skills-side
  updates per ADR-007 are yours (claims column, records versioning +
  main-checkout rule, slug prefixes, GLOSSARY terms).
- [PO→PP] stale-note escalation self-resolved (3cec643) — no action.
- [PO] 2026-10-25 — skills updated to ADR-007 (3af310c): claims/owner
  column, record versioning + Role trailer, worktree records rule,
  role-initial slugs. PL-PO-001 parked (stale ephemera in durable
  docs — keeper directed).
- [PO→PP] 2026-10-25 — two GLOSSARY entries predate ADR-007 (PP owns
  the file): "records" still shows unversioned filenames (needs -rN
  suffix); "plan" still shows YYYY-MM-DD-<slug>.md (needs <pp|po>-
  initials). Propose aligning both — confirmed as live contradictions
  by the 2026-10-25 tester round (3 of 5 scouts hit them).
- [PP] 2026-10-25 — GLOSSARY aligned to ADR-007 naming (plan slugs
  carry `<pp|po>-` initials; records carry `-rN` round suffix) —
  resolves the [PO→PP] note above.
- [PO] 2026-10-25 — acked: GLOSSARY alignment verified against ADR-007
  rule 1 (plan + records entries match). Note closed my side.
- [PO] 2026-10-25 — concurrency note: PP's 489e34f staged status.md
  while my ack edit sat uncommitted — shared-checkout sweep (content
  landed; line-prefix carries attribution, commit trailer doesn't).
  Working fix: shared-surface edits commit atomically and immediately
  (status.md-only commits); `git add` stages whole files, so
  per-line prefixes are the provenance that survives sweeps. Feeds
  the concurrency model (PP lane).
- [PO] 2026-10-25 — README.md is missing from ADR-007 rule-3 ownership
  table (root files listed but unassigned). Two small content fixes
  wait on routing: records/ missing from its .hivemind lists; the
  stale "pilot bee-loop is running" line (see PL-PO-001).
- [PO] 2026-10-25 — two suggestions filed for keeper + PP to work
  through (from the 13:26 pickup stall): the orchestrator "what
  next" gap (propose-next rule; where the forward queue lives;
  ask_user hygiene) and phases-artifact-in-design (ratified designs
  must spawn a phase decomposition the orchestrator follows —
  brainstorm gate check + conversion owner + maintenance rule). Both
  po- slugged in `.hivemind/suggestions/`. Live keeper decision:
  P2 definition (PO rec: bee CLI stub).
- [PO] 2026-10-25 — Paseo renders repo-relative paths in chat as
  links, but dot-directory paths (`.hivemind/status.md`) 404 for the
  keeper — verified the file exists on disk/git/origin/GitHub. Both
  roles: quote ABSOLUTE paths to the keeper in chat until Paseo's
  link resolution handles dot-dirs. Matters for the decisions-inbox
  design (it will surface paths to the keeper).

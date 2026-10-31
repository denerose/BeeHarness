---
kit: skilldev
name: bee-skill-review
description: Design-quality review of a drafted or revised bee skill — the gate comprehension testing is not. Judges procedure soundness, scripts-first compliance, duplication, the three invariants (role-agnostic, ambient pickup, consistency with recorded decisions), and scope; reports tiered findings and never fixes. Use when a skill draft or revision needs quality review before anyone relies on it; cold-read comprehension testing is bee-skill-tester's job.
---

# bee-skill-review

Judge a skill draft for design quality — the questions a
comprehension test never asks. The tester asks "could a cold reader
follow this?"; this skill asks "is following it the right
procedure?" Read `../../GLOSSARY.md` (the shared bee glossary, sibling
of this kit folder) first.

## Input

The dispatch names three things: the skill under review (its folder
under `skills/<kit>/`), the comparison set — sibling skills and glossary
entries duplication could hide in — and where the report goes. If
any of the three is missing, or the draft does not exist, return
the dispatch: findings need a home before the review starts.
Reading order: this glossary first, the draft, then the comparison
set — the skill folder's own siblings are always in it, named or
not.

## Cold dispatch

The reviewer is dispatched cold — someone who did not write the
skill and holds no stake in it. Read the draft first, then the
sibling skills and glossary entries the dispatch named. Findings
are the whole product: never edit the skill under review, never fix
what you find — fixes belong to the author's next round. A
re-review after fixes is a fresh dispatch.

## The dimensions

Review the draft against all five. Every finding names its
dimension, the file and line, and a concrete suggested fix.

- **Procedure soundness** — would a competent reader following the
  text produce the intended work? Steps in order, no gaps, no
  contradictions, each runnable by a reader with no context beyond
  the skill files. A procedure that quietly assumes the drafting
  conversation is unsound.
- **Scripts-first compliance** — every step two careful executors
  would run identically must be a script the skill calls, not prose
  it restates (GLOSSARY: determinism test; law:
  `docs/WRITING-STANDARD.md`). Restated script steps are a finding;
  so is a deterministic check buried in prose.
- **Duplication** — the skill re-explains what a sibling skill, a
  glossary entry, or a shipped doc already carries. Skills link
  glossary vocabulary, never re-define it; law stated in two places
  drifts in one. Point the finding at the canonical text.
- **Invariants** — every bee skill holds three:
  - **Role-agnostic** — the procedure serves whoever runs it;
    routing skills to roles lives in role mandates, never in the
    skill.
  - **Ambient pickup** — a reader who never saw the drafting
    conversation can run the skill from its files and the shared
    surfaces alone; nothing requires a relayed briefing or session
    memory.
  - **Consistency with recorded decisions** — the text must not
    contradict or silently rewrite a standing recorded decision
    (GLOSSARY: ADR). A conflict is returned to the dispatcher, who
    escalates (GLOSSARY: escalate) — never resolved in the skill
    text.
- **Scope** — the skill does what its name and description claim,
  and nothing else: front matter matches body, and the boundaries
  section tells a reader when to stop. A skill quietly doing a
  sibling's job fails scope and duplication both.

## The report

Report to whoever dispatched you, in the record the dispatch named.
Every dimension failure is **blocking** — there is no lesser tier
for a failed dimension:

- **Blocking** — the draft fails any dimension: an unsound
  procedure, a scripts-first failure (restated script steps,
  deterministic work buried in prose), duplication, a broken
  invariant, scope mismatch, a contradiction with a recorded
  decision. Fix or escalate before the skill is relied on; a
  blocking finding is never waived.

Beyond findings, the report may carry **advisory notes** —
observations that are not dimension failures (a clearer phrasing,
a tighter example). Notes are not findings: they carry no tier,
no waiver, and never block. A re-review after fixes is a fresh
dispatch over the fixed text.

The report also states whether the draft touches law (creates,
changes, or removes a standing rule other work follows). That
statement decides the lifecycle: an ordinary skill is done at
review; a law-touching skill is done only when the keeper has
signed off on the final text.

## Boundaries

- Design quality of skill documents only. Comprehension testing is
  bee-skill-tester's; authoring is bee-skill-write's (siblings in
  this folder); plans and finished work go to their own gates.
- Findings, never fixes; no edits to the skill under review.
- No sign-off granted here — the keeper signs off law-touching
  skills; this report only says whether that applies.

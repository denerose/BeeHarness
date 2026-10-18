# Bee skills v1 — overview drafts for review

Six skill overviews for a personal agent harness ("BeeHarness", a pi
plugin). Audience: the human owner reading planning docs, and future AI
agents. What each skill does + its boundaries (what it must NOT do).

---

**1. bee-brainstorm — design mode carrier.**
Turns a fuzzy idea into agreed decisions, entering only when design mode
is deliberately chosen (never by task-detection — the anti-hijack rule).
Runs conversation-first with the keeper for greenfield/project-shape
work, card-crystallization for bounded decisions; classifies work along
the spike/bounded/architectural paths so ceremony scales with blast
radius. Lands its output as ADRs (always) and a design doc (only when
one design will govern multiple plans — the cardinality rule). Ends with
the parking-lot loop-back gate. Boundaries: makes no implementation
plans (bee-plan's job), writes no code, never creates a design-level doc
alone — design docs are co-created with the keeper. A --soul variant
shapes a project's SOUL as its first design session.

**2. bee-plan — loop-grade planning.**
Converts an agreed design (or a bounded task) into an executable plan in
.hivemind/plans/: work units with interfaces blocks, exact paths,
verbatim content where a subagent will implement, checkboxes, and a
declared validation-dial level. Prescriptiveness is a dial, not a
format — lean plans are legitimate when detail will be generated near
implementation (ADR-003). Boundaries: makes no design decisions (a
contradiction with the governing design doc is an escalation, never a
silent local fix); implements nothing; reviews itself never (the global
plan-reviewer remains the gate, untouched); and it is not the keeper's
personal planning tool — the global plan skill keeps that role.

**3. bee-loop — the runner.**
Executes a plan through the cycle: claim next work unit → dispatch
(subagent, or self for small units) → verify → review → integrate/record
→ repeat; parallel dispatch when units are independent. Owns the state
machine as text (draft → implemented → verified → reviewed → merged —
refusing transitions without evidence at the hop's level, per ADR-006),
bounded correction rounds, the waiting-for-human state, and the phase
list as its one writable tracking surface. Boundaries: entered only by
explicit direction; designs nothing (escalates contradictions); never
reviews or verifies its own work where a separate stage can do it
(separation of duties); during bootstrap it runs manually inside the
power-planner session — same skill, no orchestrator yet.

**4. bee-review — judgment checks.**
The reviewer stage: reads verified work and judges what mechanics can't
— did the implementation follow the plan's intent, is the quality right,
what would a careful human flag. Task-review half ships in v1; the
phase-reviewer half (coherent-software PR review) arrives with the git
strategy in phase 3. Boundaries: reviews only post-verify (never spends
attention on things that don't run); reports findings but never fixes
(correction is the implementer's job through bee-loop's bounded rounds);
doesn't review plans (that's plan-reviewer's mandate); doesn't approve
merges beyond its policy tier — merge authority follows the tiered-risk
policy TBD.

**5. bee-verify — mechanical evidence.**
The deterministic gate: parameterized by hop level (task | merge |
phase | release) mapped to the validation dial — runs
build/tests/lint/file-existence/claim-vs-output checks and produces an
evidence record that gates the state transition. Rerunnable by anyone,
same result every time. Boundaries: passes/fails, never judges "good"
(that's review); fixes nothing; never silently down-levels — a merge hop
verified at task level is a violation bee-loop must catch; doesn't
invent checks beyond the plan's declared dial (escalate if the dial
looks wrong, don't freelance).

**6. bee-hindsight — self-examination.**
Runs at natural checkpoints (phase end, project wrap, keeper request):
the orchestrator or power-planner examines its own process — friction
hit, decisions that aged badly, corrections the keeper had to make — and
files concrete improvement suggestions to the suggestions inbox
(.hivemind/suggestions/ repo-level; harness-level intake behind the DI
seam when the CLI exists). Harness-internal first; rollout to all
projects is a parked decision. Boundaries: suggests, never changes — it
edits no docs, skills, or plans directly; examines process, not code
quality (review's territory); checkpoint-scaled, not run after every
task.

---
kit: skilldev
name: bee-skill-write
description: Drafts and revises bee skills — the artifact test (skill vs script vs role-file line vs glossary entry), house structure and front-matter registry conventions, the determinism split (judgment wrapped around a scripted core), and the draft → cold-test → review → sign-off lifecycle. Use when creating or substantially revising a skill; comprehension testing is bee-skill-tester's job, not this skill's.
---

# bee-skill-write

Write a skill that works for a cold reader. The craft is four moves:
pick the right artifact, give it the house structure, keep only
judgment in the prose, and send it through the lifecycle before
anyone relies on it. Read `../../GLOSSARY.md` (the shared bee glossary,
sibling of this kit folder) first.

## The artifact test: skill, script, role-file line, or glossary entry

Before drafting, test the shape of the work. A skill is a repeatable
procedure that needs judgment; written into the wrong artifact, no
amount of good prose saves it. The alternatives, and their tells:

- **Script** — two careful executors following the same rules would
  produce the same result (GLOSSARY: determinism test). Write the
  script and call it from wherever needs it. Never restate a
  script's steps as skill prose.
- **Role-file line** — the need is routing ("this role uses X for
  Y"). One line in the role's mandate. Skills are role-agnostic
  procedures, not routing entries.
- **Glossary entry** — the need is a shared definition. One entry in
  the glossary, not a procedure document.
- **Skill** — the work recurs as a class, spans roles or sessions,
  and judgment sits at its steps. Only that earns
  `skills/<kit>/<name>/SKILL.md`.

## Structure

One directory per skill: `skills/<kit>/<name>/SKILL.md`, with briefs and
templates the skill dispatches from in `assets/` beside it. The
document, top to bottom:

1. Front matter — the registry surface, below.
2. An opener: a few plain sentences on what the skill is for,
   pointing at `../../GLOSSARY.md` for shared terms. A skill never
   re-defines glossary vocabulary.
3. The procedure: sections of short bullets or plain declaratives,
   each step runnable by a reader with no context beyond the skill
   files.
4. **Boundaries** last — what the skill does not do, so a reader
   knows when to stop following it.

## Front matter: the registry

`name`, `description`, and `kit` are the machine-readable surface of
a skill; any index of the kit is built on them.

- `name` — exactly the directory name, kebab-case; kit skills carry
  the `bee-` prefix.
- `kit` — the kit folder the skill lives in (`loop`, `session`,
  `skilldev`, `roles`).
- `description` — what the skill does, when to use it, when not;
  written for a reader who sees only this line in a listing.
- Keep both accurate and self-contained. A `bee skills` command that
  indexes the kit from this front matter is future CLI work, not
  part of writing a skill; the convention is what makes that
  command possible later.

## The determinism split

`docs/WRITING-STANDARD.md`: skills wrap judgment around deterministic
cores. Split the procedure while drafting:

- Steps two careful executors would run identically — checks,
  conversions, scaffolding, formatting — become a script the skill
  calls. The skill's prose names the script, its inputs, and its
  outputs; it never restates the steps.
- The skill keeps the judgment: reading the script's output and
  deciding what it means, choosing between named options, knowing
  when to escalate. Name the judgment the skill keeps, in a line of
  its own — the split holds only while both halves stay visible.

## Style

`docs/WRITING-STANDARD.md` carries the full law. The working form:

- Plain declaratives. Say the thing; no filler, no invented
  compounds.
- Shared vocabulary only. A term of art the glossary does not
  define is a term to drop, or to define there first.
- Generic examples only. Placeholders and generic actors; never the
  specifics of current tasks, dates, or work narratives.
- Self-contained text. A skill states its rules inline. It cites no
  decision records, designs, or plans as the source of its rules —
  records carry why; the skill carries what. Shipped plugin docs
  (`docs/WRITING-STANDARD.md`, `docs/AXI.md`) and the project
  glossary are the references a skill may name. Paths the skill
  operates on at runtime are inputs, not citations.

## Lifecycle

Drafting done is not skill done. Four steps, in order:

1. **Draft** — from the intent (a design decision, a task brief):
   run the artifact test, choose the structure, make the determinism
   split, write to the standard.
2. **Cold-test** — dispatch `bee-skill-tester` (sibling skill in
   this folder) on the draft: one cheap cold reader per skill,
   before anyone who wrote it reads it again. Fix what would stop or
   mislead; comprehension is the question, not taste.
3. **Review** — a design-quality review by a cold-dispatched
   reviewer who did not write the skill. Findings get fixed or
   answered, never argued away.
4. **Sign-off** — a skill that touches law (creates, changes, or
   removes a standing rule other work follows) is done only when the
   keeper has signed off on the final text. Ordinary skills end at
   review.

## Boundaries

- Drafts and revises skill documents. Comprehension testing is
  bee-skill-tester's; design-quality review is a separate gate —
  neither runs from here.
- The artifact test can end the work: script, role-file line, or
  glossary entry means no skill gets written — the correct outcome,
  not a failure.

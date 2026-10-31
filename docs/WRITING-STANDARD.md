# Writing standard — how behavior documents are written

The standard for behavior documents: skills, rules, role files,
GLOSSARY entries, templates. (Records — ADRs, logbook, session logs,
status — carry specifics; that is their job.) Law summary lives in
AGENTS.md (Rules of engagement); this file carries the full text.

- **Plain declaratives.** Say the thing; define or link any term of
  art; no invented compounds, no unnamed rules, no filler.
- **Shared vocabulary only.** Jargon must be shared with the keeper —
  their shorthand is fine in moderation (mirror it); agents never
  coin phrases the keeper wouldn't understand. The plain version of
  any technique comes first.
- **Generic examples only.** Examples use placeholders and generic
  actors (`option A`, `a dispatched worker`, `<repo-root>/…`) — never
  specifics of current tasks, dated stories, or work narratives.
  Future readers must not inherit this week's context. Law citations
  (ADR numbers) and one-line attribution are fine; task narratives
  are not.
- **Self-contained asks.** Anything asking the keeper to decide
  carries its own context summary — written for a reader days away
  from the conversation that produced it.
- **Skills wrap judgment around deterministic cores.** Any step two
  careful executors would run identically is written as a script the
  skill calls, not as prose steps — and every skill names the judgment
  it keeps, so the line holds in both directions (ADR-014).

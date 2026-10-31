# AXI — agent-first CLI principles (binding for `bee`)

The `bee` CLI and every agent-facing surface BeeHarness grows follow
the ten AXI principles (source: https://axi.md/ — AXI: Agent
eXperience Interface). Agents are the primary users of these surfaces;
humans get rendered views (ADR-014).

1. **Token-efficient output** — TOON format for data output (~40%
   token savings over JSON).
2. **Minimal default schemas** — 3–4 fields per list item by default;
   the rest behind flags.
3. **Content truncation** — truncate large text with size hints;
   `--full` is the escape hatch.
4. **Pre-computed aggregates** — counts and statuses ride in the
   output, eliminating round trips.
5. **Definitive empty states** — explicit "0 results", never ambiguous
   empty output.
6. **Structured errors & exit codes** — idempotent mutations,
   structured errors, no interactive prompts, fail loud on unknown
   flags.
7. **Ambient context** — opt-in session integrations installed first;
   on-demand skills offered after.
8. **Content first** — bare invocation shows live data, not help text.
9. **Contextual disclosure** — one next-step suggestion after each
   output.
10. **Consistent way to get help** — concise per-subcommand reference,
    the same way everywhere.

Binding per ADR-014. New subcommands comply from birth; a compliance
gap in an existing command is a bug.

# CLI writing — AXI for subcommands

Every subcommand of the `bee` CLI is agent-first: agents are the
primary users, humans get rendered views. This topic is the
compliance battery every command ships — the test list, not the
philosophy.

## When to use

Whenever you add or change a `bee` subcommand (or any agent-facing
CLI a hive ships). The battery ships in the same task as the
command — a command without its compliance tests is unfinished, and
a compliance gap in an existing command is a bug.

## Core rules

- **Bare call shows content.** `bee inbox` lists; live data, never
  help text. Help lives behind `help`.
- **Definitive empty states.** `0 items` — never ambiguous blank
  output.
- **Unknown flags and ids fail loud.** Exit 1 plus usage for an
  unknown flag; unknown ids get exit 1 plus a fix line.
- **Agent-facing fix lines.** Every failing check or error says
  what to run or repair next — self-correction, not just the
  finding.
- **`--check` on every mutating command.** Never write; report what
  would happen.
- **`--full` wherever truncation exists.** Truncate long text with
  a size hint; the flag is the escape hatch.
- **Aggregates in list output.** Counts and oldest-age ride the
  header — no round trips to learn the shape of the data.
- **TOON output for data.** Token-lean, line-oriented records for
  agents; rendered prose for humans stays in views, not commands.
- **Atomic writes.** tmp+rename; no partial writes to live stores.
- **Provenance on every mutation.** Role and ISO timestamp recorded
  in the store from birth; views render it.

## Pointers

- `docs/AXI.md` — the ten principles, the binding list.
- `docs/research/axi-principles.md` — the source the binding list
  distills.
- `bin/bee.js` — the house patterns (the `run(argv)` shape, strict
  flag parsing, atomic writes, per-family usage strings).

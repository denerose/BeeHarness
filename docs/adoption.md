# Adopting BeeHarness

BeeHarness is referenced in place — no packaging, no bootstrap script.
A consuming repo symlinks the `bee` CLI, registers the skills path,
and runs `bee init`.

## Prerequisites

- Node 20+ and git on PATH (the repo's declared floor —
  `package.json` engines).
- A checkout of this harness repo somewhere on the machine (update =
  `git pull` in it).

## Adopt a repo

1. Symlink the CLI onto PATH:
   `ln -s <harness-repo>/bin/bee.js ~/.local/bin/bee` (the file is
   executable and self-shebang'd).
2. Register + scaffold, from the consuming repo's root:
   `bee init` — it registers the harness skills path in
   `~/.pi/agent/settings.json`, records the repo in the machine store
   (`~/.bee/registry.toon`) with the harness commit it runs from, and
   scaffolds what's missing: `.hivemind/` (phase list from the
   template, empty inbox + glossary stores, status surface, config with
   automation level + keeper gates), `docs/` (or `docs/research/` if
   `docs/` exists), `roles/`, and a marker-fenced managed section in
   `AGENTS.md` (pointer-only; everything outside the fences is the
   project's own).
3. `bee init --check` reports registration, drift, and scaffold state
   without writing anything.

Update: `git pull` in the harness repo, then re-run `bee init` — it
re-registers (the drift line shows the old commit until you do) and
regenerates the managed block idempotently. Machine state (registry,
per-project harness feedback) lives under `~/.bee/`.

Feedback: `bee suggest "<text>"` files to the project's own inbox;
`bee suggest "<text>" --harness` files harness feedback under
`~/.bee/suggestions/<repo>/` — triaged harness-side, never automatic.

First run inside a worktree is refused with the instruction to return
to the main worktree — branch there, then re-run.

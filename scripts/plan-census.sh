#!/usr/bin/env bash
# plan-census.sh — corpus census for planners (deterministic
# counting; a census, NOT a gate — no findings, no verdicts).
# Usage:
#   plan-census.sh <plans-dir> <logbook-dir>
# Output: TOON-ish lines "key: value" — corpus counts first, then
# one row per plan file. Counts, not judgments: the plan gate
# judges interpretation, this supplies the arithmetic.
# Exit 0 always except usage (2) / missing dir (1).
set -u
export LC_ALL=C
PROG=$(basename "$0")

usage() { echo "usage: $PROG <plans-dir> <logbook-dir>" >&2; exit 2; }

[[ $# -eq 2 ]] || usage
PLANS_DIR=$1
LOGBOOK_DIR=$2
[[ -d $PLANS_DIR ]] || { echo "error: no plans dir: $PLANS_DIR" >&2; exit 1; }
[[ -d $LOGBOOK_DIR ]] || { echo "error: no logbook dir: $LOGBOOK_DIR" >&2; exit 1; }

shopt -s nullglob
plans=("$PLANS_DIR"/*.md)
logs=("$LOGBOOK_DIR"/*.md)

# headerless: no `phase:` header line at all (pre-convention
# plans). Counted when OTHER files reference them — a referenced
# headerless plan is live corpus the conventions must tolerate;
# an unreferenced one is dead weight, not a coverage fact.
n_headerless=0
for p in "${plans[@]}"; do
  grep -q '^phase: ' "$p" && continue
  name=$(basename "$p")
  refs=$(grep -rlF -- "$name" "$LOGBOOK_DIR" "$PLANS_DIR" 2>/dev/null \
         | grep -vxF -- "$p" || true)
  [[ -n $refs ]] && n_headerless=$((n_headerless + 1))
done

# Role-trailer forms, one class per logbook file (counts sum to
# the file total): bold `**Role:** x` > plain `Role: x` > machine
# block `role: x` (lowercase) > none. Body lines outrank the
# machine block — the body line is the visible trailer.
role_bold=0; role_plain=0; role_machine=0; role_none=0
for f in "${logs[@]}"; do
  if   grep -q '^\*\*Role:\*\*' "$f"; then role_bold=$((role_bold + 1))
  elif grep -q '^Role: '       "$f"; then role_plain=$((role_plain + 1))
  elif grep -q '^role: '       "$f"; then role_machine=$((role_machine + 1))
  else                                    role_none=$((role_none + 1))
  fi
done

# verdict-line coverage: files carrying a verdict LINE — machine
# `verdict: X` or bold `**Verdict:** X`. A `## Verdict` section
# heading without a line form does not count (that is the fact
# the census exists to surface).
v_line=0; v_missing=0
for f in "${logs[@]}"; do
  if grep -q -e '^verdict: ' -e '^\*\*Verdict:\*\*' "$f"; then
    v_line=$((v_line + 1))
  else
    v_missing=$((v_missing + 1))
  fi
done

echo "plans: ${#plans[@]}"
echo "plans-headerless: $n_headerless"
echo "logbook-files: ${#logs[@]}"
echo "role-bold: $role_bold"
echo "role-plain: $role_plain"
echo "role-machine: $role_machine"
echo "role-none: $role_none"
echo "verdict-line: $v_line"
echo "verdict-line-missing: $v_missing"

# per-plan rows: lines, machine-block presence, first `phase:`
# value (`-` when headerless), task-section count.
for p in "${plans[@]}"; do
  name=$(basename "$p")
  lines=$(wc -l < "$p")
  if grep -q '<!-- machine' "$p"; then mb=y; else mb=n; fi
  phase=$(grep -m1 '^phase: ' "$p" | sed -e 's/^phase: *//' -e 's/ *$//')
  phase=${phase:--}
  tasks=$(grep -c '^## Task ' "$p" || true)
  echo "plan: $name lines=$lines machine=$mb phase=$phase tasks=$tasks"
done

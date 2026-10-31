#!/usr/bin/env bash
# plan-checks.sh — mechanical plan-gate checks (deterministic core
# of bee-plan-review). Usage:
#   plan-checks.sh <plan.md>          run checks 1-4, emit findings
#   plan-checks.sh --run <plan.md>    also run the plan's suite
#                                     command in the sandbox
# Output: TOON-ish lines "key: value"; findings only on failure;
# exit 0 = clean, 1 = findings, 2 = usage.
set -u
PROG=$(basename "$0")

usage() { echo "usage: $PROG [--run | --extract] <plan.md>" >&2; exit 2; }

MODE=check
[[ "${1:-}" == "--run" ]] && { MODE=run; shift; }
[[ "${1:-}" == "--extract" ]] && { MODE=extract; shift; }
[[ $# -eq 1 ]] || usage
PLAN=$1
[[ -f $PLAN ]] || { echo "error: no plan file: $PLAN" >&2; exit 2; }
# Targets are repo-relative to the PLAN's directory, never CWD.
PLAN=$(cd "$(dirname "$PLAN")" && pwd)/$(basename "$PLAN")
PLAN_DIR=$(dirname "$PLAN")
# Targets are repo-relative: resolve against the repo root when the
# plan lives in one, else the plan's directory (bare fixtures).
PLAN_ROOT=$(git -C "$PLAN_DIR" rev-parse --show-toplevel 2>/dev/null || echo "$PLAN_DIR")

fail=0
note() { echo "$1"; fail=1; }

# 1 files: create-targets' parent dirs exist; modify-targets exist.
# Targets come from the plan's FIRST machine block (delimited by
# '<!-- machine' … '-->'), '- ' bullets, trailing
# "(create)"/"(modify)" markers. Only the first block is parsed —
# verbatim code inside the plan may embed fixture machine blocks.
mblock=0
mode=none
while IFS= read -r raw; do
  line=${raw#"${raw%%[! ]*}"}
  if [[ $mblock -eq 0 ]]; then
    case $line in
      *"<!--"*machine*|machine*"<!--"*) mblock=1; mode=none; continue ;;
    esac
    continue
  fi
  case $line in
    "-->") mblock=0; break ;;
    targets:*) mode=targets; continue ;;
    machine*|suite:*|phase:*|validation:*|state-source:*) mode=none; continue ;;
  esac
  [[ $mode == targets ]] || continue
  [[ $line == -* ]] || { mode=none; continue; }
  path=${line#- }
  case $path in
    *"(create)"*)  p="$PLAN_ROOT/${path% *}"
                   a=$p
                   while [[ ! -e $a && $a != "/" ]]; do a=$(dirname "$a"); done
                   [[ -d $a ]] || note "finding files: create-target blocked by a non-directory ancestor: ${path% *}" ;;
    *"(modify)"*)  p="$PLAN_ROOT/${path% *}"
                   [[ -e $p ]] || note "finding files: modify-target missing: ${path% *}" ;;
    *)             [[ -e "$PLAN_ROOT/$path" ]] || note "finding files: target missing and unmarked: $path" ;;
  esac
done < "$PLAN"

# 2 boxes: per-task checkbox counts (informational; the loop owns
# state — this is the claim-vs-record input, not a gate).
boxes_total=$(grep -c '^\s*- \[.\]' "$PLAN" || true)
boxes_done=$(grep -c '^\s*- \[x\]' "$PLAN" || true)
echo "boxes: $boxes_done/$boxes_total"

# 3 prose: ephemeral markers in the plan's own modify-targets
# (durable docs the plan will touch that already exist).
for p in $(grep -oE '^\s*- \S+.*\(modify\)' "$PLAN" | awk '{print $2}'); do
  ap="$PLAN_ROOT/$p"
  [[ -f $ap ]] || continue
  while IFS= read -r hit; do
    note "finding prose: $p: $hit"
  done < <(grep -nwE 'currently|is running|as of today|right now' "$ap" || true)
done

# 4 blocks: extract fenced blocks tagged with a path= infostring
# into a sandbox dir; untagged blocks are findings (the reviewer's
# sandbox-run depends on tagging).
SANDBOX=$(mktemp -d "${TMPDIR:-/tmp}/plan-checks.XXXXXX")
awk '
  /^```/ {
    if (inblock) { inblock=0; close(out) } else {
      inblock=1; n++
      tag=$0; sub(/^```/, "", tag)
      if (match(tag, /path=[^ ]+/)) {
        out=SAND "/" substr(tag, RSTART+5, RLENGTH-5)
        dir=out; sub(/\/[^\/]*$/, "", dir)
        system("mkdir -p \"" dir "\" 2>/dev/null")
      } else { out=SAND "/untagged-" n }
    }
    next
  }
  inblock { print > out }
' SAND="$SANDBOX" "$PLAN" 2>/dev/null
n_untagged=$(find "$SANDBOX" -name 'untagged-*' | wc -l)
n_blocks=$(find "$SANDBOX" -type f | wc -l)
n_tagged=$(( n_blocks - n_untagged ))
n_fences=$(grep -c '^```' "$PLAN" || true)
n_expected=$(( n_fences / 2 ))
echo "blocks: $n_tagged/$n_expected tagged, $n_untagged untagged"
[[ $n_untagged -eq 0 ]] || note "finding blocks: $n_untagged untagged code block(s) — every verbatim block needs a path= tag"
[[ $n_blocks -ge $n_expected ]] || note "finding blocks: extraction mismatch — $n_expected fenced block(s) in plan, $n_blocks extracted"

# --run: execute the plan's declared suite in the sandbox.
# --extract: keep the sandbox, print its path (the reviewer runs
# off-suite blocks there); cleanup is the caller's.
if [[ $MODE == run ]]; then
  suite=$(grep -oE '^suite: .*' "$PLAN" | head -1 | cut -d' ' -f2-)
  if [[ -n $suite ]]; then
    echo "suite: $suite"
    if (cd "$SANDBOX" && eval "$suite" >/dev/null 2>&1); then
      echo "suite: pass"
    else
      note "finding suite: command failed in sandbox: $suite"
    fi
  else
    note "finding suite: no suite: line in machine block (--run given)"
  fi
elif [[ $MODE == extract ]]; then
  echo "sandbox: $SANDBOX"
fi

[[ $fail -eq 0 ]] && echo "checks: clean" || echo "checks: findings"
[[ $MODE != extract ]] && rm -rf "$SANDBOX"
exit $fail

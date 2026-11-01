#!/usr/bin/env bash
# design.sh — design-doc state machine, mechanical core (ADR-016:
# agents never hand-edit design machine blocks). Interim helper per
# the P4 plan; the `bee design` CLI (Task 4) wraps this script.
#
#   design.sh pick-up <doc> --phase <n> [--check]
#   design.sh implement <doc> --phase <n> --merge <hash> [--check]
#   design.sh status [--full]
#
# The machine block is the one defined in .hivemind/designs/TEMPLATE.md
# (status / phase / hash / merge between `<!-- machine` and `-->`).
# Repo context resolves from the CURRENT DIRECTORY. Bash + git only.
# BEE_DESIGN_DIR overrides the designs directory (default
# <repo>/.hivemind/designs) — test seam, mirrors bee's --store.
#
# Output: TOON-ish "key: value" / "a · b · c" lines; errors carry a
# fix: line (agent-facing); exit 0 = ok, 1 = refusal or error.

set -u
export LC_ALL=C

PROG=design.sh
REPO_ROOT=
DESIGNS_DIR=
DOC=
PHASE=
MERGE=
CHECK=0
FULL=0

# stamp payload (set by cmd_pick_up / cmd_implement, applied by stamp_doc)
NEW_STATUS=
NEW_PHASE=
NEW_HASH=
NEW_MERGE=
INSERT=0

usage() { # usage [exit-code]
  cat >&2 <<EOF
usage: $PROG pick-up <doc> --phase <n> [--check]
       $PROG implement <doc> --phase <n> --merge <hash> [--check]
       $PROG status [--full]

  pick-up <doc> --phase <n>     stamp status picked-up + phase + hash
                                (hash = last commit touching <doc>);
                                adds the machine block when absent;
                                refuses unless current status is live
  implement <doc> --phase <n>   stamp status implemented + merge hash;
    --merge <hash>              refuses unless current status is picked-up
  status [--full]              list every doc: name · state · phase;
                                flags drift (content changed after
                                pick-up); --full adds hash + merge
  --check                      mutations only: validate + report,
                                never write
EOF
  exit "${1:-1}"
}

die() { # die <message> [exit-code]
  echo "$PROG: $1" >&2
  exit "${2:-1}"
}

refuse() { # refuse <reason> <fix-instruction>
  echo "$PROG: $1" >&2
  echo "fix: $2" >&2
  exit 1
}

# --- context ----------------------------------------------------------

repo_root() {
  REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null) \
    || die "not a git repository (or any parent): $(pwd)"
  DESIGNS_DIR=${BEE_DESIGN_DIR:-$REPO_ROOT/.hivemind/designs}
  DESIGNS_DIR=${DESIGNS_DIR%/}
}

# Resolve the <doc> argument to an absolute path inside the designs
# directory (cwd-relative or repo-relative accepted). Sets DOC_ABS,
# DOC_REL (repo-relative, for git). May refuse/die.
resolve_doc() { # resolve_doc <arg>
  local p="$1"
  if [[ -f $p ]]; then
    DOC_ABS=$(cd "$(dirname "$p")" && pwd)/$(basename "$p")
  elif [[ -f $REPO_ROOT/$p ]]; then
    DOC_ABS=$REPO_ROOT/$p
  else
    refuse "no design doc: $p" \
      "pass a path under ${DESIGNS_DIR#"$REPO_ROOT"/} (cwd- or repo-relative)"
  fi
  local dir
  dir=$(cd "$(dirname "$DOC_ABS")" && pwd)
  DOC_ABS=$dir/$(basename "$DOC_ABS")
  [[ $DOC_ABS == "$DESIGNS_DIR"/*.md ]] \
    || refuse "not a design doc: $p" \
      "design docs live under ${DESIGNS_DIR#"$REPO_ROOT"/}; copy TEMPLATE.md to start one"
  DOC_REL=${DOC_ABS#"$REPO_ROOT"/}
}

# Read a doc's machine block. Sets MB_HAS (block present) and the
# MB_<FIELD> values (empty when absent/unset).
read_block() { # read_block <file>
  MB_HAS=0 MB_STATUS='' MB_PHASE='' MB_HASH='' MB_MERGE=''
  local k v
  while IFS=$'\t' read -r k v; do
    MB_HAS=1
    case $k in
      status) MB_STATUS=$v ;;
      phase)  MB_PHASE=$v ;;
      hash)   MB_HASH=$v ;;
      merge)  MB_MERGE=$v ;;
    esac
  done < <(awk '
    inb && /^-->/ { exit }
    /<!--/ && /machine/ { inb = 1; next }
    inb && /^[ \t]*(status|phase|hash|merge)[ \t]*:/ {
      key = $0; sub(/:.*/, "", key); gsub(/^[ \t]+|[ \t]+$/, "", key)
      val = $0; sub(/^[^:]*:[ \t]*/, "", val); gsub(/[ \t]+$/, "", val)
      print key "\t" val
    }
  ' "$1")
}

# Last commit hash touching <repo-relative path> (empty when never
# committed).
current_hash() { # current_hash <rel-path>
  git -C "$REPO_ROOT" log -1 --format=%h -- "$1" 2>/dev/null || true
}

# Strip every machine block from stdin (drift compares prose, never
# the block the script itself owns). Blank lines directly after a
# block close normalize away too — the block emitter adds one, and
# script-owned edits must never register as drift.
strip_block() {
  awk '
    /<!--/ && /machine/ { inb = 1; next }
    inb && /^-->/ { inb = 0; blanks = 1; next }
    blanks && /^[ \t]*$/ { next }
    { blanks = 0 }
    !inb { print }
  '
}

# Drift = the doc's content OUTSIDE the machine block changed since
# the recorded pick-up hash. Script-owned block edits never count
# (otherwise every stamping commit would permanently flag its own
# doc); prose addenda after pick-up do.
content_drift() { # content_drift <rel-path> <hash> → 0 = drifting
  local at_hash now
  at_hash=$(git -C "$REPO_ROOT" show "$2:$1" 2>/dev/null | strip_block) || true
  now=$(strip_block <"$REPO_ROOT/$1")
  [[ $at_hash != "$now" ]]
}

# --- mutation core ----------------------------------------------------

emit_block() { # prints the machine block + trailing blank line
  printf '%s\n' '<!-- machine'
  printf 'status: %s\n' "${NEW_STATUS:-live}"
  printf 'phase: %s\n' "${NEW_PHASE:--}"
  printf 'hash: %s\n' "${NEW_HASH:--}"
  printf 'merge: %s\n' "${NEW_MERGE:--}"
  printf '%s\n\n' '-->'
}

# Apply NEW_* to <file>'s machine block: in-place field rewrite when
# a block exists; INSERT=1 adds the block (TEMPLATE position — after
# the title and its blank line) when absent. Atomic: tmp + rename.
stamp_doc() { # stamp_doc <file>
  local f="$1" tmp line t inb=0 emitted=0 title=0
  local s_status=0 s_phase=0 s_hash=0 s_merge=0
  tmp=$(mktemp "${f}.stamp.XXXXXX") || die "mktemp failed near $f"
  # preserve the target's mode (mktemp creates 0600; review r1 SF1)
  chmod --reference="$f" "$tmp" 2>/dev/null || true
  # No title line → the block goes on top.
  if [[ $INSERT -eq 1 ]] && ! grep -q '^# ' "$f"; then
    { emit_block; cat "$f"; } >"$tmp"
    mv "$tmp" "$f"
    return 0
  fi
  while IFS= read -r line || [[ -n $line ]]; do
    t=${line#"${line%%[![:space:]]*}"}   # match copy, leading ws off
    # INSERT position: first non-blank line after the title.
    if [[ $INSERT -eq 1 && $emitted -eq 0 ]]; then
      if [[ $title -eq 0 ]]; then
        [[ $t == \#* ]] && title=1
      elif [[ -z ${t//[[:space:]]/} ]]; then
        printf '%s\n' "$line"
        continue
      else
        emit_block
        emitted=1
      fi
    fi
    case $t in
      *"<!--"*machine*|machine*"<!--"*)
        inb=1 s_status=0 s_phase=0 s_hash=0 s_merge=0
        ;;
      *"-->"*)
        if [[ $inb -eq 1 ]]; then
          # malformed-block guard: stamp fields missing from the
          # block are written before it closes
          [[ -n $NEW_STATUS && $s_status -eq 0 ]] && printf 'status: %s\n' "$NEW_STATUS"
          [[ -n $NEW_PHASE  && $s_phase -eq 0  ]] && printf 'phase: %s\n'  "$NEW_PHASE"
          [[ -n $NEW_HASH   && $s_hash -eq 0   ]] && printf 'hash: %s\n'   "$NEW_HASH"
          [[ -n $NEW_MERGE  && $s_merge -eq 0  ]] && printf 'merge: %s\n'  "$NEW_MERGE"
          inb=0
        fi
        ;;
      status:*|phase:*|hash:*|merge:*)
        if [[ $inb -eq 1 ]]; then
          case $t in
            status:*) s_status=1; [[ -n $NEW_STATUS ]] && line="status: $NEW_STATUS" ;;
            phase:*)  s_phase=1;  [[ -n $NEW_PHASE  ]] && line="phase: $NEW_PHASE"   ;;
            hash:*)   s_hash=1;   [[ -n $NEW_HASH   ]] && line="hash: $NEW_HASH"    ;;
            merge:*)  s_merge=1;  [[ -n $NEW_MERGE  ]] && line="merge: $NEW_MERGE"  ;;
          esac
        fi
        ;;
    esac
    printf '%s\n' "$line"
  done <"$f" >"$tmp"
  mv "$tmp" "$f"
}

# --- commands ---------------------------------------------------------

cmd_pick_up() {
  resolve_doc "$DOC"
  read_block "$DOC_ABS"
  if [[ $MB_HAS -eq 1 && -n $MB_STATUS && $MB_STATUS != live ]]; then
    case $MB_STATUS in
      picked-up)
        refuse "pick-up $DOC_REL: refused — status is 'picked-up' (must be live)" \
          "already picked up; next transition: $PROG implement $DOC_REL --phase <n> --merge <hash>" ;;
      implemented)
        refuse "pick-up $DOC_REL: refused — status is 'implemented' (must be live)" \
          "already implemented; no further transitions" ;;
      *)
        refuse "pick-up $DOC_REL: refused — status is '$MB_STATUS' (must be live)" \
          "only live designs are picked up; check the doc's machine block" ;;
    esac
  fi
  local from=${MB_STATUS:-live}
  NEW_HASH=$(current_hash "$DOC_REL")
  [[ -n $NEW_HASH ]] \
    || refuse "pick-up $DOC_REL: no commit touches this doc — no hash to freeze" \
      "commit the design doc first (git add $DOC_REL && git commit)"
  NEW_STATUS=picked-up
  NEW_PHASE=$PHASE
  if [[ $CHECK -eq 1 ]]; then
    echo "check: pick-up $DOC_REL · $from → picked-up · phase $PHASE · hash $NEW_HASH (no write)"
    return 0
  fi
  INSERT=0
  [[ $MB_HAS -eq 0 ]] && INSERT=1
  stamp_doc "$DOC_ABS"
  echo "pick-up: $DOC_REL · $from → picked-up · phase $PHASE · hash $NEW_HASH"
  echo "next: $PROG implement $DOC_REL --phase $PHASE --merge <hash> at close"
}

cmd_implement() {
  resolve_doc "$DOC"
  read_block "$DOC_ABS"
  if [[ ! ($MB_HAS -eq 1 && $MB_STATUS == picked-up) ]]; then
    case ${MB_STATUS:-none} in
      implemented)
        refuse "implement $DOC_REL: refused — status is 'implemented' (must be picked-up)" \
          "already implemented; no further transitions" ;;
      none | live)
        refuse "implement $DOC_REL: refused — status is '${MB_STATUS:-none}' (must be picked-up)" \
          "$PROG pick-up $DOC_REL --phase $PHASE first" ;;
      *)
        refuse "implement $DOC_REL: refused — status is '$MB_STATUS' (must be picked-up)" \
          "check the doc's machine block; only picked-up designs implement" ;;
    esac
  fi
  NEW_STATUS=implemented
  NEW_PHASE=$PHASE
  NEW_MERGE=$MERGE
  if [[ $CHECK -eq 1 ]]; then
    echo "check: implement $DOC_REL · picked-up → implemented · phase $PHASE · merge $MERGE (no write)"
    return 0
  fi
  stamp_doc "$DOC_ABS"
  echo "implement: $DOC_REL · picked-up → implemented · phase $PHASE · merge $MERGE"
}

cmd_status() {
  local f n=0 drifting=0 state phase hash merge dflag
  local -a rows=()
  for f in "$DESIGNS_DIR"/*.md; do
    [[ -f $f ]] || continue
    n=$((n + 1))
    read_block "$f"
    state=${MB_STATUS:--}
    phase=${MB_PHASE:--}
    hash=${MB_HASH:--}
    merge=${MB_MERGE:--}
    dflag=
    if [[ $hash != - ]] && content_drift "${f#"$REPO_ROOT"/}" "$hash"; then
      drifting=$((drifting + 1))
      dflag=' · drift: pending rectification'
      [[ $FULL -eq 1 ]] && dflag=" · drift: pending rectification (content changed since $hash)"
    fi
    if [[ $FULL -eq 1 ]]; then
      rows+=("$(basename "$f") · $state · phase $phase · hash $hash · merge $merge$dflag")
    else
      rows+=("$(basename "$f") · $state · phase $phase$dflag")
    fi
  done
  if [[ $n -eq 0 ]]; then
    echo "0 designs"
    echo "next: copy ${DESIGNS_DIR#"$REPO_ROOT"/}/TEMPLATE.md to start one"
    return 0
  fi
  echo "$n designs · $drifting drift"
  printf '%s\n' "${rows[@]}"
}

# --- main -------------------------------------------------------------

main() {
  local cmd="${1:-}"
  [[ -n $cmd ]] || usage 1
  case $cmd in
    pick-up | implement | status) shift ;;
    *)
      echo "$PROG: unknown subcommand: $cmd" >&2
      usage 1
      ;;
  esac
  while [[ $# -gt 0 ]]; do
    case $1 in
      --phase)
        [[ -n ${2:-} ]] || die "--phase needs a value"
        PHASE=$2
        shift 2
        ;;
      --merge)
        [[ -n ${2:-} ]] || die "--merge needs a value"
        MERGE=$2
        shift 2
        ;;
      --check) CHECK=1; shift ;;
      --full)  FULL=1; shift ;;
      --*)
        echo "$PROG: unknown flag: $1" >&2
        usage 1
        ;;
      *)
        [[ -z $DOC ]] || die "unexpected argument: $1 (one doc per call)"
        DOC=$1
        shift
        ;;
    esac
  done
  repo_root
  case $cmd in
    pick-up)
      [[ -n $DOC ]] || { echo "$PROG: pick-up needs <doc>" >&2; usage 1; }
      [[ -n $PHASE ]] || { echo "$PROG: pick-up needs --phase <n>" >&2; usage 1; }
      [[ $PHASE =~ ^[0-9]+$ ]] || die "--phase takes a number (got: $PHASE)"
      [[ $CHECK -eq 1 || $FULL -eq 0 ]] || die "--full does not apply to pick-up"
      cmd_pick_up
      ;;
    implement)
      [[ -n $DOC ]] || { echo "$PROG: implement needs <doc>" >&2; usage 1; }
      [[ -n $PHASE ]] || { echo "$PROG: implement needs --phase <n>" >&2; usage 1; }
      [[ $PHASE =~ ^[0-9]+$ ]] || die "--phase takes a number (got: $PHASE)"
      [[ -n $MERGE ]] || { echo "$PROG: implement needs --merge <hash>" >&2; usage 1; }
      [[ $MERGE =~ ^[0-9a-fA-F]{7,40}$ ]] || die "--merge takes a git hash (got: $MERGE)"
      [[ $CHECK -eq 1 || $FULL -eq 0 ]] || die "--full does not apply to implement"
      cmd_implement
      ;;
    status)
      [[ -z $DOC ]] || die "status takes no <doc> (it lists them all)"
      [[ $CHECK -eq 0 ]] || die "--check applies to pick-up/implement, not status"
      cmd_status
      ;;
  esac
}

main "$@"

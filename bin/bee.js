#!/usr/bin/env node
// bee — BeeHarness CLI. `bee report`, `bee init`, `bee inbox`,
// `bee capture`, `bee park`, `bee design`.
// Specs: ADR-008 (keeper report zones/protocol), ADR-005 amendment
// (plugin registration), ADR-014 + docs/AXI.md (agent-first CLI),
// ADR-016 (design state machine — delegated to scripts/design.sh).
// Node >=20, stdlib only.

import { parseArgs } from 'node:util';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const VERSION = '0.1.0';
const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '..');

function atomicWrite(file, data) {
  const tmp = file + '.tmp-' + process.pid;
  fs.writeFileSync(tmp, data);
  fs.renameSync(tmp, file);
}

const USAGE = `bee ${VERSION} — BeeHarness CLI

usage:
  bee report [--check] [--status <path>] [--report <path>] [--store <path>]
  bee init   [--check] [--settings <path>]
  bee inbox  [list [--for <addressee>] [--full]]
             | add <addressee> <text> [--origin <role>] [--ref <path>]
             | show <id> [--full] | done <id> [--note <how>]
             | render [--status <path>]
  bee park   [list [--full]]
             | add "<item>" [--context <text>] [--unpark-when <text>]
               [--origin <role>]
             | show <id> [--full] | resolve <id> [--how <text>]
             | migrate <md>
  bee design [status [--full]]
             | new "<title>" [--check]
             | pick-up <doc> --phase <n> [--check]
             | implement <doc> --phase <n> --merge <hash> [--check]
  bee capture "<thought>"
  bee help | version

  --check   never write; report what would happen

per-subcommand reference: bee inbox help
`;

export function run(argv) {
  const [cmd, ...rest] = argv;
  if (cmd === undefined || cmd === 'help') {
    return { code: 0, out: USAGE, err: '' };
  }
  if (cmd === 'version' || cmd === '--version') {
    return { code: 0, out: VERSION + '\n', err: '' };
  }
  if (cmd === 'init') {
    return cmdInit(rest);
  }
  if (cmd === 'report') {
    return cmdReport(rest);
  }
  if (cmd === 'inbox') {
    return cmdInbox(rest);
  }
  if (cmd === 'park') {
    return cmdPark(rest);
  }
  if (cmd === 'design') {
    return cmdDesign(rest);
  }
  if (cmd === 'capture') {
    return cmdCapture(rest);
  }
  return { code: 1, out: '', err: `bee: unknown command '${cmd}'\n\n` + USAGE };
}

function flags(rest, spec, allowPositionals) {
  try {
    return parseArgs({ args: rest, options: spec, strict: true,
      allowPositionals: !!allowPositionals });
  } catch (e) {
    return { error: e };
  }
}

function expandTilde(p) {
  return p.startsWith('~/') || p === '~'
    ? path.join(os.homedir(), p.slice(1))
    : p;
}

function tildeForm(p) {
  const h = os.homedir();
  return p === h || p.startsWith(h + path.sep)
    ? '~' + p.slice(h.length)
    : p;
}

function cmdInit(rest) {
  const f = flags(rest, {
    check: { type: 'boolean' },
    settings: { type: 'string' },
  });
  if (f.error) {
    return { code: 1, out: '', err: String(f.error) + '\n' };
  }
  const settingsPath = f.values.settings
    ? path.resolve(f.values.settings)
    : path.join(os.homedir(), '.pi', 'agent', 'settings.json');
  const skillsDir = path.join(REPO_ROOT, 'skills');

  let settings;
  try {
    settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  } catch (e) {
    if (e.code === 'ENOENT') {
      settings = {};
    } else {
      return {
        code: 1, out: '',
        err: `bee init: cannot parse ${settingsPath}: ${e.message}\n`,
      };
    }
  }
  if (typeof settings !== 'object' || settings === null ||
      Array.isArray(settings)) {
    return { code: 1, out: '',
      err: `bee init: ${settingsPath} is not a settings object\n` };
  }
  if (settings.skills !== undefined && !Array.isArray(settings.skills)) {
    return { code: 1, out: '',
      err: `bee init: 'skills' in ${settingsPath} is not an array\n` };
  }

  const entries = settings.skills ?? [];
  const target = path.resolve(skillsDir);
  const hit = entries.find(
    (e) => typeof e === 'string' &&
      path.resolve(expandTilde(e)) === target);

  if (hit !== undefined) {
    return {
      code: 0,
      out: `bee init: already registered: ${hit} (${settingsPath})\n`,
      err: '',
    };
  }
  if (f.values.check) {
    return {
      code: 1,
      out: '',
      err: `bee init: NOT registered (${tildeForm(skillsDir)}) ` +
           `— run without --check to add it (${settingsPath})\n`,
    };
  }

  settings.skills = [...entries, tildeForm(skillsDir)];
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  atomicWrite(settingsPath, JSON.stringify(settings, null, 2) + '\n');
  return {
    code: 0,
    out: `bee init: registered ${tildeForm(skillsDir)} in ` +
         `${settingsPath}\n`,
    err: '',
  };
}

const ZONE_TITLES = [
  "Keeper's list",
  'Needs the keeper',
  'Changed since last report',
  'Worth a sample',
];

const FRESH_HEADER_PREFIX = `# Keeper report

**Generated:** {STAMP} by bee report (fresh) · **Source:** \`{SOURCE}\`

**Zones and rules — read before regenerating this file:** *Keeper's
list* is the keeper's own — roles add items on the keeper's word,
mark done only on the keeper's resolution (in conversation counts),
and NEVER drop or overwrite it in a regen. *Needs the keeper*,
*Changed since last report*, and *Worth a sample* are
agent-maintained: regenerate freely from status.md, MERGING items
from both roles (never silently dropping the other role's asks).
Headings carry no pronouns. Paths absolute (Paseo). The keeper may
edit any zone directly. (ADR-008 + ADR-007 amendment 1.)
`;

function freshHeader(source) {
  return FRESH_HEADER_PREFIX.replace('{SOURCE}', source);
}

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' +
    p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
}

function splitZones(text) {
  const lines = text.split('\n');
  const at = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) {
      const t = lines[i].slice(3).trim();
      if (ZONE_TITLES.includes(t)) at.push({ title: t, line: i });
    }
  }
  if (at.length !== ZONE_TITLES.length ||
      !ZONE_TITLES.every((t, i) => at[i].title === t)) {
    return null; // unparseable by contract
  }
  const header = lines.slice(0, at[0].line).join('\n');
  const zones = {};
  for (let i = 0; i < at.length; i++) {
    const end = i + 1 < at.length ? at[i + 1].line : lines.length;
    zones[at[i].title] = lines
      .slice(at[i].line + 1, end)
      .join('\n')
      .replace(/^\n+/, '')
      .replace(/\n+$/, '');
  }
  return { header, zones };
}

function renderZones(zones) {
  let out = '';
  for (const t of ZONE_TITLES) {
    out += `## ${t}\n\n${zones[t] || '(none)'}\n\n`;
  }
  return out.replace(/\n+$/, '') + '\n';
}

function queueBullets(statusText) {
  const lines = statusText.split('\n');
  const bullets = [];
  let inQueue = false;
  let cur = null;
  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (cur !== null) { bullets.push(cur); cur = null; }
      inQueue = line.slice(3).startsWith('Awaiting keeper');
      continue;
    }
    if (!inQueue) continue;
    if (/^<!--.*-->$/.test(line.trim())) continue; // markers, not asks
    if (line.startsWith('- ')) {
      if (cur !== null) bullets.push(cur);
      cur = line.slice(2);
    } else if (cur !== null && line.trim() !== '') {
      cur += ' ' + line.trim();
    }
  }
  if (cur !== null) bullets.push(cur);
  return bullets
    .filter((b) => !/^- *$/.test(b))
    .filter((b) => !/\bRESOLVED\b/.test(b)); // history, not an ask
}

// Open items addressed to the keeper — the report's derived asks
// once the store is live (fallback: queueBullets above).
function inboxKeeperAsks(items, repoRoot) {
  return items
    .filter((it) => it.addressee === 'keeper' && it.state !== 'done')
    .sort((a, b) => (Date.parse(a.opened) || 0) - (Date.parse(b.opened) || 0))
    .map((it) => {
      const m = /^(\d{4}-\d{2}-\d{2})/.exec(it.opened || '');
      const tail = [it.id];
      if (it.ref && it.ref !== '-') {
        tail.push(path.resolve(repoRoot, it.ref)); // always absolute
      }
      const line = `[${it.origin}] ${m ? m[1] : '?'} — ${it.text} ` +
        `(${tail.join(' · ')})`;
      return absolutize(line, repoRoot);
    });
}

function absolutize(text, repoRoot) {
  const resolve1 = (tok) => {
    if (tok.startsWith('/') || tok.startsWith('~')) return null;
    const abs = path.resolve(repoRoot, tok);
    return fs.existsSync(abs) ? abs : null;
  };
  return text
    .replace(/`([^`]+)`/g, (m, tok) => {
      const abs = resolve1(tok);
      return abs !== null ? '`' + abs + '`' : m; // keep backticks
    })
    .replace(/(^|[\s(])(\.{0,2}\/?\.hivemind\/[^\s`)\]]*)/g,
      (m, pre, tok) => {
        const abs = resolve1(tok);
        return abs !== null ? pre + abs : m;
      });
}

function normItem(s) {
  return s.replace(/^\d+\.\s*/, '')
    .replace(/^\[[^\]]*\]\s*/, '') // leading [role] tag
    .replace(/^\d{4}-\d{2}-\d{2}\s*[—-]?\s*/, '') // leading date
    .replace(/[*_`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/[.:;]+$/, '')
    .toLowerCase();
}

function sameAsk(a, b) {
  const x = normItem(a), y = normItem(b);
  return x === y || x.includes(y) || y.includes(x);
}

function zoneItems(zoneText) {
  const items = [];
  let cur = null;
  for (const raw of zoneText.split('\n')) {
    const line = raw.trim();
    if (line === '' || line === '(none)') {
      if (cur !== null) { items.push(cur); cur = null; }
    } else if (line.startsWith('(') && cur === null) {
      // zone note (e.g. placeholder) — not an ask
    } else if (/^\d+\.\s/.test(line) || /^- /.test(line)) {
      if (cur !== null) items.push(cur);
      cur = line.replace(/^\d+\.\s*/, '').replace(/^- /, '');
    } else if (cur !== null) {
      cur += ' ' + line; // wrapped continuation line
    }
  }
  if (cur !== null) items.push(cur);
  return items;
}

function mergeNeeds(derived, oldZone) {
  const kept = [];
  for (const old of zoneItems(oldZone)) {
    if (!derived.some((d) => sameAsk(d, old))) kept.push(old);
  }
  const all = [...derived, ...kept];
  return all.length === 0
    ? '(none)'
    : all.map((t, i) => `${i + 1}. ${t}`).join('\n');
}

function cmdReport(rest) {
  const f = flags(rest, {
    check: { type: 'boolean' },
    status: { type: 'string' },
    report: { type: 'string' },
    store: { type: 'string' },
  });
  if (f.error) {
    return { code: 1, out: '', err: String(f.error) + '\n' };
  }
  const statusPath = f.values.status
    ? path.resolve(f.values.status)
    : path.join(REPO_ROOT, '.hivemind', 'status.md');
  const reportPath = f.values.report
    ? path.resolve(f.values.report)
    : path.join(REPO_ROOT, '.hivemind', 'keeper-report.md');
  const repoRoot = path.resolve(path.dirname(statusPath), '..');

  let statusText;
  try {
    statusText = fs.readFileSync(statusPath, 'utf8');
  } catch (e) {
    return { code: 1, out: '',
      err: `bee report: cannot read ${statusPath}: ${e.message}\n` };
  }

  const oldText = fs.existsSync(reportPath)
    ? fs.readFileSync(reportPath, 'utf8')
    : null;
  const parsed = oldText !== null ? splitZones(oldText) : null;
  if (oldText !== null && parsed === null) {
    return {
      code: 1, out: '',
      err: `bee report: ${reportPath} is missing or mis-orders a zone ` +
           `heading; refusing to write — hand-fix first\n`,
    };
  }

  // Needs-the-keeper derivation: the inbox store whenever it
  // exists; status bullets only when the store is absent.
  const storePath = f.values.store
    ? path.resolve(f.values.store)
    : path.join(repoRoot, '.hivemind', 'inbox.toon');
  const sr = readInbox(storePath);
  if (sr.err) {
    return { code: 1, out: '',
      err: 'bee report: ' + sr.err.replace(/^bee inbox: /, '') };
  }
  const storeAsks = inboxKeeperAsks(sr.items, repoRoot);
  // Source of truth = the store whenever it exists (review r1
  // blocking fix): deriving from it even when zero keeper asks are
  // open — falling back only when the store is absent (pre-
  // migration) never lets the rendered region's non-keeper view
  // bullets leak into Needs the keeper.
  const fromStore = fs.existsSync(storePath);
  const derived = fromStore ? storeAsks
    : queueBullets(statusText).map((b) => absolutize(b, repoRoot));
  const source = fromStore ? '.hivemind/inbox.toon' : '.hivemind/status.md';

  const zones = parsed !== null
    ? parsed.zones
    : {
      "Keeper's list":
        "(the keeper's come-back items — add on the keeper's word)",
      'Needs the keeper': '(none)',
      'Changed since last report': '(none)',
      'Worth a sample': '(none)',
    };
  const header = parsed !== null
    ? parsed.header.replace(
        /\*\*Generated:\*\*[^\n]*(?:\n(?!\s*$|\*\*|#)[^\n]*)*(?:\n\*\*Source:\*\*[^\n]*)?$/m,
        `**Generated:** ${stamp()} by bee report (merge regen) · ` +
        `**Source:** \`${source}\``)
    : freshHeader(source).replace('{STAMP}', stamp());

  zones['Needs the keeper'] = mergeNeeds(
    derived, zones['Needs the keeper']);

  const out = header.replace(/\n+$/, '') + '\n\n' + renderZones(zones);
  if (f.values.check) {
    return { code: 0, out, err: '' };
  }
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  atomicWrite(reportPath, out);
  return {
    code: 0,
    out: `bee report: wrote ${reportPath}\n`,
    err: '',
  };
}

// ---- inbox (P4 — .hivemind/inbox.toon, agent-primary TOON store) ----

const INBOX_HEADER =
  '# inbox — items waiting on someone (agent store; views render from here)';

const INBOX_FIELDS = ['id', 'addressee', 'origin', 'ref', 'text', 'state',
  'opened', 'taken', 'done', 'note'];

const INBOX_USAGE = `bee inbox — items waiting on someone (a queue, not a document)

usage:
  bee inbox list [--for <addressee>] [--full] [--check]
  bee inbox add <addressee> <text> [--origin <role>] [--ref <path>] [--check]
  bee inbox show <id> [--full]
  bee inbox done <id> [--note <how>] [--check]
  bee inbox render [--status <path>] [--check]
  bee capture "<thought>" [--check]

flags:
  --for <addressee>  filter by addressee; a --for read marks matching
                     open items taken (no claim command this phase)
  --origin <role>    provenance on add (default: bee; capture: capture)
  --ref <path>       optional pointer riding the item (default: -)
  --note <how>       how it was resolved (recorded on done)
  --status <path>    status file the render region lives in
                     (default .hivemind/status.md)
  --full             all fields, no truncation
  --check            never write; report what would happen
  --store <path>     internal: store path (default .hivemind/inbox.toon)

store: TOON — one item per block, blank line between; ids IN-NNN
(monotonic, never reused); state open → taken → done; list counts
not-done items as open; ages from ISO opened timestamps.

render: writes the open-items view (grouped by addressee, oldest
first, with ages; full text) between <!-- inbox:render --> markers
in the status file; creates the region under the "Awaiting keeper"
heading (replacing a hand-written section) when absent; text
outside the region is never touched.
`;

const CAPTURE_USAGE = `bee capture "<thought>" — quick thought into the keeper's inbox
(routing stays conversational; this only records the thought)

usage: bee capture "<thought>" [--check] [--store <path>]
`;

function inboxUsageErr(e) {
  const msg = e && e.message ? e.message
    : String(e).replace(/^Error: /, '');
  return { code: 1, out: '', err: msg + '\n\n' + INBOX_USAGE };
}

function storePathOf(p) {
  return p ? path.resolve(p)
    : path.join(REPO_ROOT, '.hivemind', 'inbox.toon');
}

function isoStampLocal() {
  const d = new Date();
  const off = -d.getTimezoneOffset();
  const sign = off >= 0 ? '+' : '-';
  const a = Math.abs(off);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') +
    '-' + String(d.getDate()).padStart(2, '0') + 'T' +
    String(d.getHours()).padStart(2, '0') + ':' +
    String(d.getMinutes()).padStart(2, '0') + ':' +
    String(d.getSeconds()).padStart(2, '0') + sign +
    String(Math.floor(a / 60)).padStart(2, '0') + ':' +
    String(a % 60).padStart(2, '0');
}

function readToonStore(storePath, cmd) {
  let text;
  try {
    text = fs.readFileSync(storePath, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return { items: [] };
    return { err: `${cmd}: cannot read ${storePath}: ${e.message}\n` };
  }
  const items = [];
  let cur = null;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('#')) continue; // header/comment lines
    if (line.trim() === '') {
      if (cur !== null) { items.push(cur); cur = null; }
      continue;
    }
    const at = line.indexOf(': ');
    if (at < 0) {
      return { err: `${cmd}: cannot parse ${storePath}: ` +
        `line ${i + 1} is not a field — hand-fix the store, then retry\n` };
    }
    cur = cur ?? {};
    cur[line.slice(0, at)] = line.slice(at + 2);
  }
  if (cur !== null) items.push(cur);
  return { items };
}

function readInbox(storePath) {
  return readToonStore(storePath, 'bee inbox');
}

function renderToonStore(items, fields, header) {
  const blocks = items.map((it) => {
    const known = Object.keys(it).filter((k) => fields.includes(k));
    const extra = Object.keys(it).filter((k) => !fields.includes(k));
    return [...known, ...extra].map((k) => `${k}: ${it[k]}`).join('\n');
  });
  return header + '\n' + blocks.join('\n\n') + '\n';
}

function renderInboxStore(items) {
  return renderToonStore(items, INBOX_FIELDS, INBOX_HEADER);
}

function writeStore(cmd, storePath, items, fields, header) {
  try {
    fs.mkdirSync(path.dirname(storePath), { recursive: true });
    atomicWrite(storePath, renderToonStore(items, fields, header));
    return null;
  } catch (e) {
    return `${cmd}: cannot write ${storePath}: ${e.message}\n`;
  }
}

function writeInbox(storePath, items) {
  return writeStore('bee inbox', storePath, items, INBOX_FIELDS,
    INBOX_HEADER);
}

function nextInboxId(items) {
  let max = 0;
  for (const it of items) {
    const m = /^IN-(\d+)$/.exec(it.id || '');
    if (m) max = Math.max(max, Number(m[1]));
  }
  return 'IN-' + String(max + 1).padStart(3, '0');
}

function ageOf(iso) {
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return '?';
  const s = Math.max(0, Math.floor((Date.now() - t) / 1000));
  if (s < 60) return s + 's';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h';
  return Math.floor(h / 24) + 'd';
}

function truncText(s, cols = 60) {
  return s.length <= cols ? s
    : s.slice(0, cols) + `… (+${s.length - cols} chars)`;
}

function cmdInbox(rest) {
  const [sub] = rest;
  if (sub === undefined || sub === 'list' || sub.startsWith('--')) {
    return inboxList(sub === 'list' ? rest.slice(1) : rest);
  }
  if (sub === 'add') return inboxAdd(rest.slice(1));
  if (sub === 'show') return inboxShow(rest.slice(1));
  if (sub === 'done') return inboxDone(rest.slice(1));
  if (sub === 'render') return inboxRender(rest.slice(1));
  if (sub === 'help') return { code: 0, out: INBOX_USAGE, err: '' };
  return { code: 1, out: '',
    err: `bee inbox: unknown subcommand '${sub}'\n\n` + INBOX_USAGE };
}

function inboxAddItem({ storePath, addressee, text, origin, ref, check,
  verb }) {
  for (const v of [addressee, text, origin, ref]) {
    if (v !== undefined && v.includes('\n')) {
      return { code: 1, out: '',
        err: 'bee inbox: field values must be single-line\n' };
    }
  }
  const r = readInbox(storePath);
  if (r.err) return { code: 1, out: '', err: r.err };
  const id = nextInboxId(r.items);
  const item = {
    id,
    addressee,
    origin: origin || 'bee',
    ref: ref || '-',
    text,
    state: 'open',
    opened: isoStampLocal(),
    taken: '-',
    done: '-',
  };
  if (check) {
    return { code: 0, out: `--check: would append to ${storePath}\n` +
      renderInboxStore([item]).replace(INBOX_HEADER + '\n', ''), err: '' };
  }
  const w = writeInbox(storePath, [...r.items, item]);
  if (w) return { code: 1, out: '', err: w };
  return { code: 0, out: `${id} ${verb} · ${addressee} — bee inbox show ${id}\n`,
    err: '' };
}

function inboxAdd(args) {
  const f = flags(args, {
    origin: { type: 'string' },
    ref: { type: 'string' },
    check: { type: 'boolean' },
    store: { type: 'string' },
  }, true);
  if (f.error) return inboxUsageErr(f.error);
  const pos = f.positionals;
  if (pos.length !== 2) {
    return inboxUsageErr('bee inbox add: expected <addressee> <text>');
  }
  const [addressee, text] = pos;
  if (addressee === '' || text === '') {
    return inboxUsageErr(
      'bee inbox add: <addressee> and <text> must not be empty');
  }
  return inboxAddItem({
    storePath: storePathOf(f.values.store),
    addressee,
    text,
    origin: f.values.origin,
    ref: f.values.ref,
    check: f.values.check,
    verb: 'added',
  });
}

function inboxList(args) {
  const f = flags(args, {
    for: { type: 'string' },
    full: { type: 'boolean' },
    check: { type: 'boolean' },
    store: { type: 'string' },
  }, true);
  if (f.error) return inboxUsageErr(f.error);
  if (f.positionals.length > 0) {
    return inboxUsageErr(
      `bee inbox list: unexpected argument '${f.positionals[0]}'`);
  }
  const storePath = storePathOf(f.values.store);
  const r = readInbox(storePath);
  if (r.err) return { code: 1, out: '', err: r.err };
  const items = r.items;
  const isFor = f.values.for !== undefined;
  const toStamp = isFor
    ? items.filter((it) => it.state === 'open' &&
        it.addressee === f.values.for)
    : [];
  const view = items.filter((it) => it.state !== 'done' &&
    (!isFor || it.addressee === f.values.for));
  if (view.length === 0) {
    const hint = isFor && items.some((it) => it.state !== 'done')
      ? '0 items — bee inbox list\n'
      : '0 items\nadd one: bee inbox add <addressee> "<text>"\n';
    return { code: 0, out: hint, err: '' };
  }
  const oldest = view.reduce((a, b) =>
    Date.parse(a.opened) <= Date.parse(b.opened) ? a : b);
  let out = `${view.length} open · oldest ${ageOf(oldest.opened)}\n`;
  if (toStamp.length > 0) {
    out += (f.values.check ? '--check: would mark taken: '
      : 'marked taken: ') + toStamp.map((i) => i.id).join(', ') + '\n';
  }
  for (const it of view) {
    if (f.values.full) {
      out += `${it.id} · ${it.addressee} · ${it.state} · ` +
        `${ageOf(it.opened)} · ${it.text}\n` +
        `  origin: ${it.origin} · ref: ${it.ref} · ` +
        `opened: ${it.opened} · taken: ${it.taken} · done: ${it.done}` +
        (it.note !== undefined ? ` · note: ${it.note}` : '') + '\n';
    } else {
      out += `${it.id} · ${it.addressee} · ${ageOf(it.opened)} · ` +
        `${truncText(it.text)}\n`;
    }
  }
  if (toStamp.length > 0 && !f.values.check) {
    for (const it of toStamp) {
      it.state = 'taken';
      it.taken = isoStampLocal();
    }
    const w = writeInbox(storePath, items);
    if (w) return { code: 1, out: '', err: w };
  }
  return { code: 0, out, err: '' };
}

function inboxShow(args) {
  const f = flags(args, {
    full: { type: 'boolean' },
    store: { type: 'string' },
  }, true);
  if (f.error) return inboxUsageErr(f.error);
  const pos = f.positionals;
  if (pos.length !== 1) {
    return inboxUsageErr('bee inbox show: expected <id>');
  }
  const r = readInbox(storePathOf(f.values.store));
  if (r.err) return { code: 1, out: '', err: r.err };
  const it = r.items.find((i) => i.id === pos[0]);
  if (!it) {
    return { code: 1, out: '',
      err: `bee inbox: no item ${pos[0]} — bee inbox list\n` };
  }
  let out = `${it.id} · ${it.addressee} · ${it.state} · ${ageOf(it.opened)}\n` +
    `text: ${it.text}\n`;
  if (f.values.full) {
    out += `origin: ${it.origin}\nref: ${it.ref}\n` +
      `opened: ${it.opened}\ntaken: ${it.taken}\ndone: ${it.done}\n`;
    if (it.note !== undefined) out += `note: ${it.note}\n`;
  }
  return { code: 0, out, err: '' };
}

function inboxDone(args) {
  const f = flags(args, {
    note: { type: 'string' },
    check: { type: 'boolean' },
    store: { type: 'string' },
  }, true);
  if (f.error) return inboxUsageErr(f.error);
  const pos = f.positionals;
  if (pos.length !== 1) {
    return inboxUsageErr('bee inbox done: expected <id>');
  }
  const storePath = storePathOf(f.values.store);
  const r = readInbox(storePath);
  if (r.err) return { code: 1, out: '', err: r.err };
  const it = r.items.find((i) => i.id === pos[0]);
  if (!it) {
    return { code: 1, out: '',
      err: `bee inbox: no item ${pos[0]} — bee inbox list\n` };
  }
  if (it.state === 'done') {
    return { code: 0, out: `${it.id} already done\n`, err: '' };
  }
  it.state = 'done';
  it.done = isoStampLocal();
  if (f.values.note !== undefined) {
    if (f.values.note.includes('\n')) {
      return { code: 1, out: '',
        err: 'bee inbox: field values must be single-line\n' };
    }
    it.note = f.values.note;
  }
  if (f.values.check) {
    return { code: 0, out: `--check: would mark ${it.id} done` +
      (f.values.note !== undefined ? ` (note: ${f.values.note})` : '') +
      '\n', err: '' };
  }
  const w = writeInbox(storePath, r.items);
  if (w) return { code: 1, out: '', err: w };
  return { code: 0, out: `${it.id} done\n`, err: '' };
}

// ---- render (P4 Task 2 — the status file's marked inbox region) ----

const RENDER_OPEN = '<!-- inbox:render -->';
const RENDER_CLOSE = '<!-- /inbox:render -->';
const RENDER_HEADING = '## Awaiting keeper (rendered from inbox.toon)';

function inboxRenderView(items) {
  const open = items.filter((it) => it.state !== 'done');
  if (open.length === 0) return '0 open';
  const age = (it) => Date.parse(it.opened) || 0;
  const oldest = open.reduce((a, b) => age(a) <= age(b) ? a : b);
  const groups = new Map();
  for (const it of open) {
    if (!groups.has(it.addressee)) groups.set(it.addressee, []);
    groups.get(it.addressee).push(it);
  }
  const names = [...groups.keys()].sort((a, b) =>
    a.toLowerCase() < b.toLowerCase() ? -1 :
      a.toLowerCase() > b.toLowerCase() ? 1 : 0);
  let out = `${open.length} open · oldest ${ageOf(oldest.opened)}`;
  for (const name of names) {
    const g = groups.get(name).sort((x, y) => age(x) - age(y));
    out += `\n\n${name} (${g.length} open · oldest ${ageOf(g[0].opened)}):`;
    for (const it of g) {
      const ref = it.ref && it.ref !== '-' ? ` · ref: ${it.ref}` : '';
      out += `\n- ${it.id} · ${ageOf(it.opened)} — ${it.text}${ref}`;
    }
  }
  return out;
}

function renderIntoStatus(statusText, view, statusPath) {
  const openIdx = statusText.indexOf(RENDER_OPEN);
  const closeIdx = statusText.indexOf(RENDER_CLOSE);
  if (openIdx !== -1 || closeIdx !== -1) {
    if (openIdx === -1 || closeIdx === -1 || closeIdx < openIdx) {
      return {
        err: `bee inbox render: unbalanced render markers in ` +
          `${statusPath} — hand-fix the <!-- inbox:render --> pair, ` +
          `then re-run\n`,
      };
    }
    const before = statusText.slice(0, openIdx + RENDER_OPEN.length);
    const after = statusText.slice(closeIdx);
    return { text: `${before}\n${view}\n${after}`, note: 'region updated' };
  }
  // No region yet: create it under the rendered heading, replacing
  // a hand-written "Awaiting keeper" section when one exists.
  const lines = statusText.split('\n');
  const section =
    `${RENDER_HEADING}\n\n${RENDER_OPEN}\n${view}\n${RENDER_CLOSE}`;
  const start = lines.findIndex((l) => l.startsWith('## Awaiting keeper'));
  if (start !== -1) {
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
      if (/^## /.test(lines[i])) { end = i; break; }
    }
    return {
      text: end < lines.length
        ? [...lines.slice(0, start), section, '', ...lines.slice(end)]
            .join('\n')
        : [...lines.slice(0, start), section].join('\n') + '\n',
      note: 'replaced hand-written queue section',
    };
  }
  const first = lines.findIndex((l) => /^## /.test(l));
  if (first === -1) {
    return {
      text: statusText.replace(/\n+$/, '') + '\n\n' + section + '\n',
      note: 'region created',
    };
  }
  return {
    text: [...lines.slice(0, first), section, '', ...lines.slice(first)]
      .join('\n'),
    note: 'region created',
  };
}

function inboxRender(args) {
  const f = flags(args, {
    check: { type: 'boolean' },
    store: { type: 'string' },
    status: { type: 'string' },
  }, true);
  if (f.error) return inboxUsageErr(f.error);
  if (f.positionals.length > 0) {
    return inboxUsageErr(
      `bee inbox render: unexpected argument '${f.positionals[0]}'`);
  }
  const storePath = storePathOf(f.values.store);
  const statusPath = f.values.status
    ? path.resolve(f.values.status)
    : path.join(REPO_ROOT, '.hivemind', 'status.md');
  const r = readInbox(storePath);
  if (r.err) return { code: 1, out: '', err: r.err };
  let statusText;
  try {
    statusText = fs.readFileSync(statusPath, 'utf8');
  } catch (e) {
    return { code: 1, out: '',
      err: `bee inbox render: cannot read ${statusPath}: ${e.message}\n` };
  }
  const view = inboxRenderView(r.items);
  // review r1 fix: item text embedding a render marker would break
  // region isolation on the next render — refuse, hand-fix line.
  if (view.includes(RENDER_OPEN) || view.includes(RENDER_CLOSE)) {
    return { code: 1, out: '',
      err: 'bee inbox render: an item text contains a render marker — ' +
        'hand-fix the store (remove <!-- inbox:render --> from item text), then re-run\n' };
  }
  const res = renderIntoStatus(statusText, view, statusPath);
  if (res.err) return { code: 1, out: '', err: res.err };
  if (f.values.check) {
    return { code: 0, out: `--check: would render into ${statusPath} ` +
      `(${res.note})\n${RENDER_OPEN}\n${view}\n${RENDER_CLOSE}\n`, err: '' };
  }
  try {
    atomicWrite(statusPath, res.text);
  } catch (e) {
    return { code: 1, out: '',
      err: `bee inbox render: cannot write ${statusPath}: ${e.message}\n` };
  }
  return { code: 0,
    out: `bee inbox render: ${res.note} — ${statusPath}\n`, err: '' };
}

function cmdCapture(rest) {
  const f = flags(rest, {
    check: { type: 'boolean' },
    store: { type: 'string' },
  }, true);
  if (f.error) {
    const msg = f.error.message ? f.error.message
      : String(f.error).replace(/^Error: /, '');
    return { code: 1, out: '', err: msg + '\n\n' + CAPTURE_USAGE };
  }
  const pos = f.positionals;
  if (pos.length !== 1 || pos[0] === '') {
    return { code: 1, out: '',
      err: 'bee capture: expected "<thought>"\n\n' + CAPTURE_USAGE };
  }
  return inboxAddItem({
    storePath: storePathOf(f.values.store),
    addressee: 'keeper',
    text: pos[0],
    origin: 'capture',
    check: f.values.check,
    verb: 'captured',
  });
}

// ---- park (P4 Task 3 — .hivemind/memory/parking-lot.toon) ----

const PARK_HEADER =
  '# parking lot — deferred decisions (agent store; views render from here)';

const PARK_FIELDS = ['id', 'item', 'context', 'unpark-when', 'origin',
  'opened', 'resolved', 'how'];

const PARK_USAGE = `bee park — deferred decisions (a store, not a document)

usage:
  bee park list [--full]
  bee park add "<item>" [--context <text>] [--unpark-when <text>] [--origin <role>] [--check]
  bee park show <id> [--full]
  bee park resolve <id> [--how <text>] [--check]
  bee park migrate <md> [--check]

flags:
  --context <text>     background + open questions (ride verbatim,
                       never pre-answered)
  --unpark-when <text> the unpark condition (default: -)
  --origin <role>      provenance; picks the id series
                       (default bee → PL-NNN; po → PL-PO-NNN)
  --how <text>         how it was resolved (recorded on resolve)
  --full               all fields, no truncation
  --check              never write; report what would happen
  --store <path>       internal: store path
                       (default .hivemind/memory/parking-lot.toon)

store: TOON — one item per block, blank line between; ids
PL-<role>-NNN (origin bee = bare PL-NNN), monotonic per series,
never reused; resolved items carry resolved: <date> and how:;
state is derived (resolved ≠ -); list counts unresolved items as
parked; ages from ISO opened timestamps (migrated items carry
opened: - → age ?).

law: resolve is keeper-gated (AGENTS.md; GLOSSARY: parking lot) —
any agent may propose parking or resolving; only the keeper's
word resolves. Run resolve only on that word.

migrate: one-shot conversion of the markdown lot at <md> into the
store — parses every PL-* entry (parked AND resolved; nothing
leaves the views); ids key the store, and when an id appears in
both sections the RESOLVED entry wins, its how line noting
'superseded stale parked duplicate'. Replaces <md> with a pointer
stub; history stays in git. Refuses when <md> holds no PL-*
entries (already migrated?).
`;

function parkUsageErr(e) {
  const msg = e && e.message ? e.message
    : String(e).replace(/^Error: /, '');
  return { code: 1, out: '', err: msg + '\n\n' + PARK_USAGE };
}

function parkStorePathOf(p) {
  return p ? path.resolve(p)
    : path.join(REPO_ROOT, '.hivemind', 'memory', 'parking-lot.toon');
}

function parkIsResolved(it) {
  return it.resolved !== undefined && it.resolved !== '-';
}

function parkOldestAge(view) {
  let min = null;
  for (const it of view) {
    const t = Date.parse(it.opened || '');
    if (!Number.isNaN(t)) min = min === null ? t : Math.min(min, t);
  }
  return min === null ? '?'
    : ageOf(new Date(min).toISOString());
}

function nextParkId(items, origin) {
  if (origin === 'bee') {
    let max = 0;
    for (const it of items) {
      const m = /^PL-(\d+)$/.exec(it.id || '');
      if (m) max = Math.max(max, Number(m[1]));
    }
    return 'PL-' + String(max + 1).padStart(3, '0');
  }
  const tag = origin.toUpperCase();
  const re = new RegExp('^PL-' + tag + '-(\\d+)$', 'i');
  let max = 0;
  for (const it of items) {
    const m = re.exec(it.id || '');
    if (m) max = Math.max(max, Number(m[1]));
  }
  return 'PL-' + tag + '-' + String(max + 1).padStart(3, '0');
}

function cmdPark(rest) {
  const [sub] = rest;
  if (sub === undefined || sub === 'list' || sub.startsWith('--')) {
    return parkList(sub === 'list' ? rest.slice(1) : rest);
  }
  if (sub === 'add') return parkAdd(rest.slice(1));
  if (sub === 'show') return parkShow(rest.slice(1));
  if (sub === 'resolve') return parkResolve(rest.slice(1));
  if (sub === 'migrate') return parkMigrate(rest.slice(1));
  if (sub === 'help') return { code: 0, out: PARK_USAGE, err: '' };
  return { code: 1, out: '',
    err: `bee park: unknown subcommand '${sub}'\n\n` + PARK_USAGE };
}

function parkAdd(args) {
  const f = flags(args, {
    context: { type: 'string' },
    'unpark-when': { type: 'string' },
    origin: { type: 'string' },
    check: { type: 'boolean' },
    store: { type: 'string' },
  }, true);
  if (f.error) return parkUsageErr(f.error);
  const pos = f.positionals;
  if (pos.length !== 1 || pos[0] === '') {
    return parkUsageErr('bee park add: expected "<item>"');
  }
  const item = pos[0];
  const origin = f.values.origin || 'bee';
  if (!/^[a-z][a-z0-9-]*$/i.test(origin)) {
    return parkUsageErr(
      `bee park add: --origin '${origin}' must be letters/digits/hyphens`);
  }
  for (const v of [item, f.values.context, f.values['unpark-when'],
    f.values.origin]) {
    if (v !== undefined && v.includes('\n')) {
      return { code: 1, out: '',
        err: 'bee park: field values must be single-line\n' };
    }
  }
  const storePath = parkStorePathOf(f.values.store);
  const r = readToonStore(storePath, 'bee park');
  if (r.err) return { code: 1, out: '', err: r.err };
  const id = nextParkId(r.items, origin.toLowerCase());
  const entry = {
    id,
    item,
    context: f.values.context || '-',
    'unpark-when': f.values['unpark-when'] || '-',
    origin: origin.toLowerCase(),
    opened: isoStampLocal(),
    resolved: '-',
  };
  if (f.values.check) {
    return { code: 0, out: `--check: would append to ${storePath}\n` +
      renderToonStore([entry], PARK_FIELDS, PARK_HEADER)
        .replace(PARK_HEADER + '\n', ''), err: '' };
  }
  const w = writeStore('bee park', storePath, [...r.items, entry],
    PARK_FIELDS, PARK_HEADER);
  if (w) return { code: 1, out: '', err: w };
  return { code: 0,
    out: `${id} parked · ${truncText(item)} — bee park show ${id}\n`,
    err: '' };
}

function parkList(args) {
  const f = flags(args, {
    full: { type: 'boolean' },
    store: { type: 'string' },
  }, true);
  if (f.error) return parkUsageErr(f.error);
  if (f.positionals.length > 0) {
    return parkUsageErr(
      `bee park list: unexpected argument '${f.positionals[0]}'`);
  }
  const r = readToonStore(parkStorePathOf(f.values.store), 'bee park');
  if (r.err) return { code: 1, out: '', err: r.err };
  const view = r.items.filter((it) => !parkIsResolved(it));
  if (view.length === 0) {
    return { code: 0, out: '0 parked\n' +
      'add one: bee park add "<item>"\n', err: '' };
  }
  let out = `${view.length} parked · oldest ${parkOldestAge(view)}\n`;
  for (const it of view) {
    if (f.values.full) {
      out += `${it.id} · parked · ${ageOf(it.opened)} · ${it.item}\n` +
        `  context: ${it.context}\n` +
        `  unpark-when: ${it['unpark-when']} · origin: ${it.origin}\n` +
        `  opened: ${it.opened} · resolved: ${it.resolved}\n`;
    } else {
      out += `${it.id} · ${truncText(it.item)} · ${ageOf(it.opened)} · ` +
        `unpark: ${truncText(it['unpark-when'], 40)}\n`;
    }
  }
  return { code: 0, out, err: '' };
}

function parkShow(args) {
  const f = flags(args, {
    full: { type: 'boolean' },
    store: { type: 'string' },
  }, true);
  if (f.error) return parkUsageErr(f.error);
  const pos = f.positionals;
  if (pos.length !== 1) {
    return parkUsageErr('bee park show: expected <id>');
  }
  const r = readToonStore(parkStorePathOf(f.values.store), 'bee park');
  if (r.err) return { code: 1, out: '', err: r.err };
  const it = r.items.find((i) => i.id === pos[0]);
  if (!it) {
    return { code: 1, out: '',
      err: `bee park: no item ${pos[0]} — bee park list\n` };
  }
  const state = parkIsResolved(it) ? 'resolved' : 'parked';
  let out = `${it.id} · ${state} · ${ageOf(it.opened)}\n` +
    `item: ${it.item}\ncontext: ${it.context}\n` +
    `unpark-when: ${it['unpark-when']}\n`;
  if (f.values.full) {
    out += `origin: ${it.origin}\nopened: ${it.opened}\n` +
      `resolved: ${it.resolved}\n`;
    if (it.how !== undefined) out += `how: ${it.how}\n`;
  }
  return { code: 0, out, err: '' };
}

function parkResolve(args) {
  const f = flags(args, {
    how: { type: 'string' },
    check: { type: 'boolean' },
    store: { type: 'string' },
  }, true);
  if (f.error) return parkUsageErr(f.error);
  const pos = f.positionals;
  if (pos.length !== 1) {
    return parkUsageErr('bee park resolve: expected <id>');
  }
  const storePath = parkStorePathOf(f.values.store);
  const r = readToonStore(storePath, 'bee park');
  if (r.err) return { code: 1, out: '', err: r.err };
  const it = r.items.find((i) => i.id === pos[0]);
  if (!it) {
    return { code: 1, out: '',
      err: `bee park: no item ${pos[0]} — bee park list\n` };
  }
  if (parkIsResolved(it)) {
    return { code: 0, out: `${it.id} already resolved\n`, err: '' };
  }
  if (f.values.how !== undefined && f.values.how.includes('\n')) {
    return { code: 1, out: '',
      err: 'bee park: field values must be single-line\n' };
  }
  it.resolved = isoStampLocal();
  if (f.values.how !== undefined) it.how = f.values.how;
  if (f.values.check) {
    return { code: 0, out: `--check: would resolve ${it.id}` +
      (f.values.how !== undefined ? ` (how: ${f.values.how})` : '') +
      '\n', err: '' };
  }
  const w = writeStore('bee park', storePath, r.items,
    PARK_FIELDS, PARK_HEADER);
  if (w) return { code: 1, out: '', err: w };
  return { code: 0, out: `${it.id} resolved\n`, err: '' };
}

// migrate: the named one-shot executor converting the markdown
// lot into the store. The md file's own shape (from the live
// .hivemind/memory/parking-lot.md):
//   ## Parked / ## Resolved sections; one bullet per entry —
//   - **PL-<id> — title** — body…  with hard-wrapped
//   continuation lines; resolved bodies start 'resolved <date>…'.
function joinWrapped(lines) {
  // Hard-wrap join: a line ending in '-' joins WITHOUT the space
  // (mid-token wraps like '2026-11-/01', 'worktree-/scoped');
  // everything else joins with a single space.
  let out = lines[0].trim();
  for (let i = 1; i < lines.length; i++) {
    const l = lines[i].trim();
    out = out.endsWith('-') ? out + l : out + ' ' + l;
  }
  return out;
}

function parseLotEntry(lines, section) {
  if (section !== 'parked' && section !== 'resolved') {
    return { err: `entry '${truncText(lines[0], 50)}' is outside a ` +
      `Parked/Resolved section — hand-fix the markdown, then re-run\n` };
  }
  const joined = joinWrapped(lines);
  const m = /^- \*\*(PL-(?:([A-Z]+)-)?(\d+)) — (.+?)\*\*(?: — (.*))?$/.exec(joined);
  if (!m) {
    return { err: `cannot parse entry '${truncText(joined, 60)}' — ` +
      `expected '- **PL-… — title** — body'; hand-fix, then re-run\n` };
  }
  const id = m[1];
  const origin = m[2] ? m[2].toLowerCase() : 'bee';
  const item = m[4];
  const body = m[5] ?? '';
  if (section === 'resolved') {
    const rm = /^resolved (\d{4}-\d{2}-\d{2})\s*[,:]?\s*(.*)$/.exec(body);
    if (!rm) {
      return { err: `cannot parse resolution for ${id} — expected ` +
        `'— resolved <date> …' after the title; hand-fix, then re-run\n` };
    }
    const e = { id, item, context: '-', 'unpark-when': '-',
      origin, opened: '-', resolved: rm[1] };
    if (rm[2] !== '') e.how = rm[2];
    return e;
  }
  // Parked: split a trailing ' — unpark …' clause when present.
  let context = body;
  let unpark = '-';
  const at = body.lastIndexOf(' — unpark ');
  if (at !== -1) {
    context = body.slice(0, at);
    unpark = body.slice(at + ' — unpark '.length);
  }
  return { id, item, context: context || '-', 'unpark-when': unpark,
    origin, opened: '-', resolved: '-' };
}

function parseMarkdownLot(text) {
  const parked = [];
  const resolved = [];
  let section = null;
  let cur = null;
  let curSec = null;
  let err = null;
  const flush = () => {
    if (cur === null) return;
    const e = parseLotEntry(cur, curSec);
    if (e.err) {
      if (err === null) err = e.err;
    } else {
      (curSec === 'resolved' ? resolved : parked).push(e);
    }
    cur = null;
    curSec = null;
  };
  for (const line of text.split('\n')) {
    if (/^## /.test(line)) {
      flush();
      const h = line.slice(3).trim().toLowerCase();
      section = h === 'parked' ? 'parked'
        : h === 'resolved' ? 'resolved' : null;
      continue;
    }
    if (/^- \*\*PL-/.test(line)) {
      flush();
      cur = [line];
      curSec = section;
      continue;
    }
    if (cur !== null) {
      if (line.trim() === '') { flush(); continue; }
      cur.push(line);
    }
  }
  flush();
  if (err) return { err };
  return { parked, resolved };
}

function parkStub(storePath, mdPath) {
  // Repo-relative when the target sits inside the repo; absolute
  // otherwise (temp fixtures, external lots).
  const rel = (p) => {
    const r = path.relative(REPO_ROOT, p);
    return r.startsWith('..') ? p : r;
  };
  return '# Parking lot — moved to the script-owned store\n\n' +
    `- Store: \`${rel(storePath)}\` — view with \`bee park list\` ` +
    '(--full for every field).\n' +
    '- Resolve is keeper-only (AGENTS.md); any agent may propose ' +
    'parking or resolving.\n' +
    `- History of the markdown lot: \`git log -- ${rel(mdPath)}\`.\n`;
}

function parkMigrate(args) {
  const f = flags(args, {
    check: { type: 'boolean' },
    store: { type: 'string' },
  }, true);
  if (f.error) return parkUsageErr(f.error);
  const pos = f.positionals;
  if (pos.length !== 1) {
    return parkUsageErr('bee park migrate: expected <md>');
  }
  const mdPath = path.resolve(pos[0]);
  const storePath = parkStorePathOf(f.values.store);
  let text;
  try {
    text = fs.readFileSync(mdPath, 'utf8');
  } catch (e) {
    return { code: 1, out: '',
      err: `bee park migrate: cannot read ${mdPath}: ${e.message}\n` };
  }
  const parsed = parseMarkdownLot(text);
  if (parsed.err) {
    return { code: 1, out: '', err: 'bee park migrate: ' + parsed.err };
  }
  const total = parsed.parked.length + parsed.resolved.length;
  if (total === 0) {
    return { code: 1, out: '',
      err: `bee park migrate: no PL-* entries found in ${mdPath} — ` +
        `already migrated? history: git log -- ${mdPath}\n` };
  }
  // Id-keyed store; an id in BOTH sections → the RESOLVED entry
  // wins, and its how line records the superseded parked copy.
  const order = [];
  const byId = new Map();
  for (const e of parsed.parked) {
    if (!byId.has(e.id)) order.push(e.id);
    byId.set(e.id, e);
  }
  const collisions = [];
  for (const e of parsed.resolved) {
    if (byId.has(e.id)) collisions.push(e.id);
    else order.push(e.id);
    byId.set(e.id, e);
  }
  for (const id of collisions) {
    const e = byId.get(id);
    e.how = e.how
      ? e.how + ' · superseded stale parked duplicate'
      : 'superseded stale parked duplicate';
  }
  const items = order.map((id) => byId.get(id));
  const summary = `${items.length} items · ${parsed.parked.length} ` +
    `parked · ${parsed.resolved.length} resolved` +
    (collisions.length > 0
      ? ` · ${collisions.length} id collisions (resolved wins): ` +
        collisions.join(', ')
      : '');
  if (f.values.check) {
    return { code: 0, out:
      `--check: would write ${storePath} (${summary})\n` +
      `--check: would replace ${mdPath} with the pointer stub:\n` +
      parkStub(storePath, mdPath), err: '' };
  }
  const w = writeStore('bee park', storePath, items,
    PARK_FIELDS, PARK_HEADER);
  if (w) return { code: 1, out: '', err: w };
  try {
    atomicWrite(mdPath, parkStub(storePath, mdPath));
  } catch (e) {
    return { code: 1, out: '',
      err: `bee park migrate: cannot write ${mdPath}: ${e.message}\n` };
  }
  return { code: 0, out: `bee park migrate: ${summary}\n` +
    `store: ${storePath}\n${mdPath} → pointer stub — bee park list to view\n`,
    err: '' };
}

// ---- design (P4 Task 4 — CLI surface over scripts/design.sh) ----
// The script is the mechanical core (determinism split): pick-up /
// implement / status exec it and pass its TOON output through; the
// machine block stays script-only territory (ADR-016). `new` is CLI
// work (file creation from the template, never a block edit).

const DESIGN_USAGE = `bee design — design docs (live → picked-up → implemented)

usage:
  bee design [status [--full]]
  bee design new "<title>" [--check]
  bee design pick-up <doc> --phase <n> [--check]
  bee design implement <doc> --phase <n> --merge <hash> [--check]

commands:
  status [--full]   every doc: name · state · phase; flags drift
                    (content changed after pick-up); --full adds
                    hash + merge. Bare 'bee design' = status.
  new "<title>"     copy the designs TEMPLATE to
                    designs/YYYY-MM-DD-<slug>.md with title + date
                    filled (machine block starts live); refuses to
                    overwrite an existing doc
  pick-up …         stamp picked-up + phase + frozen hash; only live
  implement …       stamp implemented + merge hash; only picked-up

flags:
  --check           mutations (new/pick-up/implement): never write;
                    report what would happen
  --full            status: add hash + merge

transitions + drift live in scripts/design.sh (the core); this CLI
adds nothing on top of them. env BEE_DESIGN_DIR overrides the
designs directory for every subcommand (test seam, shared with the
script); the template for 'new' always comes from this repo's
.hivemind/designs/TEMPLATE.md.
`;

function designUsageErr(e) {
  const msg = e && e.message ? e.message
    : String(e).replace(/^Error: /, '');
  return { code: 1, out: '', err: msg + '\n\n' + DESIGN_USAGE };
}

function designDirOf() {
  if (process.env.BEE_DESIGN_DIR) {
    return path.resolve(process.env.BEE_DESIGN_DIR.replace(/\/$/, ''));
  }
  // Match the delegated core (scripts/design.sh repo_root): the
  // designs dir follows the CWD's git toplevel, not bee.js's repo
  // (review r1 SF2 — the family must agree wherever it runs).
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'],
    { encoding: 'utf8' });
  if (r.status !== 0) {
    return { err: 'bee design: no git repository at ' + process.cwd() +
      ' — run inside a repo (or set BEE_DESIGN_DIR)\n' };
  }
  return path.join(r.stdout.trim(), '.hivemind', 'designs');
}

function designShown(p) {
  const rel = path.relative(REPO_ROOT, p);
  return rel.startsWith('..') ? p : rel;
}

function runDesignScript(args) {
  const script = path.join(REPO_ROOT, 'scripts', 'design.sh');
  if (!fs.existsSync(script)) {
    return { code: 1, out: '',
      err: `bee design: missing ${script} — check the checkout\n` };
  }
  const r = spawnSync('bash', [script, ...args], {
    encoding: 'utf8',
    env: { ...process.env, BEE_DESIGN_PROG: 'bee design' },
  });
  if (r.error) {
    return { code: 1, out: '',
      err: `bee design: cannot run ${script}: ${r.error.message}\n` };
  }
  return { code: r.status ?? 1, out: r.stdout ?? '', err: r.stderr ?? '' };
}

function cmdDesign(rest) {
  const [sub] = rest;
  if (sub === undefined || sub === 'status' || sub.startsWith('--')) {
    return designStatus(sub === 'status' ? rest.slice(1) : rest);
  }
  if (sub === 'new') return designNew(rest.slice(1));
  if (sub === 'pick-up') {
    return designDelegate('pick-up', rest.slice(1),
      { phase: { type: 'string' }, check: { type: 'boolean' } });
  }
  if (sub === 'implement') {
    return designDelegate('implement', rest.slice(1),
      { phase: { type: 'string' }, merge: { type: 'string' },
        check: { type: 'boolean' } });
  }
  if (sub === 'help') return { code: 0, out: DESIGN_USAGE, err: '' };
  return { code: 1, out: '',
    err: `bee design: unknown subcommand '${sub}'\n\n` + DESIGN_USAGE };
}

function designStatus(args) {
  const f = flags(args, { full: { type: 'boolean' } }, true);
  if (f.error) return designUsageErr(f.error);
  if (f.positionals.length > 0) {
    return designUsageErr(
      `bee design status: unexpected argument '${f.positionals[0]}'`);
  }
  return runDesignScript(
    f.values.full ? ['status', '--full'] : ['status']);
}

function designDelegate(sub, args, spec) {
  const f = flags(args, spec, true);
  if (f.error) return designUsageErr(f.error);
  if (f.positionals.length !== 1) {
    return designUsageErr(`bee design ${sub}: expected <doc>`);
  }
  const out = [];
  if (f.values.phase !== undefined) out.push('--phase', f.values.phase);
  if (f.values.merge !== undefined) out.push('--merge', f.values.merge);
  if (f.values.check) out.push('--check');
  return runDesignScript([sub, ...f.positionals, ...out]);
}

function designSlug(title) {
  return title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64)
    .replace(/-+$/g, '');
}

function localDateStamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' +
    p(d.getDate());
}

function designNew(args) {
  const f = flags(args, { check: { type: 'boolean' } }, true);
  if (f.error) return designUsageErr(f.error);
  const pos = f.positionals;
  if (pos.length !== 1 || pos[0] === '') {
    return designUsageErr('bee design new: expected "<title>"');
  }
  const title = pos[0];
  if (title.includes('\n')) {
    return { code: 1, out: '',
      err: 'bee design: field values must be single-line\n' };
  }
  const slug = designSlug(title);
  if (slug === '') {
    return { code: 1, out: '',
      err: `bee design new: title '${title}' yields an empty slug — ` +
        'give it letters or digits\n' };
  }
  const template = path.join(REPO_ROOT, '.hivemind', 'designs',
    'TEMPLATE.md');
  let text;
  try {
    text = fs.readFileSync(template, 'utf8');
  } catch (e) {
    return { code: 1, out: '',
      err: `bee design new: cannot read template ${template}: ` +
        `${e.message}\n` };
  }
  const date = localDateStamp();
  if (!text.includes('<Title>') ||
      !text.includes('**Date:** YYYY-MM-DD')) {
    return { code: 1, out: '',
      err: `bee design new: template lost a placeholder (<Title> or ` +
        `**Date:** YYYY-MM-DD) — hand-fix ${template}, then re-run\n` };
  }
  text = text.replace('<Title>', () => title) // replacer fn: $-sequences in titles stay literal (review r1 SF1)
    .replace('**Date:** YYYY-MM-DD', `**Date:** ${date}`);
  const dir = designDirOf();
  if (dir.err) return { code: 1, out: '', err: dir.err };
  const file = path.join(dir, `${date}-${slug}.md`);
  if (fs.existsSync(file)) {
    return { code: 1, out: '',
      err: `bee design new: ${designShown(file)} already exists — ` +
        `refusing to overwrite\n` +
        `fix: pick a different title, or continue the existing doc ` +
        `— bee design status\n` };
  }
  if (f.values.check) {
    return { code: 0, out: `--check: would create ${designShown(file)} ` +
      `from ${designShown(template)}\n` +
      `# ${title} — design note\n**Date:** ${date}\n`, err: '' };
  }
  try {
    fs.mkdirSync(dir, { recursive: true });
    atomicWrite(file, text);
  } catch (e) {
    return { code: 1, out: '',
      err: `bee design new: cannot write ${file}: ${e.message}\n` };
  }
  return { code: 0,
    out: `created ${designShown(file)}\n` +
      `next: fill the sections, get the keeper's blessing, then ` +
      `bee design pick-up ${designShown(file)} --phase <n>\n`,
    err: '' };
}

if (process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = run(process.argv.slice(2));
  if (r.out) process.stdout.write(r.out);
  if (r.err) process.stderr.write(r.err);
  process.exitCode = r.code;
}

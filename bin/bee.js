#!/usr/bin/env node
// bee — BeeHarness CLI. `bee report`, `bee init`, `bee inbox`,
// `bee capture`, `bee park`, `bee design`, `bee verify`, `bee task`,
// `bee guidance`, `bee phase`.
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
  bee verify --plan <path> [--task <n>] [--base <ref>] [--record] [--check]
  bee task   show <plan-path> [--full]
             | move <plan-path> <task-n> <state>
               [--origin <role>] [--record <path>] [--check]
  bee guidance [list [--full]] | show <topic>
  bee phase  [list [--full]]
             | inventory <phase-id> --decisions <file> [--origin <role>]
             | close <phase-id> [--check]
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
  if (cmd === 'verify') {
    return cmdVerify(rest);
  }
  if (cmd === 'task') {
    return cmdTask(rest);
  }
  if (cmd === 'guidance') {
    return cmdGuidance(rest);
  }
  if (cmd === 'phase') {
    return cmdPhase(rest);
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
  --origin <role>      provenance; picks the id series from role
                       initials (power-planner → PL-PP-NNN;
                       default bee → PL-NNN)
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

// ADR-007 role-initials convention: a hyphenated role name maps
// to the first letter of each word (power-planner → PP,
// project-orchestrator → PO); short codes pass through (pp → PP).
function parkOriginTag(origin) {
  if (origin.includes('-')) {
    return origin.split('-').map((w) => w[0] || '').join('').toUpperCase();
  }
  return origin.toUpperCase();
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
  const tag = parkOriginTag(origin);
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
// lot into the store. The md file's own shape (from the legacy
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

// ---- verify (P4 Task 5 — plan-header checks + logbook evidence) ----
// The plan's machine header names the checks (the contract in
// skills/loop/bee-plan/assets/plan-template.md); bee verify runs
// them, link-checks changed docs, structure-checks the repo map
// (Task 8), and emits the logbook entry a state move needs
// (ADR-006: the entry IS the evidence).

const VERIFY_USAGE = `bee verify — run a plan's header checks, record the evidence

usage:
  bee verify --plan <path> [--task <n>] [--base <ref>] [--record] [--check]

flags:
  --plan <path>   the plan to verify; its machine header names the
                  checks
  --task <n>      run only task-<n>'s checks (default: all)
  --base <ref>    link-check base ref (default main): every
                  repo-relative markdown link in docs changed in
                  git diff <base>..HEAD is resolved; broken → FAIL
  --record        write the logbook entry even on FAIL (a run with
                  passing checks writes it by default)
  --role <role>   producing role stamped in the entry (default bee)
  --check         never write; preview the logbook entry
  --logbook <dir> internal: logbook directory
                  (default <plan-root>/.hivemind/logbook)

checks contract (plan machine header; one entry per task):
  checks:
    - id: task-<n>
      cmd: <command proving the step>   (optional)
      expect: exit 0                    (only form this phase)
      files: [<path>, <path>]           (optional; must exist)
  cmd and files are individually optional; at least one required.

output: TOON — task-<n> · cmd · PASS|FAIL · note; every FAIL carries
a fix: line (ruling 4 — agent-facing self-correction); exit 1 on
any FAIL. structure: runs scripts/structure-check.sh (beside this
CLI) against the plan root when it carries scripts/structure.map;
skips with a note otherwise (other repos adopt by adding a map).
logbook entry <plan-slug>-task<n>-verify-<rN>.md (one per
task checked; next free rN): machine header (role, date, verdict,
checks-run, plan path + hash); prose body only for anomalies
(empty body = clean run).
`;

function verifyUsageErr(e) {
  const msg = e && e.message ? e.message
    : String(e).replace(/^Error: /, '');
  return { code: 1, out: '', err: msg + '\n\n' + VERIFY_USAGE };
}

// Parse a plan's FIRST <!-- machine … --> block. Only the first —
// verbatim template blocks inside the plan's fenced code also
// open with '<!-- machine'. Returns { header } or { err }.
export function parsePlanHeader(text, label = 'the plan') {
  const lines = text.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/<!--\s*machine/.test(lines[i])) { start = i; break; }
  }
  if (start === -1) {
    return { err: `bee verify: ${label} has no <!-- machine --> header — ` +
      'plans carry one; shape: ' +
      'skills/loop/bee-plan/assets/plan-template.md\n' };
  }
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].trim().startsWith('-->')) { end = i; break; }
  }
  if (end === -1) {
    return { err: `bee verify: ${label} machine header never closes ` +
      '(missing -->)\n' };
  }
  const header = { phase: '', validation: '', stateSource: '',
    design: '', suite: '', targets: [], checks: [] };
  let mode = 'none';
  let cur = null;
  for (let i = start + 1; i < end; i++) {
    const raw = lines[i];
    const t = raw.trim();
    if (t === '') continue;
    const indent = raw.length - raw.trimStart().length;
    if (t.startsWith('- ')) {
      const rest = t.slice(2).trim();
      if (mode === 'targets') {
        const m = /^(.*?)\s*\((create|modify)\)$/.exec(rest);
        header.targets.push(m
          ? { path: m[1], verb: m[2] }
          : { path: rest, verb: '' });
      } else if (mode === 'checks') {
        cur = { line: i + 1 };
        header.checks.push(cur);
        const bm = /^([A-Za-z-]+):\s*(.*)$/.exec(rest);
        if (bm && ['id', 'cmd', 'expect', 'files'].includes(bm[1])) {
          cur[bm[1]] = bm[2].trim();
        }
      }
      continue;
    }
    const m = /^([A-Za-z-]+):\s*(.*)$/.exec(t);
    if (!m) continue; // stray line — ignore
    const key = m[1], val = m[2].trim();
    if (indent === 0) {
      cur = null;
      if (key === 'targets') { mode = 'targets'; continue; }
      if (key === 'checks') { mode = 'checks'; continue; }
      mode = 'none';
      if (key === 'phase') header.phase = val;
      else if (key === 'validation') header.validation = val;
      else if (key === 'state-source') header.stateSource = val;
      else if (key === 'design') header.design = val;
      else if (key === 'suite') header.suite = val;
      // unknown top-level keys: ignored (forward-compatible)
      continue;
    }
    // indented key while collecting checks → sub-field of the
    // current entry (bullets are '- …'; sub-fields sit deeper)
    if (mode === 'checks' && cur &&
        ['id', 'cmd', 'expect', 'files'].includes(key)) {
      cur[key] = val;
    }
  }
  const seen = new Set();
  for (const ch of header.checks) {
    if (!/^task-\d+$/.test(ch.id ?? '')) {
      return { err: `bee verify: checks entry (machine line ${ch.line}) ` +
        `needs id: task-<n>` +
        (ch.id !== undefined ? ` — got '${ch.id}'` : '') +
        ' — see the checks contract in ' +
        'skills/loop/bee-plan/assets/plan-template.md\n' };
    }
    if (seen.has(ch.id)) {
      return { err: `bee verify: duplicate checks id '${ch.id}' — ` +
        'one entry per task\n' };
    }
    seen.add(ch.id);
    ch.n = Number(ch.id.slice(5));
    ch.filesList = ch.files === undefined ? []
      : ch.files.replace(/^\[/, '').replace(/\]$/, '')
          .split(',').map((s) => s.trim()).filter((s) => s !== '');
    if (ch.cmd === undefined && ch.filesList.length === 0) {
      return { err: `bee verify: checks entry '${ch.id}' has neither ` +
        'cmd nor files — at least one is required\n' };
    }
    if (ch.expect !== undefined && ch.expect !== 'exit 0') {
      return { err: `bee verify: checks entry '${ch.id}': ` +
        `expect '${ch.expect}' — expect: exit 0 is the only form ` +
        'this phase\n' };
    }
  }
  return { header };
}

function verifyTimeoutMs() {
  return Number(process.env.BEE_VERIFY_TIMEOUT_MS ?? 600000);
}

function firstOutputLine(r) {
  const src = (r.stderr || '') + '\n' + (r.stdout || '');
  for (const l of src.split('\n')) {
    if (l.trim() !== '') return truncText(l.trim(), 80);
  }
  return '';
}

function runCheckEntry(ch, root, full = false) {
  const notes = [];
  const fixes = [];
  let pass = true;
  if (ch.cmd !== undefined) {
    // review r1 fix: strip the Node test-runner's child-mode marker
    // (NODE_TEST_CONTEXT) — a `node --test` check cmd spawned from
    // inside a test-runner process inherits it and silently exits 0
    // on failure; the check's verdict must be the command's own.
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    const r = spawnSync('sh', ['-c', ch.cmd], {
      cwd: root, encoding: 'utf8',
      timeout: verifyTimeoutMs(), env,
    });
    const timedOut = (r.signal === 'SIGTERM' && r.error !== undefined) ||
      (r.error !== undefined && r.error.code === 'ETIMEDOUT');
    if (timedOut || (r.signal && r.error === undefined)) {
      // review r1 fix: timeout/signal checked FIRST — a hung command
      // lands in "did not finish", not the misleading "make it runnable"
      pass = false;
      notes.push(`${timedOut ? 'timeout' : 'signal'} ${r.signal ?? ''}` +
        ` (after ${verifyTimeoutMs() / 1000}s)`);
      fixes.push(`fix: '${truncText(ch.cmd, 50)}' did not finish — ` +
        'repair or shorten it');
    } else if (r.error) {
      pass = false;
      notes.push(`cannot run: ${r.error.message}`);
      fixes.push(`fix: make '${truncText(ch.cmd, 50)}' runnable`);
    } else if (r.status === 0) {
      notes.push('exit 0');
    } else {
      pass = false;
      const l = firstOutputLine(r);
      notes.push(`exit ${r.status}` + (l ? `: ${l}` : ''));
      fixes.push(`fix: run '${truncText(ch.cmd, 50)}' and repair what ` +
        'it reports until exit 0');
    }
  }
  if (ch.filesList.length > 0) {
    const missing = ch.filesList.filter(
      (p) => !fs.existsSync(path.resolve(root, p)));
    if (missing.length > 0) {
      pass = false;
      notes.push(`missing: ${missing.join(', ')}`);
      for (const p of missing) {
        fixes.push(`fix: ${p} — place it or fix the path`);
      }
    } else {
      notes.push(`${ch.filesList.length} file` +
        (ch.filesList.length === 1 ? '' : 's'));
    }
  }
  const shown = ch.cmd !== undefined
    ? (full ? ch.cmd : truncText(ch.cmd, 60))
    : `files: ${full ? ch.filesList.join(', ')
      : truncText(ch.filesList.join(', '), 40)}`;
  return { id: ch.id, n: ch.n, pass, note: notes.join(' · '), fixes,
    shown };
}

// Links: every repo-relative markdown link in a changed doc must
// resolve. Fenced code blocks are excluded; URLs, anchors,
// absolute paths, and ~ paths are not repo-relative.
function isRepoRelativeLink(t) {
  if (t === '') return false;
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(t)) return false; // scheme
  if (t.startsWith('#') || t.startsWith('/') || t.startsWith('~')) {
    return false;
  }
  return true;
}

function docLinkFindings(root, doc) {
  const abs = path.join(root, doc);
  const text = fs.readFileSync(abs, 'utf8');
  const findings = [];
  let nLinks = 0;
  let inFence = false;
  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(```|~~~)/.test(lines[i])) { inFence = !inFence; continue; }
    if (inFence) continue;
    // Inline-code spans are skipped the way fences are: docs show
    // link EXAMPLES in backticks, not links to check (task-6
    // deviation fix — the task-5 review's latent-edge note (c),
    // applied after its own examples bit for real).
    const bare = lines[i].replace(/``.*?``/g, '')
      .replace(/`[^`]*`/g, '');
    const targets = [];
    // Angle-bracketed destinations get their own branch so spaced
    // targets (<a b.md>) capture whole (same note, edge (a)).
    for (const m of bare
      .matchAll(/\[[^\]]*\]\(\s*(?:<([^<>]*)>|<?([^)\s<>]+)>?[^)]*\))/g)) {
      targets.push(m[1] ?? m[2]);
    }
    for (const m of bare
      .matchAll(/^\s{0,3}\[[^\]]+\]:\s*(?:<([^<>]*)>|([^\s<>]+))/g)) {
      targets.push(m[1] ?? m[2]);
    }
    for (const t of targets) {
      const clean = t.split('#')[0];
      if (!isRepoRelativeLink(clean)) continue;
      nLinks++;
      if (!fs.existsSync(path.resolve(path.dirname(abs), clean))) {
        findings.push({ doc, line: i + 1, target: clean });
      }
    }
  }
  return { nLinks, findings };
}

function changedDocsForLinks(root, base) {
  const inside = spawnSync('git',
    ['rev-parse', '--is-inside-work-tree'],
    { cwd: root, encoding: 'utf8' });
  if (inside.status !== 0) {
    return { skip: 'no git repo at plan root — link-check needs git' };
  }
  const r = spawnSync('git', ['diff', '--name-only', `${base}..HEAD`],
    { cwd: root, encoding: 'utf8' });
  if (r.status !== 0) {
    return { err: `bee verify: --base '${base}' does not resolve (` +
      `${firstOutputLine(r) || 'git exit ' + r.status}) — ` +
      `fix: pass a ref that exists here: git -C . rev-parse ${base}\n` };
  }
  return { docs: r.stdout.split('\n').filter(Boolean)
    .filter((f) => f.endsWith('.md'))
    .filter((f) => fs.existsSync(path.join(root, f))) };
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function nextVerifyRound(logbookDir, stem, taskN) {
  let max = 0;
  let names = [];
  try {
    names = fs.readdirSync(logbookDir);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
  }
  const re = new RegExp(
    `^${escapeRe(stem)}-task${taskN}-verify-r(\\d+)\\.md$`);
  for (const n of names) {
    const m = re.exec(n);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max + 1;
}

function verifyEntryText(role, verdict, checksRun, planShown, planHash,
  anomalies) {
  let e = '<!-- machine\n' +
    `role: ${role}\n` +
    `date: ${isoStampLocal()}\n` +
    `verdict: ${verdict}\n` +
    `checks-run: ${checksRun}\n` +
    `plan: ${planShown} @ ${planHash}\n` +
    '-->\n';
  if (anomalies && anomalies.trim() !== '') {
    e += '\n' + anomalies.trimEnd() + '\n';
  }
  return e;
}

function cmdVerify(rest) {
  if (rest[0] === 'help') {
    return { code: 0, out: VERIFY_USAGE, err: '' };
  }
  const f = flags(rest, {
    plan: { type: 'string' },
    task: { type: 'string' },
    base: { type: 'string' },
    record: { type: 'boolean' },
    check: { type: 'boolean' },
    role: { type: 'string' },
    logbook: { type: 'string' },
    full: { type: 'boolean' },
  });
  if (f.error) return verifyUsageErr(f.error);
  if (f.values.plan === undefined) {
    return verifyUsageErr('bee verify: --plan <path> is required — ' +
      'fix: e.g. bee verify --plan .hivemind/plans/<slug>.md');
  }
  const planPath = path.resolve(f.values.plan);
  let text;
  try {
    text = fs.readFileSync(planPath, 'utf8');
  } catch (e) {
    return { code: 1, out: '',
      err: `bee verify: cannot read ${planPath}: ${e.message} — ` +
        'fix: point --plan at an existing plan\n' };
  }
  const parsed = parsePlanHeader(text, planPath);
  if (parsed.err) return { code: 1, out: '', err: parsed.err };
  const header = parsed.header;

  let scope = header.checks;
  if (f.values.task !== undefined) {
    if (!/^\d+$/.test(f.values.task)) {
      return verifyUsageErr(`bee verify: --task expects a task number, ` +
        `got '${f.values.task}'`);
    }
    const id = 'task-' + f.values.task;
    scope = header.checks.filter((c) => c.id === id);
    if (scope.length === 0) {
      const ids = header.checks.map((c) => c.id).join(', ');
      return { code: 1, out: '',
        err: `bee verify: no check '${id}' in ${planPath} — ` +
          (ids !== '' ? `checks here: ${ids}`
            : 'the plan declares no checks') +
          '\nfix: run without --task for all checks, or use a ' +
          'number from the list\n' };
    }
  }

  const planDir = path.dirname(planPath);
  const rootR = spawnSync('git', ['rev-parse', '--show-toplevel'],
    { cwd: planDir, encoding: 'utf8' });
  const planRoot = rootR.status === 0
    ? rootR.stdout.trim() : planDir;

  const results = scope.map((ch) =>
    runCheckEntry(ch, planRoot, f.values.full === true));

  const base = f.values.base ?? 'main';
  const lc = changedDocsForLinks(planRoot, base);
  if (lc.err) return { code: 1, out: '', err: lc.err };
  let linksLine;
  const linkFindings = [];
  if (lc.skip) {
    linksLine = `links · skipped · ${lc.skip}`;
  } else {
    let nLinks = 0;
    for (const doc of lc.docs) {
      const r = docLinkFindings(planRoot, doc);
      nLinks += r.nLinks;
      linkFindings.push(...r.findings);
    }
    linksLine = `links · ${lc.docs.length} docs · ` +
      (linkFindings.length === 0 ? 'PASS' : 'FAIL') +
      ` · ${nLinks} links checked` +
      (linkFindings.length > 0
        ? `, ${linkFindings.length} broken` : '');
  }

  // Structure (Task 8 — manifest map): runs bee's own shipped
  // scripts/structure-check.sh against the plan root whenever the
  // repo carries scripts/structure.map (skips with a note when
  // not — other repos adopt by adding a map). Findings fail the
  // run like link findings do.
  const mapPath = path.join(planRoot, 'scripts', 'structure.map');
  let structureLine;
  const structureFindings = [];
  if (!fs.existsSync(mapPath)) {
    structureLine = 'structure · skipped · no scripts/structure.map ' +
      'at the plan root — add one to adopt the structure check';
  } else {
    const sr = spawnSync('bash',
      [path.join(REPO_ROOT, 'scripts', 'structure-check.sh'), planRoot],
      { cwd: planRoot, encoding: 'utf8', timeout: verifyTimeoutMs() });
    const sLines = (sr.stdout ?? '').split('\n')
      .map((l) => l.trimEnd()).filter((l) => l !== '');
    const sTimedOut = (sr.signal === 'SIGTERM' && sr.error !== undefined) ||
      (sr.error !== undefined && sr.error.code === 'ETIMEDOUT');
    if (sTimedOut || (sr.signal && sr.error === undefined)) {
      // review r1 fix: timeout/signal checked FIRST (the task-5
      // lesson) — a hung check lands in "did not finish"
      structureLine = 'structure · FAIL · ' +
        (sTimedOut ? 'timeout' : 'signal') + ' ' + (sr.signal ?? '');
      structureFindings.push('fix: structure-check.sh did not ' +
        'finish — repair or shorten it');
    } else if (sr.error) {
      structureLine = 'structure · FAIL · cannot run: ' + sr.error.message;
      structureFindings.push('fix: bee needs scripts/' +
        'structure-check.sh beside bin/bee.js — restore it or drop ' +
        'the map');
    } else if (sr.status === 0) {
      structureLine = 'structure · map · PASS · ' +
        (sLines[0] ?? '0 findings');
    } else {
      structureLine = 'structure · map · FAIL · ' +
        (sLines[0] ?? `exit ${sr.status}`);
      structureFindings.push(...sLines.slice(1));
      if (sLines.length <= 1) {
        structureFindings.push('structure-check.sh: ' +
          (firstOutputLine(sr) || `exit ${sr.status}`));
      }
    }
  }

  const nPass = results.filter((r) => r.pass).length;
  const nFail = results.length - nPass;
  const anyFail = nFail > 0 || linkFindings.length > 0 ||
    structureFindings.length > 0;
  let out = '';
  if (results.length === 0) {
    out += '0 checks\n' +
      'fix: add a checks: block to the plan machine header — one ' +
      'entry per task (skills/loop/bee-plan/assets/plan-template.md)\n';
  } else {
    out += `${results.length} checks · ${nPass} pass · ${nFail} fail\n`;
  }
  for (const r of results) {
    out += `${r.id} · ${r.shown} · ${r.pass ? 'PASS' : 'FAIL'} · ` +
      `${r.note}\n`;
    for (const fx of r.fixes) out += `  ${fx}\n`;
  }
  out += linksLine + '\n';
  for (const b of linkFindings) {
    out += `  ${b.doc}:${b.line} → ${b.target}\n`;
    out += `  fix: repair the link or the target (${b.target})\n`;
  }
  out += structureLine + '\n';
  for (const l of structureFindings) {
    out += `  ${l}\n`;
  }

  // Logbook emission: one entry per task checked; written when
  // the run passed (evidence), or with --record (a failing round
  // still records). --check previews; 0 checks → nothing to
  // evidence.
  const checksRun = results.length;
  const stem = path.basename(planPath, '.md');
  const logbookDir = f.values.logbook !== undefined
    ? path.resolve(f.values.logbook)
    : path.join(planRoot, '.hivemind', 'logbook');
  const relPlan = path.relative(planRoot, planPath);
  const hashR = spawnSync('git', ['log', '-1', '--format=%h', '--', relPlan],
    { cwd: planRoot, encoding: 'utf8' });
  const planHash = hashR.status === 0 && hashR.stdout.trim() !== ''
    ? hashR.stdout.trim() : '-';
  const planShown = designShown(planPath);
  const role = f.values.role || 'bee';

  if (f.values.record && checksRun === 0) {
    out += 'logbook: not written (0 checks ran — nothing to record)\n';
  }
  // review r1 fix: unscoped full runs write only with --record (a
  // status-shaped sweep must not mint one entry per task); scoped
  // --task runs keep writing on success as the loop's evidence.
  // task-6 deviation fix: link findings fail the run too — any
  // FAIL (checks OR links) records nothing without --record, per
  // the documented contract (a scoped link-FAIL used to mint an
  // unintended entry).
  const scoped = f.values.task !== undefined;
  const willWrite = checksRun > 0 &&
    (scoped ? (!anyFail || f.values.record === true)
      : f.values.record === true);
  if (checksRun > 0 && nFail === 0 && !scoped && !f.values.record) {
    out += 'logbook: not written (unscoped run — pass --task <n> or ' +
      '--record to evidence)\n';
  }
  if (scoped && anyFail && !f.values.record) {
    out += 'logbook: not written (FAIL — pass --record to capture ' +
      'this round)\n';
  }
  if (willWrite) {
    const byTask = new Map();
    for (const r of results) {
      if (!byTask.has(r.n)) byTask.set(r.n, []);
      byTask.get(r.n).push(r);
    }
    for (const [n, trs] of byTask) {
      const taskFail = trs.filter((r) => !r.pass);
      const verdict = taskFail.length === 0 &&
        linkFindings.length === 0 &&
        structureFindings.length === 0 ? 'PASS' : 'FAIL';
      let anomalies = '';
      for (const r of taskFail) {
        anomalies += `${r.id} · ${r.shown} · FAIL · ${r.note}\n`;
        for (const fx of r.fixes) anomalies += `${fx}\n`;
      }
      if (linkFindings.length > 0) {
        anomalies += linksLine + '\n';
        for (const b of linkFindings) {
          anomalies += `${b.doc}:${b.line} → ${b.target}\n`;
        }
      }
      if (structureFindings.length > 0) {
        anomalies += structureLine + '\n';
        for (const l of structureFindings) {
          anomalies += `${l}\n`;
        }
      }
      const round = nextVerifyRound(logbookDir, stem, n);
      const file = path.join(logbookDir,
        `${stem}-task${n}-verify-r${round}.md`);
      const entry = verifyEntryText(role, verdict, trs.length,
        planShown, planHash, anomalies);
      if (f.values.check) {
        out += `--check: would write ${designShown(file)}\n${entry}`;
      } else {
        try {
          fs.mkdirSync(logbookDir, { recursive: true });
          atomicWrite(file, entry);
        } catch (e) {
          return { code: 1, out: '',
            err: `bee verify: cannot write ${file}: ${e.message}\n` };
        }
        out += `logbook: ${designShown(file)}\n`;
      }
    }
  }
  return { code: anyFail ? 1 : 0, out, err: '' };
}

// ---- task (P4 Task 6 — work-item state moves, script-owned) ----
// The work-item state (GLOSSARY: work-item states) lives in the
// plan itself: the task's checkboxes (done ⇄ all ticked) + a
// state ledger inside the machine block (intermediate states;
// provenance on every line). Header parsing is parsePlanHeader's,
// reused — its checks list is the task universe, and it ignores
// the ledger's task-<n>: keys (forward-compatible); the ledger
// lines are parsed here.

const TASK_STATES = ['draft', 'implemented', 'verified', 'reviewed',
  'done'];

const TASK_USAGE = `bee task — work-item states of a plan (script-owned)

usage:
  bee task show <plan-path> [--full]
  bee task move <plan-path> <task-n> <state>
                [--origin <role>] [--record <path>] [--check]

states (forward only): draft → implemented → verified → reviewed → done
  done   every checkbox of the task's section ticks '- [x]'
  draft  the section's checkboxes untick to '- [ ]'
  other  intermediate states ride the ledger only; the body is
         never touched (checkbox rewrites are byte-exact: only
         the '- [ ]'/'- [x]' marker changes)

the ledger — one line per move, appended inside the plan's
machine block before '-->' (script territory):
  task-<n>: <state> <ISO-8601> by <role>[ record: <verify entry>]
the last ledger line for a task is its state; with no lines the
state derives from the boxes (all ticked → done, else draft).

move rules:
  unknown task number      exit 1 + the tasks the plan declares
  backwards move           exit 1 + fix (moves go forward only;
                           undo = hand-correct the ledger line)
  same state               no-op note, exit 0
  done without --record    exit 1 + fix — done needs the verify
                           entry path (existence-checked; judging
                           the entry's content stays with the loop)
  --record elsewhere       usage error (it evidences done moves)

flags:
  --origin <role>  provenance on the ledger line (default bee)
  --record <path>  verify entry path, required for done
  --full           show: the last ledger line per task
  --check          move: never write; report what would happen

<task-n> accepts 6 or task-6. bee verify parses plans with
parsePlanHeader, which ignores the ledger lines — the header
contract is unaffected.
`;

function taskUsageErr(e) {
  const msg = e && e.message ? e.message
    : String(e).replace(/^Error: /, '');
  return { code: 1, out: '', err: msg + '\n\n' + TASK_USAGE };
}

// The FIRST machine block's line range — the same first-only
// rule parsePlanHeader applies (fenced copies inside the plan
// body are not the header). Called after parsePlanHeader has
// already accepted the plan, so null is defensive only.
function machineRange(lines) {
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (/<!--\s*machine/.test(lines[i])) { start = i; break; }
  }
  if (start === -1) return null;
  let end = -1;
  for (let i = start + 1; i < lines.length; i++) {
    if (lines[i].trim().startsWith('-->')) { end = i; break; }
  }
  return end === -1 ? null : { start, end };
}

// Ledger lines: 'task-<n>: <state> <ISO-timestamp> by <role>
// [record: <path>]' at the machine block's top level. A line
// that starts like one but does not parse is a hand-fix finding.
const TASK_LEDGER_RE =
  /^task-(\d+):\s+(\S+)\s+(\S+)\s+by\s+(\S+)(?:\s+record:\s+(\S+))?$/;

function parseTaskLedger(lines, range, label) {
  const byTask = new Map();
  for (let i = range.start + 1; i < range.end; i++) {
    const line = lines[i];
    if (!/^task-\d+\s*:/.test(line)) continue;
    const m = TASK_LEDGER_RE.exec(line);
    if (!m || !TASK_STATES.includes(m[2])) {
      return { err: `bee task: cannot parse ledger line ${i + 1} of ` +
        `${label}: '${truncText(line, 60)}' — expected 'task-<n>: ` +
        `<state> <ISO-timestamp> by <role>[ record: <path>]'\n` +
        'fix: hand-correct the ledger line in the machine block, ' +
        'then re-run\n' };
    }
    const n = Number(m[1]);
    if (!byTask.has(n)) byTask.set(n, []);
    byTask.get(n).push(
      { state: m[2], ts: m[3], role: m[4], record: m[5] });
  }
  return { byTask };
}

// The task's body region: from its '## Task <n>:' heading to
// the next '## ' heading (a following task or '## Phase exit').
function taskSectionRange(lines, n) {
  const re = new RegExp(`^## Task ${n}:`);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (re.test(lines[i])) { start = i; break; }
  }
  if (start === -1) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^## /.test(lines[i])) { end = i; break; }
  }
  return { start, end };
}

function taskCheckboxStats(lines, range) {
  let total = 0;
  let checked = 0;
  let inFence = false;
  for (let i = range.start + 1; i < range.end; i++) {
    // review r1 fix: fenced verbatim blocks are not step boxes —
    // the fence rule docLinkFindings applies (plans carry
    // path=-tagged contracts inside task sections).
    if (/^\s*(```|~~~)/.test(lines[i])) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = /^(\s*)- \[( |x)\]/.exec(lines[i]);
    if (m) { total++; if (m[2] === 'x') checked++; }
  }
  return { total, checked };
}

function taskCurrentState(entries, stats) {
  if (entries.length > 0) return entries[entries.length - 1].state;
  return stats.total > 0 && stats.checked === stats.total
    ? 'done' : 'draft';
}

// Ledger record paths display repo-relative inside the plan's
// repo (house convention), absolute outside it.
function taskRecordShown(absRecord, planPath) {
  const rootR = spawnSync('git', ['rev-parse', '--show-toplevel'],
    { cwd: path.dirname(planPath), encoding: 'utf8' });
  if (rootR.status === 0) {
    const rel = path.relative(rootR.stdout.trim(), absRecord);
    if (!rel.startsWith('..')) return rel;
  }
  return absRecord;
}

function cmdTask(rest) {
  const [sub] = rest;
  if (sub === undefined || sub === 'show' || sub.startsWith('--')) {
    return taskShow(sub === 'show' ? rest.slice(1) : rest);
  }
  if (sub === 'move') return taskMove(rest.slice(1));
  if (sub === 'help') return { code: 0, out: TASK_USAGE, err: '' };
  return { code: 1, out: '',
    err: `bee task: unknown subcommand '${sub}'\n\n` + TASK_USAGE };
}

function readPlanFor(cmd, planArg) {
  const planPath = path.resolve(planArg);
  let text;
  try {
    text = fs.readFileSync(planPath, 'utf8');
  } catch (e) {
    return { err: `bee ${cmd}: cannot read ${planPath}: ${e.message}` +
      ' — fix: point at an existing plan\n' };
  }
  const parsed = parsePlanHeader(text, planPath);
  if (parsed.err) return { err: parsed.err };
  const lines = text.split('\n');
  const range = machineRange(lines);
  if (!range) {
    return { err: `bee ${cmd}: ${planPath} machine header never ` +
      'closes (missing -->)\n' };
  }
  return { planPath, text, lines, range, header: parsed.header };
}

function taskShow(args) {
  const f = flags(args, { full: { type: 'boolean' } }, true);
  if (f.error) return taskUsageErr(f.error);
  const pos = f.positionals;
  if (pos.length !== 1) {
    return taskUsageErr('bee task show: expected <plan-path> — ' +
      'fix: e.g. bee task show .hivemind/plans/<slug>.md');
  }
  const r = readPlanFor('task show', pos[0]);
  if (r.err) return { code: 1, out: '', err: r.err };
  const ledger = parseTaskLedger(r.lines, r.range, r.planPath);
  if (ledger.err) return { code: 1, out: '', err: ledger.err };
  const checks = r.header.checks;
  if (checks.length === 0) {
    return { code: 0, out: '0 tasks\n' +
      'fix: add a checks: block to the plan machine header — one ' +
      'entry per task (skills/loop/bee-plan/assets/plan-template.md)\n',
      err: '' };
  }
  const rows = checks.map((ch) => {
    const section = taskSectionRange(r.lines, ch.n);
    const stats = section
      ? taskCheckboxStats(r.lines, section) : { total: 0, checked: 0 };
    const entries = ledger.byTask.get(ch.n) ?? [];
    const state = taskCurrentState(entries, stats);
    const rawTitle = section
      ? (/^## Task \d+: ?(.*)$/.exec(r.lines[section.start])?.[1] ?? '')
        .trim()
      : 'no task section in body';
    // review r1 fix: --full relieves the title truncation
    const title = f.values.full ? rawTitle : truncText(rawTitle, 48);
    return { ch, state, stats, entries, title };
  });
  const nDone = rows.filter((x) => x.state === 'done').length;
  let out = `${rows.length} tasks · ${nDone} done\n`;
  for (const x of rows) {
    out += `${x.ch.id} · ${x.state} · ${x.stats.checked}/${x.stats.total}` +
      ` steps · ${x.title}\n`;
    if (f.values.full && x.entries.length > 0) {
      const e = x.entries[x.entries.length - 1];
      out += `  last: ${e.state} ${e.ts} by ${e.role}` +
        (e.record !== undefined ? ` · record: ${e.record}` : '') + '\n';
    }
  }
  return { code: 0, out, err: '' };
}

function taskMove(args) {
  const f = flags(args, {
    origin: { type: 'string' },
    record: { type: 'string' },
    check: { type: 'boolean' },
  }, true);
  if (f.error) return taskUsageErr(f.error);
  const pos = f.positionals;
  if (pos.length !== 3) {
    return taskUsageErr(
      'bee task move: expected <plan-path> <task-n> <state>');
  }
  const [planArg, nArg, stateArg] = pos;
  const nm = /^(?:task-)?(\d+)$/.exec(nArg);
  if (!nm) {
    return taskUsageErr(`bee task move: <task-n> expects a task ` +
      `number, got '${nArg}'`);
  }
  const n = Number(nm[1]);
  if (!TASK_STATES.includes(stateArg)) {
    return taskUsageErr(`bee task move: unknown state '${stateArg}' — ` +
      `states: ${TASK_STATES.join(' → ')}`);
  }
  const origin = (f.values.origin || 'bee').toLowerCase();
  if (!/^[a-z][a-z0-9-]*$/i.test(f.values.origin || 'bee')) {
    return taskUsageErr(`bee task move: --origin ` +
      `'${f.values.origin}' must be letters/digits/hyphens`);
  }
  const r = readPlanFor('task move', planArg);
  if (r.err) return { code: 1, out: '', err: r.err };
  const ids = r.header.checks.map((c) => c.id);
  if (!r.header.checks.some((c) => c.n === n)) {
    return { code: 1, out: '',
      err: `bee task move: no task ${n} in ${r.planPath} — ` +
        (ids.length > 0 ? `tasks here: ${ids.join(', ')}`
          : 'the plan declares no checks') +
        '\nfix: move a task from the list (its \'## Task <n>:\' ' +
        'section must exist too)\n' };
  }
  const ledger = parseTaskLedger(r.lines, r.range, r.planPath);
  if (ledger.err) return { code: 1, out: '', err: ledger.err };
  const section = taskSectionRange(r.lines, n);
  if (!section) {
    return { code: 1, out: '',
      err: `bee task move: ${r.planPath} has no '## Task ${n}:' ` +
        'section — the machine header declares the task but the ' +
        'body does not\nfix: add the section (or fix the checks ' +
        'id), then re-run\n' };
  }
  const stats = taskCheckboxStats(r.lines, section);
  const entries = ledger.byTask.get(n) ?? [];
  const cur = taskCurrentState(entries, stats);
  const curIdx = TASK_STATES.indexOf(cur);
  const newIdx = TASK_STATES.indexOf(stateArg);
  if (newIdx === curIdx) {
    return { code: 0, out: `task-${n} already ${cur} — nothing to do\n`,
      err: '' };
  }
  if (newIdx < curIdx) {
    return { code: 1, out: '',
      err: `bee task move: task-${n} is ${cur}; moves go forward ` +
        `only (${TASK_STATES.join(' → ')}) — '${stateArg}' is ` +
        'backwards\nfix: if the recorded state is wrong, ' +
        `hand-correct the task-${n} ledger line in the plan's ` +
        'machine block (the last line wins), then re-run\n' };
  }
  // done requires its evidence: the verify entry path. The
  // script checks existence only — judging the entry's content
  // stays with the loop (it reads the entry before the move).
  let record = null;
  if (stateArg === 'done') {
    if (f.values.record === undefined) {
      return { code: 1, out: '',
        err: `bee task move: task-${n} → done requires --record ` +
          '<path> — the verify entry evidencing it\nfix: run ' +
          `bee verify --task ${n} first, then pass its logbook ` +
          `entry (e.g. .hivemind/logbook/<plan-slug>-task${n}-verify-rN.md)\n` };
    }
  } else if (f.values.record !== undefined) {
    return taskUsageErr('bee task move: --record belongs to done ' +
      `moves (got state '${stateArg}')`);
  }
  if (f.values.record !== undefined) {
    if (f.values.record === '' || /\s/.test(f.values.record)) {
      return taskUsageErr('bee task move: --record expects a ' +
        'space-free path (ledger lines are single-token fields)');
    }
    const recAbs = path.resolve(f.values.record);
    if (!fs.existsSync(recAbs)) {
      return { code: 1, out: '',
        err: `bee task move: --record path does not exist: ` +
          `${f.values.record}\nfix: pass the entry bee verify ` +
          `wrote — e.g. .hivemind/logbook/<plan-slug>-task${n}-verify-rN.md\n` };
    }
    record = recAbs;
  }
  // Rewrite: checkboxes (done ticks, draft unticks; byte-exact —
  // only the leading marker changes) + the ledger line inserted
  // before the machine block's '-->'.
  const newLines = [...r.lines];
  let inFence = false; // review r1 fix: never rewrite inside fences
  for (let i = section.start + 1; i < section.end; i++) {
    if (/^\s*(```|~~~)/.test(newLines[i])) { inFence = !inFence; continue; }
    if (inFence) continue;
    if (stateArg === 'done') {
      newLines[i] = newLines[i].replace(/^(\s*- \[) \]/, '$1x]');
    } else if (stateArg === 'draft') {
      newLines[i] = newLines[i].replace(/^(\s*- \[)x\]/, '$1 ]');
    }
  }
  const ts = isoStampLocal();
  let ledgerLine = `task-${n}: ${stateArg} ${ts} by ${origin}`;
  if (record !== null) {
    ledgerLine += ` record: ${taskRecordShown(record, r.planPath)}`;
  }
  newLines.splice(r.range.end, 0, ledgerLine);
  if (f.values.check) {
    return { code: 0, out: `--check: would move task-${n} ${cur} → ` +
      `${stateArg} in ${r.planPath}\n${ledgerLine}\n` +
      (stateArg === 'done' && stats.checked < stats.total
        ? `${stats.total - stats.checked} checkbox(es) would tick\n`
        : ''), err: '' };
  }
  try {
    atomicWrite(r.planPath, newLines.join('\n'));
  } catch (e) {
    return { code: 1, out: '',
      err: `bee task move: cannot write ${r.planPath}: ${e.message}\n` };
  }
  return { code: 0, out: `task-${n} ${stateArg} · ${ts} by ${origin}\n` +
    `plan: ${r.planPath}\n`, err: '' };
}

// ---- guidance (P4 Task 7 — docs/guidance topics, read-only) ----
// Minimal skeleton per the plan: list/show over docs/guidance/*.md
// (topic = filename stem). No injection machinery — that is the
// init contract's (P6). Read-only family: no store, no mutations,
// no --check; the --dir seam mirrors inbox's --store.

const GUIDANCE_USAGE = `bee guidance — guidance topics (docs/guidance/*.md)

usage:
  bee guidance [list] [--full]
  bee guidance show <topic>

commands:
  list [--full]   every topic: stem · one-line purpose, sorted;
                  the purpose is the file's first non-heading line,
                  truncated ~60 cols with a size hint (--full
                  untruncates). Bare 'bee guidance' = list.
  show <topic>    print the topic's markdown (topic = filename
                  stem; unknown topic → exit 1 + the list fix line)

flags:
  --full          list: untruncated purpose lines
  --dir <path>    internal: guidance directory
                  (default docs/guidance)

read-only — topics are markdown files; this command never writes.
`;

function guidanceUsageErr(e) {
  const msg = e && e.message ? e.message
    : String(e).replace(/^Error: /, '');
  return { code: 1, out: '', err: msg + '\n\n' + GUIDANCE_USAGE };
}

function guidanceDirOf(p) {
  return p ? path.resolve(p)
    : path.join(REPO_ROOT, 'docs', 'guidance');
}

function guidanceTopics(dir) {
  let names;
  try {
    names = fs.readdirSync(dir);
  } catch (e) {
    if (e.code === 'ENOENT') return { topics: [] };
    return { err: `bee guidance: cannot read ${dir}: ${e.message}\n` };
  }
  const topics = names.filter((n) => n.endsWith('.md'))
    .sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 :
      a.toLowerCase() > b.toLowerCase() ? 1 : 0);
  return { topics };
}

// One-line purpose: the file's first non-empty non-heading line;
// a file with none shows '-'.
function guidanceOneLiner(text) {
  for (const line of text.split('\n')) {
    const t = line.trim();
    if (t === '' || t.startsWith('#')) continue;
    return t;
  }
  return '-';
}

function cmdGuidance(rest) {
  const [sub] = rest;
  if (sub === undefined || sub === 'list' || sub.startsWith('--')) {
    return guidanceList(sub === 'list' ? rest.slice(1) : rest);
  }
  if (sub === 'show') return guidanceShow(rest.slice(1));
  if (sub === 'help') return { code: 0, out: GUIDANCE_USAGE, err: '' };
  return { code: 1, out: '',
    err: `bee guidance: unknown subcommand '${sub}'\n\n` + GUIDANCE_USAGE };
}

function guidanceList(args) {
  const f = flags(args, {
    full: { type: 'boolean' },
    dir: { type: 'string' },
  }, true);
  if (f.error) return guidanceUsageErr(f.error);
  if (f.positionals.length > 0) {
    return guidanceUsageErr(
      `bee guidance list: unexpected argument '${f.positionals[0]}'`);
  }
  const dir = guidanceDirOf(f.values.dir);
  const r = guidanceTopics(dir);
  if (r.err) return { code: 1, out: '', err: r.err };
  if (r.topics.length === 0) {
    return { code: 0, out: '0 topics\n' +
      `add one: ${designShown(path.join(dir, '<topic>.md'))}\n`, err: '' };
  }
  let out = `${r.topics.length} topics\n`;
  for (const name of r.topics) {
    const stem = name.slice(0, -3);
    let text;
    try {
      text = fs.readFileSync(path.join(dir, name), 'utf8');
    } catch (e) {
      return { code: 1, out: '',
        err: `bee guidance: cannot read ${path.join(dir, name)}: ` +
          `${e.message}\n` };
    }
    const line = guidanceOneLiner(text);
    out += `${stem} · ${f.values.full ? line : truncText(line)}\n`;
  }
  out += 'show one: bee guidance show <topic>\n';
  return { code: 0, out, err: '' };
}

function guidanceShow(args) {
  const f = flags(args, {
    dir: { type: 'string' },
  }, true);
  if (f.error) return guidanceUsageErr(f.error);
  const pos = f.positionals;
  if (pos.length !== 1) {
    return guidanceUsageErr('bee guidance show: expected <topic>');
  }
  const topic = pos[0];
  if (/[/\\]/.test(topic)) {
    return guidanceUsageErr(
      `bee guidance show: <topic> is a filename stem, got '${topic}'`);
  }
  const dir = guidanceDirOf(f.values.dir);
  const file = path.join(dir, `${topic}.md`);
  if (!fs.existsSync(file)) {
    return { code: 1, out: '',
      err: `bee guidance: no topic ${topic} — bee guidance list\n` };
  }
  let text;
  try {
    text = fs.readFileSync(file, 'utf8');
  } catch (e) {
    return { code: 1, out: '',
      err: `bee guidance: cannot read ${file}: ${e.message}\n` };
  }
  return { code: 0, out: text, err: '' };
}

// ---- phase (P4 Task 9 — decision inventory + scripted close) ----
// The close is the loop's mechanical tail: gate (branch exists +
// suite green at its tree), no-ff merge phase/<n> → main (the P3/P7
// lesson — a phase is a real merge commit, never a fast-forward),
// rest the persistent worktree detached at main, delete the phase
// branch, emit the close card with the decision count (the P7
// calibration signal; threshold calibratable later), push. The
// decision inventory is agent-assembled content in a script-owned
// format: one line per decision, id · one-line · source-record-path.

const PHASE_FLAG_THRESHOLD = 8;

const PHASE_USAGE = `bee phase — phase inventory + scripted close

usage:
  bee phase [list [--full]]
  bee phase inventory <phase-id> --decisions <file> [--origin <role>] [--check]
  bee phase close <phase-id> [--check]

commands:
  list [--full]   every phase with a plan: id · plan · title;
                  bare 'bee phase' = list
  inventory …     write the phase's decision inventory to
                  .hivemind/logbook/<plan-slug>-decisions.toon;
                  the decisions file is agent-assembled (the sign-off
                  inventory is judgment) — one line per decision:
                  id · one-line · source-record-path ('#' comments
                  and blank lines skipped; lines ride verbatim;
                  re-runs replace the file atomically)
  close …         the scripted close; each step refuses with a fix
                  line when its preconditions fail:
                  1 gate    branch phase/<n> exists + its tree
                            passes the plan's suite
                  2 merge   --no-ff phase/<n> → main, from the main
                            checkout on main, tree clean (the
                            decision inventory itself is exempt —
                            it is expected pre-close)
                  3 rest    persistent worktree on phase/<n>
                            detached at main (skipped when none)
                  4 delete  branch phase/<n> (-d, merged only)
                  5 card    decisions: <n> — the inventory's
                            decision lines; flag 'under-asked
                            kickoff — front-load harder next phase'
                            when n > ${PHASE_FLAG_THRESHOLD} (threshold
                            calibratable later; waivers count —
                            a waiver is a decision)
                  6 push    origin main (skipped with a note when
                            no remote 'origin')

flags:
  --decisions <file>  inventory: the assembled decisions file
  --origin <role>      inventory: provenance (default bee)
  --full               list: untruncated plan titles
  --check              close/inventory: never merge/push/write;
                      close's gates still run (throwaway worktree
                      when no clean persistent one holds the branch)
  --root <path>        internal: repo root (default: git toplevel
                       of the cwd)

phase-id: <n>, P<n>, or phase/<n>. one plan per phase — the plan
whose machine header carries 'phase: P<n>'; ambiguous → exit 1.
`;

function phaseUsageErr(e) {
  const msg = e && e.message ? e.message
    : String(e).replace(/^Error: /, '');
  return { code: 1, out: '', err: msg + '\n\n' + PHASE_USAGE };
}

function phaseGit(root, args) {
  return spawnSync('git', args, { cwd: root, encoding: 'utf8' });
}

function phaseRootOf(p) {
  if (p) return { root: path.resolve(p) };
  const r = spawnSync('git', ['rev-parse', '--show-toplevel'],
    { encoding: 'utf8' });
  if (r.status !== 0) {
    return { err: 'bee phase: no git repository at ' + process.cwd() +
      ' — fix: run inside the repo or pass --root <path>\n' };
  }
  return { root: r.stdout.trim() };
}

// <n> | P<n> | phase/<n> → n (null when none parse)
function phaseNormId(arg) {
  const m = /^(?:phase\/)?[Pp]?(\d+)$/.exec(arg);
  return m === null ? null : Number(m[1]);
}

// Every plan whose machine header names a phase. Plans without a
// machine header (pre-contract) are skipped, not findings.
function phasePlanMap(root) {
  const plansDir = path.join(root, '.hivemind', 'plans');
  let names;
  try {
    names = fs.readdirSync(plansDir);
  } catch (e) {
    if (e.code === 'ENOENT') return { phases: [] };
    return { err: `bee phase: cannot read ${plansDir}: ${e.message}\n` };
  }
  const phases = [];
  for (const name of names.filter((x) => x.endsWith('.md')).sort()) {
    const file = path.join(plansDir, name);
    let text;
    try {
      text = fs.readFileSync(file, 'utf8');
    } catch (e) {
      continue; // unreadable — not a phase-plan candidate
    }
    const parsed = parsePlanHeader(text, name);
    if (parsed.err) continue; // no machine header — pre-contract plan
    const pm = /^p(\d+)$/i.exec((parsed.header.phase || '').trim());
    if (!pm) continue;
    const h = text.split('\n').find((l) => l.startsWith('# '));
    phases.push({ n: Number(pm[1]), file, header: parsed.header,
      title: h !== undefined
        ? h.slice(2).trim().replace(/^Plan:\s*/, '')
        : '-' });
  }
  phases.sort((a, b) => a.n - b.n || a.file.localeCompare(b.file));
  return { phases };
}

function phaseFindPlan(root, n) {
  const r = phasePlanMap(root);
  if (r.err) return r;
  const hits = r.phases.filter((p) => p.n === n);
  if (hits.length === 0) {
    const known = [...new Set(r.phases.map((p) => 'P' + p.n))];
    return { err: `bee phase: no plan for phase P${n} in ` +
      `${path.join(root, '.hivemind', 'plans')}` +
      (known.length > 0 ? ` — phases with plans here: ${known.join(', ')}`
        : " — no plan here carries a phase header") +
      `\nfix: check the phase id, or give the phase's plan a machine ` +
      `header with 'phase: P${n}'\n` };
  }
  if (hits.length > 1) {
    return { err: `bee phase: ${hits.length} plans claim P${n}: ` +
      `${hits.map((h) => path.basename(h.file)).join(', ')}\n` +
      'fix: a phase has one plan — archive or rename the stale one, ' +
      'then re-run\n' };
  }
  return { plan: hits[0].file, header: hits[0].header };
}

// The worktree holding <branch> checked out (null when none) —
// the same porcelain walk worktree.sh uses.
function phaseWorktreeOf(root, branch) {
  const r = phaseGit(root, ['worktree', 'list', '--porcelain']);
  if (r.status !== 0) return null;
  let wt = null;
  for (const line of r.stdout.split('\n')) {
    if (line.startsWith('worktree ')) wt = line.slice(9);
    else if (line.startsWith(`branch refs/heads/${branch}`)) return wt;
  }
  return null;
}

function phaseMainCheckout(root) {
  const r = phaseGit(root, ['worktree', 'list', '--porcelain']);
  const line = r.stdout.split('\n').find((l) => l.startsWith('worktree '));
  return line !== undefined ? line.slice(9) : root;
}

function cmdPhase(rest) {
  const [sub] = rest;
  if (sub === undefined || sub === 'list' || sub.startsWith('--')) {
    return phaseList(sub === 'list' ? rest.slice(1) : rest);
  }
  if (sub === 'inventory') return phaseInventory(rest.slice(1));
  if (sub === 'close') return phaseClose(rest.slice(1));
  if (sub === 'help') return { code: 0, out: PHASE_USAGE, err: '' };
  return { code: 1, out: '',
    err: `bee phase: unknown subcommand '${sub}'\n\n` + PHASE_USAGE };
}

function phaseList(args) {
  const f = flags(args, {
    full: { type: 'boolean' },
    root: { type: 'string' },
  }, true);
  if (f.error) return phaseUsageErr(f.error);
  if (f.positionals.length > 0) {
    return phaseUsageErr(
      `bee phase list: unexpected argument '${f.positionals[0]}'`);
  }
  let root;
  if (f.values.root !== undefined) {
    root = path.resolve(f.values.root);
  } else {
    const r = spawnSync('git', ['rev-parse', '--show-toplevel'],
      { encoding: 'utf8' });
    root = r.status === 0 ? r.stdout.trim() : process.cwd();
  }
  const m = phasePlanMap(root);
  if (m.err) return { code: 1, out: '', err: m.err };
  if (m.phases.length === 0) {
    return { code: 0, out: '0 phases\n' +
      `fix: no plan in ${path.join(root, '.hivemind', 'plans')} carries ` +
      "a machine header with 'phase:' — add one " +
      '(skills/loop/bee-plan/assets/plan-template.md)\n', err: '' };
  }
  let out = `${m.phases.length} phase${m.phases.length === 1 ? '' : 's'}\n`;
  for (const p of m.phases) {
    const slug = path.basename(p.file, '.md');
    const title = f.values.full ? p.title : truncText(p.title, 48);
    out += `P${p.n} · ${slug} · ${title}\n`;
  }
  out += 'next: bee phase close <phase-id> --check\n';
  return { code: 0, out, err: '' };
}

function phaseDecisionLines(text) {
  // Decision lines carry the ' · ' separator; header fields
  // (phase:, plan:, count:, assembled:) and '#' comments do not.
  return text.split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.trim() !== '' && !l.trim().startsWith('#'))
    .filter((l) => l.includes(' · '));
}

function phaseInventory(args) {
  const f = flags(args, {
    decisions: { type: 'string' },
    origin: { type: 'string' },
    check: { type: 'boolean' },
    root: { type: 'string' },
  }, true);
  if (f.error) return phaseUsageErr(f.error);
  const pos = f.positionals;
  if (pos.length !== 1) {
    return phaseUsageErr('bee phase inventory: expected <phase-id>');
  }
  const n = phaseNormId(pos[0]);
  if (n === null) {
    return phaseUsageErr(`bee phase inventory: <phase-id> expects a ` +
      `phase number, got '${pos[0]}' (forms: 4, P4, phase/4)`);
  }
  if (f.values.decisions === undefined) {
    return phaseUsageErr(
      'bee phase inventory: --decisions <file> is required — fix: ' +
      'point it at the assembled inventory (one line per decision: ' +
      'id · one-line · source-record-path)');
  }
  const origin = f.values.origin || 'bee';
  if (!/^[a-z][a-z0-9-]*$/i.test(origin)) {
    return phaseUsageErr(`bee phase inventory: --origin '${origin}' ` +
      'must be letters/digits/hyphens');
  }
  const rr = phaseRootOf(f.values.root);
  if (rr.err) return { code: 1, out: '', err: rr.err };
  const root = rr.root;
  const found = phaseFindPlan(root, n);
  if (found.err) return { code: 1, out: '', err: found.err };
  const decPath = path.resolve(f.values.decisions);
  let text;
  try {
    text = fs.readFileSync(decPath, 'utf8');
  } catch (e) {
    return { code: 1, out: '',
      err: `bee phase inventory: cannot read ${decPath}: ${e.message}\n` +
        'fix: point --decisions at the assembled inventory file\n' };
  }
  const lines = [];
  const raw = text.split('\n');
  for (let i = 0; i < raw.length; i++) {
    const l = raw[i].replace(/\r$/, '');
    if (l.trim() === '' || l.trim().startsWith('#')) continue;
    const parts = l.split(' · ');
    const oneLine = parts.slice(1, -1).join(' · ');
    if (parts.length < 3 || parts[0].trim() === '' ||
        oneLine.trim() === '' || parts[parts.length - 1].trim() === '') {
      return { code: 1, out: '',
        err: `bee phase inventory: ${designShown(decPath)} line ${i + 1} ` +
          `is not 'id · one-line · source-record-path': ` +
          `'${truncText(l, 50)}'\n` +
          'fix: hand-fix the decisions file, then re-run\n' };
    }
    lines.push(l);
  }
  const slug = path.basename(found.plan, '.md');
  const outFile = path.join(root, '.hivemind', 'logbook',
    `${slug}-decisions.toon`);
  const relPlan = path.relative(root, found.plan);
  const body = [
    `# decisions — P${n} close inventory (plan: ${slug})`,
    '# one line per decision: id · one-line · source-record-path',
    `phase: P${n}`,
    `plan: ${relPlan}`,
    `count: ${lines.length}`,
    `assembled: ${isoStampLocal()} by ${origin}`,
    '',
    ...lines,
  ].join('\n') + '\n';
  if (f.values.check) {
    return { code: 0, out: `--check: would write ${designShown(outFile)} ` +
      `(${lines.length} decisions)\n${body}`, err: '' };
  }
  try {
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    atomicWrite(outFile, body);
  } catch (e) {
    return { code: 1, out: '',
      err: `bee phase inventory: cannot write ${outFile}: ${e.message}\n` };
  }
  return { code: 0,
    out: `${lines.length} decisions · P${n} · ${slug}\n` +
      `wrote: ${designShown(outFile)}\n` +
      `next: bee phase close ${n} --check\n`, err: '' };
}

// The suite gate: run the plan's suite against the phase tree —
// at the persistent worktree when it is clean, else a throwaway
// detached worktree (added + removed; the honest branch tree, not
// a possibly-dirty checkout).
function phaseSuiteGate(root, branch, suite, pwt, pwtClean) {
  let dir = null;
  let tmp = null;
  if (pwt !== null && pwtClean) {
    dir = pwt;
  } else {
    const base = fs.mkdtempSync(path.join(os.tmpdir(), 'bee-phase-suite-'));
    tmp = path.join(base, 'tree');
    dir = tmp;
  }
  let addErr = null;
  if (tmp !== null) {
    const add = phaseGit(root, ['worktree', 'add', '--detach', tmp, branch]);
    if (add.status !== 0) {
      addErr = firstOutputLine(add) || `git exit ${add.status}`;
    }
  }
  let res = null;
  if (addErr === null) {
    // Strip the Node test-runner's child-mode marker: a `node
    // --test` suite spawned from inside a test-runner process
    // inherits NODE_TEST_CONTEXT and silently exits 0 on failure
    // — the gate's verdict must be the suite's own.
    const env = { ...process.env };
    delete env.NODE_TEST_CONTEXT;
    const sr = spawnSync('sh', ['-c', suite], {
      cwd: dir, encoding: 'utf8', timeout: verifyTimeoutMs(), env,
    });
    const timedOut = (sr.signal === 'SIGTERM' && sr.error !== undefined) ||
      (sr.error !== undefined && sr.error.code === 'ETIMEDOUT');
    if (timedOut || (sr.signal && sr.error === undefined)) {
      res = { pass: false,
        note: `${timedOut ? 'timeout' : 'signal'} ${sr.signal ?? ''} ` +
          `(after ${verifyTimeoutMs() / 1000}s)` };
    } else if (sr.error) {
      res = { pass: false, note: `cannot run: ${sr.error.message}` };
    } else if (sr.status === 0) {
      res = { pass: true, note: 'exit 0' };
    } else {
      res = { pass: false, note: `exit ${sr.status}` +
        (firstOutputLine(sr) !== '' ? `: ${firstOutputLine(sr)}` : '') };
    }
  }
  if (tmp !== null) {
    const rm = phaseGit(root, ['worktree', 'remove', tmp]);
    if (rm.status !== 0) {
      phaseGit(root, ['worktree', 'remove', '--force', tmp]);
    }
    try {
      fs.rmSync(path.dirname(tmp), { recursive: true, force: true });
    } catch (e) { /* best-effort; the OS tmp cleaner retires it */ }
  }
  if (addErr !== null) return { err: addErr };
  return res;
}

function phaseClose(args) {
  const f = flags(args, {
    check: { type: 'boolean' },
    root: { type: 'string' },
  }, true);
  if (f.error) return phaseUsageErr(f.error);
  const pos = f.positionals;
  if (pos.length !== 1) {
    return phaseUsageErr('bee phase close: expected <phase-id>');
  }
  const n = phaseNormId(pos[0]);
  if (n === null) {
    return phaseUsageErr(`bee phase close: <phase-id> expects a phase ` +
      `number, got '${pos[0]}' (forms: 4, P4, phase/4)`);
  }
  const check = f.values.check === true;
  const rr = phaseRootOf(f.values.root);
  if (rr.err) return { code: 1, out: '', err: rr.err };
  const root = rr.root;
  const branch = `phase/${n}`;
  const out = [];
  out.push(`bee phase close ${n}${check ? ' --check' : ''} · P${n}\n`);
  // step 1, first half — the branch exists (checked before the plan
  // lookup: it needs no plan, and it is the most immediate finding)
  if (phaseGit(root, ['show-ref', '--verify', '--quiet',
      `refs/heads/${branch}`]).status !== 0) {
    const br = phaseGit(root, ['for-each-ref', '--format=%(refname:short)',
      'refs/heads/']);
    const local = br.stdout.split('\n').filter(Boolean).join(', ');
    out.push(`1 · gate · FAIL · no branch ${branch}` +
      (local !== '' ? ` (local: ${local})` : '') + '\n');
    out.push(`fix: create it, or close from the repo that holds it\n`);
    return { code: 1, out: out.join(''), err: '' };
  }
  const branchSha = phaseGit(root, ['rev-parse', '--short', branch])
    .stdout.trim();
  const found = phaseFindPlan(root, n);
  if (found.err) return { code: 1, out: out.join(''), err: found.err };
  const slug = path.basename(found.plan, '.md');
  out.push(`plan: ${slug}\n`);
  const suite = (found.header.suite || '').trim();
  const decRel = path.join('.hivemind', 'logbook', `${slug}-decisions.toon`);

  // step 1 — gate: the branch's tree passes the suite
  if (suite === '') {
    out.push(`1 · gate · FAIL · plan ${slug} names no suite\n`);
    out.push(`fix: add 'suite: <cmd>' to the plan's machine header ` +
      '(skills/loop/bee-plan/assets/plan-template.md), then re-run\n');
    return { code: 1, out: out.join(''), err: '' };
  }
  const pwt = phaseWorktreeOf(root, branch);
  const pwtClean = pwt === null
    ? true
    : phaseGit(pwt, ['status', '--porcelain']).stdout.trim() === '';
  const gate = phaseSuiteGate(root, branch, suite, pwt, pwtClean, check);
  if (gate.err !== undefined) {
    out.push(`1 · gate · FAIL · cannot materialize the ${branch} tree: ` +
      `${gate.err}\n`);
    out.push('fix: clear the worktree state it reports, then re-run\n');
    return { code: 1, out: out.join(''), err: '' };
  }
  if (!gate.pass) {
    out.push(`1 · gate · FAIL · suite '${truncText(suite, 50)}' ` +
      `${gate.note} (at the ${branch} tree)\n`);
    out.push(`fix: run '${suite}' at the ${branch} tree and repair ` +
      'until green, then re-run\n');
    return { code: 1, out: out.join(''), err: '' };
  }
  out.push(`1 · gate · ${branch} @ ${branchSha} · suite PASS\n`);

  // step 2 preconditions — on main, main tree clean
  const cur = phaseGit(root, ['branch', '--show-current']).stdout.trim();
  if (cur !== 'main') {
    out.push(`2 · merge · FAIL · close merges into main, but this ` +
      `checkout is ${cur === '' ? 'detached' : `on '${cur}'`}\n`);
    out.push(`fix: run from the main checkout on main — ` +
      `${phaseMainCheckout(root)}\n`);
    return { code: 1, out: out.join(''), err: '' };
  }
  const dirty = phaseGit(root, ['status', '--porcelain',
    '--untracked-files=all']).stdout
    .split('\n').filter(Boolean)
    .filter((l) => {
      const p = l.slice(3);
      return p !== decRel && !p.endsWith(' -> ' + decRel);
    });
  if (dirty.length > 0) {
    out.push(`2 · merge · FAIL · uncommitted work in ${root} ` +
      `(${dirty.length} path${dirty.length === 1 ? '' : 's'}: ` +
      `${truncText(dirty.map((l) => l.slice(3)).join(', '), 60)})\n`);
    out.push(`fix: commit or stash every uncommitted path first — the ` +
      `decision inventory wants committing too (git add ${decRel})\n`);
    return { code: 1, out: out.join(''), err: '' };
  }
  const mainSha = phaseGit(root, ['rev-parse', '--short', 'main'])
    .stdout.trim();

  // step 3 precondition — persistent worktree clean
  if (pwt !== null && !pwtClean) {
    out.push(`3 · rest · FAIL · worktree ${pwt} (on ${branch}) has ` +
      'uncommitted work\n');
    out.push(`fix: commit or stash it — the persistent worktree must ` +
      'be clean before it rests detached at main\n');
    return { code: 1, out: out.join(''), err: '' };
  }

  // step 5 precondition — the decision inventory exists
  let decText = null;
  const decAbs = path.join(root, decRel);
  if (fs.existsSync(decAbs)) {
    try {
      decText = fs.readFileSync(decAbs, 'utf8');
    } catch (e) {
      decText = null;
    }
  }
  if (decText === null) {
    const show = phaseGit(root, ['show', `${branch}:${decRel}`]);
    if (show.status === 0) decText = show.stdout;
  }
  if (decText === null) {
    out.push(`5 · card · FAIL · no decision inventory at ${decRel} ` +
      `(worktree or ${branch} tree)\n`);
    out.push(`fix: assemble the decisions file, then run ` +
      `bee phase inventory ${n} --decisions <file>\n`);
    return { code: 1, out: out.join(''), err: '' };
  }
  const decCount = phaseDecisionLines(decText).length;
  const hasOrigin = phaseGit(root, ['remote', 'get-url', 'origin'])
    .status === 0;

  // --check: the plan, nothing run
  if (check) {
    out.push(`2 · merge · would --no-ff ${branch} → main ` +
      `(main @ ${mainSha})\n`);
    out.push(pwt !== null
      ? `3 · rest · would detach ${pwt} at main\n`
      : `3 · rest · no worktree on ${branch} — would skip\n`);
    out.push(`4 · branch · would delete ${branch}\n`);
    out.push(`5 · close card · P${n} (preview)\n`);
    out.push(`  decisions: ${decCount}\n`);
    if (decCount > PHASE_FLAG_THRESHOLD) {
      out.push('  flag: under-asked kickoff — front-load harder next phase\n');
    }
    out.push(hasOrigin
      ? '6 · push · would push origin main\n'
      : `6 · push · no remote 'origin' — would skip\n`);
    return { code: 0, out: out.join(''), err: '' };
  }

  // step 2 — the real merge commit (never fast-forward: P3/P7)
  const m = phaseGit(root, ['merge', '--no-ff', branch, '-m',
    `merge ${branch} into main (P${n} close)`]);
  if (m.status !== 0) {
    const inMerge = phaseGit(root, ['rev-parse', '-q', '--verify',
      'MERGE_HEAD']).status === 0;
    if (inMerge) phaseGit(root, ['merge', '--abort']);
    out.push(`2 · merge · FAIL · ${firstOutputLine(m) || `git exit ${m.status}`}\n`);
    if (inMerge) {
      out.push(`  merge aborted — main restored to ${mainSha}\n`);
    }
    out.push(`fix: the branches conflict — merge main into ${branch} by ` +
      'hand, resolve, push nothing, then re-run\n');
    return { code: 1, out: out.join(''), err: '' };
  }
  const mergeSha = phaseGit(root, ['rev-parse', '--short', 'main'])
    .stdout.trim();
  const already = mergeSha === mainSha;
  out.push(already
    ? `2 · merge · already merged (no merge commit) · ${mergeSha}\n`
    : `2 · merge · --no-ff ${branch} → main · ${mergeSha}\n`);

  // step 3 — rest the persistent worktree detached at main
  if (pwt === null) {
    out.push(`3 · rest · no worktree on ${branch} — skipped\n`);
  } else {
    const c = phaseGit(pwt, ['checkout', '--detach', 'main']);
    if (c.status !== 0) {
      out.push(`3 · rest · FAIL · ${firstOutputLine(c) || `git exit ${c.status}`}\n`);
      out.push(`fix: clean/rest ${pwt} by hand (git -C ${pwt} checkout ` +
        '--detach main); the merge already landed — re-run after ' +
        'fixing to finish\n');
      return { code: 1, out: out.join(''), err: '' };
    }
    out.push(`3 · rest · ${pwt} detached at main\n`);
  }

  // step 4 — delete the phase branch (merged only)
  const d = phaseGit(root, ['branch', '-d', branch]);
  if (d.status !== 0) {
    out.push(`4 · branch · FAIL · ${firstOutputLine(d) || `git exit ${d.status}`}\n`);
    out.push(`fix: git branch -d refuses unmerged branches — the merge ` +
      `landed; finish by hand (git branch -d ${branch})\n`);
    return { code: 1, out: out.join(''), err: '' };
  }
  out.push(`4 · branch · deleted ${branch}\n`);

  // step 5 — the close card
  out.push(`5 · close card · P${n}\n`);
  out.push(already
    ? `  merge: ${mergeSha} (already merged)\n`
    : `  merge: ${mergeSha} (${branch} → main, no-ff)\n`);
  out.push(`  decisions: ${decCount}\n`);
  if (decCount > PHASE_FLAG_THRESHOLD) {
    out.push('  flag: under-asked kickoff — front-load harder next phase\n');
  }
  // review r1 fix: surface the untracked inventory — exempt from
  // the clean gate but blocks the NEXT phase's close until committed.
  if (fs.existsSync(path.join(root, decRel)) &&
      phaseGit(root, ['ls-files', '--error-unmatch', decRel]).status !== 0) {
    out.push(`  note: ${decRel} is untracked — commit it ` +
      `(git add ${decRel}) or it will block the next close\n`);
  }

  // step 6 — push
  if (!hasOrigin) {
    out.push(`6 · push · skipped — no remote 'origin'\n`);
  } else {
    const p = phaseGit(root, ['push', 'origin', 'main']);
    if (p.status !== 0) {
      out.push(`6 · push · FAIL · ${firstOutputLine(p) || `git exit ${p.status}`}\n`);
      out.push('fix: the close landed locally — run ' +
        "'git push origin main' by hand\n");
      return { code: 1, out: out.join(''), err: '' };
    }
    out.push('6 · push · origin main · pushed\n');
  }
  return { code: 0, out: out.join(''), err: '' };
}

if (process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = run(process.argv.slice(2));
  if (r.out) process.stdout.write(r.out);
  if (r.err) process.stderr.write(r.err);
  process.exitCode = r.code;
}

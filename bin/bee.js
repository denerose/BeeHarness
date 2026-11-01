#!/usr/bin/env node
// bee — BeeHarness CLI. `bee report`, `bee init`, `bee inbox`,
// `bee capture`.
// Specs: ADR-008 (keeper report zones/protocol), ADR-005 amendment
// (plugin registration), ADR-014 + docs/AXI.md (agent-first CLI).
// Node >=20, stdlib only.

import { parseArgs } from 'node:util';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
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

  // Needs-the-keeper derivation: the inbox store when it carries
  // open keeper items; status bullets otherwise (transition safety
  // until the queues are migrated into the store).
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

function readInbox(storePath) {
  let text;
  try {
    text = fs.readFileSync(storePath, 'utf8');
  } catch (e) {
    if (e.code === 'ENOENT') return { items: [] };
    return { err: `bee inbox: cannot read ${storePath}: ${e.message}\n` };
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
      return { err: `bee inbox: cannot parse ${storePath}: ` +
        `line ${i + 1} is not a field — hand-fix the store, then retry\n` };
    }
    cur = cur ?? {};
    cur[line.slice(0, at)] = line.slice(at + 2);
  }
  if (cur !== null) items.push(cur);
  return { items };
}

function renderInboxStore(items) {
  const blocks = items.map((it) => {
    const known = Object.keys(it).filter((k) => INBOX_FIELDS.includes(k));
    const extra = Object.keys(it).filter((k) => !INBOX_FIELDS.includes(k));
    return [...known, ...extra].map((k) => `${k}: ${it[k]}`).join('\n');
  });
  return INBOX_HEADER + '\n' + blocks.join('\n\n') + '\n';
}

function writeInbox(storePath, items) {
  try {
    fs.mkdirSync(path.dirname(storePath), { recursive: true });
    atomicWrite(storePath, renderInboxStore(items));
    return null;
  } catch (e) {
    return `bee inbox: cannot write ${storePath}: ${e.message}\n`;
  }
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

if (process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = run(process.argv.slice(2));
  if (r.out) process.stdout.write(r.out);
  if (r.err) process.stderr.write(r.err);
  process.exitCode = r.code;
}

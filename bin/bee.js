#!/usr/bin/env node
// bee — BeeHarness CLI stub (P2). `bee report` + `bee init`.
// Specs: ADR-008 (keeper report zones/protocol), ADR-005 amendment
// (plugin registration). Node >=20, stdlib only.

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

const USAGE = `bee ${VERSION} — BeeHarness CLI stub

usage:
  bee report [--check] [--status <path>] [--report <path>]
  bee init   [--check] [--settings <path>]
  bee help | version

  --check   never write; report what would happen
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
  return { code: 1, out: '', err: `bee: unknown command '${cmd}'\n\n` + USAGE };
}

function flags(rest, spec) {
  try {
    return parseArgs({ args: rest, options: spec, strict: true });
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

const FRESH_HEADER = `# Keeper report

**Generated:** {STAMP} by bee report (fresh) · **Source:** \`.hivemind/status.md\`

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
        `**Source:** \`.hivemind/status.md\``)
    : FRESH_HEADER.replace('{STAMP}', stamp());

  const derived = queueBullets(statusText)
    .map((b) => absolutize(b, repoRoot));
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

if (process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = run(process.argv.slice(2));
  if (r.out) process.stdout.write(r.out);
  if (r.err) process.stderr.write(r.err);
  process.exitCode = r.code;
}

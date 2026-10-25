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

function cmdReport(rest) { // Task 3 implements this
  return { code: 0, out: 'bee report: not implemented yet\n', err: '' };
}

if (process.argv[1] &&
    import.meta.url === pathToFileURL(process.argv[1]).href) {
  const r = run(process.argv.slice(2));
  if (r.out) process.stdout.write(r.out);
  if (r.err) process.stderr.write(r.err);
  process.exitCode = r.code;
}

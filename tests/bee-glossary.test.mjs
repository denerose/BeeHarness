// Tests for `bee glossary` (P5 Task 4) — the shared-vocabulary
// store + rendered view. All runs go through temp-dir
// --store/--view — never the live .hivemind/glossary.toon or the
// real skills/GLOSSARY.md (D6: conversions run tests-only until
// phase close).

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { run } from '../bin/bee.js';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)), '..');
const STORE_HEADER =
  '# glossary — shared vocabulary (term :: gist :: see; supply, never update)';
const VIEW_MARKER = '<!-- glossary view — script-owned: ' +
  'bee glossary regenerates this file on every store write; ' +
  'hand edits are overwritten -->';

// Seed shape mirrors the store contract: keeper / inbox /
// in-page link — 'in' prefixes two of them (multi-match probe),
// 'in-p' exactly one (unique-prefix probe).
function seedStore(p, n = 3) {
  const terms = [
    ['keeper', 'the human owner', '-'],
    ['inbox', 'items waiting on someone', '.hivemind/inbox.toon'],
    ['in-page link', 'a pointer inside a doc', '-'],
  ].slice(0, n);
  fs.writeFileSync(p, STORE_HEADER + '\n' +
    terms.map(([t, g, s]) => `${t} :: ${g} :: ${s}`).join('\n') + '\n');
}

function tmp() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'bee-glossary-'));
}

function tmpStore() {
  const dir = tmp();
  return path.join(dir, 'glossary.toon');
}

// Hand-written glossary fixture — the convert input shape:
// headings + intro prose + wrapped bullets + a trailing See
// pointer on one entry.
const GLOSSARY_MD = `# Bee glossary

Intro prose that is not a bullet. It gets skipped and reported.

## Terms

- **keeper** — the human owner. Final authority on every decision
  that matters; the only one who unparks items.
- **inbox** — items waiting on someone. See \`.hivemind/inbox.toon\`.
- **ADR** — architecture decision record, one file per decision,
  in \`.hivemind/decisions/\`. Written with the global \`adr\` skill.
`;

const DUPLICATE_MD = `# Dup

- **keeper** — first gist.
- **keeper** — second gist collides.
`;

const MALFORMED_MD = `# Bad

- **keeper** — fine.
- plain bullet with no bold term dash
`;

function writeFixture(dir, name, text) {
  const p = path.join(dir, name);
  fs.writeFileSync(p, text);
  return p;
}

// ---- lookup: exact / unique prefix / multi prefix / miss ----

test('lookup exact match prints the TOON line, exit 0', () => {
  const p = tmpStore();
  seedStore(p);
  const r = run(['glossary', 'keeper', '--store', p]);
  assert.equal(r.code, 0);
  assert.equal(r.out, 'keeper :: the human owner :: -\n');
});

test('lookup unique prefix match prints it, exit 0', () => {
  const p = tmpStore();
  seedStore(p);
  const r = run(['glossary', 'in-p', '--store', p]);
  assert.equal(r.code, 0);
  assert.equal(r.out, 'in-page link :: a pointer inside a doc :: -\n');
});

test('lookup multiple prefix matches print all, exit 0', () => {
  const p = tmpStore();
  seedStore(p);
  const r = run(['glossary', 'in', '--store', p]);
  assert.equal(r.code, 0);
  assert.ok(r.out.includes('inbox :: items waiting on someone :: .hivemind/inbox.toon'));
  assert.ok(r.out.includes('in-page link :: a pointer inside a doc :: -'));
  assert.ok(!r.out.includes('keeper'));
});

test('lookup zero matches → structured error with nearest (substring) hits, exit 1', () => {
  const p = tmpStore();
  seedStore(p);
  const r = run(['glossary', 'eep', '--store', p]); // substring of keeper, not a prefix
  assert.equal(r.code, 1);
  assert.match(r.err, /no term 'eep'/);
  assert.match(r.err, /nearest: keeper/);
  assert.match(r.err, new RegExp(p)); // the store path, verbatim
  const none = run(['glossary', 'zzz', '--store', p]);
  assert.equal(none.code, 1);
  assert.match(none.err, /no near matches/);
});

test('absent store: bare call reports 0 terms; lookup fails loud', () => {
  const p = tmpStore(); // never created
  const bare = run(['glossary', '--store', p]);
  assert.equal(bare.code, 0);
  assert.ok(bare.out.startsWith('0 terms'));
  assert.ok(bare.out.includes('bee glossary add')); // next-step suggestion
  const look = run(['glossary', 'keeper', '--store', p]);
  assert.equal(look.code, 1);
  assert.match(look.err, /no term 'keeper'/);
  assert.match(look.err, /\(absent\)/);
});

// ---- bare call + --markdown ----

test('bare glossary lists terms (content first)', () => {
  const p = tmpStore();
  seedStore(p);
  const r = run(['glossary', '--store', p]);
  assert.equal(r.code, 0);
  assert.match(r.out, /^3 terms/);
  assert.ok(r.out.includes('keeper · the human owner'));
  assert.ok(!r.out.includes('usage:')); // content, not help
});

test('--markdown renders lookup and list as markdown lines', () => {
  const p = tmpStore();
  seedStore(p);
  const look = run(['glossary', 'inbox', '--markdown', '--store', p]);
  assert.equal(look.code, 0);
  assert.equal(look.out,
    '**inbox** — items waiting on someone\n  see: `.hivemind/inbox.toon`\n');
  assert.ok(!look.out.includes(' :: ')); // not TOON
  const list = run(['glossary', '--markdown', '--store', p]);
  assert.equal(list.code, 0);
  assert.ok(list.out.includes('**keeper** — the human owner'));
  assert.ok(list.out.includes('  see: `.hivemind/inbox.toon`'));
});

// ---- add ----

test('add lands the line, see defaults to -, appends to store', () => {
  const p = tmpStore();
  const dir = tmp();
  const v = path.join(dir, 'GLOSSARY.md');
  const r = run(['glossary', 'add', 'TOON', 'token-oriented notation',
    '--store', p, '--view', v]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /^TOON added/);
  const r2 = run(['glossary', 'add', 'AXI', 'ten agent-first CLI principles',
    '--see', 'docs/AXI.md', '--store', p, '--view', v]);
  assert.equal(r2.code, 0, r2.err);
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  assert.equal(lines.length, 4); // header + 2 entries + trailing ''
  assert.equal(lines[0], STORE_HEADER);
  assert.equal(lines[1], 'TOON :: token-oriented notation :: -');
  assert.equal(lines[2], 'AXI :: ten agent-first CLI principles :: docs/AXI.md');
});

test('add duplicate term fails loud, store unchanged', () => {
  const p = tmpStore();
  seedStore(p);
  const before = fs.readFileSync(p, 'utf8');
  const r = run(['glossary', 'add', 'keeper', 'a second gist',
    '--store', p, '--view', path.join(tmp(), 'GLOSSARY.md')]);
  assert.equal(r.code, 1);
  assert.match(r.err, /'keeper' already exists/);
  assert.match(r.err, /supply, not update/);
  assert.match(r.err, /the human owner/); // the existing gist named
  assert.equal(fs.readFileSync(p, 'utf8'), before);
});

test('add guards: newlines and \' :: \' rejected (house rule)', () => {
  const p = tmpStore();
  const v = path.join(tmp(), 'GLOSSARY.md');
  const r1 = run(['glossary', 'add', 't', 'a\nb', '--store', p, '--view', v]);
  assert.equal(r1.code, 1);
  assert.match(r1.err, /single-line/);
  const r2 = run(['glossary', 'add', 't', 'a :: b', '--store', p, '--view', v]);
  assert.equal(r2.code, 1);
  assert.match(r2.err, /' :: '/);
  assert.equal(fs.existsSync(p), false); // nothing minted
  assert.equal(fs.existsSync(v), false);
});

// ---- view regeneration (D5) ----

test('view regenerates on add: marker + markdown entries, alphabetical', () => {
  const dir = tmp();
  const p = path.join(dir, 'glossary.toon');
  const v = path.join(dir, 'GLOSSARY.md');
  run(['glossary', 'add', 'zebra', 'last alphabetically',
    '--store', p, '--view', v]);
  run(['glossary', 'add', 'alpha', 'first alphabetically',
    '--see', 'docs/alpha.md', '--store', p, '--view', v]);
  const text = fs.readFileSync(v, 'utf8');
  const lines = text.split('\n');
  assert.equal(lines[0], VIEW_MARKER); // the script-owned marker
  // alphabetical despite insertion order zebra → alpha
  assert.ok(text.indexOf('**alpha**') < text.indexOf('**zebra**'));
  assert.ok(text.includes('**alpha** — first alphabetically'));
  assert.ok(text.includes('  see: `docs/alpha.md`')); // indented pointer
  assert.ok(text.includes('**zebra** — last alphabetically'));
  // no see pointer for a see-less term
  const zebraBlock = text.split('**zebra**')[1].split('\n')[0];
  assert.ok(!zebraBlock.includes('see:'));
});

test('lookups never touch the view (byte-stable)', () => {
  const dir = tmp();
  const p = path.join(dir, 'glossary.toon');
  seedStore(p);
  const v = path.join(dir, 'GLOSSARY.md');
  fs.writeFileSync(v, 'sentinel view content — hand-written\n');
  const before = fs.readFileSync(v, 'utf8');
  run(['glossary', 'keeper', '--store', p]);
  run(['glossary', 'in', '--store', p]);
  run(['glossary', '--store', p]);
  run(['glossary', 'zzz', '--store', p]); // even a miss
  assert.equal(fs.readFileSync(v, 'utf8'), before);
});

// ---- --check writes nothing ----

test('add --check writes nothing (store and view both absent)', () => {
  const dir = tmp();
  const p = path.join(dir, 'glossary.toon');
  const v = path.join(dir, 'GLOSSARY.md');
  const r = run(['glossary', 'add', 'keeper', 'the human owner',
    '--check', '--store', p, '--view', v]);
  assert.equal(r.code, 0);
  assert.match(r.out, /would append/);
  assert.match(r.out, /keeper :: the human owner :: -/);
  assert.match(r.out, /would regenerate the view/);
  assert.equal(fs.existsSync(p), false);
  assert.equal(fs.existsSync(v), false);
});

// ---- convert: the named one-shot (fixtures only — D6) ----

test('convert clean fixture: join, see extraction, store + view', () => {
  const dir = tmp();
  const md = writeFixture(dir, 'GLOSSARY.md', GLOSSARY_MD);
  const p = path.join(dir, 'glossary.toon');
  const v = path.join(dir, 'view.md');
  const r = run(['glossary', 'convert', md, '--store', p, '--view', v]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /3 terms converted/);
  // headings and prose skipped AND reported
  assert.match(r.out, /skipped headings: Bee glossary · Terms/);
  assert.match(r.out, /skipped prose lines outside bullets: 1/);
  const lines = fs.readFileSync(p, 'utf8').split('\n');
  assert.equal(lines[0], STORE_HEADER);
  // continuation lines joined space-joined into the single-line gist
  assert.equal(lines[1],
    'keeper :: the human owner. Final authority on every decision that matters; the only one who unparks items. :: -');
  // trailing See sentence moved to the see field; gist keeps its period
  assert.equal(lines[2],
    'inbox :: items waiting on someone. :: .hivemind/inbox.toon');
  // gists ride as-is — inner backticks survive, no editorializing
  assert.equal(lines[3],
    'ADR :: architecture decision record, one file per decision, in `.hivemind/decisions/`. Written with the global `adr` skill. :: -');
  // the view regenerated: marker + alphabetical markdown
  const view = fs.readFileSync(v, 'utf8');
  assert.ok(view.startsWith(VIEW_MARKER));
  assert.ok(view.indexOf('**ADR**') < view.indexOf('**inbox**'));
  assert.ok(view.indexOf('**inbox**') < view.indexOf('**keeper**'));
  assert.ok(view.includes('  see: `.hivemind/inbox.toon`'));
  // source md untouched (its afterlife is the view's default path,
  // pinned separately below — convert itself never edits it)
  assert.equal(fs.readFileSync(md, 'utf8'), GLOSSARY_MD);
});

test('convert duplicate term fails loud with a hand-fix list, nothing written', () => {
  const dir = tmp();
  const md = writeFixture(dir, 'dup.md', DUPLICATE_MD);
  const p = path.join(dir, 'glossary.toon');
  const v = path.join(dir, 'view.md');
  const r = run(['glossary', 'convert', md, '--store', p, '--view', v]);
  assert.equal(r.code, 1);
  assert.match(r.err, /1 hand-fix — nothing written/);
  assert.match(r.err, /duplicate term/);
  assert.match(r.err, /keeper/);
  assert.equal(fs.existsSync(p), false);
  assert.equal(fs.existsSync(v), false);
});

test('convert duplicate against the existing store fails loud too', () => {
  const dir = tmp();
  const md = writeFixture(dir, 'g.md', GLOSSARY_MD);
  const p = path.join(dir, 'glossary.toon');
  seedStore(p, 1); // keeper already in the store
  const r = run(['glossary', 'convert', md, '--store', p,
    '--view', path.join(dir, 'view.md')]);
  assert.equal(r.code, 1);
  assert.match(r.err, /already in the store/);
  const before = fs.readFileSync(p, 'utf8');
  assert.equal(fs.readFileSync(p, 'utf8'), before);
});

test('convert malformed bullet lands on the hand-fix list with its line', () => {
  const dir = tmp();
  const md = writeFixture(dir, 'bad.md', MALFORMED_MD);
  const p = path.join(dir, 'glossary.toon');
  const r = run(['glossary', 'convert', md, '--store', p,
    '--view', path.join(dir, 'view.md')]);
  assert.equal(r.code, 1);
  assert.match(r.err, /hand-fix/);
  assert.match(r.err, /bad\.md:4/); // the offending line number
  assert.equal(fs.existsSync(p), false);
});

test('convert with no bullets refuses (re-run guard on a view)', () => {
  const dir = tmp();
  const md = writeFixture(dir, 'view.md',
    VIEW_MARKER + '\n\n**keeper** — regenerated, no bullets\n');
  const r = run(['glossary', 'convert', md,
    '--store', path.join(dir, 'glossary.toon'),
    '--view', path.join(dir, 'v2.md')]);
  assert.equal(r.code, 1);
  assert.match(r.err, /no '- \*\*term\*\* — gist' bullets/);
  assert.match(r.err, /already converted/);
});

test('convert --check writes nothing (store, view, md all untouched)', () => {
  const dir = tmp();
  const md = writeFixture(dir, 'GLOSSARY.md', GLOSSARY_MD);
  const p = path.join(dir, 'glossary.toon');
  const v = path.join(dir, 'view.md');
  const r = run(['glossary', 'convert', md, '--check',
    '--store', p, '--view', v]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /--check: would write/);
  assert.match(r.out, /3 terms converted/);
  assert.equal(fs.existsSync(p), false);
  assert.equal(fs.existsSync(v), false);
  assert.equal(fs.readFileSync(md, 'utf8'), GLOSSARY_MD);
});

// ---- seam overrides: store + view land where told ----

test('--store/--view overrides land exactly where expected', () => {
  const dir = tmp();
  const p = path.join(dir, 'nested', 'my-glossary.toon');
  const v = path.join(dir, 'elsewhere', 'VIEW.md');
  const r = run(['glossary', 'add', 'keeper', 'the human owner',
    '--store', p, '--view', v]);
  assert.equal(r.code, 0, r.err);
  assert.ok(fs.existsSync(p));
  assert.ok(fs.existsSync(v));
  assert.match(fs.readFileSync(p, 'utf8'),
    /keeper :: the human owner :: -/);
  assert.ok(fs.readFileSync(v, 'utf8').startsWith(VIEW_MARKER));
  // and lookup reads the same override
  const look = run(['glossary', 'keeper', '--store', p]);
  assert.equal(look.code, 0);
  assert.match(look.out, /keeper :: the human owner :: -/);
});

// a store override with no view override must never regenerate
// the repo-default (live) view from the overridden store — one
// forgotten --view in any probe would clobber it
test('add --store without --view fails loud, nothing written anywhere', () => {
  const p = tmpStore();
  const live = fs.existsSync(path.join(REPO_ROOT, 'skills', 'GLOSSARY.md'))
    ? path.join(REPO_ROOT, 'skills', 'GLOSSARY.md')
    : path.join(REPO_ROOT, 'GLOSSARY.md');
  const before = fs.readFileSync(live, 'utf8');
  const r = run(['glossary', 'add', 'fenced', 'a gist', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /--view/);
  // nothing written anywhere: the tmp store dir stays empty and
  // the live view is byte-identical
  assert.equal(fs.readdirSync(path.dirname(p)).length, 0);
  assert.equal(fs.readFileSync(live, 'utf8'), before);
});

// ---- fail-loud / usage surfaces ----

test('unknown flag → exit 1 + usage; bare positional is a term, not a subcommand', () => {
  const p = tmpStore();
  const r1 = run(['glossary', 'keeper', '--bogus', '--store', p]);
  assert.equal(r1.code, 1);
  assert.match(r1.err, /--bogus/);
  assert.match(r1.err, /usage:/);
  // the [<term>] grammar: an unknown word is a lookup miss, never
  // an unknown-subcommand error
  const r2 = run(['glossary', 'bogus-sub', '--store', p]);
  assert.equal(r2.code, 1);
  assert.match(r2.err, /no term 'bogus-sub'/);
});

test('help lists the --store/--view seams (park/inbox pattern)', () => {
  const r = run(['glossary', 'help']);
  assert.equal(r.code, 0);
  assert.match(r.out, /--store <path>/);
  assert.match(r.out, /--view <path>/);
  assert.match(r.out, /glossary\.toon/);
  // seams stay out of the top-level stanza
  const usage = run(['help']).out;
  const stanza = usage.split('bee glossary')[1].split('bee verify')[0];
  assert.ok(!stanza.includes('--store'));
  assert.ok(!stanza.includes('--view'));
});

test('top-level USAGE carries the glossary stanza verbatim', () => {
  const usage = run(['help']).out;
  assert.ok(usage.includes('bee glossary [<term>] [--markdown]'));
  assert.ok(usage.includes('| add <term> "<gist>" [--see <path>]'));
  assert.ok(usage.includes('| convert <md>'));
});

test('unparseable store line fails loud (hand-fix message)', () => {
  const p = tmpStore();
  fs.writeFileSync(p, STORE_HEADER + '\nkeeper :: only two fields\n');
  const r = run(['glossary', 'keeper', '--store', p]);
  assert.equal(r.code, 1);
  assert.match(r.err, /cannot parse/);
  assert.match(r.err, /hand-fix/);
});

// Translation completeness check for /campaigns/ (run: node _tests/check-i18n.mjs).
// Folders starting with "_" are not published by GitHub Pages (Jekyll), so this file stays private to the repo.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const LANGS = ['en', 'id', 'tl', 'my'];
const STATUSES = ['active', 'coming-soon', 'closed', 'hidden'];
const problems = [];
const ok = [];

function load(files) {
  const dicts = [];
  const context = { window: {}, TulusI18n: { register: (d) => dicts.push(d) } };
  vm.createContext(context);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), context, { filename: f });
  return { dicts, window: context.window };
}

function checkDict(d, file) {
  const en = Object.keys(d.en ?? {}).sort();
  for (const l of LANGS) {
    if (!d[l]) { problems.push(`${file}: missing language "${l}"`); continue; }
    const keys = Object.keys(d[l]).sort();
    const missing = en.filter((k) => !keys.includes(k));
    const extra = keys.filter((k) => !en.includes(k));
    const empty = keys.filter((k) => typeof d[l][k] !== 'string' || !d[l][k].trim());
    if (missing.length) problems.push(`${file} [${l}] missing: ${missing.join(', ')}`);
    if (extra.length) problems.push(`${file} [${l}] not in English: ${extra.join(', ')}`);
    if (empty.length) problems.push(`${file} [${l}] empty: ${empty.join(', ')}`);
  }
  if (!d.review || LANGS.some((l) => !d.review[l])) problems.push(`${file}: review status missing for some languages`);
  ok.push(`${file}: ${en.length} keys × ${LANGS.length} languages`);
}

function htmlKeys(file) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const keys = new Set();
  for (const m of html.matchAll(/data-i18n(?:-link)?="([^"]+)"/g)) keys.add(m[1]);
  for (const m of html.matchAll(/data-i18n-attr="([^"]+)"/g)) m[1].split(';').forEach((p) => keys.add(p.split(':')[1]));
  return keys;
}

// Keys the shared scripts use in code (not in markup).
const CORE_KEYS = ['meta.title', 'meta.description', 'privacy.link', 'privacy.linkEnglishOnly'];
const FORM_KEYS = ['form.submit', 'form.submitting', ...['invalid_phone', 'phone_country_code', 'too_long', 'invalid_option', 'network', 'server', 'rate_limited', 'too_fast', 'campaign_closed'].map((c) => `err.${c}`),
  ...['coming-soon', 'closed'].flatMap((s) => [`state.${s}.title`, `state.${s}.body`])];

function resolve(dicts, keys, label) {
  const missing = [...keys].filter((k) => !dicts.some((d) => d.en && Object.prototype.hasOwnProperty.call(d.en, k)));
  if (missing.length) problems.push(`${label}: keys used but not translated: ${missing.join(', ')}`);
  else ok.push(`${label}: all ${keys.size} keys used on the page exist in all languages`);
}

// ---- shared + hub
const shared = ['campaigns/shared/i18n-shared.js'];
const hub = load([...shared, 'campaigns/campaigns.js', 'campaigns/i18n.js']);
hub.dicts.forEach((d, i) => checkDict(d, [...shared, 'campaigns/i18n.js'][i]));
const campaigns = hub.window.TULUS_CAMPAIGNS ?? [];
const hubKeys = new Set([...htmlKeys('campaigns/index.html'), ...CORE_KEYS]);
for (const c of campaigns) {
  if (!STATUSES.includes(c.status)) problems.push(`campaigns.js: "${c.slug}" has unknown status "${c.status}"`);
  if (!fs.existsSync(path.join(root, 'campaigns', c.slug, 'index.html'))) problems.push(`campaigns.js: /campaigns/${c.slug}/index.html does not exist`);
  if (c.status === 'hidden') continue;
  hubKeys.add(`status.${c.status}`);
  ['title', 'desc', 'alt'].forEach((k) => hubKeys.add(`campaign.${c.slug}.${k}`));
  if (c.status === 'active') hubKeys.add(`campaign.${c.slug}.cta`);
}
resolve(hub.dicts, hubKeys, 'campaigns/index.html (hub)');

// ---- each campaign page
for (const c of campaigns) {
  const dir = `campaigns/${c.slug}`;
  if (!fs.existsSync(path.join(root, dir, 'i18n.js'))) { problems.push(`${dir}/i18n.js missing`); continue; }
  const page = load([...shared, `${dir}/i18n.js`]);
  checkDict(page.dicts[1], `${dir}/i18n.js`);
  const app = fs.readFileSync(path.join(root, dir, 'app.js'), 'utf8');
  const fields = (app.match(/fields:\s*\[([^\]]*)\]/)?.[1] ?? '').match(/'([^']+)'/g)?.map((f) => f.slice(1, -1)) ?? [];
  if (!fields.length) problems.push(`${dir}/app.js: could not read the fields list`);
  const keys = new Set([...htmlKeys(`${dir}/index.html`), ...CORE_KEYS, ...FORM_KEYS, ...fields.map((f) => `err.${f}`)]);
  resolve(page.dicts, keys, `${dir}/index.html`);
}

console.log(ok.map((l) => `PASS  ${l}`).join('\n'));
if (problems.length) {
  console.log(problems.map((l) => `FAIL  ${l}`).join('\n'));
  process.exit(1);
}
console.log(`\nAll translation checks passed (${campaigns.length} campaign(s)).`);

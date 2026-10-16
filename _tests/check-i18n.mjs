// Translation completeness check for /campaigns/ (run: node _tests/check-i18n.mjs).
// Folders starting with "_" are not published by GitHub Pages (Jekyll), so this file stays private to the repo.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); // works on Windows too
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
const FORM_KEYS = ['form.submit', 'form.submitting', ...['invalid_phone', 'phone_country_code', 'too_long', 'invalid_option', 'network', 'server', 'rate_limited', 'too_fast', 'campaign_closed', 'invalid_email', 'social_platform'].map((c) => `err.${c}`),
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
// Text the directory script (campaigns/hub.js) uses in code.
['view.label', 'view.cards', 'view.calendar', 'filter.label', 'filter.all', 'sec.upcoming', 'sec.soon', 'sec.past',
  'status.active', 'status.coming-soon', 'status.closed', 'status.completed', 'card.view', 'card.dateTbc', 'hub.empty',
  'cal.prev', 'cal.next', 'cal.empty', 'cal.note', 'date.months', 'date.weekdays', 'date.full', 'date.short', 'date.month',
  'date.range', ...['starts', 'ends', 'regOpens', 'regCloses', 'event'].map((k) => `kind.${k}`)].forEach((k) => hubKeys.add(k));
const CATEGORIES = ['sports', 'stories', 'learning', 'community'];
for (const c of campaigns) {
  if (!STATUSES.includes(c.status)) problems.push(`campaigns.js: "${c.slug}" has unknown status "${c.status}"`);
  if (!fs.existsSync(path.join(root, 'campaigns', c.slug, 'index.html'))) problems.push(`campaigns.js: /campaigns/${c.slug}/index.html does not exist`);
  if (!CATEGORIES.includes(c.category)) problems.push(`campaigns.js: "${c.slug}" needs a category (${CATEGORIES.join(' / ')})`);
  if (!Array.isArray(c.audience) || c.audience.some((a) => !['mdw', 'mw'].includes(a))) problems.push(`campaigns.js: "${c.slug}" audience must be a list of 'mdw' / 'mw' (or [])`);
  if (c.status === 'hidden') continue;
  hubKeys.add(`cat.${c.category}`);
  (c.audience || []).forEach((a) => hubKeys.add(`aud.${a}`));
  ['title', 'alt'].forEach((k) => hubKeys.add(`campaign.${c.slug}.${k}`));
}
resolve(hub.dicts, hubKeys, 'campaigns/index.html (hub)');

// ---- each campaign page
// Every language a page offers (its language menu, including languages still awaiting review) must translate every
// key the page uses, in the page file or the shared file; nothing may silently fall back to English.
const lookup = (dicts, l, k) => { for (const d of dicts) if (d[l] && Object.prototype.hasOwnProperty.call(d[l], k)) return d[l][k]; return undefined; };
// Words that are meant to stay in Latin script in any language (names, brands, codes).
const KEEP_LATIN = new Set(['TulusSG', 'Share', 'Your', 'Story', 'WhatsApp', 'Facebook', 'Instagram', 'TikTok', 'Telegram',
  'YouTube', 'X', 'Twitter', 'The', 'Digital', 'Systems', 'Architect', 'FIN', 'admin', 'tulussg', 'com', 'English', 'Bahasa',
  'Indonesia', 'Filipino', 'Tagalog', 'Sports', 'Carnival', 'Zan', 'J', 'Private', 'Limited', 'UEN', 'link', 'spam', 'junk',
  'Bengali', 'Tamil', 'Thai', 'Burmese', 'Chinese', 'Indonesian', 'yourname', 'SG', 'PDPA', 'DRUMS', 'UP', 'Menu',
  // loanwords Burmese readers use as they appear in the apps
  'Channel', 'follow', 'Follow', 'mailing', 'list']);
const NON_LATIN = ['my', 'bn', 'ta', 'zh'];
// Numbers in a text, whatever digits the language writes them in (Bengali and Burmese digits included).
const numbers = (v) => (String(v).replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d)).replace(/[၀-၉]/g, (d) => '၀၁၂၃၄၅၆၇၈၉'.indexOf(d))
  .match(/\d+/g) || []).map((n) => String(Number(n)));
function checkLanguages(dir, dicts, keys) {
  const html = fs.readFileSync(path.join(root, dir, 'index.html'), 'utf8');
  const offered = [...html.matchAll(/<option value="([a-z]{2})"/g)].map((m) => m[1]);
  for (const l of offered.filter((x) => x !== 'en')) {
    const missing = [...keys].filter((k) => lookup(dicts, l, k) === undefined);
    if (missing.length) { problems.push(`${dir} [${l}] not translated: ${missing.join(', ')}`); continue; }
    const english = [], dates = [];
    for (const k of keys) {
      const v = lookup(dicts, l, k), en = lookup(dicts, 'en', k);
      if (NON_LATIN.includes(l)) {
        const words = (v.replace(/https?:\S+|\S+@\S+|\{\w+\}/g, '').match(/[A-Za-z][A-Za-z'’-]*/g) || []).map((w) => w.replace(/[-'’]+$/, ''));
        if (words.filter((w) => !KEEP_LATIN.has(w)).length >= 2) english.push(k);
      } else if (v === en && v.length > 25 && /[a-z]{3,} [a-z]{3,}/.test(v)) english.push(k);
      // The same dates and numbers as English (campaign periods, limits), whatever digits the language uses.
      // (Every number in the English must appear; a translation may add the month as a number.)
      // and no other number except a month (1–12).
      if (/\b20\d\d\b/.test(en) && (numbers(en).some((n) => !numbers(v).includes(n))
        || numbers(v).some((n) => !numbers(en).includes(n) && !(Number(n) >= 1 && Number(n) <= 12)))) dates.push(k);
    }
    if (english.length) problems.push(`${dir} [${l}] looks untranslated (still English): ${english.join(', ')}`);
    if (dates.length) problems.push(`${dir} [${l}] dates differ from English: ${dates.join(', ')}`);
    if (!english.length && !dates.length) ok.push(`${dir} [${l}]: all ${keys.size} keys translated, dates match English`);
  }
}
for (const c of campaigns) {
  const dir = `campaigns/${c.slug}`;
  if (!fs.existsSync(path.join(root, dir, 'i18n.js'))) { problems.push(`${dir}/i18n.js missing`); continue; }
  const page = load([...shared, `${dir}/i18n.js`]);
  checkDict(page.dicts[1], `${dir}/i18n.js`);
  let keys;
  if (c.form === false) { // information page: no form, so no form keys or fields list
    keys = new Set([...htmlKeys(`${dir}/index.html`), ...CORE_KEYS]);
  } else {
    const app = fs.readFileSync(path.join(root, dir, 'app.js'), 'utf8');
    const fields = (app.match(/fields:\s*\[([^\]]*)\]/)?.[1] ?? '').match(/'([^']+)'/g)?.map((f) => f.slice(1, -1)) ?? [];
    if (!fields.length) problems.push(`${dir}/app.js: could not read the fields list`);
    keys = new Set([...htmlKeys(`${dir}/index.html`), ...CORE_KEYS, ...FORM_KEYS, ...fields.map((f) => `err.${f}`)]);
  }
  resolve(page.dicts, keys, `${dir}/index.html`);
  checkLanguages(dir, page.dicts, keys);
}

console.log(ok.map((l) => `PASS  ${l}`).join('\n'));
if (problems.length) {
  console.log(problems.map((l) => `FAIL  ${l}`).join('\n'));
  process.exit(1);
}
console.log(`\nAll translation checks passed (${campaigns.length} campaign(s)).`);

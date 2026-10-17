// Translation completeness check for /campaigns/ (run: node _tests/check-i18n.mjs).
// Folders starting with "_" are not published by GitHub Pages (Jekyll), so this file stays private to the repo.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'); // works on Windows too
const LANGS = ['en', 'id', 'tl', 'my', 'bn', 'ta', 'zh']; // every dictionary file provides all seven
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
    // Safe-markup tokens ([em] [strong] [br] [aN]) must be exactly the English ones (data-i18n-rich).
    const toks = (v) => (String(v).match(/\[\/?(?:em|strong|br|a[1-9])\]/g) || []).sort().join();
    const badTok = keys.filter((k) => d.en[k] !== undefined && toks(d[l][k]) !== toks(d.en[k]));
    if (badTok.length) problems.push(`${file} [${l}] markup tokens differ from English: ${badTok.join(', ')}`);
  }
  ok.push(`${file}: ${en.length} keys × ${LANGS.length} languages`);
}

function htmlKeys(file) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  const keys = new Set();
  for (const m of html.matchAll(/data-i18n(?:-link|-rich)?="([^"]+)"/g)) keys.add(m[1]);
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
  'cal.prev', 'cal.next', 'cal.empty', 'date.months', 'date.weekdays', 'date.full', 'date.short', 'date.month',
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
  'Channel', 'follow', 'Follow', 'mailing', 'list',
  // main website: names, brands and sports kept in Latin script
  'Johan', 'Vijaikumar', 'Rangabashayam', 'Vijai', 'SportSG', 'LinkedIn', 'Piloxing', 'Kahtel', 'Media', 'Outsidein',
  'Motion', 'Facilitators', 'Project', 'Affirmative', 'People', 'asia', 'Floorball', 'Pickleball', 'Netball', 'floorball',
  'pickleball', 'netball', 'piloxing', 'Kayak', 'Kayaking', 'Badminton', 'Basketball', 'Football', 'Singapore', 'Partners']);
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
        const words = (v.replace(/https?:\S+|\S+@\S+|\{\w+\}|\[\/?(?:em|strong|br|a[1-9])\]/g, '').match(/[A-Za-z][A-Za-z'’-]*/g) || []).map((w) => w.replace(/[-'’]+$/, ''));
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


// ---- main website pages (17 Oct 2026): same rules as the campaign pages
const MAIN = [['home', ''], ['domestic-workers', 'domestic-worker-support-singapore'], ['migrant-workers', 'migrant-worker-community-singapore'],
  ['employers', 'caregiver-support-singapore'], ['community', 'community-resources-singapore'], ['faq', 'faq']];
// Text the homepage's own script shows (index.html <script>).
const HOME_SCRIPT_KEYS = ['nav.people', 'nav.activities', 'nav.getInvolved', 'nav.connect', 'fab.start', 'form.sending', 'form.send',
  'form.sentTitle', 'form.sentText', 'form.failTitle', 'form.failText', 'inv.cta.message', 'inv.cta.channel', 'inv.cta.community',
  ...['worker', 'mw', 'family', 'vol', 'org', 'tech'].map((t) => `inv.desc.${t}`)];
{
  const site = load(['assets/i18n/site.js']).dicts[0];
  checkDict(site, 'assets/i18n/site.js');
  for (const [key, dir] of MAIN) {
    const file = `assets/i18n/${key}.js`;
    if (!fs.existsSync(path.join(root, file))) { problems.push(`${file} missing`); continue; }
    const page = load([...shared, 'assets/i18n/site.js', file]);
    checkDict(page.dicts[2], file);
    const html = fs.readFileSync(path.join(root, dir, 'index.html'), 'utf8');
    if (!html.includes(`data-i18n-page="${key}"`)) problems.push(`${dir || '/'}index.html: <body data-i18n-page="${key}"> missing`);
    for (const f of ['/campaigns/translations.js', '/campaigns/shared/i18n-core.js', '/campaigns/shared/i18n-shared.js', '/assets/i18n/site.js', `/${file}`])
      if (!html.includes(`src="${f}"`)) problems.push(`${dir || '/'}index.html: does not load ${f}`);
    const keys = new Set([...htmlKeys(path.join(dir, 'index.html')), ...CORE_KEYS, ...(key === 'home' ? HOME_SCRIPT_KEYS : [])]);
    const dicts = [...page.dicts].reverse(); // the page's own text wins, as in the engine
    resolve(dicts, keys, `${dir || '/'}index.html`);
    checkLanguages(dir, dicts, keys);
  }
}

// ---- translation approval register (campaigns/translations.js)
{
  const ctx = { window: {} }; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(root, 'campaigns/translations.js'), 'utf8'), ctx);
  const REG = ctx.window.TULUS_TRANSLATIONS || {};
  const NAMES = { en: 'English', id: 'Bahasa Indonesia', tl: 'Filipino', my: 'Burmese', bn: 'Bengali', ta: 'Tamil', zh: 'Chinese' };
  const pages = [['campaigns', 'campaigns/index.html', null], ...campaigns.map((c) => [c.slug, `campaigns/${c.slug}/index.html`, c]),
    ...MAIN.map(([k, dir]) => [k, path.join(dir, 'index.html'), 'main'])];
  for (const [key, file, c] of pages) {
    const reg = REG[key];
    if (!reg) { problems.push(`translations.js: no entry for "${key}"`); continue; }
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    if (!html.includes('/campaigns/translations.js')) problems.push(`${file}: does not load /campaigns/translations.js`);
    const offered = [...html.matchAll(/<option value="([a-z]{2})"/g)].map((m) => m[1]).filter((v, i, a) => a.indexOf(v) === i && Object.keys(NAMES).includes(v));
    for (const l of offered) {
      const e = reg.languages[l];
      if (!e) { problems.push(`translations.js [${key}]: no entry for language "${l}"`); continue; }
      if (!['complete', 'incomplete'].includes(e.translation)) problems.push(`translations.js [${key}] ${l}: translation must be complete or incomplete`);
      if (!['none', 'ai-reviewed', 'human-verified'].includes(e.verification)) problems.push(`translations.js [${key}] ${l}: verification must be none, ai-reviewed or human-verified`);
      if (!['approved', 'pending', 'held'].includes(e.release)) problems.push(`translations.js [${key}] ${l}: release must be approved, pending or held`);
      const shouldBePublic = l === 'en' || (e.release === 'approved' && e.translation === 'complete');
      if (e.public !== shouldBePublic) problems.push(`translations.js [${key}] ${l}: public must be true exactly when release is approved and the translation is complete`);
      if (l !== 'en' && e.release === 'approved' && e.verification === 'none') problems.push(`translations.js [${key}] ${l}: approved for release without any review`);
      if (e.verification === 'human-verified' && !(e.history || []).some((h) => /human|native/i.test(h))) problems.push(`translations.js [${key}] ${l}: human-verified needs a history line naming the reviewer and date`);
      if (e.release === 'held' && !(e.history || []).some((h) => /held|hold/i.test(h))) problems.push(`translations.js [${key}] ${l}: held needs a history line saying why`);
    }
    // The page's consent wording version must be the one the register's approvals refer to.
    if (c && c !== 'main' && c.form !== false) {
      const app = fs.readFileSync(path.join(root, 'campaigns', c.slug, 'app.js'), 'utf8');
      const v = app.match(/consentVersion:\s*'([^']+)'/)?.[1];
      if (v !== reg.consentVersion) problems.push(`translations.js [${key}]: consentVersion ${reg.consentVersion} but the page uses ${v}`);
    }
    // The "This page is available in ..." note must name exactly the public languages (skipped when only English shows: the note is hidden then).
    const pub = offered.filter((l) => reg.languages[l] && reg.languages[l].public);
    if (pub.length > 1) {
      const page = c === 'main' ? load(['assets/i18n/site.js']) : load([...shared, ...(key === 'campaigns' ? ['campaigns/i18n.js'] : [`campaigns/${key}/i18n.js`])]);
      const note = lookup([...page.dicts].reverse(), 'en', c === 'main' ? 'site.langNote' : 'lang.notice') || ''; // the page's own text wins over the shared text
      const wrong = Object.keys(NAMES).filter((l) => note.includes(NAMES[l]) !== pub.includes(l));
      if (wrong.length) problems.push(`${file}: English language note does not match the public languages (${wrong.join(', ')})`);
    }
    ok.push(`${file}: public languages ${pub.join(', ')} (register checked)`);
  }
}


// ---- English source lock: when approved English text changes, the translations of those lines need review.
// _tests/i18n-source-lock.json holds a fingerprint of every English line; `--update-lock` records the current text
// (run it only after the translations of the changed lines have been updated and reviewed).
{
  const crypto = await import('node:crypto');
  const files = ['campaigns/shared/i18n-shared.js', 'campaigns/i18n.js', ...campaigns.map((c) => `campaigns/${c.slug}/i18n.js`),
    'assets/i18n/site.js', ...MAIN.map(([k]) => `assets/i18n/${k}.js`)];
  const now = {};
  for (const f of files) {
    const d = load([f]).dicts[0];
    now[f] = Object.fromEntries(Object.entries(d.en).map(([k, v]) => [k, crypto.createHash('sha256').update(v).digest('hex').slice(0, 12)]));
  }
  const lockFile = path.join(root, '_tests/i18n-source-lock.json');
  if (process.argv.includes('--update-lock')) { fs.writeFileSync(lockFile, JSON.stringify(now, null, 1) + '\n'); ok.push('English source lock updated'); }
  else {
    const lockData = fs.existsSync(lockFile) ? JSON.parse(fs.readFileSync(lockFile, 'utf8')) : {};
    for (const f of files) {
      const was = lockData[f] || {};
      const changed = Object.keys(now[f]).filter((k) => was[k] !== now[f][k]);
      if (changed.length) problems.push(`${f}: English changed or added since the translations were last reviewed (review these lines in every language, then run --update-lock): ${changed.join(', ')}`);
      else ok.push(`${f}: English unchanged since last translation review`);
    }
  }
}

console.log(ok.map((l) => `PASS  ${l}`).join('\n'));
if (problems.length) {
  console.log(problems.map((l) => `FAIL  ${l}`).join('\n'));
  process.exit(1);
}
console.log(`\nAll translation checks passed (${campaigns.length} campaign(s)).`);

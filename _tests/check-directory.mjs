// Campaigns & Events directory checks (run: node _tests/check-directory.mjs).
// 1. The plain list and structured data in /campaigns/index.html and /sitemap.xml list exactly the published entries.
// 2. Status and section rules give the expected answer at fixed Singapore times (simulated clock).
// 3. Month and weekday name lists are complete in every language.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
const problems = [];
let passed = 0;
const check = (name, cond, detail = '') => { if (cond) passed++; else problems.push(`${name}${detail ? `: ${detail}` : ''}`); };

const ctx = { window: {}, Date, TulusI18n: { register: (d) => (ctx.dict = d) } };
vm.createContext(ctx);
vm.runInContext(read('campaigns/campaigns.js'), ctx);
vm.runInContext(read('campaigns/i18n.js'), ctx);
const W = ctx.window;
const list = W.TULUS_CAMPAIGNS;

// ---- 1. static copies in step with the register
const html = read('campaigns/index.html');
const staticBlock = html.slice(html.indexOf('id="directory-static"'), html.indexOf('</section>', html.indexOf('id="directory-static"')));
const ld = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? '';
const sitemap = read('sitemap.xml');
for (const c of list) {
  const shown = c.status !== 'hidden';
  const rel = `/campaigns/${c.slug}/`;
  check(`index.html plain list ${shown ? 'has' : 'must not have'} ${rel}`, staticBlock.includes(`href="${rel}"`) === shown);
  check(`index.html structured data ${shown ? 'has' : 'must not have'} ${rel}`, ld.includes(`https://www.tulussg.com${rel}"`) === shown);
  check(`sitemap.xml ${shown ? 'has' : 'must not have'} ${rel}`, sitemap.includes(`<loc>https://www.tulussg.com${rel}</loc>`) === shown);
  if (c.period) check(`${c.slug}: period start before end`, c.period.start <= c.period.end);
  for (const k of ['opensAt', 'closesAt']) if (c[k]) check(`${c.slug}: ${k} is a Singapore time (+08:00)`, /T\d\d:\d\d:\d\d\+08:00$/.test(c[k]));
}
try { JSON.parse(ld); passed++; } catch (e) { problems.push(`structured data is not valid JSON: ${e.message}`); }
check('slugs are unique', new Set(list.map((c) => c.slug)).size === list.length);

// ---- 2. rules at fixed Singapore times
const at = (s) => Date.parse(`${s}+08:00`);
const find = (slug) => list.find((c) => c.slug === slug);
const expect = [
  // [time, slug, status, section]
  ['2026-10-16T12:00:00', 'share-your-story', 'open', 'upcoming'],
  ['2026-10-16T12:00:00', 'share-your-story-migrant-workers', 'coming-soon', 'upcoming'],
  ['2026-10-16T12:00:00', 'sports-carnival', 'coming-soon', 'upcoming'],
  ['2026-10-25T23:59:59', 'share-your-story-migrant-workers', 'coming-soon', 'upcoming'],
  ['2026-10-26T00:00:00', 'share-your-story-migrant-workers', 'open', 'upcoming'],
  ['2026-11-26T23:59:59', 'share-your-story-migrant-workers', 'open', 'upcoming'],
  ['2026-11-27T00:00:00', 'share-your-story-migrant-workers', 'completed', 'past'],
  ['2027-01-10T18:00:00', 'sports-carnival', 'coming-soon', 'upcoming'],
  ['2027-01-11T00:00:00', 'sports-carnival', 'completed', 'past'],
];
for (const [time, slug, status, section] of expect) {
  const c = find(slug);
  check(`${slug} at ${time}: status ${status}`, W.TULUS_PUBLIC_STATUS(c, at(time)) === status, W.TULUS_PUBLIC_STATUS(c, at(time)));
  check(`${slug} at ${time}: section ${section}`, W.TULUS_SECTION(c, at(time)) === section, W.TULUS_SECTION(c, at(time)));
}
// Never "Open" unless a form exists and the registration window is open (the same rule the API enforces).
for (const c of list) {
  for (let t = at('2026-10-01T00:00:00'); t < at('2027-03-01T00:00:00'); t += 3600000) {
    if (W.TULUS_PUBLIC_STATUS(c, t) === 'open' && (c.form === false || W.TULUS_CAMPAIGN_STATE(c, t) !== 'active')) {
      problems.push(`${c.slug} shown as Open at ${new Date(t).toISOString()} while registration is not accepted`); break;
    }
  }
}
passed++;
// Made-up entries for cases not in the register today
const fake = (o) => ({ slug: 'x', category: 'community', audience: [], ...o });
const now = at('2026-12-01T12:00:00');
check('no dates yet → Coming Soon section', W.TULUS_SECTION(fake({ status: 'coming-soon', form: false }), now) === 'soon');
check('hidden (draft) → not listed', W.TULUS_SECTION(fake({ status: 'hidden', eventDate: '2027-02-01' }), now) === null);
check('closed early, event still ahead → Upcoming, Closed', W.TULUS_SECTION(fake({ status: 'closed', eventDate: '2027-02-01' }), now) === 'upcoming'
  && W.TULUS_PUBLIC_STATUS(fake({ status: 'closed', eventDate: '2027-02-01' }), now) === 'closed');
check('closed, no date → Past', W.TULUS_SECTION(fake({ status: 'closed' }), now) === 'past');
check('information page with status active is never Open', W.TULUS_PUBLIC_STATUS(fake({ status: 'active', form: false, eventDate: '2027-02-01' }), now) === 'coming-soon');

// ---- 3. date names
for (const l of ['en', 'id', 'tl', 'my']) {
  check(`${l}: 12 month names`, ctx.dict[l]['date.months'].split(',').length === 12);
  check(`${l}: 7 weekday names`, ctx.dict[l]['date.weekdays'].split(',').length === 7);
}

if (problems.length) { console.log(problems.map((p) => `FAIL  ${p}`).join('\n')); console.log(`${passed} passed, ${problems.length} failed`); process.exit(1); }
console.log(`All directory checks passed (${passed}).`);

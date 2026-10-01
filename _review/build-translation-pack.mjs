// Builds _review/translations-{id,tl,my}.csv from the live i18n files (run: node _review/build-translation-pack.mjs).
// Each row: priority, where the text appears, key, English source, current draft, what changed, and empty reviewer columns.
// Also includes the registrant email copy, read from ../tulussg-api/src/mailer.js (COPY_TEXT) when that folder exists.
// Re-run after ANY text change so reviewers always see the current wording.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const LANG_NAMES = { id: 'Bahasa Indonesia', tl: 'Filipino / Tagalog', my: 'Burmese (Myanmar Unicode)' };

const SOURCES = [
  { files: ['campaigns/shared/i18n-shared.js'], page: 'All campaign pages' },
  { files: ['campaigns/campaigns.js', 'campaigns/i18n.js'], page: '/campaigns/ (campaign list)' },
  { files: ['campaigns/share-your-story/i18n.js'], page: '/campaigns/share-your-story/' },
];

// Text added or changed on 1 October 2026 (the reviewer should look at these first).
const NEW_2026_10_01 = new Set([
  'f.phone.help', 'f.phone.code', 'f.social', 'f.social.help', 'f.social.placeholder', 'f.social.platform', 'f.social.choose',
  'f.social.other', 'f.social.handle', 'f.social.add', 'f.social.remove', 'err.social_platform', 'err.socialLinks',
  'f.emailCopy', 'f.copyEmail', 'f.copyEmail.help', 'err.copyEmail', 'err.invalid_email',
  'success.reference', 'success.copySent', 'success.copyFailed', 'success.next', 'success.whatsapp', 'success.follow',
  'social.instagram', 'social.facebook', 'social.tiktok', 'social.youtube',
]);
const CHANGED_2026_10_01 = new Set(['f.mediaNote', 'success.title', 'success.received']);

const HIGH_LEGAL = new Set(['f.consent', 'f.consentAck', 'f.mediaNote', 'privacy.link', 'privacy.linkEnglishOnly',
  'f.emailCopy', 'f.copyEmail.help', 'email.note', 'email.help', 'email.consent']);
const HIGH_OUTCOME = new Set(['err.network', 'err.server', 'err.campaign_closed', 'err.rate_limited', 'success.received',
  'success.copySent', 'success.copyFailed', 'success.reference']);

function where(key, page) {
  const exact = {
    'f.consent': 'Form: the required consent checkbox (legal wording)',
    'f.consentAck': 'Form: line under the consent checkbox. {link} is replaced by the "Privacy Policy" link; keep {link}',
    'f.mediaNote': 'Form: media notice under the consent checkbox (legal wording; matches Privacy Policy section 11)',
    'privacy.link': 'Footer of every campaign page, and the {link} inside the consent line',
    'privacy.linkEnglishOnly': 'Same link, used while the Privacy Policy is only in English',
    'f.emailCopy': 'Form: OPTIONAL checkbox just above the consent checkbox (not ticked by default)',
    'f.copyEmail': 'Form: email box label, shown only when "Email me a copy" is ticked',
    'f.copyEmail.help': 'Form: help text under the email box (promise: used only to send the copy)',
    'success.copySent': 'Thank-you page: shown ONLY when the email copy was actually sent',
    'success.copyFailed': 'Thank-you page: shown when a copy was requested but could not be sent; "admin@tulussg.com" follows it',
    'success.reference': 'Thank-you page: followed by the reference, e.g. SYS-4Y677L',
    'success.next': 'Thank-you page: sentence above the WhatsApp button',
    'success.whatsapp': 'Thank-you page: main button (opens the TulusSG WhatsApp community)',
    'success.follow': 'Thank-you page: small heading above the Instagram / Facebook / TikTok / YouTube icons',
    'f.phone.help': 'Form: WhatsApp number help text (country-code dropdown + number box)',
    'f.phone.code': 'Form: hidden label for the country-code dropdown (read by screen readers)',
    'f.phone.placeholder': 'Form: grey example text inside the WhatsApp number box',
    'f.social.add': 'Form: the "+" button that adds another social media row (screen-reader label)',
    'f.social.remove': 'Form: the "×" button that removes a social media row (screen-reader label)',
    'hero.alt': 'Image description read by screen readers (not visible)',
    'trust.contact': 'Share Your Story page: reassurance section',
    'form.title': 'Form heading',
    'form.submit': 'Form: the send button',
    'form.submitting': 'Form: send button text while sending',
    'footer.questions': 'Footer of every campaign page, before admin@tulussg.com',
  };
  if (exact[key]) return exact[key];
  const p = key.split('.')[0];
  if (key.startsWith('campaign.')) return key.endsWith('.alt') ? '/campaigns/ list: card image description (screen readers)' : '/campaigns/ list: the campaign card';
  const byPrefix = {
    meta: 'Browser tab title / search-result and link-preview text (not shown on the page)',
    nav: 'Top bar of every campaign page',
    form: 'Form: field markers',
    err: 'Form: error message (shown after pressing Send)',
    status: '/campaigns/ list: status label on a campaign card',
    state: 'Campaign page when the campaign is not open (replaces the form)',
    hub: '/campaigns/ page heading',
    hero: 'Share Your Story page: top section',
    share: 'Share Your Story page: "What can you share?" section',
    trust: 'Share Your Story page: reassurance section',
    f: 'Form: field label or help text',
    nat: 'Form: answer option for Nationality',
    lang: 'Form: answer option for Preferred language',
    film: 'Form: answer option for "comfortable being filmed?"',
    success: 'Thank-you page (shown only after the server confirms the registration is saved)',
    social: 'Thank-you page: screen-reader label / tooltip for a TulusSG social icon',
    email: 'Email copy sent to the registrant (only if they ticked "Email me a copy"). Keep {campaign}, {reference} and {name}',
  };
  return byPrefix[p] || page;
}

function load(files) {
  const dicts = [];
  const ctx = { window: {}, TulusI18n: { register: (d) => dicts.push(d) } };
  vm.createContext(ctx);
  for (const f of files) vm.runInContext(fs.readFileSync(path.join(root, f), 'utf8'), ctx, { filename: f });
  return dicts;
}

const rows = []; // { key, page, en, id, tl, my }
for (const s of SOURCES) {
  for (const d of load(s.files)) {
    for (const key of Object.keys(d.en)) rows.push({ key, page: s.page, en: d.en[key], id: d.id[key], tl: d.tl[key], my: d.my[key] });
  }
}

const apiMailer = path.resolve(root, '..', 'tulussg-api', 'src', 'mailer.js');
if (fs.existsSync(apiMailer)) {
  const { COPY_TEXT } = await import(pathToFileURL(apiMailer).href);
  for (const k of Object.keys(COPY_TEXT.en)) {
    const key = `email.${k}`;
    NEW_2026_10_01.add(key);
    rows.push({ key, page: 'Registrant email copy (api.tulussg.com)', en: COPY_TEXT.en[k], id: COPY_TEXT.id[k], tl: COPY_TEXT.tl[k], my: COPY_TEXT.my[k] });
  }
} else {
  console.warn('tulussg-api not found next to this repo: registrant email copy rows NOT included');
}

const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
for (const lang of ['id', 'tl', 'my']) {
  const header = ['Priority', 'Where it appears', 'Key', 'English (source)', `${LANG_NAMES[lang]} (current draft)`, 'Changed',
    'Reviewer: correct? (Y/N)', 'Reviewer: corrected text', 'Reviewer notes'];
  const lines = [header.map(q).join(',')];
  for (const r of rows) {
    const priority = HIGH_LEGAL.has(r.key) ? 'HIGH: consent / privacy wording'
      : HIGH_OUTCOME.has(r.key) ? 'HIGH: tells the person whether it was saved or sent' : 'Normal';
    const changed = NEW_2026_10_01.has(r.key) ? 'NEW 1 Oct 2026' : CHANGED_2026_10_01.has(r.key) ? 'CHANGED 1 Oct 2026' : '';
    lines.push([priority, where(r.key, r.page), r.key, r.en, r[lang], changed, '', '', ''].map(q).join(','));
  }
  fs.writeFileSync(path.join(here, `translations-${lang}.csv`), '﻿' + lines.join('\r\n') + '\r\n', 'utf8');
  console.log(`translations-${lang}.csv: ${rows.length} rows`);
}

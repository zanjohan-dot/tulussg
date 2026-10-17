/*
 * TulusSG TRANSLATION APPROVAL REGISTER. One place that says, for every page and language: whether the translation is
 * complete, how it was really checked, and whether the owner approved it for public release.
 *
 * Covers the campaign pages AND the main website (main pages: body data-i18n-page).
 * The language menu shows ONLY languages with public: true. Others stay hidden (visible only in review mode: open a
 * page once with ?review=1; ?review=0 ends it). A visitor who chose a hidden language elsewhere is told, in their
 * language, that the page is shown in English and is offered the available languages. Registration works in every case.
 *
 * Fields (one entry per page and language)
 *   consentVersion  page level: the approved English consent wording the translations correspond to (must equal the
 *                   page's app.js and the API; checked by _tests/check-i18n.mjs)
 *   translation     'complete' | 'incomplete'          every key translated? (also enforced by the checks)
 *   verification    'none' | 'ai-reviewed' | 'human-verified'
 *                     ai-reviewed     independent AI review (meaning, naturalness, terminology, blind back-translation
 *                                     of consent and privacy lines). NOT a human check.
 *                     human-verified  checked by a qualified human reviewer; history must name who and when.
 *   release         'approved' | 'pending' | 'held'
 *                     approved  the owner approved this translation for public use (separate from verification:
 *                               a translation can be AI-reviewed and approved without being human-verified)
 *                     pending   awaiting the owner's decision
 *                     held      kept back because of a known material issue (see history)
 *   public          true exactly when release is 'approved' and translation 'complete' (English: always true)
 *   changes         page level: dated English wording changes that apply to every language (consent version history)
 *   translationVersion  date of the last change to this language's text on this page
 *   history         dated log of translations, reviews, approvals and corrections (with the change log in the API repo,
 *                   docs/consent-docs/translation-change-log.md, this maps a registration's "Website language" +
 *                   submission time + consent version to the exact wording shown)
 *
 * When the approved ENGLISH text changes, _tests/check-i18n.mjs lists the changed lines (it compares against
 * _tests/i18n-source-lock.json): update the translations, re-review them, then run
 * `node _tests/check-i18n.mjs --update-lock`.
 */
(function () {
  var AI = 'ai-reviewed';
  function lang(release, version, history) {
    return { translation: 'complete', verification: AI, release: release, public: release === 'approved', translationVersion: version, history: history };
  }
  var SOURCE = { translation: 'complete', verification: 'none', release: 'approved', public: true };

  window.TULUS_TRANSLATIONS = {
    'share-your-story': {
      consentVersion: 'share-your-story-v7.4-2026-10-17',
      // Page-level wording changes (all languages). Earlier records keep the version they were given.
      changes: ['2026-10-14 v7.3 live', '2026-10-17 owner: employer-contact sentence (f.after.p3) removed in every language -> v7.4 (takes effect on deployment)', '2026-10-17 owner D3/D4: new f.use.responsible (Zan J Private Limited responsible for collection and use); f.withdraw and success.withdraw deletion wording aligned with the withdrawal procedure; all languages translated and independently AI-checked (blind back-translation); part of the same version'],
      languages: {
        en: SOURCE,
        id: lang('approved', '2026-10-17', [
          '2026-10-14 AI-audited; approved by owner for publication (live since 14 Oct 2026 ~18:24 SGT)',
          '2026-10-17 independent AI review; withdrawal sentence: "kapan saja" moved first (meaning unchanged; see change log)', '2026-10-17 final AI review (second round); corrections applied (see change log)']),
        tl: lang('approved', '2026-10-17', [
          '2026-10-14 AI-audited; approved by owner for publication (live since 14 Oct 2026 ~18:24 SGT)',
          '2026-10-17 independent AI review; withdrawal sentence: "anumang oras" moved first so it clearly covers withdrawal; social-media help clarified (see change log)', '2026-10-17 final AI review (second round); corrections applied (see change log)']),
        my: lang('approved', '2026-10-17', [
          '2026-10-14 AI-audited; approved by owner for publication (live since 14 Oct 2026 ~18:24 SGT)',
          '2026-10-17 independent AI review; "if any" filming, username label, channel wording (see change log)', '2026-10-17 final AI review (second round); corrections applied (see change log)']),
        bn: lang('approved', '2026-10-17', ['2026-10-17 added (owner: seven languages on every campaign page); shared lines reuse the AI-reviewed Migrant Workers text', '2026-10-17 final AI review (blind back-translation + independent review + adjudication); corrections applied; no unresolved material translation ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        ta: lang('approved', '2026-10-17', ['2026-10-17 added (owner: seven languages on every campaign page); shared lines reuse the AI-reviewed Migrant Workers text', '2026-10-17 final AI review (blind back-translation + independent review + adjudication); corrections applied; no unresolved material translation ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        zh: lang('approved', '2026-10-17', ['2026-10-17 added (owner: seven languages on every campaign page); shared lines reuse the AI-reviewed Migrant Workers text', '2026-10-17 final AI review (blind back-translation + independent review + adjudication); corrections applied; no unresolved material translation ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
      },
    },
    'share-your-story-migrant-workers': {
      consentVersion: 'share-your-story-mw-v1.1-2026-10-17',
      changes: ['2026-10-16 mw-v1 (never public)', '2026-10-17 owner: employer-contact sentence (f.after.p3) removed in every language -> mw-v1.1 (before opening)', '2026-10-17 owner D3/D4: new f.use.responsible (Zan J Private Limited responsible for collection and use); f.withdraw and success.withdraw deletion wording aligned with the withdrawal procedure; all languages translated and independently AI-checked (blind back-translation); part of the same version'],
      languages: {
        en: SOURCE,
        id: lang('approved', '2026-10-17', ['2026-10-16 AI translation (MW lines)', '2026-10-17 independent AI review + third-pass contextual review', '2026-10-17 final AI review (blind back-translation + independent review + adjudication); corrections applied; no unresolved material translation ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        tl: lang('approved', '2026-10-17', ['2026-10-16 AI translation (MW lines)', '2026-10-17 independent AI review + third-pass contextual review', '2026-10-17 final AI review (blind back-translation + independent review + adjudication); corrections applied; no unresolved material translation ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        my: lang('approved', '2026-10-17', ['2026-10-16 AI translation (MW lines)', '2026-10-17 independent AI review + third-pass contextual review', '2026-10-17 final AI review (blind back-translation + independent review + adjudication); corrections applied; no unresolved material translation ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        bn: lang('approved', '2026-10-17', ['2026-10-16 AI translation (whole page)', '2026-10-17 independent AI review + third-pass contextual review', '2026-10-17 final AI review (blind back-translation + independent review + adjudication); corrections applied; no unresolved material translation ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        ta: lang('approved', '2026-10-17', ['2026-10-16 AI translation (whole page)', '2026-10-17 independent AI review (terms: வெளிநாட்டு ஊழியர்கள், இயக்கம், ஒலிப்பதிவு) + third-pass contextual review', '2026-10-17 final AI review (blind back-translation + independent review + adjudication); corrections applied; no unresolved material translation ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        zh: lang('approved', '2026-10-17', ['2026-10-16 AI translation (whole page)', '2026-10-17 independent AI review + third-pass contextual review', '2026-10-17 final AI review (blind back-translation + independent review + adjudication); corrections applied; no unresolved material translation ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
      },
    },
    'sports-carnival': {
      consentVersion: null, // information page: no form, no consent wording
      languages: {
        en: SOURCE,
        id: lang('approved', '2026-10-17', ['2026-10-16 owner asked for the page in seven languages', '2026-10-17 independent AI review', '2026-10-17 final AI review (second round); corrections applied (see change log)']),
        tl: lang('approved', '2026-10-17', ['2026-10-16 owner asked for the page in seven languages', '2026-10-17 independent AI review', '2026-10-17 final AI review (second round); corrections applied (see change log)']),
        my: lang('approved', '2026-10-17', ['2026-10-16 owner asked for the page in seven languages', '2026-10-17 independent AI review', '2026-10-17 final AI review (second round); corrections applied (see change log)']),
        bn: lang('approved', '2026-10-17', ['2026-10-16 owner asked for Bengali, Tamil and Chinese on this page', '2026-10-17 independent AI review', '2026-10-17 final AI review (second round); corrections applied (see change log)']),
        ta: lang('approved', '2026-10-17', ['2026-10-16 owner asked for Bengali, Tamil and Chinese on this page', '2026-10-17 independent AI review', '2026-10-17 final AI review (second round); corrections applied (see change log)']),
        zh: lang('approved', '2026-10-17', ['2026-10-16 owner asked for Bengali, Tamil and Chinese on this page', '2026-10-17 independent AI review', '2026-10-17 final AI review (second round); corrections applied (see change log)']),
      },
    },
    campaigns: { // the /campaigns/ directory
      consentVersion: null,
      languages: {
        en: SOURCE,
        id: lang('approved', '2026-10-17', ['2026-10-14 hub text approved by owner', '2026-10-16 directory text added (AI)', '2026-10-17 independent AI review', '2026-10-17 final AI review (second round); corrections applied (see change log)']),
        tl: lang('approved', '2026-10-17', ['2026-10-14 hub text approved by owner', '2026-10-16 directory text added (AI)', '2026-10-17 independent AI review', '2026-10-17 final AI review (second round); corrections applied (see change log)']),
        my: lang('approved', '2026-10-17', ['2026-10-14 hub text approved by owner', '2026-10-16 directory text added (AI)', '2026-10-17 independent AI review', '2026-10-17 final AI review (second round); corrections applied (see change log)']),
        bn: lang('approved', '2026-10-17', ['2026-10-17 added (owner: seven languages on the directory)', '2026-10-17 final AI review (blind back-translation + independent review + adjudication); corrections applied; no unresolved material translation ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        ta: lang('approved', '2026-10-17', ['2026-10-17 added (owner: seven languages on the directory)', '2026-10-17 final AI review (blind back-translation + independent review + adjudication); corrections applied; no unresolved material translation ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        zh: lang('approved', '2026-10-17', ['2026-10-17 added (owner: seven languages on the directory)', '2026-10-17 final AI review (blind back-translation + independent review + adjudication); corrections applied; no unresolved material translation ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
      },
    },
    // ---- Main website (17 Oct 2026). No consent wording on these pages.
    'home': { // the homepage (/)
      consentVersion: null,
      languages: {
        en: SOURCE,
        id: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)", '2026-10-17 sidebar.credit added (owner: sidebar credit line); AI translation + independent blind back-translation review: meaning matches, no correction; zh keeps 数字 for consistency with the site']),
        tl: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)", '2026-10-17 sidebar.credit added (owner: sidebar credit line); AI translation + independent blind back-translation review: meaning matches, no correction; zh keeps 数字 for consistency with the site']),
        my: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)", '2026-10-17 sidebar.credit added (owner: sidebar credit line); AI translation + independent blind back-translation review: meaning matches, no correction; zh keeps 数字 for consistency with the site']),
        bn: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)", '2026-10-17 sidebar.credit added (owner: sidebar credit line); AI translation + independent blind back-translation review: meaning matches, no correction; zh keeps 数字 for consistency with the site']),
        ta: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)", '2026-10-17 sidebar.credit added (owner: sidebar credit line); AI translation + independent blind back-translation review: meaning matches, no correction; zh keeps 数字 for consistency with the site']),
        zh: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)", '2026-10-17 sidebar.credit added (owner: sidebar credit line); AI translation + independent blind back-translation review: meaning matches, no correction; zh keeps 数字 for consistency with the site']),
      },
    },
    'domestic-workers': { // /domestic-worker-support-singapore/
      consentVersion: null,
      languages: {
        en: SOURCE,
        id: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        tl: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        my: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        bn: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        ta: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        zh: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
      },
    },
    'migrant-workers': { // /migrant-worker-community-singapore/
      consentVersion: null,
      languages: {
        en: SOURCE,
        id: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        tl: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        my: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        bn: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        ta: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        zh: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
      },
    },
    'employers': { // /caregiver-support-singapore/
      consentVersion: null,
      languages: {
        en: SOURCE,
        id: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        tl: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        my: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        bn: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        ta: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        zh: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
      },
    },
    'community': { // /community-resources-singapore/
      consentVersion: null,
      languages: {
        en: SOURCE,
        id: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        tl: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        my: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        bn: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        ta: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        zh: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
      },
    },
    'faq': { // /faq/
      consentVersion: null,
      languages: {
        en: SOURCE,
        id: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        tl: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        my: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        bn: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        ta: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
        zh: lang('approved', '2026-10-17', ['2026-10-17 AI translation from the approved English', '2026-10-17 independent AI review (meaning, naturalness, terminology vs campaign pages, back-translation of sensitive lines); corrections applied; no unresolved material ambiguity; READY FOR OWNER APPROVAL', "2026-10-17 owner (Zan Johan) approved all seven languages for public release in chat (decision D2): approved for public release (AI-reviewed, not human-verified)"]),
      },
    },
  };
})();

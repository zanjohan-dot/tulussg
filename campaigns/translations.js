/*
 * TulusSG TRANSLATION APPROVAL REGISTER (17 Oct 2026). One place that says, for every campaign page and language:
 * whether it may be shown to the public, how it was checked, and which English consent wording it translates.
 *
 * The language menu shows ONLY languages with public: true. Others stay hidden (they appear only in review mode:
 * open a page once with ?review=1). A visitor who chose a hidden language elsewhere is told, in their language, that
 * this page is shown in English, and is offered the available languages. Registration works in every case.
 *
 * Fields
 *   consentVersion   the approved English consent wording this page's translations correspond to (must equal the
 *                    page's app.js and the API; checked by _tests/check-i18n.mjs)
 *   status           'source' (English) | 'owner-approved' (Zan approved it for publication) | 'pending-approval'
 *   public           true only for 'source' and 'owner-approved'
 *   verification     what checking has REALLY happened:
 *                      'ai-reviewed'     reviewed by AI (incl. back-translation of consent lines); NOT a human check
 *                      'native-verified' checked by a qualified native speaker (record who and when in `history`)
 *   translationVersion  date of the last change to this language's text on this page
 *   history          dated log of reviews, approvals and changes (needed to map consent records to the exact wording:
 *                    a registration's "Website language" + submission time + consent version identify the text shown)
 *
 * TO APPROVE A LANGUAGE: after the native-speaker check, set status 'owner-approved', public true, verification
 * 'native-verified', add a history line (date, reviewer, scope). Never set public: true for a language whose consent
 * wording has not been approved by the owner.
 */
window.TULUS_TRANSLATIONS = {
  'share-your-story': {
    consentVersion: 'share-your-story-v7.3-2026-10-14',
    languages: {
      en: { status: 'source', public: true },
      id: { status: 'owner-approved', public: true, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: [
        '2026-10-14 AI-audited; accepted by owner for publication (live since 14 Oct 2026 ~18:24 SGT)',
        '2026-10-17 independent AI review; withdrawal sentence: "kapan saja" moved first (meaning unchanged); awaiting owner sign-off of the 17 Oct changes'] },
      tl: { status: 'owner-approved', public: true, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: [
        '2026-10-14 AI-audited; accepted by owner for publication (live since 14 Oct 2026 ~18:24 SGT)',
        '2026-10-17 independent AI review; withdrawal sentence: "anumang oras" moved first so it clearly covers withdrawal; social-media help clarified; awaiting owner sign-off of the 17 Oct changes'] },
      my: { status: 'owner-approved', public: true, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: [
        '2026-10-14 AI-audited; accepted by owner for publication (live since 14 Oct 2026 ~18:24 SGT)',
        '2026-10-17 independent AI review; "if any" filming, username label, channel wording; awaiting owner sign-off of the 17 Oct changes'] },
    },
  },
  'share-your-story-migrant-workers': {
    consentVersion: 'share-your-story-mw-v1-2026-10-16',
    languages: {
      en: { status: 'source', public: true },
      // Not yet approved by the owner: the campaign opens in English until each language is approved.
      id: { status: 'pending-approval', public: false, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: ['2026-10-16 AI translation (MW lines)', '2026-10-17 independent AI review + third-pass contextual review'] },
      tl: { status: 'pending-approval', public: false, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: ['2026-10-16 AI translation (MW lines)', '2026-10-17 independent AI review + third-pass contextual review'] },
      my: { status: 'pending-approval', public: false, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: ['2026-10-16 AI translation (MW lines)', '2026-10-17 independent AI review + third-pass contextual review'] },
      bn: { status: 'pending-approval', public: false, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: ['2026-10-16 AI translation (whole page)', '2026-10-17 independent AI review + third-pass contextual review'] },
      ta: { status: 'pending-approval', public: false, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: ['2026-10-16 AI translation (whole page)', '2026-10-17 independent AI review (terms: வெளிநாட்டு ஊழியர்கள், இயக்கம், ஒலிப்பதிவு) + third-pass contextual review'] },
      zh: { status: 'pending-approval', public: false, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: ['2026-10-16 AI translation (whole page)', '2026-10-17 independent AI review + third-pass contextual review'] },
    },
  },
  'sports-carnival': {
    consentVersion: null, // information page: no form, no consent wording
    languages: {
      en: { status: 'source', public: true },
      id: { status: 'owner-approved', public: true, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: ['2026-10-16 owner asked for the page in these languages', '2026-10-17 independent AI review'] },
      tl: { status: 'owner-approved', public: true, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: ['2026-10-16 owner asked for the page in these languages', '2026-10-17 independent AI review'] },
      my: { status: 'owner-approved', public: true, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: ['2026-10-16 owner asked for the page in these languages', '2026-10-17 independent AI review'] },
      bn: { status: 'owner-approved', public: true, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: ['2026-10-16 owner asked for Bengali, Tamil and Chinese on this page', '2026-10-17 independent AI review'] },
      ta: { status: 'owner-approved', public: true, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: ['2026-10-16 owner asked for Bengali, Tamil and Chinese on this page', '2026-10-17 independent AI review'] },
      zh: { status: 'owner-approved', public: true, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: ['2026-10-16 owner asked for Bengali, Tamil and Chinese on this page', '2026-10-17 independent AI review'] },
    },
  },
  campaigns: { // the /campaigns/ directory
    consentVersion: null,
    languages: {
      en: { status: 'source', public: true },
      id: { status: 'owner-approved', public: true, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: ['2026-10-14 hub text accepted by owner', '2026-10-16 directory text added (AI)', '2026-10-17 independent AI review'] },
      tl: { status: 'owner-approved', public: true, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: ['2026-10-14 hub text accepted by owner', '2026-10-16 directory text added (AI)', '2026-10-17 independent AI review'] },
      my: { status: 'owner-approved', public: true, verification: 'ai-reviewed', translationVersion: '2026-10-17', history: ['2026-10-14 hub text accepted by owner', '2026-10-16 directory text added (AI)', '2026-10-17 independent AI review'] },
    },
  },
};

/*
 * TulusSG campaigns — PUBLIC list for the website (no secrets, no Sheet IDs).
 *
 * form: false  → information page only (no registration form); its card links to the page with a "See details" button.
 *
 * status:
 *   'active'       card + CTA on /campaigns/; the page shows its form
 *   'coming-soon'  card with "Coming soon", no CTA; the page shows a "coming soon" message instead of the form
 *   'closed'       card with "Closed", no registration CTA; the page shows a "closed" message
 *   'hidden'       not listed on /campaigns/; the page shows a "coming soon" message
 *
 * The API (api.tulussg.com) has its own server-side list and is the AUTHORITY on whether a campaign accepts
 * registrations: if this file and the API disagree, the API rejects the registration and the page shows a
 * translated "closed" message — never a false success. Change both when a campaign opens or closes.
 *
 * To add a campaign: create /campaigns/<slug>/ (index.html, i18n.js, app.js), add its card text to
 * /campaigns/i18n.js (campaign.<slug>.title / .desc / .cta / .alt) and add one entry here.
 */
window.TULUS_CAMPAIGNS = [
  {
    slug: 'share-your-story',
    // OPEN since 14 Oct 2026 (Zan approved Milestone 2b). To close: 'closed' here AND in the API's src/config.js.
    status: 'active',
    order: 1,
    image: 'https://raw.githack.com/zanjohan-dot/tulussg/preview-review-2026-10-16/campaigns/share-your-story/hero-640.webp',
    imageFallback: 'https://raw.githack.com/zanjohan-dot/tulussg/preview-review-2026-10-16/campaigns/share-your-story/hero-640.jpg',
    imageFocus: '50% 30%',
  },
  {
    slug: 'sports-carnival',
    // COMING SOON (Zan, 16 Oct 2026): date Sunday 10 Jan 2027 confirmed; venue, time and registration not yet.
    // form: false = information page only. The card links to the page ("See details") but offers no registration.
    status: 'coming-soon',
    form: false,
    order: 2,
    image: 'https://raw.githack.com/zanjohan-dot/tulussg/preview-review-2026-10-16/campaigns/sports-carnival/card-640.png',
    imageFocus: '50% 50%',
  },
];

/*
 * TulusSG campaigns — PUBLIC list for the website (no secrets, no Sheet IDs).
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
    status: 'active',
    order: 1,
    image: '/campaigns/share-your-story/hero-640.webp',
    imageFallback: '/campaigns/share-your-story/hero-640.jpg',
    imageFocus: '50% 30%',
  },
];

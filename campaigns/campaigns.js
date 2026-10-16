/*
 * TulusSG campaigns — PUBLIC list for the website (no secrets, no Sheet IDs).
 *

 * opensAt / closesAt (optional, absolute times with +08:00): the campaign is 'coming-soon' before opensAt, open
 *   in the window and 'closed' from closesAt, automatically. The API enforces the same window (src/config.js).
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
    image: '/campaigns/share-your-story/hero-640.webp',
    imageFallback: '/campaigns/share-your-story/hero-640.jpg',
    imageFocus: '50% 30%',
  },
  {
    slug: 'sports-carnival',
    // COMING SOON (Zan, 16 Oct 2026): date Sunday 10 Jan 2027 confirmed; venue, time and registration not yet.
    // form: false = information page only. The card links to the page ("See details") but offers no registration.
    status: 'coming-soon',
    form: false,
    order: 2,
    image: '/campaigns/sports-carnival/card-640.png',
    imageFocus: '50% 50%',
  },
  {
    slug: 'share-your-story-migrant-workers',
    // SCHEDULED (Zan, 16 Oct 2026): opens 26 Oct 2026 00:00 SGT, closes 27 Nov 2026 00:00 SGT, by itself.
    // Same dates in the API's src/config.js. To stop it early: 'closed' here AND in the API.
    status: 'active',
    opensAt: '2026-10-26T00:00:00+08:00',
    closesAt: '2026-11-27T00:00:00+08:00',
    order: 3,
    image: '/campaigns/share-your-story-migrant-workers/hero-640.webp',
    imageFallback: '/campaigns/share-your-story-migrant-workers/hero-640.jpg',
    imageFocus: '50% 35%',
  },
];

// The state of a campaign at a moment: 'coming-soon' | 'active' | 'closed' | 'hidden'. Same rule as the API.
// The time comes from the visitor's clock; the API checks again with the server clock when a form is sent.
window.TULUS_CAMPAIGN_STATE = function (c, now) {
  if (!c) return 'closed';
  if (c.status !== 'active') return c.status;
  var t = typeof now === 'number' ? now : (typeof window.TULUS_NOW === 'function' ? window.TULUS_NOW() : Date.now());
  if (c.opensAt && t < Date.parse(c.opensAt)) return 'coming-soon';
  if (c.closesAt && t >= Date.parse(c.closesAt)) return 'closed';
  return 'active';
};

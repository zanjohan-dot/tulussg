/*
 * TulusSG CAMPAIGNS & EVENTS REGISTER: the one list behind /campaigns/ (cards, filters, calendar and archive).
 * PUBLIC file: no secrets, no Sheet IDs. Each entry is one campaign or event.
 *
 * ADDING A CAMPAIGN OR EVENT
 *   1. Create its page: /campaigns/<slug>/ (index.html, i18n.js, app.js). Copy the closest existing one.
 *   2. Add one entry below.
 *   3. Add its card title and image description to /campaigns/i18n.js (campaign.<slug>.title / .alt, 4 languages).
 *   4. Add the page to /sitemap.xml and one line to the plain list in /campaigns/index.html (for search engines).
 *   Run `node _tests/check-i18n.mjs` and `node _tests/check-directory.mjs`: they say what is missing.
 *   Nothing else changes: the section, status, date line and calendar entries are worked out from these fields.
 *
 * FIELDS
 *   slug          unique ID and page address: /campaigns/<slug>/
 *   category      'sports' | 'stories' | 'learning' | 'community'  (the filter buttons only show categories in use)
 *   audience      who it is for: ['mdw'] migrant domestic workers, ['mw'] migrant workers, [] not announced.
 *                 Shown on the card. List both only if the activity really is open to both groups.
 *   status        'active' (registration may open, see opensAt/closesAt) | 'coming-soon' | 'closed' | 'hidden' (draft:
 *                 not listed anywhere; its page shows "coming soon")
 *   form          false = information page, no registration form (Registration: not available)
 *   opensAt / closesAt   REGISTRATION window, absolute times with +08:00. Before opensAt: Coming soon; from closesAt:
 *                 Closed. The API enforces the same window (tulussg-api src/config.js); change both together.
 *   period        CAMPAIGN period for display, Singapore dates: { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
 *   eventDate     the EVENT day, Singapore date 'YYYY-MM-DD'. Only confirmed dates; leave out if not confirmed.
 *   image / imageFallback / imageFocus   card image (webp + jpg), and which part of it to keep in the 16:10 frame
 *   order         tie-breaker when two entries have the same date
 *
 * HOW THE PAGE SORTS THEM (automatic, Singapore time)
 *   Status shown:  Open        registration accepted right now (form, status 'active', inside opensAt–closesAt)
 *                  Coming soon not open yet          Closed  registration closed, event or period not over yet
 *                  Completed   the last date (eventDate or period end) has passed and nothing is open
 *   Section:       Upcoming & Ongoing  open, or has a confirmed date that has not passed
 *                  Coming Soon         no confirmed date yet
 *                  Past                completed, or closed with no date still ahead
 *   "Open" is only shown while the registration window is open. The API is the AUTHORITY on whether a campaign accepts
 *   registrations: if this file and the API disagree, the API refuses and the page shows "closed", never a false
 *   success.
 */
window.TULUS_CAMPAIGNS = [
  {
    slug: 'share-your-story',
    // OPEN since 14 Oct 2026 (Zan approved Milestone 2b). Closes BY ITSELF at the end of the campaign period
    // (Zan, 16 Oct 2026, D1): last day 15 Nov 2026; same closesAt in the API's src/config.js.
    category: 'stories',
    audience: ['mdw'],
    status: 'active',
    closesAt: '2026-11-16T00:00:00+08:00',
    period: { start: '2026-10-15', end: '2026-11-15' },
    order: 1,
    image: 'https://raw.githack.com/zanjohan-dot/tulussg/preview-review-2026-10-17-v12/campaigns/share-your-story/hero-640.webp',
    imageFallback: 'https://raw.githack.com/zanjohan-dot/tulussg/preview-review-2026-10-17-v12/campaigns/share-your-story/hero-640.jpg',
    imageFocus: '50% 30%',
  },
  {
    slug: 'share-your-story-migrant-workers',
    // SCHEDULED (Zan, 16 Oct 2026): opens 26 Oct 2026 00:00 SGT, closes 27 Nov 2026 00:00 SGT, by itself.
    // Same dates in the API's src/config.js. To stop it early: 'closed' here AND in the API.
    category: 'stories',
    audience: ['mw'],
    status: 'active',
    opensAt: '2026-10-26T00:00:00+08:00',
    closesAt: '2026-11-27T00:00:00+08:00',
    period: { start: '2026-10-26', end: '2026-11-26' },
    order: 2,
    image: 'https://raw.githack.com/zanjohan-dot/tulussg/preview-review-2026-10-17-v12/campaigns/share-your-story-migrant-workers/hero-640.webp',
    imageFallback: 'https://raw.githack.com/zanjohan-dot/tulussg/preview-review-2026-10-17-v12/campaigns/share-your-story-migrant-workers/hero-640.jpg',
    imageFocus: '50% 35%',
  },
  {
    slug: 'sports-carnival',
    // COMING SOON (Zan, 16 Oct 2026): date Sunday 10 Jan 2027 confirmed; venue, time, audience and registration not yet.
    // form: false = information page only. When registration is ready: build the form, then status/opensAt/closesAt.
    category: 'sports',
    audience: [],
    status: 'coming-soon',
    form: false,
    eventDate: '2027-01-10',
    order: 3,
    image: 'https://raw.githack.com/zanjohan-dot/tulussg/preview-review-2026-10-17-v12/campaigns/sports-carnival/card-640.jpg',
    imageFocus: '50% 50%',
  },
];

(function () {
  var DAY = 86400000;
  var SGT = 8 * 3600000;
  function now(t) { return typeof t === 'number' ? t : (typeof window.TULUS_NOW === 'function' ? window.TULUS_NOW() : Date.now()); }
  // Midnight (start) of a Singapore calendar date, as a timestamp.
  function sgDay(ymd) { return Date.parse(ymd + 'T00:00:00+08:00'); }
  // Singapore calendar date of a timestamp.
  function sgDate(t) { return new Date(t + SGT).toISOString().slice(0, 10); }

  // Registration state: 'coming-soon' | 'active' | 'closed' | 'hidden'. Same rule as the API (src/config.js).
  // The time comes from the visitor's clock; the API checks again with the server clock when a form is sent.
  window.TULUS_CAMPAIGN_STATE = function (c, t) {
    if (!c) return 'closed';
    if (c.status !== 'active') return c.status;
    t = now(t);
    if (c.opensAt && t < Date.parse(c.opensAt)) return 'coming-soon';
    if (c.closesAt && t >= Date.parse(c.closesAt)) return 'closed';
    return 'active';
  };

  // Last confirmed day of the campaign or event (Singapore date), or null.
  function lastDay(c) {
    var days = [c.eventDate, c.period && c.period.end].filter(Boolean).sort();
    return days.length ? days[days.length - 1] : null;
  }
  function firstDay(c) {
    var days = [c.eventDate, c.period && c.period.start, c.opensAt && sgDate(Date.parse(c.opensAt))].filter(Boolean).sort();
    return days.length ? days[0] : null;
  }

  // Public status shown on the page: 'open' | 'coming-soon' | 'closed' | 'completed' | 'hidden'.
  // 'open' only when a registration form exists AND the registration window is open.
  window.TULUS_PUBLIC_STATUS = function (c, t) {
    t = now(t);
    var reg = window.TULUS_CAMPAIGN_STATE(c, t);
    if (reg === 'hidden') return 'hidden';
    if (reg === 'active' && c.form !== false) return 'open';
    var last = lastDay(c);
    if (last && t >= sgDay(last) + DAY) return 'completed';
    if (reg === 'closed') return 'closed';
    return 'coming-soon';
  };

  // Section of the page: 'upcoming' | 'soon' | 'past' | null (hidden). Each entry is in exactly one section.
  window.TULUS_SECTION = function (c, t) {
    var s = window.TULUS_PUBLIC_STATUS(c, t);
    if (s === 'hidden') return null;
    if (s === 'open') return 'upcoming';
    if (s === 'completed') return 'past';
    var last = lastDay(c);
    var ahead = last && now(t) < sgDay(last) + DAY;
    if (s === 'closed') return ahead ? 'upcoming' : 'past';
    return (firstDay(c) || c.opensAt) ? 'upcoming' : 'soon';
  };

  window.TULUS_DATES = { sgDay: sgDay, sgDate: sgDate, firstDay: firstDay, lastDay: lastDay };
})();

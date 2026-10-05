/*
 * TulusSG campaigns — language engine (shared by /campaigns/ and every campaign page).
 *
 * - ONE language on screen at a time; one selector (#lang-select).
 * - Precedence: ?lang= in the link → the visitor's saved choice (localStorage "tulussg.lang") → English.
 *   Never switches automatically from the browser language.
 * - Translations live in separate files that call TulusI18n.register({...}):
 *     /campaigns/shared/i18n-shared.js    navigation, footer, generic errors, statuses
 *     /campaigns/i18n.js                  the campaign hub
 *     /campaigns/<campaign>/i18n.js       one campaign page
 *   Later files win for the same key; every file must provide all four languages (see _tests/check-i18n.mjs).
 *
 * Markup hooks:
 *   data-i18n="key"                 → textContent
 *   data-i18n-attr="attr:key;…"     → attributes (aria-label, alt, placeholder…)
 *   data-i18n-link="key"            → sentence with a "{link}" placeholder; the link is the privacy policy when
 *                                     data-privacy-anchor is set (built with text nodes, never innerHTML)
 *   data-privacy-link               → the site-wide privacy policy link (text + href follow the language)
 *   data-keep-lang                  → internal link that carries ?lang= (backup for in-app browsers)
 */
// Anti-framing: GitHub Pages cannot send X-Frame-Options, so break out of (or hide inside) foreign frames.
if (window.top !== window.self) {
  try { window.top.location.replace(window.location.href); } catch (e) { document.documentElement.style.display = 'none'; }
}

(function () {
  'use strict';

  var STORAGE_KEY = 'tulussg.lang';
  var LANGS = {
    en: { htmlLang: 'en' },
    id: { htmlLang: 'id' },
    tl: { htmlLang: 'fil' },
    my: { htmlLang: 'my' },
  };

  /*
   * Privacy policy versions that have been LEGALLY REVIEWED and published. English is the authoritative draft.
   * When a reviewed translation is published (e.g. /privacy/id/index.html), add it here — e.g. id: '/privacy/id/'.
   * Until then, other languages link to the English policy with a translated "(in English)" note.
   */
  var PRIVACY_PAGES = { en: '/privacy/' };

  var dictionaries = [];
  var listeners = [];
  var lang = 'en';
  function known(code) { return typeof code === 'string' && Object.prototype.hasOwnProperty.call(LANGS, code); }

  function register(dict) {
    dictionaries.push(dict);
  }

  function lookup(code, key) {
    for (var i = dictionaries.length - 1; i >= 0; i--) {
      var d = dictionaries[i][code];
      if (d && Object.prototype.hasOwnProperty.call(d, key)) return d[key];
    }
    return undefined;
  }

  function t(key) {
    var value = lookup(lang, key);
    if (value === undefined) value = lookup('en', key);
    return value === undefined ? key : value;
  }

  function saved() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function save(code) {
    try { localStorage.setItem(STORAGE_KEY, code); } catch (e) { /* private mode: ?lang= links still work */ }
  }

  function withLang(href) {
    var url = new URL(href, location.href);
    if (lang === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', lang);
    return url.pathname + url.search + url.hash;
  }

  function privacyHref(anchor) {
    return (PRIVACY_PAGES[lang] || PRIVACY_PAGES.en) + (anchor ? '#' + anchor : '');
  }
  function privacyText() {
    return t(PRIVACY_PAGES[lang] ? 'privacy.link' : 'privacy.linkEnglishOnly');
  }

  function apply(code, persist) {
    lang = known(code) ? code : 'en';
    document.documentElement.lang = LANGS[lang].htmlLang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var parts = pair.split(':');
        el.setAttribute(parts[0], t(parts[1]));
      });
    });
    document.querySelectorAll('[data-i18n-link]').forEach(function (el) {
      var parts = t(el.getAttribute('data-i18n-link')).split('{link}');
      var link = document.createElement('a');
      var anchor = el.getAttribute('data-privacy-anchor');
      link.href = privacyHref(anchor);
      link.textContent = privacyText();
      el.textContent = '';
      el.appendChild(document.createTextNode(parts[0] || ''));
      el.appendChild(link);
      el.appendChild(document.createTextNode(parts[1] || ''));
    });
    document.querySelectorAll('[data-privacy-link]').forEach(function (el) {
      el.href = privacyHref(el.getAttribute('data-privacy-link'));
      el.textContent = privacyText();
    });
    document.querySelectorAll('a[data-keep-lang]').forEach(function (el) {
      if (!el.dataset.baseHref) el.dataset.baseHref = el.getAttribute('href');
      el.setAttribute('href', withLang(el.dataset.baseHref));
    });

    document.title = t('meta.title');
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('meta.description'));
    var select = document.getElementById('lang-select');
    if (select) select.value = lang;

    if (persist) {
      save(lang);
      var url = new URL(location.href);
      if (lang === 'en') url.searchParams.delete('lang'); else url.searchParams.set('lang', lang);
      history.replaceState(history.state, '', url);
    }
    listeners.forEach(function (fn) { fn(lang); });
  }

  function start() {
    var fromUrl = new URLSearchParams(location.search).get('lang');
    var initial = (known(fromUrl) && fromUrl) || (known(saved()) && saved()) || 'en';
    // A ?lang= link is an explicit choice: remember it for the other campaign pages and later visits.
    if (known(fromUrl)) save(fromUrl);
    var select = document.getElementById('lang-select');
    if (select) {
      select.addEventListener('change', function () {
        var from = lang;
        apply(select.value, true);
        document.dispatchEvent(new CustomEvent('tulus:language-changed', { detail: { from: from, to: lang } }));
      });
    }
    apply(initial, false);
  }

  window.TulusI18n = {
    register: register,
    start: start,
    t: t,
    lang: function () { return lang; },
    onChange: function (fn) { listeners.push(fn); },
    withLang: withLang,
    languages: Object.keys(LANGS),
  };
})();

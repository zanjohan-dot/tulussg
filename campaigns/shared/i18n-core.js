/*
 * TulusSG — language engine for the WHOLE website (17 Oct 2026: main pages too; it started on the campaign pages,
 * hence its folder). Seven languages: en, id, tl, my, bn, ta, zh.
 *
 * - ONE language on screen at a time; one selector (#lang-select).
 * - Precedence: ?lang= in the link → the visitor's saved choice (localStorage "tulussg.lang") → English.
 *   Never switches automatically from the browser language.
 * - Translations live in separate files that call TulusI18n.register({...}):
 *     /campaigns/shared/i18n-shared.js    navigation, footer, generic errors, statuses
 *     /campaigns/i18n.js                  the campaign hub
 *     /campaigns/<campaign>/i18n.js       one campaign page
 *     /assets/i18n/<page>.js              one main-site page (home, faq, community, ...)
 *   Later files win for the same key; every file must provide all seven languages (see _tests/check-i18n.mjs).
 *   Which languages the public sees is set per page in /campaigns/translations.js (the approval register);
 *   <body data-i18n-page="..."> (main pages) or data-campaign (campaign pages) names the page's register entry.
 *
 * Markup hooks:
 *   data-i18n="key"                 → textContent
 *   data-i18n-attr="attr:key;…"     → attributes (aria-label, alt, placeholder…)
 *   data-i18n-link="key"            → sentence with a "{link}" placeholder; the link is the privacy policy when
 *                                     data-privacy-anchor is set (built with text nodes, never innerHTML)
 *   data-privacy-link               → the site-wide privacy policy link (text + href follow the language)
 *   data-keep-lang                  → internal link that carries ?lang= (backup for in-app browsers)
 *   data-i18n-rich="key"            → text with a tiny SAFE markup: [em]…[/em] [strong]…[/strong] [br] and [a1]…[/a1],
 *                                     [a2]…[/a2] (= the element's 1st, 2nd … original link, keeping its href). Built
 *                                     with DOM nodes and textContent only: translations can never inject HTML.
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
    // Extra languages (16 Oct 2026). A page offers them only if its language menu (#lang-select) lists them, so
    // pages that do not (e.g. Share Your Story) are unchanged and fall back to English.
    bn: { htmlLang: 'bn' },
    ta: { htmlLang: 'ta' },
    zh: { htmlLang: 'zh-Hans' },
  };
  var CORE = ['en', 'id', 'tl', 'my', 'bn', 'ta', 'zh'];

  /*
   * Privacy policy versions that have been LEGALLY REVIEWED and published. English is the authoritative draft.
   * When a reviewed translation is published (e.g. /privacy/id/index.html), add it here — e.g. id: '/privacy/id/'.
   * Until then, other languages link to the English policy with a translated "(in English)" note.
   */
  var PRIVACY_PAGES = { en: '/privacy/' };

  var dictionaries = [];
  var listeners = [];
  var lang = 'en';
  // Languages this page offers: the options of its language menu, or the four core languages.
  // Languages awaiting native-speaker verification (option has data-pending-review) are hidden from the public. They
  // appear only in review mode: open any campaign page once with ?review=1 (ends with ?review=0 or the browser session).
  function reviewMode() {
    var q = new URLSearchParams(location.search).get('review');
    try {
      if (q === '1') sessionStorage.setItem('tulus-review', '1');
      if (q === '0') sessionStorage.removeItem('tulus-review');
      return sessionStorage.getItem('tulus-review') === '1';
    } catch (e) { return q === '1'; }
  }
  // Which languages this page may show the public comes from the translation approval register
  // (/campaigns/translations.js): only public: true. Without a register entry, options marked data-pending-review
  // are hidden. Review mode shows everything.
  function pageKey() {
    var b = document.body;
    return (b && (b.getAttribute('data-i18n-page') || b.getAttribute('data-campaign'))) || 'campaigns';
  }
  (function hideUnapprovedLanguages() {
    var select = document.getElementById('lang-select');
    if (!select || reviewMode()) return;
    var reg = window.TULUS_TRANSLATIONS && window.TULUS_TRANSLATIONS[pageKey()];
    for (var i = select.options.length - 1; i >= 0; i--) {
      var o = select.options[i];
      var entry = reg && reg.languages && reg.languages[o.value];
      var hide = reg ? !(entry && entry.public === true) : o.hasAttribute('data-pending-review');
      if (hide && o.value !== 'en') select.removeChild(o);
    }
    // Only English available: no menu and no "available in ..." note (it would list languages the page does not offer).
    if (select.options.length === 1) {
      var wrap = select.closest('.lang'); if (wrap) wrap.style.display = 'none';
      var n = document.getElementById('lang-note'); if (n) n.style.display = 'none';
    }
  })();

  // Said in the visitor's own language when the language they chose elsewhere on the site is not (yet) available on
  // this page, so the switch to English is never silent.
  var NOT_AVAILABLE = {
    bn: 'এই পৃষ্ঠাটি এখনও বাংলায় পাওয়া যাচ্ছে না, তাই ইংরেজিতে দেখানো হচ্ছে।',
    ta: 'இந்தப் பக்கம் இன்னும் தமிழில் கிடைக்கவில்லை, எனவே ஆங்கிலத்தில் காட்டப்படுகிறது.',
    zh: '本页暂未提供中文版本，现以英文显示。',
    id: 'Halaman ini belum tersedia dalam Bahasa Indonesia, jadi ditampilkan dalam bahasa Inggris.',
    tl: 'Hindi pa available sa Filipino ang pahinang ito, kaya nasa English ito.',
    my: 'ဤစာမျက်နှာကို မြန်မာဘာသာဖြင့် မရရှိသေးသဖြင့် အင်္ဂလိပ်ဘာသာဖြင့် ပြသထားပါသည်။',
  };
  function showNotAvailable(code) {
    var msg = NOT_AVAILABLE[code];
    var note = document.getElementById('lang-note');
    if (!msg || !note || document.getElementById('lang-missing')) return;
    var p = document.createElement('p');
    p.id = 'lang-missing';
    p.className = 'lang-note lang-missing';
    p.setAttribute('role', 'status');
    p.lang = LANGS[code] ? LANGS[code].htmlLang : code;
    p.textContent = msg + ' ';
    // Offer the languages this page does have, so the visitor chooses instead of being switched silently.
    var select = document.getElementById('lang-select');
    if (select && select.options.length > 1) {
      for (var i = 0; i < select.options.length; i++) {
        (function (o) {
          var b = document.createElement('button');
          b.type = 'button';
          b.className = 'lang-choice';
          b.lang = o.getAttribute('lang') || o.value;
          b.textContent = o.textContent;
          b.addEventListener('click', function () {
            select.value = o.value;
            select.dispatchEvent(new Event('change'));
            p.parentNode.removeChild(p);
          });
          p.appendChild(b);
        })(select.options[i]);
      }
    }
    note.parentNode.insertBefore(p, note);
  }

  function pageLangs() {
    var select = document.getElementById('lang-select');
    if (!select) return CORE;
    var list = [];
    for (var i = 0; i < select.options.length; i++) list.push(select.options[i].value);
    return list;
  }
  function known(code) {
    return typeof code === 'string' && Object.prototype.hasOwnProperty.call(LANGS, code) && pageLangs().indexOf(code) !== -1;
  }

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


  // [em]..[/em] [strong]..[/strong] [br] [aN]..[/aN] -> DOM nodes (no innerHTML). Unknown tokens stay as plain text.
  function renderRich(el, text, links) {
    if (links) el._tulusLinks = links;
    if (!el._tulusLinks) el._tulusLinks = Array.prototype.map.call(el.querySelectorAll('a'), function (a) { return a.cloneNode(false); });
    var links = el._tulusLinks;
    while (el.firstChild) el.removeChild(el.firstChild);
    var stack = [el];
    var re = /\[(\/?)(em|strong|br|a[1-9])\]/g, last = 0, m;
    function top() { return stack[stack.length - 1]; }
    while ((m = re.exec(text))) {
      if (m.index > last) top().appendChild(document.createTextNode(text.slice(last, m.index)));
      last = re.lastIndex;
      var tag = m[2];
      if (tag === 'br') { top().appendChild(document.createElement('br')); continue; }
      if (m[1] === '/') { if (stack.length > 1) stack.pop(); continue; }
      var node = tag.charAt(0) === 'a' ? (links[+tag.slice(1) - 1] || document.createElement('span')).cloneNode(false) : document.createElement(tag);
      top().appendChild(node); stack.push(node);
    }
    if (last < text.length) top().appendChild(document.createTextNode(text.slice(last)));
  }

  function apply(code, persist) {
    lang = known(code) ? code : 'en';
    document.documentElement.lang = LANGS[lang].htmlLang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-rich]').forEach(function (el) {
      renderRich(el, t(el.getAttribute('data-i18n-rich')));
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
    if (desc && lookup('en', 'meta.description') !== undefined) desc.setAttribute('content', t('meta.description'));
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
    var wanted = fromUrl || saved();
    if (wanted && initial === 'en' && wanted !== 'en' && Object.prototype.hasOwnProperty.call(LANGS, wanted) && !known(wanted)) showNotAvailable(wanted);
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
    rich: renderRich, // renderRich(element, text, [optional link elements]) for texts a page's own script shows
    languages: CORE.slice(),
  };
})();

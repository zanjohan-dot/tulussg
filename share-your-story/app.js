/*
 * Share Your Story — page behaviour.
 * - One language at a time (header selector, remembered for the visit, ?lang= links).
 * - Friendly inline validation (the API re-validates everything; only the server is trusted).
 * - Sends the registration to the TulusSG API; shows success ONLY when the API confirms it was stored.
 */
(function () {
  'use strict';

  var I18N = window.SYS_I18N;
  var LANGS = window.SYS_LANGUAGES;
  var STORAGE_KEY = 'tulussg.shareStory.lang';
  var MIN_FILL_MS = 3000;
  var TIMEOUT_MS = 20000;
  var STORY_MAX = 1000;

  var metaApi = document.querySelector('meta[name="share-story-api"]');
  // Local preview talks to a locally running API; the live site uses the address in the <meta> tag.
  var API =
    /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
      ? 'http://localhost:3000/api/share-your-story'
      : metaApi && metaApi.content;

  var form = document.getElementById('story-form');
  var langSelect = document.getElementById('lang-select');
  var submitBtn = document.getElementById('submit-btn');
  var sendError = document.getElementById('send-error');
  var storyCount = document.getElementById('story-count');
  var openedAt = Date.now();
  var submitAttempted = false;
  var touched = {};
  var serverErrors = {};
  var sendErrorCode = null;
  var inFlight = false;
  var started = false;
  var clientSubmissionId = randomId();
  var lang = 'en';

  // ---------------------------------------------------------------- analytics (no personal data)
  function track(event, params) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', event, params || {});
      else if (Array.isArray(window.dataLayer)) window.dataLayer.push(Object.assign({ event: event }, params || {}));
    } catch (e) { /* never break the form */ }
  }

  function randomId() {
    if (window.crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    var bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }

  // ---------------------------------------------------------------- language
  function t(key) {
    return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
  }

  function sessionGet() { try { return sessionStorage.getItem(STORAGE_KEY); } catch (e) { return null; } }
  function sessionSet(v) { try { sessionStorage.setItem(STORAGE_KEY, v); } catch (e) { /* private mode */ } }

  function applyLanguage(code, remember) {
    lang = I18N[code] ? code : 'en';
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
    document.title = t('meta.title');
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', t('meta.description'));
    langSelect.value = lang;
    if (remember) {
      sessionSet(lang);
      var url = new URL(location.href);
      url.searchParams.set('lang', lang);
      history.replaceState(history.state, '', url);
    }
    render();
    if (sendErrorCode) showSendError(sendErrorCode);
  }

  langSelect.addEventListener('change', function () {
    track('share_story_language_changed', { from_language: lang, to_language: langSelect.value });
    applyLanguage(langSelect.value, true);
  });

  // ---------------------------------------------------------------- validation (mirrors the API)
  function normalizePhone(raw) {
    var value = raw.trim();
    if (!/^\+?[\d\s\-().]+$/.test(value)) return { ok: false, code: 'invalid_phone' };
    var hasPlus = value.charAt(0) === '+';
    var digits = value.replace(/\D/g, '');
    if (hasPlus) {
      if (digits.length < 8 || digits.length > 15 || digits.charAt(0) === '0') return { ok: false, code: 'invalid_phone' };
      if (digits.indexOf('65') === 0 && !/^65[3689]\d{7}$/.test(digits)) return { ok: false, code: 'invalid_phone' };
      return { ok: true };
    }
    if (/^[3689]\d{7}$/.test(digits) || /^65[3689]\d{7}$/.test(digits)) return { ok: true };
    if (digits.length >= 8 && digits.length <= 15) return { ok: false, code: 'phone_country_code' };
    return { ok: false, code: 'invalid_phone' };
  }

  function values() {
    var data = new FormData(form);
    return {
      fullName: (data.get('fullName') || '').toString(),
      phone: (data.get('phone') || '').toString(),
      nationality: (data.get('nationality') || '').toString(),
      nationalityOther: (data.get('nationalityOther') || '').toString(),
      preferredLanguage: (data.get('preferredLanguage') || '').toString(),
      preferredLanguageOther: (data.get('preferredLanguageOther') || '').toString(),
      story: (data.get('story') || '').toString(),
      filmingComfort: (data.get('filmingComfort') || '').toString(),
      consentContact: form.consentContact.checked,
    };
  }

  // Returns { field: code }. 'required' means "use the field's own friendly message".
  function validate(v) {
    var e = {};
    if (!v.fullName.trim()) e.fullName = 'required';
    if (!v.phone.trim()) e.phone = 'required';
    else { var p = normalizePhone(v.phone); if (!p.ok) e.phone = p.code; }
    if (!v.nationality) e.nationality = 'required';
    if (v.nationality === 'other' && !v.nationalityOther.trim()) e.nationalityOther = 'required';
    if (!v.preferredLanguage) e.preferredLanguage = 'required';
    if (v.preferredLanguage === 'other' && !v.preferredLanguageOther.trim()) e.preferredLanguageOther = 'required';
    if (v.story.length > STORY_MAX) e.story = 'too_long';
    if (!v.filmingComfort) e.filmingComfort = 'required';
    if (!v.consentContact) e.consentContact = 'required';
    return e;
  }

  var FIELDS = ['fullName', 'phone', 'nationality', 'nationalityOther', 'preferredLanguage', 'preferredLanguageOther', 'story', 'filmingComfort', 'consentContact'];

  function messageFor(field, code) {
    if (code === 'required' || code === 'required_choice' || code === 'required_consent') return t('err.' + field);
    return t('err.' + code);
  }

  function render() {
    var v = values();
    var live = validate(v);
    document.querySelector('[data-field="nationalityOther"]').hidden = v.nationality !== 'other';
    document.querySelector('[data-field="preferredLanguageOther"]').hidden = v.preferredLanguage !== 'other';
    storyCount.textContent = String(v.story.length);

    FIELDS.forEach(function (field) {
      var code = serverErrors[field] || ((submitAttempted || touched[field]) && live[field]);
      var box = document.querySelector('[data-field="' + field + '"]');
      var msg = document.getElementById(field + '-error');
      var input = document.getElementById(field);
      if (code) {
        msg.textContent = messageFor(field, code);
        msg.hidden = false;
      } else {
        msg.textContent = '';
        msg.hidden = true;
      }
      if (box) box.classList.toggle('invalid', !!code);
      if (input && input.type !== 'radio') {
        if (code) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
      } else if (box) {
        if (code) box.setAttribute('aria-invalid', 'true'); else box.removeAttribute('aria-invalid');
      }
    });
    return live;
  }

  function fieldOf(target) {
    var box = target.closest('[data-field]');
    return box && box.getAttribute('data-field');
  }

  form.addEventListener('focusin', function () {
    if (started) return;
    started = true;
    track('share_story_form_started', { site_language: lang });
  });
  form.addEventListener('focusout', function (e) {
    var field = fieldOf(e.target);
    if (field && e.target.type !== 'radio' && e.target.type !== 'checkbox') { touched[field] = true; render(); }
  });
  form.addEventListener('input', function (e) {
    var field = fieldOf(e.target);
    if (field && serverErrors[field]) delete serverErrors[field];
    if (e.target.type === 'radio' || e.target.type === 'checkbox' || e.target.tagName === 'SELECT') touched[field] = true;
    hideSendError();
    render();
  });
  form.addEventListener('change', function () { render(); });

  function focusFirstInvalid(errors) {
    for (var i = 0; i < FIELDS.length; i++) {
      if (errors[FIELDS[i]]) {
        var el = document.getElementById(FIELDS[i]);
        var box = document.querySelector('[data-field="' + FIELDS[i] + '"]');
        if (box) box.scrollIntoView({ block: 'center', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        if (el) el.focus({ preventScroll: true });
        return;
      }
    }
  }

  function showSendError(code) {
    sendErrorCode = code;
    sendError.textContent = t('err.' + code);
    sendError.hidden = false;
  }
  function hideSendError() {
    sendErrorCode = null;
    sendError.hidden = true;
  }

  function setSubmitting(on) {
    submitBtn.disabled = on;
    submitBtn.setAttribute('aria-busy', on ? 'true' : 'false');
    var label = submitBtn.querySelector('[data-i18n]');
    var icon = submitBtn.querySelector('svg, .spinner');
    if (on) {
      label.setAttribute('data-i18n', 'form.submitting');
      if (icon) icon.outerHTML = '<span class="spinner" aria-hidden="true"></span>';
    } else {
      label.setAttribute('data-i18n', 'form.submit');
      if (icon) icon.outerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3.1 4.5 6.8 4.5c2.1 0 3.6 1.2 4.4 2.5.8-1.3 2.3-2.5 4.4-2.5 3.7 0 5.9 3.8 4.4 7.2C19.5 16.4 12 21 12 21z"/></svg>';
    }
    label.textContent = t(label.getAttribute('data-i18n'));
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (inFlight) return;
    submitAttempted = true;
    hideSendError();
    var errors = render();
    if (Object.keys(errors).length) {
      track('share_story_form_error', { error_type: 'validation', fields: Object.keys(errors).join(','), site_language: lang });
      focusFirstInvalid(errors);
      return;
    }
    send(values());
  });

  function send(v) {
    inFlight = true;
    setSubmitting(true);
    var controller = 'AbortController' in window ? new AbortController() : null;
    var timer = setTimeout(function () { if (controller) controller.abort(); }, TIMEOUT_MS);
    var body = Object.assign({}, v, {
      siteLanguage: lang,
      clientSubmissionId: clientSubmissionId,
      elapsedMs: Date.now() - openedAt,
      website: form.website.value,
    });

    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: controller ? controller.signal : undefined,
    })
      .then(function (res) {
        return res.json().catch(function () { return null; }).then(function (json) { return { res: res, json: json }; });
      })
      .then(function (r) {
        clearTimeout(timer);
        if (r.res.ok && r.json && r.json.ok === true) {
          track('share_story_form_submitted', { site_language: lang, filming_comfort: v.filmingComfort });
          showSuccess();
          return;
        }
        var json = r.json || {};
        if (json.error === 'validation' && json.fieldErrors) {
          serverErrors = json.fieldErrors;
          fail('validation');
          focusFirstInvalid(render());
          return;
        }
        fail(json.error === 'rate_limited' || json.error === 'too_fast' ? json.error : 'server');
      })
      .catch(function () {
        clearTimeout(timer);
        fail('network');
      });
  }

  function fail(code) {
    inFlight = false;
    setSubmitting(false);
    track('share_story_form_error', { error_type: code, site_language: lang });
    if (code !== 'validation') showSendError(code);
  }

  function showSuccess() {
    document.getElementById('form-view').hidden = true;
    document.getElementById('success-view').hidden = false;
    updateSticky(true);
    var card = document.getElementById('register');
    card.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    document.getElementById('success-title').focus({ preventScroll: true });
  }

  // ---------------------------------------------------------------- CTAs & sticky bar
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  document.querySelectorAll('[data-cta]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var kind = link.getAttribute('data-cta');
      track('share_story_cta_clicked', { cta_location: kind, site_language: lang });
      e.preventDefault();
      var target = document.getElementById(kind === 'about' ? 'about' : 'register');
      target.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      if (kind !== 'about') {
        var heading = document.getElementById(document.getElementById('success-view').hidden ? 'form-title' : 'success-title');
        heading.focus({ preventScroll: true });
      }
    });
  });

  var sticky = document.getElementById('sticky');
  var stickyLink = sticky.querySelector('a');
  var seen = { hero: true, form: false };
  function updateSticky(forceHide) {
    var show = !forceHide && !seen.hero && !seen.form && document.getElementById('success-view').hidden;
    sticky.classList.toggle('show', show);
    sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
    stickyLink.tabIndex = show ? 0 : -1;
  }
  if ('IntersectionObserver' in window) {
    var heroCta = document.getElementById('hero-cta');
    var formCard = document.getElementById('register');
    new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        seen.hero = entry.isIntersecting;
      });
      updateSticky(false);
    }).observe(heroCta);
    // The form counts as "reached" once it fills the lower part of the screen, not when its top edge peeks in.
    new IntersectionObserver(function (entries) {
      seen.form = entries[entries.length - 1].isIntersecting;
      updateSticky(false);
    }, { rootMargin: '0px 0px -35% 0px' }).observe(formCard);
  }

  // ---------------------------------------------------------------- start
  var fromUrl = new URLSearchParams(location.search).get('lang');
  var initial = (fromUrl && I18N[fromUrl] && fromUrl) || (I18N[sessionGet()] && sessionGet()) || 'en';
  applyLanguage(initial, !!fromUrl);
  track('share_story_page_view', { site_language: lang });
})();

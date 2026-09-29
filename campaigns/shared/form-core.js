/*
 * TulusSG campaigns — shared registration-form behaviour.
 *
 * A campaign page supplies only its own fields and rules:
 *   TulusCampaignForm.init({
 *     fields: [...],              // field names in page order (each has #<name>, #<name>-error, [data-field="<name>"])
 *     values: function (form) {}, // read the form
 *     validate: function (v) {},  // → { field: code } ('required' = use the field's own "err.<field>" message)
 *     render: function (v) {},    // optional: show/hide "Other" boxes, counters…
 *   });
 *
 * Everything else is shared: inline errors (no summary box), focus on the first invalid field, a one-per-form
 * clientSubmissionId (so retries never create duplicates), honeypot + fill time, loading state, translated API
 * errors, success ONLY when the API confirms the registration was stored, sticky CTA, campaign status.
 *
 * The page posts to <API>/api/campaigns/<campaign>/interest. It never knows or sends a Sheet ID.
 */
(function () {
  'use strict';

  var TIMEOUT_MS = 20000;
  var t = TulusI18n.t;

  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function randomId() {
    if (window.crypto && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    var bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return Array.prototype.map.call(bytes, function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
  }

  function apiEndpoint(campaign) {
    var meta = document.querySelector('meta[name="tulussg-api"]');
    // Local preview talks to a locally running API (or, for the controlled pre-launch test, the base in ?api=).
    // The override is ignored on the live site, which always uses the address in the <meta> tag.
    var isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
    var base = isLocal ? new URLSearchParams(location.search).get('api') || 'http://localhost:3000' : meta && meta.content;
    return String(base).replace(/\/+$/, '') + '/api/campaigns/' + encodeURIComponent(campaign) + '/interest';
  }

  function init(config) {
    var campaign = document.body.getAttribute('data-campaign');
    var prefix = document.body.getAttribute('data-analytics') || 'campaign';
    var API = apiEndpoint(campaign);
    var FIELDS = config.fields;
    var form = document.getElementById('campaign-form');
    var submitBtn = document.getElementById('submit-btn');
    var sendError = document.getElementById('send-error');
    var formView = document.getElementById('form-view');
    var successView = document.getElementById('success-view');
    var statusView = document.getElementById('status-view');
    var openedAt = Date.now();
    var submitAttempted = false;
    var touched = {};
    var serverErrors = {};
    var sendErrorCode = null;
    var inFlight = false;
    var started = false;
    var clientSubmissionId = randomId();

    function track(event, params) {
      params = Object.assign({ site_language: TulusI18n.lang(), campaign: campaign }, params || {});
      try {
        if (typeof window.gtag === 'function') window.gtag('event', prefix + '_' + event, params);
        else if (Array.isArray(window.dataLayer)) window.dataLayer.push(Object.assign({ event: prefix + '_' + event }, params));
      } catch (e) { /* analytics must never break the form (and never receives personal data) */ }
    }

    // ------------------------------------------------------------ campaign status (public config)
    var entry = (window.TULUS_CAMPAIGNS || []).filter(function (c) { return c.slug === campaign; })[0];
    var status = entry ? entry.status : 'closed';
    if (status !== 'active') {
      var state = status === 'closed' ? 'closed' : 'coming-soon'; // hidden campaigns aren't open either
      formView.hidden = true;
      statusView.hidden = false;
      document.getElementById('status-title').setAttribute('data-i18n', 'state.' + state + '.title');
      document.getElementById('status-body').setAttribute('data-i18n', 'state.' + state + '.body');
    }

    // ------------------------------------------------------------ inline validation
    function messageFor(field, code) {
      if (code === 'required' || code === 'required_choice' || code === 'required_consent') return t('err.' + field);
      return t('err.' + code);
    }

    function render() {
      var v = config.values(form);
      var live = config.validate(v);
      if (config.render) config.render(v);
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
      track('form_started');
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
        if (icon) {
          submitBtn.dataset.icon = icon.outerHTML;
          icon.outerHTML = '<span class="spinner" aria-hidden="true"></span>';
        }
      } else {
        label.setAttribute('data-i18n', 'form.submit');
        if (icon && submitBtn.dataset.icon) icon.outerHTML = submitBtn.dataset.icon;
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
        track('form_error', { error_type: 'validation', fields: Object.keys(errors).join(',') });
        focusFirstInvalid(errors);
        return;
      }
      send(config.values(form));
    });

    function send(v) {
      inFlight = true;
      setSubmitting(true);
      var controller = 'AbortController' in window ? new AbortController() : null;
      var timer = setTimeout(function () { if (controller) controller.abort(); }, TIMEOUT_MS);
      var body = Object.assign({}, v, {
        siteLanguage: TulusI18n.lang(),
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
            track('form_submitted', config.analytics ? config.analytics(v) : {});
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
          var known = ['rate_limited', 'too_fast', 'campaign_closed'];
          fail(known.indexOf(json.error) >= 0 ? json.error : 'server');
        })
        .catch(function () {
          clearTimeout(timer);
          fail('network');
        });
    }

    function fail(code) {
      inFlight = false;
      setSubmitting(false);
      track('form_error', { error_type: code });
      if (code !== 'validation') showSendError(code);
    }

    function showSuccess() {
      formView.hidden = true;
      successView.hidden = false;
      updateSticky(true);
      document.getElementById('register').scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      document.getElementById('success-title').focus({ preventScroll: true });
    }

    // ------------------------------------------------------------ CTAs & sticky bar
    document.querySelectorAll('[data-cta]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        var kind = link.getAttribute('data-cta');
        track('cta_clicked', { cta_location: kind });
        e.preventDefault();
        var target = document.getElementById(kind === 'about' ? 'about' : 'register');
        target.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        if (kind !== 'about') {
          var visible = [formView, successView, statusView].filter(function (v) { return !v.hidden; })[0];
          var heading = visible && visible.querySelector('h2[tabindex]');
          if (heading) heading.focus({ preventScroll: true });
        }
      });
    });

    var sticky = document.getElementById('sticky');
    var stickyLink = sticky.querySelector('a');
    var seen = { hero: true, form: false };
    function updateSticky(forceHide) {
      var show = !forceHide && status === 'active' && !seen.hero && !seen.form && successView.hidden;
      sticky.classList.toggle('show', show);
      sticky.setAttribute('aria-hidden', show ? 'false' : 'true');
      stickyLink.tabIndex = show ? 0 : -1;
    }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { seen.hero = e.isIntersecting; });
        updateSticky(false);
      }).observe(document.getElementById('hero-cta'));
      // The form counts as "reached" once it fills the lower part of the screen, not when its top edge peeks in.
      new IntersectionObserver(function (entries) {
        seen.form = entries[entries.length - 1].isIntersecting;
        updateSticky(false);
      }, { rootMargin: '0px 0px -35% 0px' }).observe(document.getElementById('register'));
    }

    // ------------------------------------------------------------ language
    TulusI18n.onChange(function () {
      render();
      if (sendErrorCode) showSendError(sendErrorCode);
    });
    document.addEventListener('tulus:language-changed', function (e) {
      track('language_changed', { from_language: e.detail.from, to_language: e.detail.to });
    });

    TulusI18n.start();
    track('page_view');
  }

  window.TulusCampaignForm = { init: init };
})();

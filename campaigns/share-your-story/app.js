/*
 * Share Your Story — this campaign's fields and friendly browser checks.
 * Everything generic (language, inline errors, submitting, success, sticky CTA, status) is in
 * /campaigns/shared/form-core.js. The API re-validates everything; only the server is trusted.
 */
(function () {
  'use strict';

  var STORY_MAX = 1000;

  // Mirrors normalizePhone() in the API (server/core/sanitize.ts).
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

  TulusCampaignForm.init({
    fields: ['fullName', 'phone', 'nationality', 'nationalityOther', 'preferredLanguage', 'preferredLanguageOther', 'story', 'filmingComfort', 'consentContact'],

    values: function (form) {
      var data = new FormData(form);
      var get = function (name) { return (data.get(name) || '').toString(); };
      return {
        fullName: get('fullName'),
        phone: get('phone'),
        nationality: get('nationality'),
        nationalityOther: get('nationalityOther'),
        preferredLanguage: get('preferredLanguage'),
        preferredLanguageOther: get('preferredLanguageOther'),
        story: get('story'),
        filmingComfort: get('filmingComfort'),
        consentContact: form.consentContact.checked,
      };
    },

    // Returns { field: code }. 'required' means "use the field's own friendly message".
    validate: function (v) {
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
    },

    render: function (v) {
      document.querySelector('[data-field="nationalityOther"]').hidden = v.nationality !== 'other';
      document.querySelector('[data-field="preferredLanguageOther"]').hidden = v.preferredLanguage !== 'other';
      document.getElementById('story-count').textContent = String(v.story.length);
    },

    // Only non-personal answers go to analytics.
    analytics: function (v) {
      return { filming_comfort: v.filmingComfort };
    },
  });
})();

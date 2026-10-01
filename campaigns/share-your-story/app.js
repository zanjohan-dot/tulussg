/*
 * Share Your Story — this campaign's fields and friendly browser checks.
 * Everything generic (language, inline errors, submitting, success, sticky CTA, status) is in
 * /campaigns/shared/form-core.js. The API re-validates everything; only the server is trusted.
 */
(function () {
  'use strict';

  var STORY_MAX = 1000;
  var SOCIAL_ROWS_MAX = 4;

  // The country-code dropdown and the number box are sent to the API as ONE international number
  // (e.g. +6591234567), the format normalizePhone() and the API already accept. Typing a full number
  // starting with + overrides the dropdown.
  function combinedPhone(form) {
    var raw = (form.phone.value || '').trim();
    if (!raw) return '';
    if (raw.charAt(0) === '+') return raw;
    var cc = form.phoneCountry.value || '65';
    if (!/^[\d\s\-().]+$/.test(raw)) return '+' + cc + ' ' + raw; // let validation flag it
    var digits = raw.replace(/\D/g, '').replace(/^0+/, ''); // drop a local trunk 0 (e.g. Indonesia 0812…)
    if (cc === '65' && /^65[3689]\d{7}$/.test(digits)) digits = digits.slice(2); // 65 typed twice
    return '+' + cc + digits;
  }

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


  // Social media: one row per account (platform dropdown + username). Rows with no username are ignored.
  // Sent to the API as socialAccounts: [{ platform, handle }].
  function socialAccounts(form) {
    return Array.prototype.map.call(form.querySelectorAll('.social-row'), function (row) {
      return {
        platform: row.querySelector('select').value,
        handle: row.querySelector('input').value.trim(),
      };
    }).filter(function (a) { return a.handle; });
  }

  function setupSocialRows() {
    var rows = document.getElementById('socialLinks');
    var add = document.getElementById('social-add');
    function refresh() {
      var all = rows.querySelectorAll('.social-row');
      Array.prototype.forEach.call(all, function (row) { row.querySelector('.social-remove').hidden = all.length === 1; });
      add.hidden = all.length >= SOCIAL_ROWS_MAX;
    }
    add.addEventListener('click', function () {
      var row = rows.querySelector('.social-row').cloneNode(true);
      row.querySelector('select').value = '';
      row.querySelector('input').value = '';
      rows.appendChild(row);
      refresh();
      row.querySelector('select').focus();
    });
    rows.addEventListener('click', function (e) {
      var btn = e.target.closest('.social-remove');
      if (!btn) return;
      var row = btn.closest('.social-row');
      var next = row.nextElementSibling || row.previousElementSibling;
      row.remove();
      refresh();
      (next ? next.querySelector('select') : add).focus();
      rows.dispatchEvent(new Event('change', { bubbles: true })); // re-run the form checks
    });
    refresh();
  }
  setupSocialRows();

  TulusCampaignForm.init({
    fields: ['fullName', 'phone', 'nationality', 'nationalityOther', 'preferredLanguage', 'preferredLanguageOther', 'story', 'socialLinks', 'filmingComfort', 'consentContact'],

    values: function (form) {
      var data = new FormData(form);
      var get = function (name) { return (data.get(name) || '').toString(); };
      return {
        fullName: get('fullName'),
        phone: combinedPhone(form),
        nationality: get('nationality'),
        nationalityOther: get('nationalityOther'),
        preferredLanguage: get('preferredLanguage'),
        preferredLanguageOther: get('preferredLanguageOther'),
        story: get('story'),
        socialAccounts: socialAccounts(form),
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
      var badSocial = v.socialAccounts.filter(function (a) { return a.handle && !a.platform; }).length;
      if (badSocial) e.socialLinks = 'social_platform';
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

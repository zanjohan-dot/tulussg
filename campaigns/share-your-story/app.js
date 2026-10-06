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

  // Year list: from 18 years ago back to 1940 (the server applies the same date rules).
  (function () {
    var sel = document.getElementById('dobYear');
    var top = new Date().getFullYear() - 18;
    for (var y = top; y >= 1940; y--) { var o = document.createElement('option'); o.value = String(y); o.textContent = String(y); sel.appendChild(o); }
  })();

  function validDob(s) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return false;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    if (d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return false;
    var now = new Date(), age = now.getFullYear() - +m[1] - ((now.getMonth() + 1 < +m[2] || (now.getMonth() + 1 === +m[2] && now.getDate() < +m[3])) ? 1 : 0);
    return age >= 18;
  }

  TulusCampaignForm.init({
    fields: ['fullName', 'dateOfBirth', 'idType', 'idNumber', 'mdwDeclaration', 'phone', 'nationality', 'nationalityOther', 'preferredLanguage', 'preferredLanguageOther', 'story', 'socialLinks', 'copyEmail', 'consentVerification', 'consentContact', 'consentMedia'],

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
        // Optional copy by email: only used to send that copy (never marketing).
        emailCopy: form.emailCopy.checked,
        copyEmail: form.emailCopy.checked ? get('copyEmail').trim() : '',
        consentContact: form.consentContact.checked,
        consentMedia: form.consentMedia.checked,
        // Work-pass eligibility. Sent to the server only (which stores it encrypted); never stored in the browser.
        dateOfBirth: get('dobYear') && get('dobMonth') && get('dobDay') ? get('dobYear') + '-' + get('dobMonth') + '-' + get('dobDay') : '',
        idType: get('idType'),
        idNumber: get('idNumber').toUpperCase().replace(/[\s-]/g, ''),
        mdwDeclaration: form.mdwDeclaration.checked,
        consentVerification: form.consentVerification.checked,
        // The consent wording shown on this page. Must match the server's version (change both together).
        consentVersion: 'share-your-story-v6-2026-10-06',
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
      if (v.emailCopy) {
        if (!v.copyEmail) e.copyEmail = 'required';
        else if (v.copyEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.copyEmail)) e.copyEmail = 'invalid_email';
      }
      if (!v.consentContact) e.consentContact = 'required';
      if (!v.consentMedia) e.consentMedia = 'required';
      // Format checks only: they never show that a document or a person is genuine.
      if (!v.dateOfBirth) e.dateOfBirth = 'required';
      else if (!validDob(v.dateOfBirth)) e.dateOfBirth = 'invalid_dob';
      if (!v.idType) e.idType = 'required';
      if (!v.idNumber) e.idNumber = 'required';
      else if (v.idType === 'fin' && !/^[FGM]\d{7}[A-Z]$/.test(v.idNumber)) e.idNumber = 'invalid_fin';
      else if (v.idType === 'passport' && !/^[A-Z0-9]{5,15}$/.test(v.idNumber)) e.idNumber = 'invalid_passport';
      if (!v.mdwDeclaration) e.mdwDeclaration = 'required';
      if (!v.consentVerification) e.consentVerification = 'required';
      return e;
    },

    render: function (v) {
      document.querySelector('[data-field="nationalityOther"]').hidden = v.nationality !== 'other';
      document.querySelector('[data-field="preferredLanguageOther"]').hidden = v.preferredLanguage !== 'other';
      document.getElementById('story-count').textContent = String(v.story.length);
      document.getElementById('copy-email-box').hidden = !v.emailCopy;
      var shown = v.idType === 'fin' || v.idType === 'passport' ? v.idType : 'none';
      Array.prototype.forEach.call(document.querySelectorAll('[data-id-label]'), function (el) { el.hidden = el.getAttribute('data-id-label') !== shown; });
    },

    // Only non-personal answers go to analytics.
    analytics: function (v) {
      return { email_copy: v.emailCopy };
    },
  });
})();

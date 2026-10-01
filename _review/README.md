# Pre-launch review packs (not published: folders starting with "_" are excluded by GitHub Pages)

Refreshed 1 October 2026 to match branch `feat/share-your-story`.

* `legal-review.md`: **start here.** Status, the actual registration flow and storage, the exact English consent wording
  (reviewed by Zan Johan on 1 Oct 2026; not ALAC-approved), emails, the media-consent process, and the Privacy Policy changes
  still needed (section 8; 8A is a launch blocker).
* `translations-id.csv`, `translations-tl.csv`, `translations-my.csv`: every string on /campaigns/ and
  /campaigns/share-your-story/ (form, errors, thank-you page), plus the email copy sent to registrants. Each row has the
  English source, the current draft, **where it appears**, and whether it is new or changed on 1 Oct 2026. Open in Google
  Sheets or Excel, fill in the "Reviewer" columns, and send them back. HIGH-priority rows are consent/privacy wording or
  messages that tell the person whether their registration was saved.
  After corrections are inserted, set `review` to `'reviewed'` for that language in
  campaigns/shared/i18n-shared.js, campaigns/i18n.js and campaigns/share-your-story/i18n.js (and update `COPY_TEXT` in
  tulussg-api/src/mailer.js), then run `node _tests/check-i18n.mjs`.
  **Regenerate the CSVs after any text change:** `node _review/build-translation-pack.mjs`.
* `pdpa-review-2026-09-30.md`, `privacy-policy-v2-draft.md`: **superseded, kept for history.**

Contact address everywhere: admin@tulussg.com.

Order and scope:
1. UI translation review (the CSVs) covers page text, form text, errors, consent lines, the thank-you page and the email copy.
   It does **not** cover the Privacy Policy.
2. The Privacy Policy is legal text. Finalise the English version first (Zan; see `legal-review.md` section 8), then translate
   it, have each translation reviewed, and publish at /privacy/id/, /privacy/tl/, /privacy/my/.

Launch blockers: native-speaker review of id/tl/my, Privacy Policy change 8A, and api.tulussg.com deployed with a passing
end-to-end test.

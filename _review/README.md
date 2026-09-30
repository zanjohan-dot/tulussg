# Pre-launch review packs (not published: folders starting with "_" are excluded by GitHub Pages)

* `translations-id.csv`, `translations-tl.csv`, `translations-my.csv`: every string on /campaigns/ and
  /campaigns/share-your-story/ with its English source. Open them in Google Sheets or Excel, fill in the
  "Reviewer" columns, and send them back. HIGH-priority rows are consent/privacy wording.
  After corrections are inserted, set `review` to `'reviewed'` for that language in
  campaigns/shared/i18n-shared.js, campaigns/i18n.js and campaigns/share-your-story/i18n.js, then run
  `node _tests/check-i18n.mjs`. Regenerate these files after any text change.
* `legal-review.md`: brief for the legal/privacy reviewer (ALAC).

Order and scope:
1. UI translation review (the CSVs) covers page text, form text, errors and consent lines. It does **not** cover the
   Privacy Policy.
2. The Privacy Policy is **legal text**: ALAC approves the **English** version first. Only that approved version is then
   translated, and each translation is legally reviewed before publication at /privacy/id/, /privacy/tl/, /privacy/my/.
Both reviews are launch blockers.

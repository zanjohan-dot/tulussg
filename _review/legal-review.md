# Legal / privacy review brief: TulusSG campaigns (Share Your Story)

For: ALAC (or other legal reviewer). Prepared: 29 September 2026. Status: **draft, pending review. Nothing is live.**
This folder starts with "_" and is **not published** on tulussg.com.

## 1. Pages to review
| Page (after launch) | File in this repo | Notes |
|---|---|---|
| https://www.tulussg.com/privacy/ | `privacy/index.html` | Site-wide policy (text supplied by TulusSG). English = authoritative draft. |
| https://www.tulussg.com/campaigns/share-your-story/ | `campaigns/share-your-story/index.html` | Consent checkbox + notice under it (§3). |
| https://www.tulussg.com/campaigns/ | `campaigns/index.html` | Campaign directory; collects nothing. |

## 2. What the Share Your Story form collects and where it goes
| Data | Required | Stored in |
|---|---|---|
| Name | yes | Private Google Sheet for this campaign only |
| WhatsApp number | yes | same |
| Nationality (+ "other" text) | yes | same |
| Preferred language (+ "other" text) | yes | same |
| Personal story (free text, up to 1,000 characters) | no | same |
| Comfortable being filmed (Yes / Maybe / No) | yes | same |
| Contact consent (must be ticked) | yes | same ("Yes"), plus a consent wording version and timestamp in the server record and admin email |
| Page language used | automatic | admin email only |

* **Flow:** browser → TulusSG API (Google Cloud, Singapore region, subject to host confirmation) → **one private Google Sheet per campaign** (shared only with named TulusSG staff and one service account) → notification email to admin@tulussg.com.
* **Not collected:** email address, FIN, passport, employer, address or salary. Analytics tags, if ever added, receive no personal data.
* **Technical:** the API sees the visitor's IP address, used in memory for about 15 minutes for rate limiting and not stored. Server logs hold only Submission IDs and error types. The website stores the chosen language in the browser (`localStorage`, key `tulussg.lang`); no personal data.

## 3. Exact consent wording (English source)
* **Checkbox (required):** "I agree that TulusSG may contact me about this story-sharing opportunity."
* **Under the checkbox:** "By submitting this form, you acknowledge our [Privacy Policy]." / "Submitting your interest does not give TulusSG permission to publish or use your story, image or voice. Media consent will be obtained separately if you are selected."
* The consent wording version (`share-your-story-v2-2026-09`) is recorded with each registration. If the wording changes, the version is bumped.
* **Media / publication consent is NOT collected** by this form. It is to be obtained separately from selected participants.

Translations of these lines (Bahasa Indonesia, Filipino/Tagalog, Burmese) are marked **HIGH priority** in `_review/translations-*.csv` and are pending native-speaker review.

## 4. Points for the reviewer
1. **Retention:** the policy says unsuccessful expressions of interest are removed "when no longer reasonably required". Is a concrete period needed (e.g. within 6 or 12 months after the campaign ends)?
2. **PDPA contact:** a named Data Protection Officer or business contact (not only admin@tulussg.com)?
3. **Overseas transfer:** Google Sheets / Google Cloud may store or process data outside Singapore. Is the service-provider wording in §6 of the policy sufficient under PDPA's Transfer Limitation Obligation?
4. **Operator:** confirm "Zan J Private Limited", and whether its UEN should appear.
5. **Language:** the policy is English-only while the form is in four languages. Campaign pages link to it with a translated "(in English)" note. Is that acceptable at launch? **Process agreed by TulusSG:** ALAC approves the English policy first; only that approved version is then translated, and the translations are legally reviewed before being published at /privacy/id/, /privacy/tl/, /privacy/my/. Policy translation is kept separate from the ordinary UI translation review (`translations-*.csv`).
6. **"Acknowledge" wording:** is "By submitting this form, you acknowledge our Privacy Policy" appropriate, or should it read differently?
7. **Children:** the form does not ask for age. Is a statement or check needed (e.g. "must be 18 or over")?
8. **Consent record in the Sheet:** the Sheet shows "Contact Consent = Yes". The wording version and timestamp are in the server record and admin email but not in the Sheet columns. Should they be added as Sheet columns for audit? (Small change; the columns were fixed by TulusSG.)
9. **Withdrawal / deletion:** requests go to admin@tulussg.com and are handled manually in the Sheet (Status "Withdrawn" or row deletion). Is a stated response time needed?
10. **Browser storage:** the language preference in `localStorage` is strictly functional. Is any notice needed?

## 5. Sign-off
| Item | Reviewer | Date | Result |
|---|---|---|---|
| Privacy Policy (English) | | | |
| Consent wording (English) | | | |
| Consent wording translations | | | |
| Retention period decided | | | |

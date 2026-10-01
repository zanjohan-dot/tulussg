# Legal / privacy review pack: TulusSG campaigns (Share Your Story)

Refreshed: **1 October 2026**, to match the implementation on branch `feat/share-your-story` (draft pull request).
This folder starts with "_" and is **not published** on tulussg.com.

## 0. Status (read first)

| Item | Status |
|---|---|
| English Privacy Policy (`privacy/index.html`, "Last updated 1 October 2026") | **Reviewed by Zan Johan, Project Lead, 1 October 2026.** Not reviewed or approved by ALAC or any other lawyer. **Section 8 below lists further changes the implementation now needs.** |
| English consent and notice wording on the form (section 4) | **Reviewed by Zan Johan, 1 October 2026.** Not ALAC-approved. |
| Bahasa Indonesia / Filipino / Burmese wording | Drafts. **Pending native-speaker review** (`translations-*.csv`). |
| Registration server (api.tulussg.com) | Built and tested locally only. **Not deployed. No registration is stored anywhere yet.** |
| Website changes | Draft pull request, **not merged, not live**. |

Contact address everywhere: **admin@tulussg.com**. (No other mailbox is used; earlier drafts that suggested `privacy@tulussg.com` are superseded.)

## 1. Pages

| Page (after launch) | File | Notes |
|---|---|---|
| https://www.tulussg.com/privacy/ | `privacy/index.html` | Site-wide policy, English only for now. |
| https://www.tulussg.com/campaigns/ | `campaigns/index.html` | List of published campaigns; collects nothing. Closed campaigns show a "Closed" label and no registration button. Hidden ones are not listed. |
| https://www.tulussg.com/campaigns/share-your-story/ | `campaigns/share-your-story/index.html` | Registration form, consent wording, thank-you page. |
| Homepage menu | `index.html` | New "Campaigns" item in the desktop side menu and the mobile menu, linking to /campaigns/. No other homepage change. |

## 2. What actually happens when someone presses "Share my story"

1. The browser checks the answers and shows errors next to the fields if something is missing.
2. The answers are sent over HTTPS to **api.tulussg.com** (TulusSG's own registration server, to run on Google Cloud Run in Singapore, `asia-southeast1`). The browser never holds any storage key or password.
3. The server checks everything again, then **adds one row to a private Google Sheet** owned by the TulusSG Google Workspace (`zanj@tulussg.com`). Only when that row is saved does the server answer "ok".
4. Only then does the website show the **thank-you page** with a registration reference (e.g. `SYS-4Y677L`). If saving fails, the person sees "your registration was NOT sent", their answers stay in the form, and no email is sent.
5. After saving, the server emails **admin@tulussg.com** (summary + link to the row) and, only if the person asked, emails them **a copy of their own answers**. Each email's result ("Sent …" / "Failed …: reason") is written back to the row. A failed email never turns a saved registration into an error message, and failed emails can be re-sent with `npm run notify:retry`.
6. Pressing Send twice, or the browser retrying, does **not** create a second row (each form carries a one-off submission ID, checked against the Sheet).

### Where the data is stored, and who can see it

* **Store:** Google Sheet "TulusSG – Share Your Story registrations", tab "Registrations", in the TulusSG Google Workspace Drive of `zanj@tulussg.com`. General access: **Restricted**. Shared only with the server's service account (Editor) and the TulusSG people Zan names.
* **Status today:** the Sheet structure is ready; **nothing is written to it until the server is deployed**. Until then the website must not be published.
* **Server logs** contain only the reference, the campaign and error types. No names, numbers, stories or emails.
* **IP address:** held in memory for up to 15 minutes for rate limiting (10 tries per 15 minutes), then dropped. Not stored.
* **Browser:** remembers only the chosen page language (`localStorage`, key `tulussg.lang`).

## 3. What the form collects (one Sheet row per registration)

| Sheet column | Required? | Notes |
|---|---|---|
| Registration reference | automatic | e.g. SYS-4Y677L; shown to the person |
| Campaign | automatic | "Share Your Story" |
| Submitted (Singapore time) | automatic | |
| Name | yes | |
| WhatsApp number | yes | country-code dropdown + number, stored as +CC… |
| Nationality / Nationality (other) | yes | |
| Preferred language / (other) | yes | |
| Story | no | up to 1,000 characters |
| Social media | no | up to 4 accounts: platform + username |
| Comfortable being filmed | yes | Yes / Maybe, tell me more / No |
| Contact consent | yes | must be ticked |
| Consent wording version | automatic | `share-your-story-v3-2026-10-01` (bumped whenever the wording changes) |
| Consent time (UTC) | automatic | |
| Email copy requested | no | Yes / No; **unticked by default** |
| Email for copy | only if a copy is requested | used **only** to send the copy; not marketing consent |
| Copy emailed / Admin notified | automatic | "Pending", "Sent … SGT" or "Failed … SGT: reason" |
| Website language | automatic | language the page was shown in |
| Status | automatic | "New"; TulusSG updates it by hand (e.g. "Contacted", "Withdrawn") |
| Client submission ID | automatic | random ID used only to stop duplicates |

**Not collected:** FIN, passport, employer, address, salary, date of birth.

## 4. Exact English wording on the form (reviewed by Zan Johan, 1 Oct 2026)

* **Consent checkbox (required):** "I agree that TulusSG may contact me about this story-sharing opportunity."
* **Under it:** "By submitting this form, you acknowledge our [Privacy Policy]."
* **Media notice:** "If you are selected and take part, TulusSG may use your image, voice and story for TulusSG events, publicity, social media and media productions, as explained in our Privacy Policy. You can opt out at any time by emailing admin@tulussg.com."
* **Optional checkbox (unticked):** "Email me a copy of my submission." → email box "Your email address", help text: "We will only use this to send you the copy. We won't add you to any mailing list."
* **WhatsApp help:** "Choose your country code, then type your number." **Social media help:** "Choose the platform, then type your username."
* **Errors that say nothing was saved:** "Your registration was not sent. Please check your internet connection and try again." / "Sorry, something went wrong on our side and your registration was NOT sent. Please try again in a few minutes." / "Registrations for this campaign are closed, so your registration was NOT sent." / "Too many tries in a short time. Please wait a few minutes and try again."
* **Thank-you page (only after the server confirms the save):** "Thank you! We've received your registration." · "Your registration reference: SYS-……" · either "A copy has been emailed to you." (only when it was actually sent) or "Your registration was received, but we couldn't email you a copy. For help, contact admin@tulussg.com." · "Join our WhatsApp community for activity updates, and follow TulusSG to see what's coming next." · button "Join our WhatsApp community" · "Follow TulusSG" with Instagram, Facebook, TikTok and YouTube icons. Both are optional; nothing is required to complete the registration.

## 5. Media consent: the actual process

Media use follows **Privacy Policy §11**: joining TulusSG or taking part in an activity is consent to photos, video, interviews and use of image, voice and story; TulusSG tells people when filming or interviews are happening; anyone can opt out by emailing admin@tulussg.com, and TulusSG stops using it in new materials. The form's media notice says the same thing, limited to "if you are selected and take part". **Submitting the form alone is not treated as media consent.**

Removed as superseded: the form line "Submitting your interest does not give TulusSG permission to publish or use your story, image or voice. Media consent will be obtained separately if you are selected." **Still to fix:** the same idea remains in Privacy Policy §3 (see 8A).

## 6. Emails

* **Admin notification** → admin@tulussg.com. Subject "New registration: Share Your Story (SYS-……)". Contains campaign, reference, Singapore time, name, nationality, preferred language, filming answer, whether a story/social accounts/email copy were given, and a link to the row. It deliberately does **not** contain the WhatsApp number, story, social usernames or email address. These stay in the Sheet.
* **Registrant copy** (only if ticked) → the address typed in. Contains their own answers (including WhatsApp number and story), campaign, reference and time, in the page language. Footer: "You asked for this copy. We will not use this email address for anything else." Sent from the TulusSG Workspace mailbox, with replies going to admin@tulussg.com.

## 7. Superseded material

* `pdpa-review-2026-09-30.md` and `privacy-policy-v2-draft.md`: kept for history only. Where they disagree with this pack, this pack wins. Their `privacy@tulussg.com` suggestions have been replaced with admin@tulussg.com.
* Consent version `share-your-story-v2-2026-09` → now **v3-2026-10-01**.

## 8. English Privacy Policy changes still needed (for Zan's decision)

Recommended before launch. **A is a blocker**; the others are strongly recommended. Proposed wording is a starting point. If adopted, bump the policy date and (for A/B) the consent version.

**A. §3 contradicts §11 and the form (BLOCKER).** §3 still says submitting "does not give TulusSG permission to publish, film, photograph…" and that consent "will be discussed with you separately before production". Proposed replacement for the last three sentences of §3:
> Submitting the form means you are expressing interest in taking part. It does not by itself allow TulusSG to publish your story, image or voice. If you are selected and take part, section 11 (Photos, videos and media) applies, and we will tell you before any filming, photography or interview. You may decide not to proceed at any time, and you can opt out by emailing admin@tulussg.com.

**B. §3 list is incomplete.** Add: "the social media accounts you choose to share (platform and username)"; "your email address, only if you ask for a copy of your submission"; and "a registration reference and a record of when you gave consent and which wording you agreed to".

**C. Purpose of the optional email.** Add to §3: "If you ask for a copy of your submission, we use your email address only to send that copy. We do not use it for marketing or add it to any mailing list."

**D. §6 Service providers: be specific.** Suggested: "Registrations are received by TulusSG's registration service, hosted on Google Cloud in Singapore, and stored in a private Google Sheet in TulusSG's Google Workspace. Notification emails are sent through Google Workspace. Google may process or store data outside Singapore under its own data protection terms." This also addresses the PDPA Transfer Limitation question.

**E. §7 Retention: a concrete period.** e.g. "We delete registrations that do not lead to participation within 12 months after the campaign closes."

**F. Copy-email risk (decision, not wording).** If someone mistypes their email address, the copy (with their WhatsApp number and story) goes to a stranger. Options: (1) accept it, since it is their own choice and the box is unticked by default; (2) add a "type your email again" box; (3) leave the WhatsApp number and story out of the copy. Current build: option 1.

**G. Age.** The form does not ask for age. §10 talks about children generally. Consider adding "You must be 18 or older to register" to the form and policy.

**H. Translation.** The policy is English only; campaign pages link to it with the translated link text. The agreed process still stands: once the English text is final, translate it, have each translation reviewed, then publish at /privacy/id/, /privacy/tl/, /privacy/my/.

Still open from the earlier brief: a named data protection contact (the address can stay admin@tulussg.com); a stated response time for access, correction and withdrawal requests.

## 9. Sign-off

| Item | Reviewer | Date | Result |
|---|---|---|---|
| Privacy Policy (English), current text | Zan Johan | 1 Oct 2026 | Reviewed |
| Consent and notice wording (English), section 4 | Zan Johan | 1 Oct 2026 | Reviewed |
| Policy changes 8A–8H | | | |
| Bahasa Indonesia wording | | | |
| Filipino / Tagalog wording | | | |
| Burmese wording | | | |
| End-to-end test on the deployed server | | | |

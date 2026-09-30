# TulusSG Privacy Policy: PDPA review (internal drafting simulation)

**Prepared as:** simulated review by ALAC's Singapore PDPA adviser, for internal drafting only. **This is not legal advice.** ALAC must confirm every conclusion before launch.
**Date:** 30 September 2026
**Reviewed text:** `privacy/index.html`, branch `feat/share-your-story`, commit `341cf43` ("Last updated: 29 September 2026")
**Also reviewed:** the Share Your Story form and consent wording, the campaigns API, the admin email, and browser storage (actual behaviour, checked in code)

**Sources and verification note.** Statutory points reference the Personal Data Protection Act 2012 (PDPA), the Personal Data Protection Regulations 2021, the Personal Data Protection (Notification of Data Breaches) Regulations 2021, and PDPC Advisory Guidelines and guides. The drafting environment could not open sso.agc.gov.sg or pdpc.gov.sg directly. Points were checked through searches restricted to those two domains, which return summaries of the official pages. **Items marked ⚑ should be read against the source text by ALAC before sign-off.**

Classification: **CRITICAL** (a legal requirement is unmet or the policy is materially inaccurate) · **HIGH** (significant legal or operational risk) · **MEDIUM** · **LOW**.
Each point is labelled as a **[Law]** requirement, **[PDPC]** guidance / recommended practice, or **[Practice]** prudent operational practice.

---

## PART 1: Executive assessment

**Verdict: suitable for publication only after amendments.** The draft is not unsound in approach. It is plain-language, it separates media consent, and it avoids absolute security promises. But it cannot be published as it stands, for three reasons:

1. **No designated data protection contact [Law, CRITICAL].** The PDPA requires Zan J Private Limited to designate at least one individual responsible for PDPA compliance and to make that individual's business contact information available to the public (s 11(3), (5)). The policy gives only a general `admin@tulussg.com`, and nothing shows a person has been designated.
2. **The responsible organisation and the actual processing are not described accurately [Law/PDPC, HIGH].**
   * The accountable organisation is named only in passing ("operated under").
   * The policy does not disclose processing that actually happens: Google Fonts receives every visitor's IP address, the pages are hosted on GitHub Pages, the API runs on Render, WhatsApp is used for contact, and full registration details are copied into email.
   * It refers to "private Google Workspace tools" and "private cloud databases" without confirming either.
3. **Transfer, retention and breach handling have no operational basis yet [Law, HIGH].** The PDPA's Transfer Limitation, Retention Limitation and Data Breach Notification obligations are obligations on the organisation, not the website. There is currently:
   * no retention schedule,
   * no check of vendor terms (in particular, whether the Sheet sits in a business Google account covered by Google's data processing terms),
   * no breach procedure.

   The policy wording can only be as accurate as those internal arrangements.

Secondary issues (MEDIUM/LOW):
* **Purposes:** some are broader than current activity, e.g. "programme partners" and "improve … digital platforms".
* **Rights procedures:** withdrawal and access/correction procedures are incomplete, with no consequences explained, no timing and no fee position.
* **Stories:** the warning about sensitive information in personal stories should be extended to medical details, third parties and employer information.
* **Translation:** an English-only policy for a four-language form means reviewed, translated short notices at the point of collection are needed.

A privacy policy does not by itself achieve compliance. Part 7 lists the internal measures that must exist **before launch**.

---

## PART 2: Clause-by-clause review

### Header / introduction
**Current:** "TulusSG is a community initiative operated under Zan J Private Limited."
* **Issue (HIGH):** it doesn't say which **organisation** is responsible for personal data. TulusSG is a brand and is not a legal person, so the PDPA obligations fall on Zan J Private Limited. "Operated under" is ambiguous (licensed? sponsored?).
* **Basis:** [Law] the PDPA applies to "organisations"; s 11(2) makes the organisation responsible for data in its possession or under its control. [PDPC] Notices should be clear about who is collecting.
* **Change:** "TulusSG is a community initiative of Zan J Private Limited (UEN [●]) ("TulusSG", "we", "us"). Zan J Private Limited is the organisation responsible for personal data collected through TulusSG's website, campaigns and activities."

**Current:** "This policy is currently available in English only. Reviewed translations … will be added."
* **Issue (LOW):** acceptable as a status note, but it promises something with no date. See Part 3, Q20 on which language governs.
* **Change:** keep, and add a governing-language clause (see the revised policy, §14).

### §1 Information we may collect
**Current:** a generic list including "email address, where provided", "event or programme registration information", "basic technical information generated when you use our website".
* **Issue (MEDIUM):**
  * (a) The list is a union of possible future data; it doesn't tell a visitor what *this* form collects. That's acceptable only if every form has its own collection notice (see Q3).
  * (b) "Basic technical information" is vague. The actual technical processing is: IP addresses in the website host's and API host's logs, the IP address held in memory for about 15 minutes for rate limiting, and **the visitor's IP address sent to Google Fonts on every page load**.
  * (c) The browser's language setting isn't mentioned (it isn't personal data, but transparency helps).
* **Basis:** [Law] s 20 (notification of purposes). [PDPC] Guide to Notification: layered notices; purposes rather than every activity.
* **Change:** restructure into (a) information you give us through a form, as described on that form; (b) messages you send; (c) technical information, listed concretely; (d) no analytics or advertising cookies.

**Current:** "We only ask for information that is reasonably required …"
* **Issue (LOW):** this is fine, but it must be true in practice. See Part 4 on nationality and full name.

### §2 Why we collect your information
**Current:** "understand the needs and interests of the communities we work with; improve TulusSG programmes, services and digital platforms"
* **Issue (MEDIUM):** these are secondary purposes. Using registration data this way is permissible only within the purposes consented to, or under an exception (e.g. the business-improvement exception, or anonymised or aggregated use). As written, it could be read as permission to analyse stories.
* **Basis:** [Law] ss 13–15, 18 (purpose limitation: purposes a reasonable person would consider appropriate, and notified). ⚑ First Schedule / Second Schedule business-improvement exception, whose conditions apply.
* **Change:** limit it to "using information in aggregated or de-identified form to understand community needs and improve our programmes". Don't mention "digital platforms" analytics that don't exist.

**Current:** "We will not use your personal information for purposes that are materially different … without an appropriate basis or further consent where required."
* **Issue (LOW):** acceptable, but "appropriate basis" is lawyerly and vague to a lay reader.
* **Change:** "If we want to use your information for a new purpose, we will tell you and, where the law requires, ask for your consent first."

### §3 Share Your Story campaign
**Current:** a campaign-specific list inside the site-wide policy.
* **Issue (MEDIUM, structural):** the policy is meant to govern many campaigns. Putting campaign lists in it means amending the policy for each campaign, and it drifts out of date.
* **Basis:** [PDPC] layered notification is acceptable.
* **Change:** move campaign specifics to **campaign collection notices on each form**. The policy gives the common framework, plus one short paragraph explaining that each campaign page says what it collects and why. Keep the media-consent separation as a general clause (§8 of the revised policy).

**Current:** "Submitting the form does not give TulusSG permission to publish, film, photograph or publicly share your story…"
* **Issue:** none. This is good and should be kept (in general form).

### §4 Sensitive or personal stories
**Current:** list of passport/FIN numbers, bank information, passwords, residential address.
* **Issue (MEDIUM):**
  * Missing: medical or health information; information about other people (employers, family, children cared for); employer or household confidential information; immigration or legal matters.
  * There is no statement of what TulusSG does if unrequested sensitive or third-party data arrives.
* **Basis:** [PDPC] NRIC / national identification numbers guidelines: FIN, work permit and passport numbers should not be collected unless required by law or necessary to verify identity to a high degree. [Law] s 24 (protection) and s 25 (retention) apply to data received even if unrequested.
* **Change:** extend the list, and add: "If you include information we do not need, especially about other people, we may remove or redact it."

### §5 Who may access your information
**Current:** "programme partners where this is necessary for the relevant activity and appropriate safeguards are in place"
* **Issue (MEDIUM):** no partner disclosure exists today. A standing statement that data may go to unnamed partners is broad, and disclosure to a partner for its own purposes requires notification and consent (or an exception).
* **Basis:** [Law] ss 13, 20 (consent and notification for **disclosure**).
* **Change:** "We do not share your information with partner organisations unless the campaign's form says so, or we ask you first."

**Current:** "We do not sell your personal information." / "We do not publish your personal information merely because you submitted a registration."
* **Issue:** fine, and should be kept.

### §6 Service providers
**Current:** "stored using services such as private cloud databases or private Google Workspace tools"
* **Issue (HIGH, accuracy):**
  * (a) There is no "cloud database". Storage is Google Sheets.
  * (b) Whether the Sheet is in **Google Workspace** (a business account with Google's data processing terms) or a **personal Google account** hasn't been decided. That affects transfer-limitation compliance (Q13).
  * (c) Not disclosed: **GitHub Pages** (website hosting), **Render** (API hosting), **Google Fonts** (receives visitors' IP addresses), the **email provider** of admin@tulussg.com, and **WhatsApp** (used to contact people).
* **Basis:** [Law] s 20 (accuracy of notified purposes); s 26 (transfer limitation); s 24 (protection, including arrangements with data intermediaries).
* **Change:** name the categories of provider with examples of the actual providers, and state that they may process data outside Singapore (§10 of the revised policy).

### §7 How long we keep information
**Current:** "we aim to remove or anonymise information when it is no longer reasonably required"
* **Issue (HIGH, operational):** the wording mirrors s 25, but "aim to" is soft, and there is **no internal retention schedule** behind it. The PDPA does not require a fixed period to be published, but it does require the organisation to actually stop retaining data. Without a schedule, nobody deletes anything.
* **Basis:** [Law] s 25. [PDPC] the Retention Limitation Obligation does not prescribe fixed periods; organisations set their own.
* **Change:** adopt the schedule in Q9, and publish the **principles plus the headline period** for unsuccessful registrations (e.g. "normally within 6 months after the campaign's selection ends").

### §8 Security
**Current:** "reasonable administrative and technical measures … no internet transmission … can be guaranteed to be completely secure."
* **Issue (LOW):** appropriate and non-absolute. The internal measures must exist (Part 7).
* **Basis:** [Law] s 24 ("reasonable security arrangements").
* **Change:** minor. Mention restricted access and the separate Sheet per campaign in general terms, without technical detail that could aid an attacker.

### §9 Your choices
**Current:** "request deletion of information where appropriate"
* **Issue (MEDIUM):** the PDPA has **no general right to deletion**. Offering deletion as a practice is fine if clearly framed as TulusSG's practice, not a statutory right.
* **Basis:** [Law] ss 16, 21, 22, 25.
* **Change:** "You can ask us to delete your registration. We will do so unless we need to keep something for a legal or safety reason, and we'll tell you if so."

**Current:** access and correction: "ask what personal information we hold about you; correct inaccurate information"
* **Issue (MEDIUM):**
  * No timing and no fee position.
  * The access right under s 21 also covers **how the data has been used or disclosed within the past year**. Not mentioned.
  * Correction under s 22 includes sending corrected data to organisations it was disclosed to in the past year. Not mentioned (rarely relevant here).
* **Basis:** [Law] ss 21–22; Personal Data Protection Regulations 2021 ⚑: respond within 30 days, or tell the individual in writing within 30 days when the organisation will respond. A reasonable fee may be charged for access (not for correction), and the fee should be communicated in advance.
* **Change:** see revised policy §12.

**Current:** withdrawal: "withdraw consent for future contact" / "this will not affect actions already lawfully taken"
* **Issue (MEDIUM):** the likely **consequences of withdrawal** aren't explained (s 16(2)), and there's no statement that withdrawal will be acted on within a reasonable time.
* **Basis:** [Law] s 16: an individual may withdraw on reasonable notice; the organisation must inform them of likely consequences and must not prohibit withdrawal; it must then cease collection, use and disclosure (subject to exceptions and permitted retention).
* **Change:** see revised policy §11.

### §10 Children and young persons
**Current:** "does not intend to collect personal information from children through forms designed for adult participants …"
* **Issue (LOW):** reasonable. The PDPC's practical position is that people aged 13–17 can generally consent for themselves, while under-13s need a parent or guardian, with extra care for minors generally ⚑ (Advisory Guidelines on Children's Personal Data in the Digital Environment, Mar 2024).
* **Change:** keep the substance and add that forms for programmes involving young people will say how consent is handled.

### §11 Photos, videos and media
* **Issue (LOW):** good. Tighten "obtain consent where required" to "ask for your **separate written** consent before any filming, recording or publication".

### §12 External links
* **Issue (LOW):** acceptable.

### §13 Changes to this policy
* **Issue (LOW):** add that significant changes affecting how existing registrations are used will be communicated where practicable.

### §14 Contact us
**Current:** "TulusSG, Email: admin@tulussg.com"
* **Issue (CRITICAL):** no designated data protection contact and no organisation name. See Q2.
* **Basis:** [Law] s 11(3), (5).
* **Change:** "Data Protection Officer, Zan J Private Limited (for TulusSG): privacy@tulussg.com [●]."

### Consent line on the form
**Current:** "By submitting this form, you acknowledge our Privacy Policy."
* **Issue (MEDIUM):** "acknowledge" is acceptable, but a policy is a notice, not something a person consents to or agrees with. The wording should invite reading rather than imply agreement.
* **Change:** see Part 6.

---

## PART 3: Specific questions

### Q1. Organisation / data controller
* **Name Zan J Private Limited** as the organisation responsible. [Law] PDPA obligations attach to the organisation, and TulusSG, as a brand, is not a legal person.
* **UEN:** not required by the PDPA in a privacy policy. It's **recommended** [Practice] because it removes ambiguity about which "Zan J" is meant. (Separately, ALAC should confirm whether the Companies Act 1967's requirement to show the registration number on business documents and publications extends to this website ⚑.)
* **TulusSG:** describe it as a **community initiative (brand) of Zan J Private Limited**, not a separate entity.
* **Wording:** "TulusSG is a community initiative of Zan J Private Limited (UEN [●]). In this policy, 'TulusSG', 'we' and 'us' mean Zan J Private Limited acting through TulusSG. Zan J Private Limited is responsible for personal data collected through TulusSG."

### Q2. Data Protection Officer
* **Requirement [Law]:** s 11(3) requires at least one individual designated as responsible for PDPA compliance (commonly called the DPO). s 11(5) requires the **business contact information of at least one designated individual** to be made available to the public. The DPO need not be an employee and may delegate. PDPC guidance: for access and correction requests, at least one contact should be a mailing address or email.
* **Is admin@tulussg.com enough?** Legally it *may* suffice if it demonstrably reaches the designated individual and is presented as the data protection contact. It isn't sufficient **as currently drafted**, because nothing identifies it as the DPO contact or shows anyone has been designated. **Recommended:** a dedicated role address (e.g. `privacy@tulussg.com` or `dpo@tulussg.com`) that the DPO monitors, with at least one backup person. This keeps privacy requests, including withdrawals and breach reports, out of the general inbox.
* **Personal name:** **not necessary** in the public policy. A title ("Data Protection Officer") plus a business email is a common, accepted approach. The individual's name should be recorded internally and given in the registration to PDPC.
* **Registration [PDPC]:** register the DPO's details with PDPC. Registration was via ACRA BizFile+; PDPC indicated that from 1 Dec 2024 it would be done through PDPC's own form until BizFile+ was restored ⚑. Check the current channel.
* **Implementation:** designate the individual in writing (board or director note) → create the `privacy@` mailbox → publish "Data Protection Officer, Zan J Private Limited (TulusSG): privacy@tulussg.com" → register with PDPC.

### Q3. Notification / purpose limitation
* The general policy explains broad purposes adequately after the edits in Part 2. **But for a multi-campaign site, the most important notice is the campaign collection notice at the point of collection** [PDPC: layered notices]. Each form should say, in 2–4 sentences in the page's language:
  * who is collecting,
  * what it will be used for (that campaign only),
  * who will see it,
  * how long it's kept,
  * how to withdraw or ask questions,
  * a link to the full policy.
* **Yes, every campaign should have its own short notice** (Part 6), reviewed per campaign. The policy then says: "Each form tells you what it collects and why; this policy applies to all of them."

### Q4. Consent (Share Your Story)
* "I agree that TulusSG may contact me about this story-sharing opportunity" is **appropriate but incomplete**. It covers **contact**. It doesn't expressly cover **using the submitted information (including the story) to consider the person for the project**.
  * Arguably, deemed consent by conduct under s 15(1) covers that, since the person voluntarily provides the data for that obvious purpose ⚑.
  * Express wording is cleaner, costs nothing, and avoids reliance on deemed consent for the story, which is the most sensitive field.
* **Recommended** (Part 6): "I agree that TulusSG may use the information in this form to consider me for Share Your Story and contact me about it."
* **Privacy Policy acknowledgement should be separate** and **never presented as consent to the policy**. A policy is a notice; consent is given to specific purposes. Put a notice with a link near the submit button, with **no checkbox**.
* **Don't make wider consents a condition** of registering (s 14(2)(a) ⚑: consent beyond what is reasonable to provide the service cannot be required as a condition). This is one more reason to keep media consent and any "future campaigns" contact separate and optional.

### Q5. Media consent: the four separate things
| Stage | What it covers | When | How |
|---|---|---|---|
| 1. Contact | contacting the person and considering their interest | at registration | the form checkbox (Part 6) |
| 2. Participation | taking part in interviews, pre-production and meetings | after shortlisting | a plain-language participant information sheet plus agreement (in their language) |
| 3. Recording | being filmed, photographed or audio-recorded | before any recording | a separate signed consent, specifying what, where, who is present, and an opt-out for faces/voice (e.g. blurring or pseudonym) |
| 4. Publication and use | publishing or using image, voice and story: channels, duration, editing, and what happens on withdrawal after publication | before release, ideally after they've seen the edit | a separate release; ALAC to draft |

* A release is a legal instrument (copyright and personality considerations, not only PDPA). **ALAC should draft stage 4**, scoped to the specific production rather than "any media, worldwide, in perpetuity" unless justified.
* Be honest in the release about the limits of withdrawal after publication.
* Given the power imbalance (migrant domestic workers, employer relationships), [Practice]:
  * make participation and consent clearly voluntary,
  * allow time to decide and to seek advice,
  * provide the documents in the person's language,
  * avoid identifying employers or households.

### Q6. Personal stories
* **Form and policy warning [Practice, supported by the PDPC NRIC guidelines]:** ask people not to include identification numbers (FIN/passport/work permit), addresses, bank or financial details, medical information, names or identifying details of employers, family members, the people they care for or other third parties, and employer or household confidential information.
* **If third-party data arrives [Law: s 24, s 25; Practice]:**
  * treat it as confidential,
  * don't use it beyond assessing interest,
  * don't forward it,
  * redact or delete unnecessary third-party details from the Sheet once shortlisting no longer needs them,
  * never publish third-party information without that person's own consent,
  * during production, remove identifying details of employers or households.
* **If safeguarding concerns appear** (e.g. disclosure of abuse), have an internal escalation path (e.g. signposting to MOM or NGO helplines). [Practice] This isn't a privacy-policy matter, but it's a foreseeable consequence of inviting stories.

### Q7. Nationality
* **Arguments for:** the production seeks a range of experiences, and nationality helps assemble a representative group of four. It may also inform interpreter and cultural needs, but *preferred language* already covers communication.
* **Arguments against:**
  * For migrant domestic workers, nationality is closely tied to immigration status and can be sensitive.
  * It isn't needed to contact someone or read their story, and a story often reveals background anyway.
* **Assessment:** collection is **defensible if the purpose is stated** ("to help us include a range of experiences"). It's **not necessary as a required field** at the expression-of-interest stage. [Law] s 18: purposes must be reasonable, and required fields should be limited to what's necessary.
* **Recommendation:** make it **optional**, with a one-line reason; **or remove it** and ask shortlisted people later. **Decision needed** (Part 8). Do not require it.

### Q8. Age / minors
* For Share Your Story, an age field is **not necessary**. Migrant domestic workers in Singapore are generally required to be at least 23 under Ministry of Manpower (MOM) work-permit rules ⚑ (verify the current MOM criteria). Collecting age would add data without a clear purpose.
* A **one-line eligibility statement** is proportionate ("This project is for adults aged 18 and over working as domestic helpers in Singapore"), with **no checkbox and no date of birth**.
* **Future campaigns** (students, families, youth sports):
  * each form states whether minors may register;
  * for under-13s, a parent or guardian registers or consents;
  * for 13–17s, use age-appropriate notices and consider parental involvement for anything involving media or overnight activities;
  * collect only an **age band or confirmation**, not date of birth, unless an activity needs it (e.g. insurance).
* ⚑ PDPC Advisory Guidelines on Children's Personal Data in the Digital Environment (Mar 2024).

### Q9. Retention schedule (internal; publish the headline periods)
| Record | Keep for | Then |
|---|---|---|
| Unsuccessful registrations | until selection for that campaign is complete, **max. 6 months** after the registration window closes | delete the row (keep only anonymous counts) |
| Withdrawn registrations | delete within **30 days** of the request | keep a minimal record (Submission ID, withdrawal date, and the WhatsApp number only if needed to honour "do not contact") for the campaign's duration + 6 months |
| Selected participants' registration data | duration of production + **12 months** after first publication (or after the project is abandoned) | delete or reduce to what's in the participant file |
| Media consent / release records | as long as the content is used or published, **plus 6 years** (the general limitation period for contract claims ⚑, Limitation Act 1959), subject to ALAC's advice | secure archive |
| Campaign administration (anonymous counts, statuses without identities) | as needed | already anonymous |
| Admin notification emails | if they contain personal data, **delete within 30 days**; better, stop including it (Q16) | — |
| Exports / downloads of the Sheet | not permitted by default; if needed, delete within **7 days** | — |
| Server / security logs | application logs hold no personal data (Submission IDs only); the rate-limit IP is kept in memory for ~15 minutes; host platform logs per the provider's retention (check Render and GitHub) | automatic |
| Test registrations | delete immediately after testing | — |

[Law] s 25 requires cessation when the purpose is no longer served and there's no legal or business need. These periods are recommended practice, and ALAC should confirm them, especially the media-record period.

### Q10. Access and correction
* [Law] s 21: on request, provide the personal data held and information about how it has been used or disclosed **within the year before the request**, subject to exceptions (Fifth Schedule ⚑). s 22: correct errors or omissions as soon as practicable, unless there are reasonable grounds not to.
* ⚑ Personal Data Protection Regulations 2021: respond within 30 days, or tell the individual in writing within 30 days when the organisation will respond. A reasonable fee may be charged for access (not for correction), communicated in advance.
* **Wording must not over-promise** (e.g. "we will delete anything on request") or under-state (e.g. requiring a specific form, or requiring requests only in English). Accept requests in any of the four languages [Practice].
* Verify identity before disclosing (e.g. reply to the registered WhatsApp number) [Practice].

### Q11. Withdrawal of consent
* [Law] s 16: withdrawal is allowed at any time on reasonable notice; the organisation must inform the person of the likely consequences, must not prohibit withdrawal, and must stop collecting, using or disclosing the data (though it may retain data where s 25 permits).
* **Tell people:**
  * withdrawing means TulusSG will stop contacting them about the campaign and can no longer consider them for it;
  * it doesn't undo anything done before withdrawal;
  * after publication, withdrawing contact consent doesn't by itself withdraw a media release — that's governed by the release, which should say so honestly.
* **Procedure:**
  * any channel (WhatsApp reply, email) in any campaign language;
  * acknowledge promptly;
  * act within **10 working days** [Practice; PDPC's sample clauses use a similar period ⚑];
  * update the Sheet status to "Withdrawn";
  * delete per Q9.

### Q12. Protection (security claims and architecture)
* **Wording:** keep it non-absolute ("reasonable security arrangements"). [Law] s 24.
* **Architecture assessment (PDPA governance view): reasonable and proportionate** for this scale, provided the controls in Q15 are followed. Positive points:
  * a separate private Sheet per campaign (limits the blast radius),
  * server-side-only credentials,
  * no Sheet ID in the browser,
  * a least-privilege service account (Editor on specific Sheets only),
  * plain-text writes (no formula injection),
  * rate limiting and CORS,
  * no personal data in application logs.

  Weaknesses:
  * the admin email copies (Q16),
  * dependence on the Google account type (Q13),
  * the service-account key is a long-lived secret (rotate it; restrict who can create keys),
  * people with Sheet access can download or copy it (Q15).
* **Data intermediaries:** Google, Render and the email provider process data on TulusSG's behalf. [Law] s 4(2) and s 24: TulusSG remains responsible for protection and retention of data they process for it. Contract terms matter (Q13).

### Q13. Overseas transfers
* [Law] s 26 and the PDP Regulations 2021 ⚑: transfer outside Singapore only if the recipient is bound by **legally enforceable obligations** (law, contract, binding corporate rules, or other binding instruments) providing a standard comparable to the PDPA, or a specified certification applies, or another prescribed condition is met (e.g. consent after notification in prescribed terms).
* **Being a large company is not compliance.** TulusSG must check:
  1. **Google (Sheets and service account):**
     * use a **Google Workspace (business) account** to own the Sheet, not a personal Gmail;
     * accept Google's **Cloud / Workspace Data Processing Addendum**;
     * note where data is stored (Workspace data regions exist only on certain editions).

     A personal Google account is **not recommended**: consumer terms don't give a processor commitment.
  2. **Render:** the service runs in Singapore, but Render is a US company, and logs, support access and backups may be processed elsewhere. Review Render's **DPA** and sub-processor list.
  3. **Email provider for admin@tulussg.com** (Workspace, Microsoft 365, Zoho…): check its DPA and data location.
  4. **GitHub Pages** (website hosting; visitor IPs in logs) and **Google Fonts** (visitor IPs): consider **self-hosting fonts** to remove this transfer entirely (a small code change).
  5. **WhatsApp (Meta):** used to contact registrants. The data goes to Meta under the individual's own relationship with WhatsApp; don't share registration data with Meta beyond the message itself.
* Keep a short **vendor register** (Part 7) with each vendor's terms, DPA, location and date checked.
* Policy wording: say that providers **may process data outside Singapore** and that TulusSG takes steps to ensure a comparable standard of protection. **Only say that once the checks above are done.**

### Q14. Data breaches
* **Public policy:** a short statement is enough — that TulusSG will assess suspected breaches and notify PDPC and affected individuals **where the PDPA requires**. Don't publish procedures or timelines beyond what's certain.
* **Internal [Law]**, PDPA Part 6A (ss 26A–26E) ⚑:
  * **Assess** a suspected breach in a reasonable and expeditious manner. PDPC's Guide on Managing and Notifying Data Breaches sets expectations on timing; check the current version.
  * A breach is **notifiable** if it results in, or is likely to result in, **significant harm** to affected individuals (with prescribed categories of personal data in the Notification Regulations), **or** is of **significant scale** (**500 or more** individuals).
  * **Notify PDPC as soon as practicable, and no later than 3 calendar days** after determining the breach is notifiable.
  * **Notify affected individuals** (significant-harm cases) as soon as practicable, unless an exception applies (e.g. remedial action makes harm unlikely, or law enforcement instructs otherwise).
  * **Data intermediaries** must notify TulusSG without undue delay.
* **Keep a breach log** (including non-notifiable incidents), and a one-page response plan: who decides, whom to call, evidence to keep, and how to revoke access or rotate keys.
* **Scale context:** four selected participants, but potentially many registrants, whose stories may include sensitive matters. A story leak could meet the "significant harm" threshold even for a small number of people. Treat Sheet access seriously.
* **Penalties** (context for ALAC): up to S$1 million or 10% of annual Singapore turnover for organisations with turnover above S$10 million, whichever is higher (from 1 Oct 2022).

### Q15. Google Sheets: controls
The per-campaign private Sheet is a **reasonable** design [PDPC-consistent: proportionate, least privilege]. Controls:
* **Ownership:** owned by the TulusSG Google Workspace account, **not an individual's personal account**, so access survives staff changes.
* **Sharing:** General access **Restricted**. Named individuals only, with Viewer where editing isn't needed. The service account is **Editor only** on that Sheet, never Owner. `npm run sheet:verify` checks this.
* **No link forwarding:** forwarded links don't grant access when sharing is Restricted, but check that "Anyone with the link" is never switched on (the verify script fails if it is).
* **Downloads:** for Viewers, disable download, print and copy in the Sheet's sharing settings. Rule: no exports to personal devices or chat apps.
* **Offboarding:** remove access the same day someone leaves or finishes the campaign. **Quarterly access review** (run `sheet:verify` and review the access list).
* **Auditability:** version history shows edits. Workspace editions with Drive audit logs add access logging. Keep the Status column as the workflow record rather than side lists.
* **Retention:** a calendar reminder to delete rows per Q9. When a campaign ends, delete or anonymise the Sheet and remove its variable from the API.
* **Service-account key:** stored only in the host's secret store. Rotate yearly or on any suspicion. Restrict key creation in the Cloud project.

### Q16. Admin email notifications
* **Current behaviour:** the email contains **name, WhatsApp number, nationality, languages, the full story, filming comfort and consent**. That creates copies outside the Sheet's controls — mailboxes, phones, forwards, backups — undermining Q9 and Q15. [Law] s 24, s 25.
* **Recommendation:** send a **minimal notification**: "New Share Your Story registration received: SYS-XXXX (Singapore time …). Review it in the Sheet." At most, include the **first name** and **preferred language**. **Never include the story or the phone number.** This is a small code change; **decision needed**.

### Q17. localStorage (`tulussg.lang`)
* The stored value is only a language code (e.g. `"id"`). On its own it doesn't identify anyone and isn't personal data. **No consent is required under Singapore law**, and there's no EU-style cookie-consent requirement in the PDPA. [PDPC] Cookies that don't collect personal data don't require consent under the PDPA ⚑ (Advisory Guidelines on the PDPA for Selected Topics, "online activities").
* [Practice] Mention it in the policy for transparency (one sentence). No banner is needed.

### Q18. Analytics / tracking
* **Currently:** no analytics, no advertising cookies, no tracking pixels. The code includes a dormant helper that only sends events if an analytics tag is later added, and it never sends personal data.
* The policy must **not** imply analytics exist. It must disclose the **Google Fonts** IP transfer, or fonts should be self-hosted.
* **If analytics are added later:**
  * update the policy **before** switching them on;
  * prefer privacy-preserving, cookieless or aggregated analytics;
  * configure IP truncation where available;
  * never send form contents;
  * reassess whether consent is needed (it is if personal data is collected for purposes not covered).

### Q19. Terminology
* The current policy mostly uses "you" and "participants", and doesn't use "applicant". Keep it that way.
* **Use:** "you", "people who register interest", "registrants", or "participants" (for those selected or taking part).
* **Avoid:** "applicant", "application" (employment connotations), and "user" where a human term fits.
* **Internal:** the form code and Sheet use "Submission ID" and "registration", which is fine. Earlier drafts' "applicant" in code comments is internal only.

### Q20. Translation
* [Law] The PDPA doesn't prescribe a language. But notification and consent are only effective if the person can **reasonably understand** what they're told [PDPC: notices should be clear and easily understood].
* An English-only policy is **acceptable at launch only if** the **point-of-collection notice and consent lines are translated and reviewed** in all four languages. Those carry the essential information.
* **Process** (TulusSG's agreed approach, endorsed):
  1. ALAC approves the **English** policy.
  2. Only that version is translated professionally.
  3. Each translation is reviewed (legal plus native speaker).
  4. Publish each at /privacy/id/, /privacy/tl/, /privacy/my/.
* **Governing language:** state that the English version governs if a translation differs, **but** that TulusSG will interpret any inconsistency fairly to the individual. Don't rely on the English text to defeat a person's reasonable understanding of the translated notice they were actually shown.

---

## PART 4: Data minimisation, Share Your Story fields

| Field | Why needed | Needed at expression-of-interest stage? | Required / optional | Less intrusive alternative |
|---|---|---|---|---|
| Name | to address the person and recognise them when contacting | yes, some name | **Required**, but as "the name you'd like us to use" rather than full legal name | full legal name only if selected (for the release) |
| WhatsApp number | the only contact channel | yes | **Required** | none equivalent (email is less used by this group) |
| Nationality | range of experiences in a group of four | **not essential** | **Optional**, with a stated reason; or remove (**decision**) | infer from the story or ask at shortlisting |
| Preferred language | to contact the person in a language they understand | yes | **Required** | — |
| Other language | only when "Other" is chosen | conditional | required only if "Other" | — |
| Story | to consider suitability | useful, not essential | **Optional** (as now), with the sensitive-information warning; 1,000-character cap is proportionate | — |
| Filming comfort | to know early if filming is a barrier | useful | Required is **acceptable** because "Maybe" and "No" are neutral options; could be optional | — |
| Contact consent | the legal basis for contact and consideration | yes | **Required** (it's the purpose of the form) | — |

Not collected, and should stay that way: FIN, passport, work permit number, employer, address, salary, date of birth, email.

---

## PART 5: Revised Privacy Policy
See `_review/privacy-policy-v2-draft.md` (complete text, ready for ALAC mark-up). **Not yet published.**

## PART 6: Short form notice and consent
See `_review/privacy-policy-v2-draft.md`, Annex A.

## PART 7: Internal PDPA action list
See `_review/privacy-policy-v2-draft.md`, Annex B.

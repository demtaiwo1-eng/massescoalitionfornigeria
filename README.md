# Masses Coalition of Nigeria (MCN)
 
**Client handover guide · Website, newsroom, administration and advanced deployment**

MCN is an independent Nigerian news publishing platform. It combines a public-facing news website with a private newsroom for reporting, editorial review, publication, staff administration and controlled advanced-content access.

## 1. Live application

| Component | Address | Purpose |
|---|---|---|
| Public website | https://demtaiwo1-eng.github.io/massescoalitionfornigeria.github.io/ | Public news portal |
| Newsroom sign-in | https://demtaiwo1-eng.github.io/massescoalitionfornigeria.github.io/newsroom/sign-in/ | Staff login and role registration |
| Source Desk | https://demtaiwo1-eng.github.io/massescoalitionfornigeria.github.io/source-desk/ | 35 attributed external-source briefs |
| Advanced access activation | https://demtaiwo1-eng.github.io/massescoalitionfornigeria.github.io/access/activate/ | Redeem an issued access PIN |
| Backend health | https://mcn-newsroom-api.onrender.com/health | API and database health check |
| Source code | https://github.com/demtaiwo1-eng/massescoalitionfornigeria | Main application repository |
| Website deployment | https://github.com/demtaiwo1-eng/massescoalitionfornigeria.github.io | GitHub Pages deployment repository |

The custom domain `www.massescoalitionfornigeria.com` is not yet the active public address. Use the GitHub Pages URL above until domain DNS and verification are completed.

## 2. What the application can do

### Public news website
- Responsive homepage with mobile navigation.
- Browse Politics, Economy, Security, Education, Health and Society.
- Open the Latest Stories feed and individual story pages.
- Search published stories.
- Read the About, Editorial Policy, Corrections, Privacy and Terms pages.
- Send news tips, corrections, responses and editorial enquiries through the Contact form.
- Visit the Source Desk, which presents 35 curated IB Connect story briefs with dates, categories, editorial cautions and links to the original source.
- Open the newsroom sign-in and advanced-access activation pages.

### Private newsroom
- Secure staff sign-in and sign-out.
- Self-service registration for Reporter, Contributor, News Editor and Managing Editor roles.
- Administrator approval or rejection of new registrations.
- Staff account creation, role changes, access disablement and reactivation.
- Create and save article drafts.
- Submit drafts for editorial review.
- Review articles, approve them or request changes.
- Schedule and publish approved articles, subject to role permissions.
- Preview articles before publication.
- View revision history.
- Manage incoming contact messages in the newsroom inbox.
- Issue and revoke advanced-access PINs.
- Upload supported article images through the newsroom media endpoint.
- Keep audit records for important privileged actions.

### Current content status
The Source Desk has 35 attributed research briefs. These are not 35 published MCN news articles. The public Latest Stories page currently displays “No stories published yet.” The newsroom must create, verify, review and publish original stories before they appear in the public news feed. Do not describe external-source briefs as original MCN reporting.

## 3. How to navigate the public website

1. Open the public website.
2. Use the top navigation to open a news category.
3. Select **Search** to find published stories.
4. Select **Explore the latest** or **All latest stories** to view the publication feed.
5. Select **Source Desk** to review the 35 attributed IB Connect briefs. Each brief links to its original publisher and includes a note where claims, allegations, campaign material or opinion need further checking.
6. Use **About** to understand the publication.
7. Use **Editorial Policy** to read the standards for verification, attribution, fairness and corrections.
8. Use **Contact** to submit a news tip, correction or editorial enquiry.
9. Use **Activate access** only if the newsroom has privately issued you an access PIN.
10. Select **Newsroom** to sign in or apply for a newsroom role.

Public readers do not need a newsroom account to read publicly published stories.

## 4. How newsroom registration works

1. Open the Newsroom sign-in page.
2. Select **Register for a newsroom role**.
3. Enter your full name and email address.
4. Create a password of at least 14 characters.
5. Select the role you are applying for:
   - Reporter
   - Contributor
   - News Editor
   - Managing Editor
6. Submit the registration.
7. The request is saved as **Pending**. The applicant cannot sign in until the Administrator approves it.
8. The Administrator reviews the request in **Staff accounts**, then selects **Approve** or **Reject**.

The public registration form does not offer the Administrator/Publisher role. The first-owner Administrator account is protected and cannot be reassigned through the ordinary staff role selector. Registration requests are rate-limited.

## 5. Administrator and role permissions

The existing first-owner **Publisher** account is the platform's **Administrator**. In the newsroom interface it may still be represented internally as the Publisher role.

| Role | Main responsibilities |
|---|---|
| Administrator / Publisher | Full newsroom administration; staff and registration approvals; PIN issuance and revocation; inbox; editorial review; scheduling and publishing |
| Managing Editor | Editorial supervision; review and approval; scheduling and publishing; inbox access |
| News Editor | Review submitted articles; approve or request changes; newsroom inbox |
| Reporter | Create and edit own reports; submit reports for editorial review |
| Contributor | Create and edit own contributions; submit work for editorial review |

Server-side permissions apply even if a user tries to call an API directly. Only the Administrator can manage staff accounts and advanced-access PINs. Publishing and scheduling are restricted to the authorised senior editorial roles.

### Administrator navigation

After signing in as Administrator:

- **Articles** — review the newsroom's article list, create or inspect drafts, preview, edit, submit, review, schedule, publish and inspect revision history.
- **Inbox** — read contact submissions and mark them read, replied to or archived.
- **Staff accounts** — add staff, review pending applications, approve or reject requests, change permitted roles, disable accounts or reactivate approved staff.
- **Advanced access PINs** — issue a PIN, copy it for private delivery, inspect PIN status and revoke a PIN.

Keep Administrator credentials private. Do not share the Administrator password with reporters or contributors.

## 6. Editorial workflow

1. A Reporter or Contributor opens **Articles** and creates a new report/article.
2. Enter a clear headline, summary, category and story content. Add a featured image and useful alternative text where appropriate.
3. Save the work as a draft.
4. Submit it for editorial review.
5. A News Editor, Managing Editor or Administrator inspects the report, checks its sourcing and either approves it or requests changes with feedback.
6. The author updates the report and resubmits it if changes were requested.
7. An authorised Managing Editor or Administrator schedules or publishes the approved story.
8. The published story becomes available through the public Latest Stories feed, category pages and search.

Editorial safeguards:
- Verify facts with primary or reliable independent sources.
- Attribute material from other publishers.
- Seek responses to serious allegations.
- Clearly distinguish news, opinion, analysis and campaign claims.
- Do not fabricate quotes, sources, photographs or events.
- Correct material errors transparently.
- Treat Source Desk entries as research leads, not proof that the reported claims are true.

## 7. Contact inbox

The public Contact form accepts a name, email address, subject and message. Messages are stored for newsroom review. An authorised editor can open the newsroom **Inbox** and mark a message as read, replied to or archived. Sending a message does not guarantee publication or a response time. Do not ask readers to submit passwords, banking details or information that could endanger a source.

## 8. Advanced access and PIN administration

Advanced access is a manually controlled entitlement workflow:

1. A customer contacts the publication and pays through an independently agreed channel.
2. The Administrator verifies payment outside the application.
3. The Administrator opens **Advanced access PINs** and issues a PIN.
4. The PIN is delivered privately to the intended recipient.
5. The recipient opens the public **Activate access** page and submits the PIN with the matching email address.
6. The server validates the PIN and records the activation. The Administrator can revoke a PIN when necessary.

Security characteristics include hashed PIN storage, email binding, one-time use, expiry, revocation and rate-limited activation attempts.

**Important current limitation:** activation records an email-bound entitlement. A complete customer-account sign-in system and application-wide premium-feature gating are not yet implemented. Do not promise that PIN activation creates a full customer account or automatically unlocks every premium feature.

## 9. Hosting and technical architecture

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | Next.js static export / React | Public website and newsroom interface |
| Static hosting | GitHub Pages | Serves the built website |
| API | Node.js and Express | Authentication, newsroom actions and content APIs |
| Database | Neon PostgreSQL | Users, sessions, articles, revisions, reviews, messages, PINs and audit events |
| API hosting | Render | Runs the newsroom API |
| Browser QA | GitHub Actions, Chromium and Selenium | Automated external-URL browser smoke checks |

### Hosting notes
- The frontend is a static website. Database-backed newsroom actions require the API.
- The API uses Neon PostgreSQL; it does not use Render Postgres.
- The Render service is on the Free plan. Free services can spin down after inactivity, so the first API request after a quiet period may be slow while the service wakes. Free hosting is not a guarantee of uninterrupted production availability.
- The public website and API are separate deployments. A successful static-site deployment does not, by itself, prove that the API is healthy.
- Health check: https://mcn-newsroom-api.onrender.com/health

## 10. Owner-only advanced configuration

Never place production secrets in frontend code, public documentation, Git commits, screenshots or chat messages.

Configure the following in the Render service's environment settings:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `FRONTEND_ORIGINS` | Comma-separated approved frontend origins |
| `MCN_SETUP_TOKEN` | Private one-time first-Administrator setup token; only needed if initial setup is still available |
| `MCN_PUBLISHER_RECOVERY_TOKEN` | Temporary recovery secret for an approved Administrator password recovery; remove or rotate after successful recovery |
| `PORT` | Supplied by Render automatically |

The repository contains an `.env.example` reference. It is not a production secrets file. Do not copy real values into it.

### Initial Administrator setup
The first-owner setup endpoint is designed to work only before any newsroom user has been created and is protected by `MCN_SETUP_TOKEN`. The current database already has its first-owner Publisher/Administrator account, so ordinary first-time setup is closed. Do not delete that account merely to make the setup screen reappear.

### Administrator recovery
The recovery process is protected by a temporary one-time recovery token and is rate-limited. Recovery revokes existing newsroom sessions. The recovery secret should be rotated or removed after the owner confirms successful recovery. Never send the new password or recovery secret in a public channel.

### Database operations
- Keep the Neon database connection string private.
- Use schema migrations carefully and preserve existing records.
- Do not manually delete the first Administrator account.
- Keep a documented recovery contact and access handover record.
- Confirm the API health endpoint after every backend deployment.

## 11. Android APK and Google Play delivery

### Current repository status
The current source repository is a web application. It does **not** yet contain a committed native Android/Capacitor project, Android Gradle build, release keystore or a ready-to-download APK. An APK must be produced as a separate Android packaging and release task; do not represent this web repository as already containing a signed Android app.

### Android packaging workflow
The advanced Android delivery work should include:

1. Confirm the final app name, icon, splash screen, package ID (for example, a permanent reverse-domain identifier) and supported Android versions.
2. Create the Android wrapper project using Capacitor or another maintained Android WebView/native integration.
3. Configure the wrapper to load the approved MCN production site and communicate securely with the live API.
4. Configure Android permissions conservatively. Do not request contacts, SMS, location or other sensitive access unless a real feature requires it.
5. Build and test a debug APK on physical Android devices.
6. Configure a release signing key and protect it outside the source repository.
7. Build a signed release APK for direct installation and an Android App Bundle (`.aab`) for Google Play.
8. Test sign-in, registration, article browsing, image display, network failure, session handling and device back navigation.
9. Archive the signing-key recovery instructions securely with the project owner.

A developer workstation or CI runner needs a supported Node.js version, Java JDK, Android SDK, Android build tools and Gradle. The Android wrapper must be added before Gradle build commands are available. The current project does not have an `android/` directory yet.

### Build commands after the Android wrapper exists
The exact commands depend on the generated Capacitor project and configured build variant. A typical workflow is:

```bash
npm ci
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
./gradlew assembleRelease
./gradlew bundleRelease
```

Expected outputs in a standard Gradle project:
- Debug APK: `android/app/build/outputs/apk/debug/`
- Release APK: `android/app/build/outputs/apk/release/`
- Play Store bundle: `android/app/build/outputs/bundle/release/`

A release build is not ready for distribution until it is signed and tested. Never commit a keystore, signing password or Play Console credentials to GitHub.

### Google Play publishing format
An APK is useful for direct installation and testing. For a new Google Play listing, prepare an Android App Bundle (`.aab`); Google Play uses the bundle to generate device-optimised APKs. New apps have been required to use Android App Bundles since August 2021. See Google's current [App Bundle guidance](https://support.google.com/googleplay/android-developer/answer/9859152) and [release guidance](https://support.google.com/googleplay/android-developer/answer/9859348).

Google Play developer registration currently has a one-time **US$25** fee. This is a Google fee paid to Google, separate from any service charge for setting up the listing. Google may require identity verification and additional testing before publication, depending on account type and current policy. See [Google Play Console registration](https://support.google.com/googleplay/android-developer/answer/6112435) and [developer account requirements](https://support.google.com/googleplay/android-developer/answer/13628312).

## 12. Project delivery pricing

The following are the proposed service prices for the client handover:

| Service | Price | Scope |
|---|---:|---|
| Android application APK package | **₦200,000** | Separate Android packaging, signing preparation, device testing and delivery of the agreed APK build |
| Google Play Store setup | **US$30** | Store listing and release setup assistance |

The Google Play account's official one-time registration fee (currently US$25) is separate and is paid directly to Google by the account owner. The US$30 is the service price, not Google's fee. Approval and publication timing are controlled by Google.

**iOS option:** iPhone/iPad packaging and App Store submission are not included in the Android package. If the client is interested in iOS, they should contact the project provider to arrange a separate iOS scope, Apple developer account and release plan.

## 13. Browser testing and release checks

The website deployment repository contains a GitHub Actions workflow named **Selenium external URL browser test**. It installs Chromium and ChromeDriver, opens the public website and runs the Selenium smoke test. It can run after a successful Pages deployment or be manually dispatched from the repository's Actions tab.

Public browser checks performed for this handover confirmed:
- Homepage loads and shows its main navigation and category links.
- About and Editorial Policy pages load.
- Contact page shows its message form.
- Source Desk loads the 35 attributed briefs.
- Newsroom sign-in page loads.
- Registration form exposes the four non-Administrator roles and the 14-character password minimum.
- Latest Stories currently has no published articles.

These checks are public-page smoke tests, not a full authenticated end-to-end security audit. The complete registration-to-approval-to-sign-in workflow still needs a controlled test with approved test accounts before it is described as fully acceptance-tested.

## 14. Local development

Requirements: Node.js 20 or newer and npm.

Frontend:

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

Backend, in another terminal:

```bash
cd backend
npm install
npm start
```

The backend requires a valid `DATABASE_URL` and appropriate local environment settings. Configure CORS to permit the local frontend origin. Do not use production credentials in an unsecured local machine.

Production build check:

```bash
npm run build
```

Backend syntax check:

```bash
cd backend
npm run check
```

## 15. Handover checklist

- [ ] Confirm the legal owner and contact person for the publication.
- [ ] Confirm who will hold the Administrator account after handover.
- [ ] Change or reissue Administrator credentials through a secure, owner-controlled process.
- [ ] Confirm the Administrator can sign in and access Staff accounts, Inbox, Articles and Advanced access PINs.
- [ ] Approve at least one controlled test staff account and verify its role permissions.
- [ ] Confirm the client owns or controls the GitHub, Render and Neon accounts needed for ongoing operation.
- [ ] Store recovery and signing secrets in a secure password manager.
- [ ] Confirm a database backup and recovery plan before production use.
- [ ] Decide whether to activate the custom domain.
- [ ] Create and test the Android wrapper before promising a downloadable APK.
- [ ] Prepare an AAB and Play Console listing if Google Play distribution is required.
- [ ] Agree on a separate iOS scope if iPhone/iPad support is requested.

## 16. Important limitations and honest delivery status

- No MCN articles are currently published in the public Latest Stories feed.
- The Source Desk is an attributed research/monitoring list, not an independently verified news feed.
- Advanced PIN activation records an entitlement but is not yet a full customer account or complete premium-content gating system.
- The current repository does not yet contain an Android native project or generated APK.
- The custom domain is not yet active.
- Render Free may sleep during inactivity and is not an uptime guarantee.
- Browser smoke checks do not replace authenticated end-to-end testing, security review, backups or editorial verification.

---

**Project principle:** publish original, verified journalism; protect newsroom sources; keep privileged access private; and never promise a feature or release artifact until it has been built and tested.

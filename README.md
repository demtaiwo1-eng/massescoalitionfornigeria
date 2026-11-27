# Masses Coalition of Nigeria

Independent Nigerian journalism and a private editorial newsroom.

- Public website: https://demtaiwo1-eng.github.io/massescoalitionfornigeria.github.io/
- Intended custom domain: https://www.massescoalitionfornigeria.com
- Source repository: https://github.com/demtaiwo1-eng/massescoalitionfornigeria
- Newsroom API: https://mcn-newsroom-api.onrender.com
- Database: Neon PostgreSQL project \`masses-coalition-newsroom\`

## What is working

### Public website
- Responsive homepage, mobile navigation, categories, About and Editorial Policy pages.
- Latest and category feeds read published articles from the newsroom API.
- Article detail pages and search across published stories.
- Contact form writes to the newsroom inbox.
- Advanced-access PIN activation page.
- Shared global theme stylesheet adapted from the Winning-game design contract.
- GitHub Pages build publishes both the project-path URL and the root-domain variant.

### Private newsroom
- First Publisher account setup is one-time and protected by \`MCN_SETUP_TOKEN\`.
- Passwords are bcrypt-hashed; session tokens are random, hashed in the database and delivered in secure HTTP-only cookies.
- Role-based newsroom access: Publisher, Managing Editor, News Editor, Reporter and Contributor.
- Draft, submit for review, approve and publish workflow.
- Article revision snapshots and audit logging.
- Publisher-only staff account management.
- Publisher-only advanced-access PIN issuance and revocation. PINs are hashed, single-use, email-bound and expire.
- Reader contact submissions are stored in a private newsroom inbox.

## First Publisher setup

1. Open the public website and choose **Newsroom**.
2. On the sign-in page, choose **First-time Publisher setup** while it is available.
3. Enter your own name, email and a strong password (at least 14 characters).
4. Enter the one-time setup key supplied privately to the project owner.
5. Sign in with the Publisher credentials you just created.

The first-admin endpoint closes itself after the first Publisher is created. Do not publish the setup key or commit it to GitHub. There are no default staff passwords.

## Editorial workflow

1. A newsroom user creates an original article draft.
2. The reporter or contributor submits it for editorial review.
3. A News Editor, Managing Editor or Publisher reviews it.
4. A Managing Editor or Publisher publishes an approved article.
5. Published stories appear in the public latest feed, category pages and search.

The newsroom should publish only original, checked reporting. Verify claims, attribute sources, seek responses to serious allegations and correct material errors. Do not fabricate quotes or copy other publishers' work.

## Advanced access

The Publisher verifies payment independently and issues a unique PIN from the newsroom. The customer activates it using the exact email address it was issued to. The PIN is single-use, hashed at rest, revocable and expires. The platform does not collect payments or automatically issue PINs.

Activation currently records the email-bound entitlement. A customer-account sign-in and application-wide feature gating are not yet implemented; do not treat the activation record as proof of a verified customer login.

## Hosting and configuration

- GitHub Pages serves the static public website.
- Render runs the Node API.
- Neon stores newsroom users, sessions, articles, revisions, editorial reviews, contact messages, access PINs and audit events.
- Keep \`DATABASE_URL\`, \`MCN_SETUP_TOKEN\` and other secrets in the hosting provider's environment settings only.
- Configure \`FRONTEND_ORIGINS\` to include the exact public site origins.
- The custom domain requires correct DNS records and GitHub Pages domain verification.

GitHub Pages is static hosting; dynamic newsroom features depend on the API and database. Render's free service can sleep when idle, so the API may take longer to respond on the first request after inactivity. This setup does not promise unlimited concurrent API capacity.

## Local development

Install frontend dependencies in the repository root and run \`npm run dev\`. For the API, install dependencies in \`backend/\` and run \`npm start\`. Configure local environment variables before using authenticated or database-backed features.

Never commit real passwords, setup keys, PINs, database URLs or \`.env\` files.

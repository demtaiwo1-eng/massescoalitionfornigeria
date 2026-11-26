# MCN product and security plan

## Public publication
- Public reading, categories, article search and author pages remain free.
- Publish only original reporting and material with clear attribution and verification.
- No automated scraping or copying from Google, television, newspapers or other news channels.
- Article publishing must generate canonical metadata, Open Graph metadata, NewsArticle structured data and sitemap entries.

## Private newsroom
Roles: Publisher/Super Admin, Managing Editor, News Editor, Reporter/Journalist and Contributor.

Workflow: draft -> editorial review -> revision if required -> final approval -> publication. Contributors and reporters cannot publish directly. Record revisions, approvals, corrections and privileged actions in an audit trail.

The editor should support headings, paragraphs, emphasis, lists, tables, blockquotes, links, images with captions, video embeds, galleries, autosave, revisions, word count, reading time, preview and article SEO fields.

## Manual Advanced Access
1. The client explores public content without payment or PIN.
2. The client contacts the publisher and pays directly outside the platform.
3. The publisher verifies payment independently.
4. The publisher creates a one-time serial PIN in a publisher-only control panel and issues it privately.
5. The signed-in client submits the PIN.
6. The server validates and activates the client account.

PIN requirements:
- Cryptographically random, sufficiently long, stored only as a strong hash.
- Single-use, account-bound, expiry and revocation support.
- Rate-limited activation attempts and audit records.
- Never returned by public APIs, embedded in frontend code, indexed, or shown to other clients.
- No master/backdoor PIN.
- Every privileged server action must enforce authorization; hiding a button is not security.

## Deployment prerequisites
- PostgreSQL database and migrations.
- Secure authentication and role-based server-side access control.
- AUTH_SECRET and DATABASE_URL configured only in hosting secret settings.
- Persistent media storage (object storage) before accepting newsroom uploads.
- HTTPS, backups, monitoring, email delivery and recovery process.
- Domain DNS records pointed to the production web service.

## Release gates
Do not call the newsroom production-ready until auth, role boundaries, PIN lifecycle, rate limiting, editorial workflow, media storage, database backups and end-to-end tests pass.

# Masses Coalition of Nigeria

Independent Nigerian journalism and a private editorial newsroom.

**Production domain:** https://massescoalitionfornigeria.com

## Project principles

- Publish original reporting and clearly attributed, verified material.
- Public readers can browse articles, categories and search without a paid PIN.
- Advanced newsroom access is activated manually by the publisher after direct payment verification.
- Never put PINs, credentials, database URLs, or other secrets in source control.

## Planned platform

- Responsive public news site with article pages, categories, search and SEO metadata.
- Authenticated newsroom with role-based access and editorial review/publishing workflow.
- Publisher-only licence and serial-PIN management.
- Server-side authorization, audit logging, secure PIN hashing and account-bound activation.

## Development status

Repository foundation initialized. Hosting, database, environment secrets and domain DNS must be configured before production deployment.

## Security

Keep all secrets in deployment environment variables. Do not commit `.env` files or real activation PINs.

# Inventory Management System Capstone

A full-stack academic capstone based on a real client inventory-management requirement. The submitted scope is the implementation in this repository: a public storefront, customer account flows, and an administrator dashboard for product, category, inventory, and order management.

## Technology stack

- Next.js 16 and React 19
- TypeScript and Tailwind CSS
- PostgreSQL with Drizzle ORM and migrations
- Better Auth for email/password sessions and protected routes

## Main features

- Product browsing by category, product detail pages, search, cart, wishlist, and checkout views
- Customer signup, login, account, and order views
- Protected dashboard pages for product, category, inventory, order, and settings workflows
- Variant-level stock locations, stock adjustments, reservations, movement history, and non-negative stock validation
- Seeded demo catalog data for local review

## Local setup

Prerequisites: Node.js 20+, pnpm, and a running PostgreSQL instance.

```powershell
pnpm install
Copy-Item .env.example .env.local
```

Edit `.env.local` with local PostgreSQL credentials and a strong, local-only `SESSION_SECRET`. Never commit this file.

## Database setup

Create the database named by `DATABASE_URL`, then run:

```powershell
pnpm db:migrate
pnpm bootstrap:super-admin
pnpm seed:demo
```

`bootstrap:super-admin` reads the local administrator values from `.env.local`. Use the generated local account note only on your machine; it is intentionally ignored by Git.

## Run the application

This is a single full-stack Next.js application, so one command runs both the web interface and API routes:

```powershell
pnpm dev
```

Open http://localhost:3000. For a production build, use `pnpm build` followed by `pnpm start`.

## Validation commands

```powershell
pnpm typecheck
pnpm lint
pnpm build
```

The repository does not currently include an automated browser test suite or a published end-to-end test report. Capture and record actual validation results before claiming functionality has been tested. See [evaluation readiness](docs/evaluation-readiness.md) for outstanding verification tasks.

## Documentation

See [docs](docs) for architecture, API, UI, and module-level documentation. Start with:

- [Architecture overview](docs/architecture/overview.md)
- [Evaluator architecture walkthrough](docs/architecture/evaluator-walkthrough.md)
- [Development provenance and observed milestones](docs/development-provenance.md)
- [Evaluation readiness checklist](docs/evaluation-readiness.md)
- [Module map](index/module-map.md)
- [Database map](index/database-map.md)

**Project origin:** This repository is an adapted academic version of an existing real-world application. Its initial Git commit imports an established baseline; it does not represent the start of development. See the provenance record for the distinction between original work and activity captured in this repository.

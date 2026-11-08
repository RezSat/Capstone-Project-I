# Evaluator Walkthrough: Architecture and Implementation

**Prepared:** 9 November 2026. This is a source-code review, not a production certification.

## Architectural style

The application is a single full-stack **Next.js 16 / React 19** application. It serves the storefront, dashboard, and API routes in one deployment, backed by PostgreSQL through Drizzle ORM. A domain-organized service/repository structure is used for much of the code. The application is therefore best described as a **modular full-stack monolith with layered conventions**, rather than independent microservices or perfectly enforced clean architecture.

```text
Browser
  ├── Storefront: src/app/(storefront), src/components/storefront
  └── Dashboard: src/app/dashboard, src/components/dashboard
           │
           ▼
Next.js API route handlers / server rendering
           │
           ▼
Domain services: src/modules/*/*.service.ts
           │
           ▼
Repositories: src/modules/*/*.repo.ts
           │
           ▼
Drizzle ORM → PostgreSQL
```

Cross-cutting facilities include `src/core/auth/`, `src/core/db/`, `src/core/http/`, `src/core/env/`, and Zod schemas.

**Actual code caveat:** Not all endpoints rigorously follow the layered ideal. For instance, `src/app/api/dashboard/orders/confirm/route.ts` and `src/app/api/storefront/checkout/card-submit/route.ts` contain direct database access. This is a target for future refactoring; the architecture diagrams are conceptual conventions, not an assertion that every import is compliant.

## Architecture decisions, rationale, and trade-offs

| Decision | Benefit | Trade-off / reviewer question |
| --- | --- | --- |
| One Next.js application for storefront and dashboard | Shared deployment, types and server APIs | Must isolate role permissions between surfaces |
| PostgreSQL | Relational consistency, transactions, row locking | Requires database setup and migration management |
| Drizzle schema and migrations | Typed SQL access and tracked schema evolution | Migrations must match the actual database |
| Zod request validation | Typed, declarative input checks | Routes must consistently use the schemas |
| Better Auth and RBAC | Session-based identity and role-specific permissions | Authentication must be enforced at every sensitive API boundary |
| Repository and service modules | Separates domain rules from persistence in many workflows | Existing direct-DB route handlers create inconsistent boundaries |
| Variant-level inventory | Supports sizes, SKUs and per-location stock | Reservation and order-confirmation edge cases need tests |

## Guided inventory flow (traceable source references)

1. A dashboard action submits to `POST /api/dashboard/inventory/adjust` in `src/app/api/dashboard/inventory/adjust/route.ts`.
2. The route verifies a dashboard session, validates request shape using `adjustInventorySchema`, and calls `adjustInventory`.
3. `src/modules/inventory/inventory.service.ts` checks the request, computes a new quantity, and rejects negative stock.
4. It enters a database transaction through `withInventoryTransaction`.
5. The inventory repository locks the row with `FOR UPDATE` and updates the quantity with a current-quantity check.
6. The route revalidates dashboard paths after the operation.

**Why transactions?** Concurrent operators could otherwise read the same stock and overwrite each other's changes. The implemented approach attempts to serialize updates to the inventory row; concurrency tests and database verification are still needed before making guarantees.

## Authentication and authorization

- `src/proxy.ts` redirects unauthenticated browser navigation to dashboard pages.
- `src/app/dashboard/layout.tsx` also requires one of four staff roles.
- Permissions are declared in `src/core/auth/rbac-permissions.ts`.
- Sensitive API handlers must **independently check** the authenticated user's active status and permission: UI redirects do not secure an API endpoint.
- This review added explicit access checks for dashboard orders listing, confirmation and cancellation in the evaluation-readiness branch.
- The `E2E_DASHBOARD_AUTH_BYPASS` flag is an especially sensitive testing mechanism; do not enable it in production or publicly exposed environments.

## Order and checkout caveats

- `src/modules/orders/storefront-order.service.ts` uses a transaction to create orders/items and reserve stock.
- `src/app/api/storefront/checkout/card-submit/route.ts` validates card-like input and marks an order paid after a simulated delay. **It does not perform a real card charge or verify a payment-provider webhook.** Use test-only data; do not accept genuine payment details through the demo.
- `src/app/api/dashboard/orders/confirm/route.ts` currently clamps decrements with `Math.max(0, ...)`; this avoids negative stored values but may conceal insufficient stock. It should reject invalid transitions rather than silently shortchanging inventory.
- `src/app/api/dashboard/orders/delete/route.ts` releases reservations and changes order status in separate steps, and currently logs release failures before proceeding. This warrants a future atomic service-layer refactor.
- These are known review findings, not claims that checkout is production-ready.

## Five-minute live demonstration

1. Launch against a separate local demo database using the README setup procedure.
2. Sign in as a local demo staff user.
3. Open products and categories; demonstrate CRUD using non-sensitive demo records.
4. Adjust a variant's stock; show before/after values and discuss the transaction/locking strategy.
5. Display a storefront product, cart and simulated checkout, stating clearly that payments are not real.
6. Demonstrate a denied API request without a valid dashboard session, and discuss RBAC.
7. Show schema files and migrations, then cite the retrospective provenance document to explain the imported initial baseline.

## Evidence and validation to gather

Run `pnpm typecheck`, `pnpm lint`, and `pnpm build` locally and record date, command, commit SHA, result and environment. Exercise authorized/unauthorized API requests with demo credentials. Also test simultaneous stock adjustments and insufficient-stock cases. **These tests have not been executed as part of preparing this document.**

See [development provenance](../development-provenance.md) for the distinction between original stakeholder development and the GitHub capstone import.

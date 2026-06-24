# Module Map

## Module Structure

Each domain module follows a consistent file naming convention:

- `*.repo.ts` – Database access layer
- `*.service.ts` – Business logic
- `*.schema.ts` – Zod validation schemas
- `*.types.ts` – TypeScript type definitions

## Modules

### products (25 files)
Product management with categories, brands, variants, attributes, and recommendations.
- `src/modules/products/`

### auth (16 files)
Dashboard and customer authentication, session management, RBAC.
- `src/modules/auth/`

### product-files (13 files)
File upload, storage, and metadata management.
- `src/modules/product-files/`

### inventory (8 files)
Stock quantities, locations, reservations, and adjustments.
- `src/modules/inventory/`

### users (7 files)
Dashboard user and customer management.
- `src/modules/users/`

### settings (5 files)
System configuration management.
- `src/modules/settings/`

### stock-movements (5 files)
Inventory change history tracking.
- `src/modules/stock-movements/`

### orders (4 files)
Cart, checkout, and order processing.
- `src/modules/orders/`

### audit (1 file)
Action tracking and logging.
- `src/modules/audit/`

### wishlists (1 file)
Customer wishlist management.
- `src/modules/wishlists/`

## Shared Core

| Directory | Purpose |
|---|---|
| `src/core/auth/` | Authentication, session, RBAC, API key helpers |
| `src/core/db/` | Database client, schema definitions (15 domain schemas) |
| `src/core/env/` | Environment variable validation |
| `src/core/http/` | Standardized API response helpers |
| `src/core/search/` | Search query parsing |
| `src/core/utils/` | General-purpose utilities (IDs, errors, CSV export) |

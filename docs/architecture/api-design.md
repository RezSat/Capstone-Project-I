# API Design

## Overview

RESTful API endpoints organized by consumer: admin, dashboard, and storefront.

## Admin API (`/api/admin/...`)

Product, category, brand, and inventory management.

| Group | Endpoints |
|---|---|
| Products | `GET/POST /api/admin/products`, `GET/PATCH/DELETE /api/admin/products/:id` |
| Product Upload | `POST /api/admin/products/upload` |
| Product Images | `GET/POST /api/admin/products/:id/images`, primary, delete |
| Product Variants | `GET/POST /api/admin/products/:id/variants`, generate, delete |
| Product Attributes | `GET/POST /api/admin/products/:id/attributes`, values |
| Product Specs | `GET/POST /api/admin/products/:id/specifications`, delete |
| Content Sections | `GET/POST /api/admin/products/:id/content-sections`, delete |
| Categories | `GET/POST /api/admin/categories`, `GET/PATCH/DELETE /api/admin/categories/:id` |
| Category Filters | Full CRUD for filters and filter options |
| Category Files | Upload intent, upload, finalize |
| Brands | `GET/POST /api/admin/brands`, `PATCH /api/admin/brands/:id` |
| Inventory | `PUT /api/admin/inventory/update` |

## Dashboard API (`/api/dashboard/...`)

| Group | Endpoints |
|---|---|
| Products | `GET/POST /api/dashboard/products`, `PATCH /api/dashboard/products/:id` |
| Product Files | Upload intent, finalize, delete |
| Inventory | `POST /api/dashboard/inventory/adjust` |
| Orders | `GET /api/dashboard/orders`, confirm, delete |
| Users | `GET/POST /api/dashboard/users`, role, deactivate, reactivate |

## Storefront API (`/api/storefront/...`)

| Group | Endpoints |
|---|---|
| Session | `GET /api/storefront/session` |
| Checkout | Auto-login, card submit |
| Orders | Order lookup |
| Auth | Logout, save guest user, register guest |
| Settings | Storefront settings |

## Other APIs

| Endpoint | Purpose |
|---|---|
| `GET /api/search` | Product search |
| `GET/POST /api/settings` | System settings |
| `GET/POST/DELETE /api/wishlist` | Wishlist management |
| `GET/POST /api/wishlist/guest` | Guest wishlist |
| `GET /api/account/details` | Customer account details |
| `PUT /api/account/address` | Customer address |
| `GET /api/account/orders/:id` | Order details |

## Response Format

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

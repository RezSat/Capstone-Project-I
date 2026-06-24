# API Overview

## Consumer Groups

### Admin API (`/api/admin/...`)
Product, category, brand, and inventory management for admin operations.

### Dashboard API (`/api/dashboard/...`)
Dashboard-specific endpoints for products, inventory, orders, and users.

### Storefront API (`/api/storefront/...`)
Customer-facing endpoints for session, checkout, and orders.

### Account API (`/api/account/...`)
Customer account details and order history.

### Other APIs
- `GET /api/search` – Product search
- `GET/POST /api/settings` – System settings
- `GET/POST/DELETE /api/wishlist` – Wishlist management

## Authentication

- Admin/Dashboard: Dashboard session cookies
- Storefront: Customer session
- External: API key via `x-api-key` header

## Response Format

```json
{
  "success": true,
  "data": { ... },
  "error": null
}
```

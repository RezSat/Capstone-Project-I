# Database Map

## Overview

PostgreSQL database accessed through Drizzle ORM.

## Schema Source

- Main schema: `src/core/db/schema.ts`
- Schema modules: `src/core/db/schema/*.ts`
- Database client: `src/core/db/client.ts`
- Migrations: `drizzle/migrations/`

## Core Tables

| Table | Purpose |
|---|---|
| `products` | Product records with pricing, status, SEO fields |
| `product_variants` | Purchasable variants with SKU and pricing |
| `product_media` | Product images and files |
| `product_attributes` | Variant attributes (size, color) |
| `product_attribute_values` | Possible values per attribute |
| `categories` | Hierarchical product categories |
| `brands` | Product brands |
| `inventory_items` | Stock quantities per variant per location |
| `stock_locations` | Physical/virtual stock locations |
| `stock_movements` | Immutable audit trail of stock changes |
| `inventory_reservations` | Temporary stock holds for checkout |
| `carts` | Shopping carts (guest or authenticated) |
| `cart_items` | Line items in a cart |
| `checkout_sessions` | Checkout flow sessions |
| `orders` | Order records with status tracking |
| `order_items` | Order line items |
| `order_addresses` | Shipping/billing address snapshots |
| `users` | Core user records |
| `customer_profiles` | Customer-specific data |
| `staffProfiles` | Staff-specific data |
| `roles` | Dashboard roles (super_admin, admin, operator, viewer) |
| `permissions` | Permission definitions |
| `files` | Uploaded file metadata |
| `system_settings` | Application configuration |
| `api_keys` | External API key records |
| `audit_logs` | Action tracking |

## Key Enums

| Enum | Values |
|---|---|
| `product_status` | draft, active, inactive, archived |
| `stock_movement_type` | initial, receive, adjustment, sale, return, etc. |
| `order_status` | draft, pending_payment, confirmed, processing, shipped, etc. |
| `payment_status` | unpaid, pending, paid, failed, refunded |
| `cart_status` | active, converted, abandoned, expired |
| `file_kind` | image, document, video, other |

## Relationships

- `products` → `product_variants` (1:many)
- `products` → `categories` (many:many via `product_categories`)
- `products` → `brands` (many:1)
- `product_variants` → `inventory_items` (1:1 per location)
- `carts` → `cart_items` (1:many)
- `orders` → `order_items` (1:many)
- `users` → `customer_profiles` (1:1)
- `users` → `staffProfiles` (1:1)

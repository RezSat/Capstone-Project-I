# Database Architecture

## Overview

PostgreSQL accessed through Drizzle ORM. Schema is defined in `src/core/db/schema/` with 15 domain-specific files.

## Key Schema Files

| File | Tables |
|---|---|
| `products.ts` | products, product_variants, product_media, product_attributes, product_categories, brands |
| `catalog.ts` | categories, category_filters, category_filter_options, storefront_nav_items |
| `inventory.ts` | inventory_items, stock_locations, stock_movements, inventory_reservations |
| `orders.ts` | carts, cart_items, orders, order_items, checkout_sessions |
| `auth.ts` | users, customer_profiles, staffProfiles, roles, permissions |
| `payments.ts` | payments, payment_refunds, payment_events |
| `files.ts` | files |
| `settings.ts` | system_settings, api_keys |
| `audit.ts` | audit_logs |

## Core Tables

| Table | Purpose |
|---|---|
| products | Product records with pricing and status |
| product_variants | Purchasable variants with SKU |
| categories | Hierarchical product categories |
| inventory_items | Stock quantities per variant per location |
| stock_movements | Immutable audit trail of stock changes |
| orders | Order records with status tracking |
| carts | Shopping carts |
| users | All user accounts (customer + staff) |
| files | Uploaded file metadata |

## Access Rules

- Database access is allowed only in repository files
- UI and API routes must not query the database directly

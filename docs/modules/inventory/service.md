# Inventory Module

## Purpose

Manages stock quantities, locations, reservations, and adjustments.

## Files (8 files)

| File | Purpose |
|---|---|
| `inventory.types.ts` | Type definitions |
| `inventory.schema.ts` | Validation schemas |
| `inventory.repo.ts` | Core database queries |
| `inventory.service.ts` | Business logic |
| `admin-inventory.repo.ts` | Admin inventory queries |
| `admin-inventory.service.ts` | Admin inventory logic |
| `dashboard-inventory-adjust.service.ts` | Dashboard stock adjustment |
| `inventory-search.repo.ts` | Inventory search |

## Key Entities

- **Stock Locations** – Physical or virtual locations (store, warehouse)
- **Inventory Items** – Stock quantities per variant per location
- **Stock Movements** – Immutable audit trail of all stock changes
- **Reservations** – Temporary stock holds for checkout
- **Stock Commits** – Atomic stock change transactions

## Adjustment Types

| Type | Effect |
|---|---|
| receive | Stock increase from supplier |
| sale | Stock decrease from order |
| adjustment | Manual correction |
| return | Stock increase from return |
| transfer_in / transfer_out | Location transfers |
| damage / loss | Stock decrease |

# Settings Module

## Purpose

Manages system configuration and operational settings.

## Files (5 files)

| File | Purpose |
|---|---|
| `settings.repo.ts` | Database queries |
| `settings.service.ts` | Business logic |
| `settings.types.ts` | Type definitions |
| `operational-settings.ts` | Operational setting definitions |
| `sku-defaults.ts` | SKU generation defaults |

## Settings Table

Key-value store in `system_settings` with typed values (string, number, boolean, json).

## API Endpoints

- `GET /api/settings` – Read all settings
- `POST /api/settings` – Update settings (admin only)

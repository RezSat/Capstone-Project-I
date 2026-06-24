# Stock Movements Module

## Purpose

Tracks all inventory changes as immutable audit trail records.

## Files (5 files)

| File | Purpose |
|---|---|
| `movement.types.ts` | Type definitions |
| `movement.schema.ts` | Validation schemas |
| `movement.repo.ts` | Database queries |
| `movement.service.ts` | Business logic |
| `dashboard-stock-movements.types.ts` | Dashboard types |

## Movement Types

- initial, receive, adjustment, reservation, release
- sale, cancellation, return, refund
- transfer_in, transfer_out, damage, loss

## Note

This is an internal module used by the inventory system. Stock movements are created automatically when inventory is adjusted.

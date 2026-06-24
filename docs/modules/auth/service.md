# Auth Module

## Purpose

Handles authentication and authorization for dashboard users and customers.

## Files (16 files)

| File | Purpose |
|---|---|
| `dashboard-auth.service.ts` | Dashboard authentication logic |
| `dashboard-login.types.ts` | Login types |
| `dashboard-forgot-password.service.ts` | Password reset request |
| `dashboard-forgot-password.schema.ts` | Password reset validation |
| `dashboard-forgot-password.types.ts` | Password reset types |
| `dashboard-reset-password.service.ts` | Password reset completion |
| `dashboard-reset-password.schema.ts` | Reset validation |
| `dashboard-reset-password.types.ts` | Reset types |
| `dashboard-logout.service.ts` | Logout logic |
| `dashboard-auth.types.ts` | Auth types |
| `checkout-auto-login.service.ts` | Checkout auto-login |
| `customer-signup.schema.ts` | Customer signup validation |
| `customer-signup.types.ts` | Customer signup types |
| `customer-profile.schema.ts` | Customer profile validation |
| `customer-profile.types.ts` | Customer profile types |
| `login-redirect.ts` | Login redirect logic |
| `session-token.ts` | Session token helpers |
| `super-admin-bootstrap.config.ts` | Bootstrap config |
| `super-admin-bootstrap.ts` | First admin setup |

## Authentication Methods

1. **Dashboard Login** – Email/password via Better Auth
2. **Customer Signup/Login** – Email/password with profile creation
3. **Guest Checkout** – Token-based guest sessions
4. **API Key** – `x-api-key` header for external access

## RBAC

4 roles with 22 permissions:
- **super_admin** – Full access
- **admin** – Product, inventory, order management
- **operator** – View and limited adjustments
- **viewer** – Read-only

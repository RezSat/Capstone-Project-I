# Authentication Architecture

## Overview

Two authentication paths: dashboard session-based login and customer authentication.

## Dashboard Authentication

Uses Better Auth with email/password login.

### Login Flow
1. User submits email and password at `/auth/login`
2. Service validates credentials via Better Auth
3. Session is established
4. User is redirected to `/dashboard`

### Roles and Permissions

| Role | Description |
|---|---|
| super_admin | Full access to all features |

22 permissions are mapped to roles (e.g., `products.manage`, `inventory.adjust`, `orders.view`).

## Customer Authentication

- Signup at `/auth/signup`
- Login via Better Auth
- Password reset via email
- Guest checkout support

## API Key Authentication

External integrations authenticate using API keys via the `x-api-key` header. Only hashed keys are stored.

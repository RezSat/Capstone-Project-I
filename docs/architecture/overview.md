# Architecture Overview

## System Purpose

A full-stack inventory management system with e-commerce frontend, built as an academic Capstone Project I submission.

## Architecture Pattern

Layered architecture with clear separation of concerns:

```
UI (Next.js pages and components)
  → API (routes and server actions)
    → Service (business logic)
      → Repository (database queries)
        → Database (PostgreSQL via Drizzle ORM)
```

## Two Primary Surfaces

1. **Public Storefront** – Product browsing, cart, checkout, customer accounts
2. **Admin Dashboard** – Product, category, inventory, order, and user management

## Technology

- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API routes and server actions
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: Zod schemas
- **Auth**: Better Auth with role-based access control

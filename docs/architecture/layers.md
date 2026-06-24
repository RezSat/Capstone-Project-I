# Architecture Layers

## Overview

The application is organized into five distinct layers, each with a specific responsibility.

## Layer Descriptions

### UI Layer
Responsible for rendering pages, forms, tables, and user interactions. Built with Next.js pages and React components. Does not contain business logic or direct database access.

### API Layer
Responsible for request parsing, authentication checks, validation, and returning consistent JSON responses. API routes stay thin and delegate to the service layer.

### Service Layer
Contains all business logic and rules. Coordinates repository operations, validates inputs, and enforces domain rules. Services are the primary entry point for business operations.

### Repository Layer
Responsible for all database queries and data access. Does not contain business logic. Provides a clean interface between services and the database.

### Database Layer
PostgreSQL database accessed through Drizzle ORM. Schema definitions are in `src/core/db/schema.ts`. Migrations are managed in the `drizzle/` directory.

## Dependency Rules

- UI must not import repository files
- UI must not access the database directly
- API routes must not contain business logic
- API routes must not query the database directly
- Services depend on repositories, not on UI or API layers

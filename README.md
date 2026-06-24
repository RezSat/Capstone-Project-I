# Capstone Project I

## Inventory Management System with E-Commerce Frontend

---

## 1. Introduction

This project is the Capstone Project I submission for the BSc (Hons) in Data Science programme at Sabaragamuwa University of Sri Lanka.

The system is a full-stack web application that combines an inventory management system with an e-commerce storefront. It allows administrators to manage products, track inventory, and handle orders, while customers can browse products, add items to a cart, and proceed through checkout.

---

## 2. Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack React framework for server-side rendering, API routes, and page routing |
| PostgreSQL | Relational database for persisting products, inventory, orders, and user data |
| Drizzle ORM | TypeScript-first ORM for database access and schema management |
| Tailwind CSS | Utility-first CSS framework for styling the user interface |
| shadcn/ui | Reusable UI component library built on Radix UI and Tailwind CSS |
| Zod | Schema validation library for form and API input validation |
| Better Auth | Authentication framework for dashboard and customer sessions |

---

## 3. Features

### 3.1 Product Management
- Create, update, and list products with SKU, name, description, and status
- Product variants with attributes (size, color, etc.)
- Product categories with hierarchical structure and filters
- Brand management
- Product images, specifications, and content sections
- Bulk product operations

### 3.2 Inventory Management
- Track stock quantities per variant per location
- Stock adjustments (in, out, adjustment)
- Low stock threshold alerts
- Inventory reservations for checkout

### 3.3 Order Processing
- Shopping cart (guest and authenticated)
- Checkout session with pricing breakdown
- Order creation with status tracking
- Order status history and fulfillment

### 3.4 Admin Dashboard
- Overview page with key metrics
- Product management (create, edit, variants, images, specifications)
- Category management with filters
- Inventory management with stock adjustments
- Order management with status updates
- User management with role-based access

### 3.5 Storefront
- Public product listing and detail pages
- Category-based navigation with filters
- Shopping cart and checkout
- Customer account with order history and addresses
- Wishlist functionality
- Search

### 3.6 Authentication
- Dashboard user authentication with role-based access (super_admin, admin, operator, viewer)
- Customer authentication with signup, login, and password reset

### 3.7 File Management
- Product and category image upload
- Server-side file storage with metadata tracking

---

## 4. System Architecture

```
┌─────────────────────────────────────┐
│           UI Layer                  │
│   Next.js pages and components     │
├─────────────────────────────────────┤
│           API Layer                 │
│   API routes and server actions    │
├─────────────────────────────────────┤
│         Service Layer               │
│   Business logic and validation    │
├─────────────────────────────────────┤
│        Repository Layer             │
│   Database queries                 │
├─────────────────────────────────────┤
│        Database Layer               │
│   PostgreSQL via Drizzle ORM       │
└─────────────────────────────────────┘
```

---

## 5. Project Structure

```
src/
  app/            Next.js routes, pages, and API endpoints
  components/     Reusable UI components
  modules/        Domain modules (service, repo, schema per feature)
  core/           Shared utilities (auth, db, env, http, search)
docs/             Project documentation
index/            Project overview maps
drizzle/          Database migrations
```

---

## 6. Setup Instructions

### Prerequisites
- Node.js 18+ and pnpm package manager
- PostgreSQL database server

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd capstone-project-i

# Install dependencies
pnpm install

# Set up environment variables
cp .envexample .env.local
# Edit .env.local with your database credentials

# Generate and run database migrations
pnpm db:generate
pnpm db:migrate

# Start the development server
pnpm dev
```

### Available Commands

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run linting |
| `pnpm typecheck` | Run type checking |
| `pnpm db:generate` | Generate database migrations |
| `pnpm db:migrate` | Apply database migrations |
| `pnpm db:studio` | Open Drizzle Studio |

---

## 7. Project Scope

This system demonstrates:

- Full-stack web application development using Next.js
- Relational database design and management with PostgreSQL
- Server-side rendering and SEO-friendly page architecture
- Role-based access control and authentication
- Inventory tracking and stock management
- E-commerce product catalog, cart, and checkout workflow
- RESTful API design with input validation

---

## 8. Author

| Field | Details |
|---|---|
| Index Number | 23CDS0843 |
| Programme | BSc (Hons) in Data Science |
| Institution | Sabaragamuwa University of Sri Lanka |
| Project | Capstone Project I |

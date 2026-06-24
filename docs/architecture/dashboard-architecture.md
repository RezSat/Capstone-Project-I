# Dashboard Architecture

## Purpose

The admin dashboard provides operational management for products, categories, inventory, orders, and users.

## Pages

| Page | Route | Purpose |
|---|---|---|
| Overview | `/dashboard` | Summary metrics |
| Products | `/dashboard/products` | Product listing, search |
| Product Detail | `/dashboard/products/:id` | Product view |
| Product Edit | `/dashboard/products/:id/edit` | Product editing |
| New Product | `/dashboard/products/new` | Product creation |
| Categories | `/dashboard/categories` | Category listing |
| New Category | `/dashboard/categories/new` | Category creation |
| Edit Category | `/dashboard/categories/:id/edit` | Category editing |
| Inventory | `/dashboard/inventory` | Stock management |
| Orders | `/dashboard/orders` | Order listing and management |
| Settings | `/dashboard/settings` | System configuration |

## API Endpoints

| Group | Endpoints |
|---|---|
| Products | `GET/POST /api/dashboard/products`, `PATCH /api/dashboard/products/:id` |
| Files | Upload intent, finalize, delete for product images |
| Inventory | `POST /api/dashboard/inventory/adjust` |
| Orders | `GET /api/dashboard/orders`, confirm, delete |
| Users | `GET/POST /api/dashboard/users`, role, deactivate, reactivate |

## Authorization

- All dashboard routes require authentication
- 4 roles: super_admin, admin, operator, viewer
- 22 permissions mapped to roles

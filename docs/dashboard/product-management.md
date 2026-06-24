# Product Management (Dashboard)

## Purpose

Dashboard product management with full CRUD, variants, images, and specifications.

## Dashboard Pages

| Page | Purpose |
|---|---|
| Products List | Searchable, filterable product listing |
| Product Detail | View product with all metadata |
| Product Edit | Edit product details, variants, images |
| New Product | Create new product |

## Admin API Endpoints

| Endpoint | Methods | Purpose |
|---|---|---|
| `/api/admin/products` | GET, POST | List and create products |
| `/api/admin/products/:id` | GET, PATCH, DELETE | Product CRUD |
| `/api/admin/products/upload` | POST | Product image upload |
| `/api/admin/products/:id/images` | GET, POST | Product media |
| `/api/admin/products/:id/images/primary` | POST | Set primary image |
| `/api/admin/products/:id/variants` | GET, POST | Variant management |
| `/api/admin/products/:id/variants/generate` | POST | Auto-generate variants |
| `/api/admin/products/:id/attributes` | GET, POST | Attribute management |
| `/api/admin/products/:id/specifications` | GET, POST | Specification management |
| `/api/admin/products/:id/content-sections` | GET, POST | Content sections |

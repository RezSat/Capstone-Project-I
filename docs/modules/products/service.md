# Products Module

## Purpose

Manages products, categories, brands, variants, attributes, and recommendations.

## Files (25 files)

| Category | Files |
|---|---|
| Core | `product.types.ts`, `product.service.ts`, `product.repo.ts` |
| Admin Catalog | `admin-catalog.repo.ts`, `admin-catalog.schema.ts`, `admin-catalog.service.ts` |
| Admin Details | `admin-product-details.repo.ts`, `admin-product-details.schema.ts`, `admin-product-details.service.ts` |
| Admin Variants | `admin-variants.repo.ts`, `admin-variants.schema.ts`, `admin-variants.service.ts` |
| Categories | `category.repo.ts`, `dashboard-category-list.repo.ts`, `public-category.repo.ts`, `public-category.service.ts` |
| Dashboard | `dashboard-product-list.repo.ts`, `dashboard-product-list.service.ts`, `dashboard-product-wizard.service.ts` |
| Public | `public-product.repo.ts` |
| Recommendations | `recommendations.repo.ts`, `recommendations.service.ts` |
| Promotions | `promotions.repo.ts`, `promotions.service.ts` |

## Key Entities

- **Products** – Core product records with pricing, status, SEO fields
- **Variants** – Purchasable variants with SKU, pricing, weight
- **Categories** – Hierarchical categories with filters and page content
- **Brands** – Product brand management
- **Attributes** – Variant attributes (size, color) with display types
- **Media** – Product images and files
- **Specifications** – Key-value product specifications
- **Content Sections** – Rich content on product pages

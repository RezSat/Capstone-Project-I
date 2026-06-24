# Product Files Module

## Purpose

Manages file uploads (images, documents) for products and categories.

## Files (13 files)

| File | Purpose |
|---|---|
| `product-file.types.ts` | Type definitions |
| `product-file.schema.ts` | Validation schemas |
| `product-file.repo.ts` | Database queries |
| `product-file.service.ts` | Business logic |
| `product-file.mapper.ts` | Data transformation |
| `product-file.validation.ts` | File validation |
| `product-file.access.service.ts` | Access control |
| `product-image.schema.ts` | Image validation |
| `product-image.service.ts` | Image handling |
| `product-image.types.ts` | Image types |
| `dashboard-product-files.service.ts` | Dashboard file management |
| `dashboard-product-image-upload.service.ts` | Product image upload |
| `dashboard-category-image-upload.service.ts` | Category image upload |

## Upload Flow

1. Client sends file via FormData
2. Server writes file to storage directory
3. Server saves metadata to `files` table
4. File becomes available for listing

## File Types

| Kind | Access | Max Size |
|---|---|---|
| image | private or public | 10MB |
| document | private only | 50MB |

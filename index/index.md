# Project Index

## Project Summary

Capstone Project I – Inventory Management System with E-Commerce Frontend.

A full-stack web application combining product inventory management with an online storefront.

## Implemented Modules

| Module | Files | Description |
|---|---|---|
| products | 25 | Product CRUD, categories, brands, variants, attributes, recommendations |
| auth | 16 | Dashboard and customer authentication, RBAC |
| product-files | 13 | File upload, storage, and metadata |
| inventory | 8 | Stock quantities, locations, reservations |
| users | 7 | Dashboard user and customer management |
| settings | 5 | System configuration |
| orders | 4 | Cart, checkout, order processing |
| stock-movements | 5 | Inventory change history |
| audit | 1 | Action logging |
| wishlists | 1 | Customer wishlists |

## Dashboard Pages

| Page | Route |
|---|---|
| Overview | `/dashboard` |
| Products | `/dashboard/products` |
| Product Detail | `/dashboard/products/:id` |
| Product Edit | `/dashboard/products/:id/edit` |
| New Product | `/dashboard/products/new` |
| Categories | `/dashboard/categories` |
| New Category | `/dashboard/categories/new` |
| Edit Category | `/dashboard/categories/:id/edit` |
| Inventory | `/dashboard/inventory` |
| Orders | `/dashboard/orders` |
| Settings | `/dashboard/settings` |

## Storefront Pages

| Page | Route |
|---|---|
| Homepage | `/` |
| Product Detail | `/products/:slug` |
| Category | `/category/:group/:slug` |
| Checkout | `/checkout` |
| Checkout Success | `/checkout/success` |
| Account | `/account` |
| Wishlist | `/wishlist` |
| Setup Account | `/setup-account` |

## Auth Pages

| Page | Route |
|---|---|
| Login | `/auth/login` |
| Signup | `/auth/signup` |
| Forgot Password | `/auth/forgot-password` |
| Reset Password | `/auth/reset-password` |
| Account Status | `/auth/account-status` |

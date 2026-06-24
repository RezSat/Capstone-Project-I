# Storefront Overview

## Purpose

Public-facing e-commerce storefront for product browsing and checkout.

## Pages

| Page | Route | Purpose |
|---|---|---|
| Homepage | `/` | Featured products, category navigation |
| Product Detail | `/products/:slug` | Product info, variants, images |
| Category | `/category/:group/:slug` | Filtered product listing |
| Checkout | `/checkout` | Cart review and payment |
| Checkout Success | `/checkout/success` | Order confirmation |
| Account | `/account` | Customer profile, orders, addresses |
| Wishlist | `/wishlist` | Saved products |
| Setup Account | `/setup-account` | Account setup for new users |

## Storefront API

| Endpoint | Purpose |
|---|---|
| `GET /api/storefront/session` | Get current session |
| `GET /api/search` | Product search |
| `GET/POST/DELETE /api/wishlist` | Wishlist management |
| `GET /api/account/details` | Account details |
| `PUT /api/account/address` | Update address |
| `GET /api/account/orders/:id` | Order details |
| `POST /api/storefront/checkout/card-submit` | Process payment |
| `POST /api/storefront/orders/lookup` | Order lookup |

## Features

- Product browsing with category navigation
- Variant selection (size, color)
- Shopping cart (guest and authenticated)
- Checkout with payment integration
- Customer account management
- Wishlist
- Search

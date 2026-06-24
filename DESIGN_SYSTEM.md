# Design System

## Purpose

This document defines the visual design system for the storefront and admin dashboard. The goal is to keep the frontend consistent, reusable, and clean.

## UI Areas

1. **Public Storefront** – Customer-facing product browsing and checkout
2. **Admin Dashboard** – Internal product, inventory, and user management

Both areas share the same brand identity, colors, typography, and component rules.

## Brand Identity

The storefront should feel bold, clean, modern, and product-focused. The design uses strong typography, clean spacing, large product imagery, and vivid orange accents.

## Colors

| Token | Hex | Usage |
|---|---|---|
| `brand-orange` | `#f97316` | Primary actions, active navigation, highlights |
| `brand-dark` | `#191A1C` | Main text, headings, footer |
| `brand-white` | `#FFFFFF` | Backgrounds, text on dark backgrounds |
| `surface-light` | `#F7F7F7` | Product image backgrounds, soft cards |
| `border-light` | `#E5E5E5` | Card borders, dividers |
| `text-muted` | `#777777` | Secondary text, descriptions |
| `success-green` | `#34C759` | Positive states |
| `warning-orange` | `#FF9500` | Pending states |
| `danger-red` | `#dc2626` | Failed, destructive states |

## Typography

| Font | Usage |
|---|---|
| `Oswald` | Headings, product names, category labels |
| `Open Sans` | Paragraphs, descriptions, body text |
| `Inter` | Buttons, navigation, forms, labels, UI text |

## Spacing

- Small gap: 8px
- Component gap: 16px
- Section gap: 32px
- Large section: 64px

## Border Radius

- Small controls: 4px to 6px
- Cards: 8px to 12px
- Large panels: 12px to 16px

## Buttons

| Variant | Style | Usage |
|---|---|---|
| Primary | Orange background, white text | Add to cart, checkout, save |
| Secondary | White background, dark border | Cancel, view details |
| Ghost | Transparent background | Icons, table actions |
| Danger | Red background, white text | Delete, cancel order |

## Component Structure

```
src/components/
  ui/           shadcn base components
  common/       Shared brand components
  storefront/   Public ecommerce components
  dashboard/    Admin dashboard components
```

### Common Components
Container, SectionHeader, BrandButton, SearchBox, StatusBadge, PriceText, EmptyState

### Storefront Components
StoreHeader, StoreFooter, ProductCard, ProductRail, ProductInfo, CategoryTile, QuantityStepper, VariantSwatches

### Dashboard Components
AdminSidebar, AdminTopbar, DashboardStatCard, OrdersTable, FilterPanel, ChartCard, OrderStatusBadge

## Component Rules

- Build brand components on top of shadcn/ui
- Keep components reusable and prop-driven
- Keep files under 150 lines
- Extract repeated UI into common components
- Use brand colors and fonts consistently
- Keep storefront and dashboard components separated

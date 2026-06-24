# Storefront Route Group Ownership

Active route group for public storefront routes.

- Owns shared storefront shell via `src/app/(storefront)/layout.tsx`.
- Owns customer-facing pages that should include `StoreHeader` and `StoreFooter`.
- Keep product and category pages server-rendered for SEO.

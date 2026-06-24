import { searchProductsPaginated } from '@/modules/products/product.repo'
import type { ProductCardProps } from '@/components/common/ProductCard'

type PromoLabel = 'new_arrival' | 'best_seller'

const PRICE_FORMATTER = new Intl.NumberFormat('en-LK', {
  style: 'currency',
  currency: 'LKR',
  minimumFractionDigits: 0,
})

function formatPrice(minor: number): string {
  return PRICE_FORMATTER.format(minor / 100)
}

export async function fetchPromoProducts(
  promoLabel: PromoLabel,
  pageSize = 6,
): Promise<ProductCardProps[]> {
  const result = await searchProductsPaginated({
    activityFilter: 'active',
    promoLabel,
    pageSize,
    page: 1,
  })

  if (result.items.length === 0) {
    const fallback = await searchProductsPaginated({
      activityFilter: 'active',
      pageSize,
      page: 1,
    })
    return fallback.items.map((p) => ({
      id: p.id,
      name: p.name,
      categoryName: p.categoryName ?? undefined,
      priceFormatted: formatPrice(p.basePriceMinor),
      href: `/products/${p.slug}`,
      images: p.images ?? [],
    }))
  }

  return result.items.map((p) => ({
    id: p.id,
    name: p.name,
    categoryName: p.categoryName ?? undefined,
    priceFormatted: formatPrice(p.basePriceMinor),
    href: `/products/${p.slug}`,
    images: p.images ?? [],
  }))
}

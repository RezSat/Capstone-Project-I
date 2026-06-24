import { notFound } from 'next/navigation'

import ProductDetailPage from '@/components/storefront/product/ProductDetailPage'
import { getRelatedCategoryTiles } from '@/data/related-category-tiles'
import { getStorefrontProductBySlug } from '@/modules/products/public-product.repo'
import type { ProductDetail } from '@/data/products'

export const dynamic = 'force-dynamic'

interface ProductRouteParams {
  slug: string
}

interface ProductRoutePageProps {
  params: Promise<ProductRouteParams>
}

export default async function ProductRoutePage({ params }: ProductRoutePageProps) {
  const { slug } = await params
  const product = await getStorefrontProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const productDetail: ProductDetail = {
    id: product.id,
    slug: product.slug,
    group: product.group ?? undefined,
    categorySlug: product.categorySlug ?? undefined,
    title: product.name,
    category: product.categoryName ?? '',
    description: product.description ?? product.shortDescription ?? '',
    currencyLabel: product.currencyCode,
    price: product.basePriceMinor / 100,
    oldPrice: product.compareAtPriceMinor ? product.compareAtPriceMinor / 100 : undefined,
    images: product.images.map((img) => ({
      src: img.src ?? '',
      alt: img.alt ?? '',
      orientation: 'portrait' as const,
    })),
    paymentPromos: product.paymentPromos,
    optionGroups: product.optionGroups.map(og => ({
      ...og,
      type: og.type as "button" | "color" | "swatch",
    })),
    accordions: product.accordions.map(acc => ({
      ...acc,
      contentType: acc.contentType as "bullets" | "paragraphs",
      bullets: acc.contentJson.bullets as string[] | undefined,
      paragraphs: acc.contentJson.paragraphs as string[] | undefined,
    })),
    variants: product.variants,
  }

  const relatedTiles = getRelatedCategoryTiles({
    group: product.group ?? undefined,
    categorySlug: product.categorySlug ?? undefined,
    limit: 4,
  })

  return <ProductDetailPage product={productDetail} recommendations={[]} relatedTiles={relatedTiles} />
}

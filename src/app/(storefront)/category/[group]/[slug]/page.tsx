import { notFound } from 'next/navigation'

import CategoryListingPage from '@/components/storefront/category/CategoryListingPage'
import ProductAccessoriesSection from '@/components/storefront/product/ProductAccessoriesSection'
import { getStorefrontCategoryBySlug } from '@/modules/products/public-category.service'
import { getRelatedCategoryTilesByPath } from '@/data/related-category-tiles'

export const dynamic = 'force-dynamic'

interface CategoryRouteParams {
  group: string
  slug: string
}

interface CategoryRoutePageProps {
  params: Promise<CategoryRouteParams>
  searchParams: Promise<Record<string, string | string[]>>
}

function parseSelectedFilters(
  raw: Record<string, string | string[]>,
  filterSlugs: string[],
): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const slug of filterSlugs) {
    const val = raw[slug]
    if (Array.isArray(val)) {
      result[slug] = val
    } else if (typeof val === 'string' && val) {
      result[slug] = [val]
    }
  }
  return result
}

export default async function CategoryRoutePage({ params, searchParams }: CategoryRoutePageProps) {
  const { group, slug } = await params
  const query = await searchParams

  const data = await getStorefrontCategoryBySlug(group, slug)

  if (!data) {
    notFound()
  }

  const filterSlugs = data.category.filters.map((f) => f.slug)
  const selectedFilters = parseSelectedFilters(query, filterSlugs)

  const filteredData = Object.keys(selectedFilters).length > 0
    ? await getStorefrontCategoryBySlug(group, slug, selectedFilters)
    : data

  if (!filteredData) {
    notFound()
  }

  const currentPath = `/category/${group}/${slug}`
  const accessoryTiles = getRelatedCategoryTilesByPath(currentPath)

  return (
    <>
      <CategoryListingPage category={filteredData.category} products={filteredData.products} />
      <ProductAccessoriesSection tiles={accessoryTiles} />
    </>
  )
}

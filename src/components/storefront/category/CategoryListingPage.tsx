'use client'

import { useCallback, useMemo } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

import type { StorefrontCategoryPage, StorefrontCategoryProduct } from '@/modules/products/public-category.service'

import CategoryFilterSidebar from './CategoryFilterSidebar'
import CategoryHero from './CategoryHero'
import CategoryProductGrid from './CategoryProductGrid'

interface CategoryListingPageProps {
  category: StorefrontCategoryPage
  products?: StorefrontCategoryProduct[]
}

export default function CategoryListingPage({ category, products = [] }: CategoryListingPageProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const selectedFilters = useMemo(() => {
    const result: Record<string, string[]> = {}
    for (const filter of category.filters) {
      const values = searchParams.getAll(filter.slug)
      if (values.length > 0) {
        result[filter.slug] = values
      }
    }
    return result
  }, [category.filters, searchParams])

  const handleFilterChange = useCallback(
    (filterSlug: string, optionValue: string, checked: boolean) => {
      const params = new URLSearchParams(searchParams.toString())

      if (checked) {
        params.append(filterSlug, optionValue)
      } else {
        const existing = params.getAll(filterSlug)
        params.delete(filterSlug)
        for (const val of existing) {
          if (val !== optionValue) {
            params.append(filterSlug, val)
          }
        }
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [router, pathname, searchParams],
  )

  return (
    <main className="w-full bg-white px-5 py-10 md:px-8 md:py-12 lg:px-12 lg:py-14">
      <div className="mx-auto flex w-full max-w-[1280px] flex-col">
        <CategoryHero category={category} />

        <section className="relative mt-16 grid grid-cols-1 gap-12 md:grid-cols-[220px_minmax(0,1fr)]">
          <div className="md:sticky md:top-[120px] md:self-start">
            <CategoryFilterSidebar
              filters={category.filters}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
            />
          </div>

          <div>
            <CategoryProductGrid products={products} />
          </div>
        </section>
      </div>
    </main>
  )
}

'use client'

import { useEffect, useRef } from 'react'

import { type ProductCardProps } from '@/components/common/ProductCard'
import { type RelatedCategoryTile } from '@/data/related-category-tiles'
import { type ProductDetail } from '@/data/products'

import ProductAccordionPanel from './ProductAccordionPanel'
import ProductAccessoriesSection from './ProductAccessoriesSection'
import ProductImageGallery from './ProductImageGallery'
import ProductInfoPanel from './ProductInfoPanel'
import ProductRecommendations from './ProductRecommendations'

interface ProductDetailPageProps {
  product: ProductDetail
  recommendations: ProductCardProps[]
  relatedTiles: RelatedCategoryTile[]
}

export default function ProductDetailPage({ product, recommendations, relatedTiles }: ProductDetailPageProps) {
  const sectionRef = useRef<HTMLElement | null>(null)
  const galleryScrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const handleWheel = (event: WheelEvent) => {
      if (!window.matchMedia('(min-width: 1024px)').matches) return

      const gallery = galleryScrollRef.current
      if (!gallery) return
      if (gallery.scrollHeight <= gallery.clientHeight) return

      const deltaY = event.deltaY
      const atTop = gallery.scrollTop <= 0
      const atBottom = gallery.scrollTop + gallery.clientHeight >= gallery.scrollHeight - 1

      if (deltaY > 0 && !atBottom) {
        event.preventDefault()
        event.stopPropagation()
        gallery.scrollTop += deltaY
        return
      }

      if (deltaY < 0 && !atTop) {
        event.preventDefault()
        event.stopPropagation()
        gallery.scrollTop += deltaY
      }
    }

    section.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      section.removeEventListener('wheel', handleWheel)
    }
  }, [])

  return (
    <main className="w-full overflow-x-hidden bg-white">
      <section ref={sectionRef} className="w-full overflow-visible px-5 pb-14 pt-10 md:px-8 md:py-12 lg:px-10 lg:py-10 xl:px-[40px]">
        <div className="grid w-full grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(390px,1.05fr)_minmax(280px,0.75fr)] lg:gap-10">
          <div className="min-w-0 w-full self-start">
            <ProductImageGallery images={product.images} scrollRef={galleryScrollRef} />
          </div>

          <div className="min-w-0 w-full overflow-visible">
            <ProductInfoPanel product={product} />
          </div>

          <div className="min-w-0 w-full overflow-visible">
            <ProductAccordionPanel accordions={product.accordions} />
          </div>
        </div>
      </section>

      <ProductRecommendations products={recommendations} />
      <ProductAccessoriesSection tiles={relatedTiles} />
    </main>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard, { type ProductCardProps } from './ProductCard'
import ProductSliderMobile from './ProductSliderMobile'

interface ProductSliderProps {
  title: string
  products: ProductCardProps[]
  className?: string
  id?: string
}

function getVisibleCards(width: number) {
  if (width < 640) return 1
  if (width < 1024) return 2
  if (width < 1280) return 3
  return 5
}

export default function ProductSlider({ title, products, className = '', id }: ProductSliderProps) {
  const [visibleCards, setVisibleCards] = useState(5)
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const handleResize = () => setVisibleCards(getVisibleCards(window.innerWidth))
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const maxIndex = Math.max(0, products.length - visibleCards)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentIndex(prev => Math.min(prev, maxIndex))
  }, [maxIndex])

  const slideWidth = 100 / visibleCards

  return (
    <section id={id} className={`w-full bg-white ${className}`}>
      {/* DESKTOP SLIDER LAYOUT */}
      <div className="hidden md:block px-6 py-16 md:px-10 lg:px-12">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="mb-2 font-oswald text-2xl font-semibold uppercase tracking-wide text-[#191A1C] md:text-3xl">
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
            className="flex h-9 w-9 items-center justify-center bg-[#F8F8F8] text-[#191A1C] transition-colors hover:border-[#f97316] hover:bg-[#f97316] hover:text-white disabled:cursor-not-allowed disabled:border-[#ECECEC] disabled:bg-[#F2F2F2] disabled:text-[#BFBFBF]"
              aria-label="Show previous products"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentIndex(prev => Math.min(maxIndex, prev + 1))}
              disabled={currentIndex >= maxIndex}
              className="flex h-9 w-9 items-center justify-center bg-[#F8F8F8] text-[#191A1C] transition-colors hover:border-[#f97316] hover:bg-[#f97316] hover:text-white disabled:cursor-not-allowed disabled:border-[#ECECEC] disabled:bg-[#F2F2F2] disabled:text-[#BFBFBF]"
              aria-label="Show next products"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-x-hidden overflow-y-visible py-6">
          <div
            className="-mx-[14px] flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(-${currentIndex * slideWidth}%)` }}
          >
            {products.map((product) => (
              <div
                key={`${product.name}-${product.categoryName ?? ''}-${product.id}`}
                className="px-[14px]"
                style={{ flex: `0 0 ${slideWidth}%` }}
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE SLIDER LAYOUT */}
      <div className="block md:hidden px-4 py-10">
        <ProductSliderMobile title={title} products={products} />
      </div>
    </section>
  )
}

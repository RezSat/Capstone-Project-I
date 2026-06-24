'use client'

import { useState, type TouchEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard, { type ProductCardProps } from './ProductCard'

interface ProductSliderMobileProps {
  title: string
  products: ProductCardProps[]
}

const CARD_WIDTH_PERCENT = 82
const VISIBLE_CARDS = 1.2

export default function ProductSliderMobile({ title, products }: ProductSliderMobileProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [touchEndX, setTouchEndX] = useState<number | null>(null)

  const maxIndex = Math.max(0, Math.ceil(products.length - VISIBLE_CARDS))
  const minSwipeDistance = 50

  const handleTouchStart = (e: TouchEvent) => {
    setTouchEndX(null)
    setTouchStartX(e.touches[0].clientX)
  }

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEndX(e.touches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStartX || !touchEndX) return

    const distance = touchStartX - touchEndX

    if (distance > minSwipeDistance) {
      setCurrentIndex(prev => Math.min(maxIndex, prev + 1))
    } else if (distance < -minSwipeDistance) {
      setCurrentIndex(prev => Math.max(0, prev - 1))
    }
  }

  return (
    <>
      <h2 className="mb-4 font-oswald text-3xl font-semibold uppercase tracking-wide text-[#191A1C]">
        {title}
      </h2>

      <div className="relative overflow-hidden -mx-4 px-4">
        {/* Left edge fade overlay */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white to-transparent pointer-events-none z-20" />

        {/* Right edge fade overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white to-transparent pointer-events-none z-20" />

        {/* Floating left button */}
        <button
          type="button"
          onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
          disabled={currentIndex === 0}
          className="absolute left-4 top-[125px] z-30 flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md text-[#191A1C] border border-gray-100/50 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Show previous products"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Floating right button */}
        <button
          type="button"
          onClick={() => setCurrentIndex(prev => Math.min(maxIndex, prev + 1))}
          disabled={currentIndex >= maxIndex}
          className="absolute right-4 top-[125px] z-30 flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-md text-[#191A1C] border border-gray-100/50 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
          aria-label="Show next products"
        >
          <ChevronRight size={20} />
        </button>

        {/* Slider track container utilizing the 9% centering calculation formula */}
        <div
          className="overflow-x-hidden overflow-y-visible py-4 touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="-mx-2 flex transition-transform duration-300 ease-out"
            style={{ transform: `translateX(calc(9% - ${currentIndex * CARD_WIDTH_PERCENT}%))` }}
          >
            {products.map((product) => (
              <div
                key={`${product.name}-${product.categoryName ?? ''}-${product.id}`}
                className="flex-none px-2 select-none"
                style={{ width: `${CARD_WIDTH_PERCENT}%` }}
              >
                <ProductCard {...product} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

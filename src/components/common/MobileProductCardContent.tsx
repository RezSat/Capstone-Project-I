'use client'

import Image from 'next/image'
import { Heart, ShoppingBag } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useWishlist } from '@/context/wishlist-context'
import type { ProductCardProps } from './ProductCard'

function resolveImageSrc(images?: ProductCardProps['images']): string {
  const raw = images?.find((img) => img.isPrimary)?.publicUrl ?? images?.[0]?.publicUrl
  return raw || '/images/sample/default_product.png'
}

export function MobileProductCardContent(props: ProductCardProps) {
  const { id, name, categoryName, priceFormatted, images } = props
  const { isInWishlist, toggleWishlist } = useWishlist()
  const reduceMotion = useReducedMotion()
  const imageSrc = resolveImageSrc(images)
  const inWishlist = isInWishlist(id)

  return (
    <motion.article
      className="relative flex w-full flex-col overflow-hidden rounded-[24px] border border-black/[0.06] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.08)]"
      whileTap={reduceMotion ? undefined : { scale: 0.985 }}
      transition={{ duration: 0.18 }}
    >
      <div className="relative m-3 h-[230px] overflow-hidden rounded-[20px] bg-[#fff7ed]">
        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#fdba74]/35 blur-2xl" />
        <div className="absolute inset-0 z-10 flex items-center justify-center p-5">
          <div className="relative h-full w-full">
            <Image
              src={imageSrc}
              alt={`${name} product image`}
              fill
              sizes="50vw"
              className="object-contain drop-shadow-[0_16px_20px_rgba(15,23,42,0.12)]"
              priority
            />
          </div>
        </div>

        <button
          type="button"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-sm"
          aria-label={inWishlist ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleWishlist(id)
          }}
        >
          <Heart
            size={22}
            className={inWishlist ? 'fill-[#f97316] text-[#f97316]' : 'text-[#fb923c]'}
          />
        </button>
      </div>

      <div className="flex min-h-[126px] flex-col justify-between px-5 pb-5 pt-1">
        <div>
          <p className="font-ui text-[11px] font-bold uppercase tracking-[0.16em] text-[#f97316]">
            {categoryName || 'Catalog item'}
          </p>
          <h3 className="mt-2 line-clamp-2 font-display text-[1.08rem] font-semibold uppercase leading-tight text-[#191A1C]">
            {name}
          </h3>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="font-ui text-base font-black text-[#191A1C]">
            {priceFormatted}
          </p>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#191A1C] text-white">
            <ShoppingBag size={16} />
          </span>
        </div>
      </div>
    </motion.article>
  )
}

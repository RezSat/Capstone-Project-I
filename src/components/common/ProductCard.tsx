'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingBag } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { useWishlist } from '@/context/wishlist-context'
import { MobileProductCardContent } from './MobileProductCardContent'

export interface ProductCardProps {
  id: string
  name: string
  categoryName?: string
  priceFormatted: string
  href?: string
  images?: { publicUrl: string; isPrimary: boolean }[]
}

function resolveImageSrc(images?: ProductCardProps['images']): string {
  const raw = images?.find((img) => img.isPrimary)?.publicUrl ?? images?.[0]?.publicUrl
  return raw || '/images/sample/default_product.png'
}

function ProductCardContent(props: ProductCardProps) {
  const { id, name, categoryName, priceFormatted, images } = props
  const { isInWishlist, toggleWishlist } = useWishlist()
  const reduceMotion = useReducedMotion()
  const imageSrc = resolveImageSrc(images)
  const inWishlist = isInWishlist(id)

  return (
    <motion.article
      className="group/card relative flex h-full w-full flex-col overflow-hidden rounded-[22px] border border-black/[0.06] bg-white shadow-[0_16px_42px_rgba(15,23,42,0.06)]"
      whileHover={reduceMotion ? undefined : { y: -6 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-[#fed7aa] to-transparent" />

      <div className="relative m-3 h-[250px] overflow-hidden rounded-[18px] bg-[#fff7ed]">
        <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#fdba74]/35 blur-2xl transition-transform duration-500 group-hover/card:scale-125" />
        <div className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-1 font-ui text-[10px] font-bold uppercase tracking-[0.16em] text-[#9a3412] shadow-sm">
          In catalog
        </div>

        <div className="absolute inset-0 z-10 flex items-center justify-center p-5">
          <div className="relative h-full w-full origin-bottom transition-transform duration-500 ease-out group-hover/card:scale-[1.08]">
            <Image
              src={imageSrc}
              alt={`${name} product image`}
              fill
              sizes="(max-width: 768px) 80vw, 25vw"
              className="object-contain drop-shadow-[0_18px_22px_rgba(15,23,42,0.12)]"
              priority
            />
          </div>
        </div>

        <button
          type="button"
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#191A1C] shadow-sm transition-colors hover:text-[#f97316]"
          aria-label={inWishlist ? `Remove ${name} from wishlist` : `Add ${name} to wishlist`}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            toggleWishlist(id)
          }}
        >
          <Heart
            size={17}
            className={inWishlist ? 'fill-[#f97316] text-[#f97316]' : 'text-[#191A1C] transition-colors duration-200 hover:text-[#f97316]'}
          />
        </button>
      </div>

      <div className="flex min-h-[122px] flex-1 flex-col justify-between px-5 pb-5 pt-1">
        <div>
          <p className="font-ui text-[11px] font-bold uppercase tracking-[0.16em] text-[#f97316]">
            {categoryName || 'Catalog item'}
          </p>
          <h3 className="mt-2 line-clamp-2 font-display text-[1.15rem] font-semibold uppercase leading-tight text-[#191A1C]">
            {name}
          </h3>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="font-ui text-base font-black text-[#191A1C]">
            {priceFormatted}
          </p>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#191A1C] text-white transition-colors group-hover/card:bg-[#f97316]">
            <ShoppingBag size={16} />
          </span>
        </div>
      </div>
    </motion.article>
  )
}

export default function ProductCard(props: ProductCardProps) {
  const desktop = (
    <div className="hidden md:block w-full h-full">
      <ProductCardContent {...props} />
    </div>
  )

  const mobile = (
    <div className="block md:hidden w-full h-full">
      <MobileProductCardContent {...props} />
    </div>
  )

  if (props.href) {
    return (
      <Link href={props.href} className="block h-full group">
        {desktop}
        {mobile}
      </Link>
    )
  }

  return (
    <>
      {desktop}
      {mobile}
    </>
  )
}

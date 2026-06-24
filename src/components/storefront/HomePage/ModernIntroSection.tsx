'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Search, ShoppingBag } from 'lucide-react'
import ProductCard, { type ProductCardProps } from '@/components/common/ProductCard'
import type { CollectionTile } from './homepage-content'

interface ModernIntroSectionProps {
  products: ProductCardProps[]
  collections: CollectionTile[]
}

const stats = ['Live catalog', 'Secure checkout', 'Mobile ready']

export default function ModernIntroSection({
  products,
  collections,
}: ModernIntroSectionProps) {
  const heroProduct = products[0]
  const secondaryProduct = products[1]
  const featuredCollection = collections[0]

  return (
    <section className="relative overflow-hidden bg-[#fff8f1] px-4 pb-16 pt-12 sm:px-6 md:pt-20 lg:px-12">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(440px,0.9fr)] lg:items-center">
        <div>
          <p className="font-ui text-xs font-bold uppercase text-[#f97316]">
            Generic ecommerce storefront
          </p>
          <h1 className="mt-4 max-w-4xl font-display text-[3rem] font-semibold uppercase leading-none text-[#191A1C] sm:text-[4.2rem] lg:text-[5.3rem]">
            Discover products with less friction.
          </h1>
          <p className="mt-5 max-w-2xl font-body text-base leading-7 text-[#4b5563] md:text-lg">
            A fast, responsive shopping entry point for browsing collections,
            finding new arrivals, and moving naturally toward checkout.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="#new-arrivals"
              className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-6 py-3 font-ui text-xs font-bold uppercase text-white transition-colors hover:bg-[#ea580c]"
            >
              Shop new arrivals <ShoppingBag size={16} />
            </Link>
            <Link
              href="#collections"
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[#fed7aa] bg-white px-6 py-3 font-ui text-xs font-bold uppercase text-[#191A1C] transition-colors hover:border-[#f97316]"
            >
              Browse collections <Search size={16} />
            </Link>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {stats.map((item) => (
              <div key={item} className="border-l border-[#fdba74] pl-3">
                <p className="font-ui text-[11px] font-bold uppercase text-[#9a3412]">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[520px]">
          {featuredCollection && (
            <Link
              href={featuredCollection.href}
              className="group absolute inset-x-0 top-0 h-[360px] overflow-hidden rounded-lg bg-[#191A1C]"
            >
              <Image
                src={featuredCollection.imageSrc}
                alt={featuredCollection.title}
                fill
                priority
                sizes="(max-width: 1024px) 92vw, 620px"
                className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4">
                <div>
                  <p className="font-ui text-xs font-bold uppercase text-[#fdba74]">
                    {featuredCollection.label}
                  </p>
                  <h2 className="mt-1 font-display text-4xl font-semibold uppercase text-white">
                    {featuredCollection.title}
                  </h2>
                </div>
                <ArrowRight className="text-white transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          )}

          <div className="absolute bottom-0 left-0 w-[58%] min-w-[220px]">
            {heroProduct && <ProductCard {...heroProduct} />}
          </div>
          <div className="absolute bottom-8 right-0 hidden w-[45%] min-w-[190px] md:block">
            {secondaryProduct && <ProductCard {...secondaryProduct} />}
          </div>
        </div>
      </div>
    </section>
  )
}

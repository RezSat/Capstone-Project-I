import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { type RelatedCategoryTile } from '@/data/related-category-tiles'

interface ProductAccessoriesSectionProps {
  tiles: RelatedCategoryTile[]
}

export default function ProductAccessoriesSection({ tiles }: ProductAccessoriesSectionProps) {
  if (tiles.length === 0) return null

  return (
    <section className="w-full bg-white px-5 py-12 md:px-8 lg:px-10 xl:px-[40px]">
      <h2 className="font-oswald text-2xl font-semibold uppercase text-[#191A1C] md:text-3xl">ACCESSORIES</h2>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.slice(0, 4).map((tile) => (
          <Link
            key={tile.id}
            href={tile.href}
            className="group relative h-[220px] overflow-hidden rounded-md md:h-[240px] lg:h-[250px]"
          >
            <Image
              src={tile.imageSrc}
              alt={tile.imageAlt}
              fill
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />

            <span className="absolute bottom-5 left-5 font-oswald text-lg font-[400] uppercase tracking-wide text-white md:text-xl">
              {tile.title}
            </span>

            <span className="absolute bottom-5 right-5 flex h-10 w-10 translate-x-4 items-center justify-center rounded-full text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              <ArrowRight size={20} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { CollectionTile } from './homepage-content'

interface ProductDiscoverySectionProps {
  collections: CollectionTile[]
}

export default function ProductDiscoverySection({
  collections,
}: ProductDiscoverySectionProps) {
  return (
    <section id="collections" className="bg-white px-4 py-16 sm:px-6 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="font-ui text-xs font-bold uppercase text-[#f97316]">
              Product discovery
            </p>
            <h2 className="mt-2 font-display text-3xl font-semibold uppercase text-[#191A1C] md:text-5xl">
              Shop by intent
            </h2>
          </div>
          <p className="max-w-xl font-body text-sm leading-6 text-[#4b5563] md:text-base">
            Simple collection paths help shoppers move from curiosity to the
            right product category without burying the catalog.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {collections.map((item, index) => (
            <Link
              href={item.href}
              key={item.title}
              className={`group relative min-h-[360px] overflow-hidden rounded-lg bg-[#191A1C] ${
                index === 0 ? 'md:min-h-[460px]' : ''
              }`}
            >
              <Image
                src={item.imageSrc}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 92vw, 33vw"
                className="object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-ui text-xs font-bold uppercase text-[#fdba74]">
                    {item.label}
                  </p>
                  <ArrowUpRight className="text-white transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </div>
                <h3 className="mt-3 font-display text-3xl font-semibold uppercase text-white">
                  {item.title}
                </h3>
                <p className="mt-3 font-body text-sm leading-6 text-white/82">
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

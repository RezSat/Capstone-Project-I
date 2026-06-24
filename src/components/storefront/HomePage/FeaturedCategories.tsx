import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

const categories = [
  { title: 'BADMINTON', imageSrc: '/images/storefront-generic/marketplace-hero.png', href: '/category/badminton/racquets' },
  { title: 'CRICKET', imageSrc: '/images/storefront-generic/collection-shelves.png', href: '/category/cricket/bats' },
  { title: 'PICKLE BALL', imageSrc: '/images/storefront-generic/checkout-packages.png', href: '/category/pickleball/paddles' },
]

export default function FeaturedCategories() {
  return (
    <section id="featured-categories" className="w-full bg-white px-6 py-16 md:px-10 lg:px-12 -mt-8 scroll-mt-16">
      <h2 className="mb-8 font-oswald text-2xl font-semibold uppercase tracking-wide text-[#191A1C] md:text-3xl">
        FEATURED CATEGORIES
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {categories.map((category) => (
          <Link
            href={category.href}
            key={category.title}
            className="group relative h-[400px] overflow-hidden rounded-lg md:h-[460px] block"
          >
            <Image
              src={category.imageSrc}
              alt={category.title}
              fill
              className="object-cover transition-transform duration-300 ease-out group-hover:scale-105"
            />

            <span className="absolute bottom-6 left-6 font-oswald text-xl font-[400] uppercase tracking-wider text-white">
              {category.title}
            </span>

            <span className="absolute bottom-6 right-6 flex h-10 w-10 translate-x-4 items-center justify-center rounded-full bg-transparent text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
              <ArrowRight size={20} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
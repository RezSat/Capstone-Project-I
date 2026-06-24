import Image from 'next/image'

import type { StorefrontCategoryPage } from '@/modules/products/public-category.service'

interface CategoryHeroProps {
  category: StorefrontCategoryPage
}

export default function CategoryHero({ category }: CategoryHeroProps) {
  return (
    <section className="w-full">
      <div className="relative h-[340px] w-full overflow-hidden rounded-xl md:h-[380px] lg:h-[420px]">
        <Image
          src={category.heroImage}
          alt={category.title}
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover"
          priority
        />
      </div>

      <div className="mx-auto mt-10 flex max-w-[900px] flex-col items-center text-center">
        <h1 className="font-oswald text-3xl font-normal uppercase text-[#191A1C] md:text-4xl">
          {category.title}
        </h1>
        <p className="mt-5 font-open-sans text-base leading-relaxed text-[#191A1C] md:text-lg">
          {category.description}
        </p>
      </div>
    </section>
  )
}

'use client'

import Image from 'next/image'

interface PurposeMissionCard {
  title: string
  description: string
  imageSrc: string
  imageAlt: string
}

const cards: PurposeMissionCard[] = [
  {
    title: 'OUR PURPOSE',
    description: 'To empower athletes with the right tools to perform at their best.',
    imageSrc: '/images/storefront-generic/collection-shelves.png',
    imageAlt: 'Purpose background',
  },
  {
    title: 'OUR MISSION',
    description:
      'To support and grow the sporting community by providing trusted, high-quality gear for players at every level.',
    imageSrc: '/images/storefront-generic/checkout-packages.png',
    imageAlt: 'Mission background',
  },
]

export default function PurposeMissionSection() {
  return (
    <section className="w-full bg-white px-10 py-0 mb-20">
      <div className="mx-auto grid grid-cols-1 gap-9 md:grid-cols-2">
        {cards.map((card) => (
          <div
            key={card.title}
            className="group relative h-[350px] overflow-hidden rounded-lg md:h-[70vh]"
          >
            <Image
              src={card.imageSrc}
              alt={card.imageAlt}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
            <div className="absolute inset-0 bg-black/40" />
            <div className="absolute left-8 bottom-8 right-8">
              <h3 className="font-oswald text-3xl font-semibold uppercase text-white md:text-[32px]">
                {card.title}
              </h3>
              <p className="mt-4 max-w-[520px] font-open-sans text-lg leading-snug text-white">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
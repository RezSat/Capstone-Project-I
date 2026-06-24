import Image from 'next/image'
import { type RefObject } from 'react'

import { type ProductImage } from '@/data/products'

interface ProductImageGalleryProps {
  images: ProductImage[]
  scrollRef?: RefObject<HTMLDivElement | null>
}

function getImageBoxClass(orientation?: ProductImage['orientation']) {
  if (orientation === 'portrait') return 'aspect-[4/5] min-h-[460px]'
  if (orientation === 'landscape') return 'aspect-[16/9] min-h-[260px]'
  return 'aspect-square min-h-[360px]'
}

function resolveImageSrc(src: string): string {
  if (src.startsWith('http')) return src
  if (src.startsWith('/')) return src
  return `/${src}`
}

export default function ProductImageGallery({ images, scrollRef }: ProductImageGalleryProps) {
  return (
    <aside
      ref={scrollRef}
      className="no-scrollbar w-full min-w-0 overflow-y-auto overflow-x-hidden overscroll-contain lg:sticky lg:top-[120px] lg:max-h-[calc(100svh-140px)] lg:pr-2"
    >
      {images.map((image, index) => (
        <div
          key={`${image.src}-${index}`}
          className={`relative mb-6 w-full overflow-hidden rounded-md bg-[#F8F8F8] last:mb-0 ${getImageBoxClass(image.orientation)}`}
        >
          <Image
            src={resolveImageSrc(image.src)}
            alt={image.alt}
            fill
            className="object-contain p-8 md:p-10"
            sizes="(min-width: 1280px) 40vw, (min-width: 1024px) 42vw, 100vw"
            priority={index === 0}
          />
        </div>
      ))}
    </aside>
  )
}

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface HeroBackgroundCarouselProps {
  images: string[]
  interval?: number
}

export default function HeroBackgroundCarousel({
  images,
  interval = 5000
}: HeroBackgroundCarouselProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!images || images.length <= 1) return

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [images, interval])

  if (!images || images.length === 0) {
    return <div className="absolute inset-0 bg-neutral-900" />
  }

  return (
    <div className="absolute inset-0 overflow-hidden bg-neutral-900">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          className="absolute inset-0 w-full h-full"
        >
          <Image
            src={images[index]}
            alt={`Hero slide ${index + 1}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/10 pointer-events-none" />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
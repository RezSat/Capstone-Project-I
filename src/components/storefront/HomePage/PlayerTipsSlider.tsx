'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PLAYER_TIPS_DATA } from '@/data/player-tips'

const AUTOPLAY_INTERVAL = 3500
const wrapIndex = (index: number, length: number) => ((index % length) + length) % length

interface SlotConfig {
  x: string
  scale: number
  zIndex: number
  opacity: number
  brightness: string
  blur: string
  textOpacity: number
}

function getSlotConfig(offset: number): SlotConfig {
  switch (offset) {
    case 0:
      return { x: '0%', scale: 1.0, zIndex: 10, opacity: 1, brightness: '100%', blur: '0px', textOpacity: 1 }
    case -1:
    case 1:
      return { x: offset === -1 ? '-72%' : '72%', scale: 0.82, zIndex: 5, opacity: 1, brightness: '100%', blur: '1px', textOpacity: 0.9 }
    case -2:
    case 2:
      return { x: offset === -2 ? '-140%' : '140%', scale: 0.68, zIndex: 2, opacity: 0.9, brightness: '100%', blur: '3px', textOpacity: 0 }
    default:
      return { x: '0%', scale: 0.5, zIndex: 0, opacity: 0, brightness: '0%', blur: '10px', textOpacity: 0 }
  }
}

export default function PlayerTipsSlider() {
  const [centerIndex, setCenterIndex] = useState(0)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const handleNext = useCallback(() => {
    setDirection('next')
    setCenterIndex((current) => wrapIndex(current + 1, PLAYER_TIPS_DATA.length))
  }, [])

  const handlePrev = useCallback(() => {
    setDirection('prev')
    setCenterIndex((current) => wrapIndex(current - 1, PLAYER_TIPS_DATA.length))
  }, [])

  const startAutoplay = useCallback(() => {
    if (intervalRef.current) return
    intervalRef.current = setInterval(() => {
      setCenterIndex((current) => wrapIndex(current + (direction === 'next' ? 1 : -1), PLAYER_TIPS_DATA.length))
    }, AUTOPLAY_INTERVAL)
  }, [direction])

  const stopAutoplay = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  useEffect(() => {
    startAutoplay()
    return () => stopAutoplay()
  }, [startAutoplay, stopAutoplay])

  const handleNextClick = () => {
    stopAutoplay()
    handleNext()
    startAutoplay()
  }

  const handlePrevClick = () => {
    stopAutoplay()
    handlePrev()
    startAutoplay()
  }

  const offsets = [-2, -1, 0, 1, 2]

  return (
    <div className="w-full bg-white sm:py-20 relative overflow-hidden flex flex-col items-center justify-center min-h-[550px] md:min-h-[520px]">
      <AnimatePresence mode="wait">
        {offsets.map((offset) => {
          const dataIndex = wrapIndex(centerIndex + offset, PLAYER_TIPS_DATA.length)
          const item = PLAYER_TIPS_DATA[dataIndex]
          const config = getSlotConfig(offset)
          const isCenter = offset === 0

          return (
            <motion.div
              key={item.id}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
              initial={{ x: config.x, scale: config.scale, opacity: 0 }}
              animate={{
                x: config.x,
                scale: config.scale,
                opacity: config.opacity,
                zIndex: config.zIndex,
              }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                filter: `brightness(${config.brightness}) blur(${config.blur})`,
              }}
            >
              <div className="relative w-[280px] sm:w-[340px] aspect-square rounded-md overflow-hidden shadow-2xl transition-all duration-500 ease-out">
                <Image
                  src={item.imageUrl}
                  alt={item.tipText}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 280px, 340px"
                  priority={isCenter}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>

      <button
        type="button"
        aria-label="Previous tip"
        onClick={handlePrevClick}
        className="absolute z-40 p-3 rounded-full bg-neutral-900/5 hover:bg-neutral-900/10 backdrop-blur-sm text-neutral-900 border border-neutral-200 transition-all duration-300 shadow-sm"
        style={{ left: '16px' }}
      >
        <ChevronLeft size={24} strokeWidth={1.5} />
      </button>

      <button
        type="button"
        aria-label="Next tip"
        onClick={handleNextClick}
        className="absolute z-40 p-3 rounded-full bg-neutral-900/5 hover:bg-neutral-900/10 backdrop-blur-sm text-neutral-900 border border-neutral-200 transition-all duration-300 shadow-sm"
        style={{ right: '16px' }}
      >
        <ChevronRight size={24} strokeWidth={1.5} />
      </button>
    </div>
  )
}

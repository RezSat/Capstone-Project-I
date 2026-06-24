'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { sideCardToneByDistance, sportsCategorySlides } from '@/data/sports-category-slider-data'

type SliderDirection = 1 | -1

const wrapIndex = (index: number, length: number) => ((index % length) + length) % length

const CARD_WIDTH = 150
const CARD_GAP = 36
const STEP = CARD_WIDTH + CARD_GAP

const loopedSlides = [...sportsCategorySlides, ...sportsCategorySlides, ...sportsCategorySlides]
const baseIndex = sportsCategorySlides.length

export default function SportsCategorySlider() {
  const prefersReducedMotion = useReducedMotion()
  const [trackIndex, setTrackIndex] = useState(baseIndex)
  const [direction, setDirection] = useState<SliderDirection>(1)
  const [viewportWidth, setViewportWidth] = useState(1280)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(1400)
  const transitionDuration = 0.75
  const ease: [number, number, number, number] = [0.22, 1, 0.36, 1]

  const mobile = viewportWidth < 768

  const activeSlide = sportsCategorySlides[wrapIndex(trackIndex, sportsCategorySlides.length)]
  const containerCenter = containerWidth / 2
  const trackX = containerCenter - (trackIndex * STEP + CARD_WIDTH / 2)

  useEffect(() => {
    const onResize = () => setViewportWidth(window.innerWidth)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (containerRef.current) {
      const ro = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setContainerWidth(entry.contentRect.width)
        }
      })
      ro.observe(containerRef.current)
      return () => ro.disconnect()
    }
  }, [])

  useEffect(() => {
    if (prefersReducedMotion) return
    if (sportsCategorySlides.length <= 1) return

    const timer = window.setTimeout(() => {
      setDirection(1)
      setTrackIndex((current) => {
        const next = current + 1
        const realNext = wrapIndex(next, sportsCategorySlides.length)
        if (next >= sportsCategorySlides.length * 2) {
          return sportsCategorySlides.length + realNext
        }
        return next
      })
    }, 3000)
    return () => window.clearTimeout(timer)
  }, [trackIndex, prefersReducedMotion])

  const onPrev = () => {
    setDirection(-1)
    setTrackIndex((current) => {
      const prev = current - 1
      const realPrev = wrapIndex(prev, sportsCategorySlides.length)
      if (prev < sportsCategorySlides.length) {
        return sportsCategorySlides.length + realPrev
      }
      return prev
    })
  }

  const onNext = () => {
    setDirection(1)
    setTrackIndex((current) => {
      const next = current + 1
      const realNext = wrapIndex(next, sportsCategorySlides.length)
      if (next >= sportsCategorySlides.length * 2) {
        return sportsCategorySlides.length + realNext
      }
      return next
    })
  }

  return (
    <section className="relative w-full overflow-hidden bg-white py-16 md:py-5">
      <div ref={containerRef} className="relative mx-auto h-[420px] w-full max-w-[1400px]">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-28 bg-gradient-to-r from-white to-transparent md:w-52" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-28 bg-gradient-to-l from-white to-transparent md:w-52" />

        <motion.div
          className="absolute left-1/2 top-1/2 z-10 flex gap-[36px]"
          animate={{ x: trackX }}
          transition={{ duration: transitionDuration, ease }}
          style={{ y: '-50%' }}
        >
          {loopedSlides.map((slide, index) => {
            const distance = Math.abs(index - trackIndex)
            const tone = sideCardToneByDistance[Math.min(distance, 3) as 1 | 2 | 3] ?? { opacity: 0 }

            return (
              <motion.div
                key={index}
                className="flex h-[170px] w-[150px] items-center justify-center rounded-md border border-[#EFEFEF] px-3 text-center font-oswald text-[18px] uppercase tracking-[0.08em]"
                animate={{ opacity: distance === 0 ? 0 : tone.opacity, backgroundColor: tone.backgroundColor, color: tone.color }}
                style={{ zIndex: 20 - distance }}
              >
                {slide.title}
              </motion.div>
            )
          })}
        </motion.div>

        <div className="absolute left-1/2 top-1/2 z-30 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 md:h-[320px] md:w-[320px]">
          <div className="relative h-full w-full overflow-hidden rounded-md">
            <AnimatePresence custom={direction} initial={false}>
              <motion.div
                key={`${activeSlide.title}-${trackIndex}`}
                custom={direction}
                className="absolute inset-0"
                initial={{ x: direction === 1 ? '100%' : '-100%' }}
                animate={{ x: '0%' }}
                exit={{ x: direction === 1 ? '-100%' : '100%' }}
                transition={{ duration: transitionDuration, ease }}
              >
                <Image src={activeSlide.image} alt={activeSlide.title} fill className="object-cover" sizes="(max-width: 768px) 260px, 320px" />
                <div className="absolute inset-0 bg-black/30" />
                <div className="absolute inset-0 flex items-center justify-center px-5 text-center md:px-7">
                  <p className="max-w-[260px] font-ui text-sm font-semibold uppercase leading-snug tracking-wide text-white md:text-base">
                    {activeSlide.tagline}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <button
          type="button"
          aria-label="Previous sports category"
          onClick={onPrev}
          className="absolute top-1/2 z-40 -translate-y-1/2 text-[#4A4A4A] transition-colors hover:text-[#191A1C]"
          style={{ left: `calc(50% - ${mobile ? 160 : 216}px)` }}
        >
          <ChevronLeft size={30} strokeWidth={1.8} />
        </button>
        <button
          type="button"
          aria-label="Next sports category"
          onClick={onNext}
          className="absolute top-1/2 z-40 -translate-y-1/2 text-[#4A4A4A] transition-colors hover:text-[#191A1C]"
          style={{ left: `calc(50% + ${mobile ? 132 : 184}px)` }}
        >
          <ChevronRight size={30} strokeWidth={1.8} />
        </button>
      </div>
    </section>
  )
}
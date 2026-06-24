'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { Volume2, VolumeX } from 'lucide-react'
import BrandButton from '@/components/common/BrandButton'

export default function HomeVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isMuted, setIsMuted] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    const section = sectionRef.current

    if (!video || !section) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(section)

    return () => observer.disconnect()
  }, [])

  const togglePlay = () => {
    const video = videoRef.current
    if (!video) return

    if (video.paused) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setIsMuted(video.muted)
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-[420px] w-full overflow-hidden bg-black md:h-[500px] lg:h-[600px]"
      onClick={togglePlay}
      role="button"
      tabIndex={0}
      aria-label="Play or pause video"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        playsInline
        loop
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/videos/homepage_video.mp4" type="video/mp4" />
      </video>

      <button
          type="button"
          onClick={toggleMute}
          className="absolute bottom-4 right-4 z-10 flex h-8 w-8 items-center justify-center text-white"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
      </button>
        
      <div className="absolute left-8 bottom-12 z-10 md:left-10 md:bottom-16">
        <h2 className="font-oswald text-2xl font-[400] uppercase text-white md:text-4xl">
          YONEX ASTROX 100
        </h2>
        <div className="mt-6">
          <Link href="/category/badminton/racquets" onClick={(e) => e.stopPropagation()}>
            <BrandButton variant="light" size="md">
              SHOP NOW
            </BrandButton>
          </Link>
        </div>
      </div>
    </section>
  )
}
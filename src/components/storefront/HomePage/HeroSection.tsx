'use client'

import HeroBackgroundCarousel from './HeroBackgroundCarousel'
import BlockTextReveal from '@/components/common/BlockTextReveal'
import RollingText from '../../common/RollingText'
import BrandButton from '../../common/BrandButton'

const heroImages = [
  '/images/storefront-generic/marketplace-hero.png',
  '/images/storefront-generic/collection-shelves.png',
  '/images/storefront-generic/checkout-packages.png',
]

export default function HeroSection() {
  return (
    <section className="relative h-[calc(100svh-56px)] lg:h-[calc(100svh-88px)] w-full overflow-hidden bg-black">
      <HeroBackgroundCarousel images={heroImages} interval={5000} />

      <div className="absolute inset-0 flex items-end">
        <div className="px-6 md:px-10 lg:px-14 pb-16 md:pb-20 lg:pb-16 max-w-5xl flex flex-col items-start">
          <h1 className="font-display text-[clamp(2.4rem,7.6vw,5.1rem)] text-white font-bold uppercase leading-[0.95] tracking-tight [text-shadow:0px_4px_4px_rgba(0,0,0,0.4)]">
            <BlockTextReveal
              className="block lg:top-10"
              textClassName="block"
              duration={1.1}
              delay={0}
            >
              <span className="block">
                BUILT FOR{' '}
                <RollingText
                  words={['BADMINTON', 'CRICKET', 'VOLLEYBALL', 'POWER']}
                  duration={7}
                  className='top-[1px]'
                />
              </span>
            </BlockTextReveal>
            <BlockTextReveal
              className="block"
              textClassName="block"
              duration={1.1}
              delay={0.12}
            >
              <span className="block">DESIGNED FOR PRECISION</span>
            </BlockTextReveal>
          </h1>

          <BlockTextReveal
            className="mt-4 block max-w-3xl"
            textClassName="block"
            duration={1.1}
            delay={0.28}
          >
            <p
              className="text-sm md:text-base lg:text-2xl text-white/95"
              style={{
                textShadow: '0 3px 12px rgba(0,0,0,0.7)',
                fontFamily: 'var(--font-oswald-next)',
                fontWeight: 200,
                letterSpacing: '0.02em',
              }}
            >
              Quality Products, Delivered to Your Door
            </p>
          </BlockTextReveal>

          <div className="mt-6">
            <BrandButton
              variant="light"
              size="md"
              className="uppercase tracking-wider font-semibold"
              onClick={() => {
                document.getElementById('featured-categories')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              Explore
            </BrandButton>
          </div>
        </div>
      </div>
    </section>
  )
}

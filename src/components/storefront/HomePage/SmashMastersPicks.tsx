import Image from 'next/image'
import Link from 'next/link'
import BlockTextReveal from '@/components/common/BlockTextReveal'
import BlockTextRevealModified from '@/components/common/BlockTextRevealModified'
import BrandButton from '@/components/common/BrandButton'

export default function SmashMastersPicks() {
  return (
    <section className="relative w-full">
      <div className="hidden md:block relative h-[500px] w-full overflow-hidden">
        <Image
          src="/images/storefront-generic/marketplace-hero.png"
          alt="Smash Masters Picks background"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute right-8 top-8 max-w-[620px] text-right md:right-12 md:top-12">
          <BlockTextReveal reverse blockColor="#FFFFFF">
            <h2 className="font-oswald text-3xl font-[400] uppercase leading-tight text-white md:text-4xl">
              SMASH MASTERS&apos; PICKS
            </h2>
          </BlockTextReveal>

          <div className="mt-3 md:mt-4">
            <BlockTextReveal reverse blockColor="#FFFFFF" delay={0.15}>
              <p className="text-sm font-open-sans leading-relaxed text-white md:text-base font-thin">
                Explore our handpicked selection of top-rated products loved by badminton
              </p>
            </BlockTextReveal>
            <BlockTextReveal reverse blockColor="#FFFFFF" delay={0.18}>
              <p className="text-sm font-open-sans leading-relaxed text-white md:text-base font-thin -mt-[5px]">
                enthusiasts worldwide. Guaranteed to take your game to the next level.
              </p>
            </BlockTextReveal>
          </div>

          <div className="mt-4 md:mt-5">
            <Link href="/category/badminton/racquets">
              <BrandButton variant="outlined" size="md">
                SHOP NOW
              </BrandButton>
            </Link>
          </div>
        </div>
      </div>

      <div className="block md:hidden w-full bg-white pb-10">
        <div className="relative w-full h-[240px] overflow-hidden">
          <Image
            src="/images/storefront-generic/marketplace-hero.png"
            alt="Smash Masters Picks"
            fill
            priority
            className="object-cover"
          />
        </div>

        <div className="flex flex-col items-center text-center px-5 mt-6">
          <BlockTextRevealModified
            text="SMASH MASTERS' PICKS"
            textClassName="font-oswald text-2xl font-bold uppercase tracking-wide text-neutral-900 text-center"
          />

          <div className="mt-3">
            <BlockTextRevealModified
              text="Explore our handpicked selection of top-rated products loved by badminton enthusiasts worldwide. Guaranteed to take your game to the next level."
              textClassName="font-open-sans text-sm leading-relaxed text-neutral-600 text-center"
            />
          </div>

          <div className="mt-6 w-full max-w-[240px]">
            <Link href="/category/badminton/racquets">
              <BrandButton variant="primary" size="md">
                EXPLORE
              </BrandButton>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
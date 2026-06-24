import Image from 'next/image'
import BlockTextRevealModified from '@/components/common/BlockTextRevealModified'

export default function PlayersEdge() {
  return (
    <section className="w-full bg-white mt-16 px-5 md:px-0">
      <div className="mx-auto flex flex-col items-center text-center">
        
        {/* Mobile-Only Header Asset */}
        <div className="block md:hidden w-full flex justify-center mb-4">
          <Image
            src="/images/storefront-generic/marketplace-hero.png"
            alt="The Player's Edge Illustration"
            width={110}
            height={25}
            className="object-contain"
            priority
          />
        </div>

        {/* ==========================================
            TITLE SECTION (Using Modified Engine)
            ========================================== */}
        <div className="w-full max-w-[280px] md:max-w-full mx-auto">
          <BlockTextRevealModified
            text="THE PLAYER'S EDGE"
            blockColor="#f97316"
            delay={0}
            textClassName="font-oswald text-3xl md:text-2xl font-[500] uppercase leading-tight text-[#191A1C] text-center"
          />
        </div>

        {/* ==========================================
            BODY DESCRIPTION (Using Modified Engine)
            ========================================== */}
        <div className="mt-6 w-full max-w-[340px] md:max-w-full mx-auto">
          <BlockTextRevealModified
            text="The difference between average and exceptional isn't always power or speed, it's awareness, timing, and control. Our gear is engineered precisely for those moments when split-second decisions determine victory."
            blockColor="#f97316"
            delay={0.25}
            textClassName="font-open-sans text-md md:text-md leading-relaxed text-[#191A1C] text-center"
          />
        </div>

      </div>
    </section>
  )
}
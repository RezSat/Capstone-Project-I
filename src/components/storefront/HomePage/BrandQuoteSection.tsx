import BlockTextRevealModified from '@/components/common/BlockTextRevealModified'

export default function BrandQuoteSection() {
  return (
    <section className="w-full bg-white py-20">
      <div className="mx-auto flex max-w-[900px] flex-col items-center text-center px-5 md:px-0">
        
        {/* ==========================================
            DESKTOP HEADLINE VIEW (2 Lines)
            ========================================== */}
        <div className="hidden md:flex flex-col items-center text-center w-full">
          <BlockTextRevealModified
            text="&ldquo;BECAUSE EVERY GREAT GAME BEGINS"
            blockColor="#f97316"
            delay={0}
            textClassName="font-oswald text-4xl font-[400] uppercase leading-tight text-[#f97316] text-center"
          />
          <BlockTextRevealModified
            text="WITH THE RIGHT GEAR.&rdquo;"
            blockColor="#f97316"
            delay={0.1}
            className="mt-1"
            textClassName="font-oswald text-4xl font-[400] uppercase leading-tight text-[#f97316] text-center"
          />
        </div>

        {/* ==========================================
            MOBILE HEADLINE VIEW (Naturally Balanced Rows)
            ========================================== */}
        <div className="flex md:hidden w-full justify-center max-w-[290px] mx-auto">
          <BlockTextRevealModified
            text="&ldquo;BECAUSE EVERY GREAT GAME BEGINS WITH THE RIGHT GEAR.&rdquo;"
            blockColor="#f97316"
            delay={0}
            textClassName="font-oswald text-2xl font-[400] uppercase leading-relaxed text-[#f97316] text-center"
          />
        </div>

        {/* ==========================================
            SUBTEXT PARAGRAPHS (Using Modified Engine)
            ========================================== */}
        <div className="mt-8 flex flex-col items-center w-full max-w-[390px] md:max-w-full mx-auto">
          <BlockTextRevealModified
            text="This platform demonstrates a reusable ecommerce storefront connected to practical inventory operations, with product discovery, catalog browsing, and checkout paths kept clear for customers."
            blockColor="#f97316"
            delay={0.3}
            textClassName="font-open-sans text-md md:text-lg leading-relaxed text-[#191A1C] text-center"
          />
        </div>

      </div>
    </section>
  )
}

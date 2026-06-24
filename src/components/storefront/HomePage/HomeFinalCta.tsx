import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function HomeFinalCta() {
  return (
    <section className="bg-[#fff8f1] px-4 py-16 sm:px-6 lg:px-12">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-6 rounded-lg border border-[#fed7aa] bg-white p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div>
          <p className="font-ui text-xs font-bold uppercase text-[#f97316]">
            Ready for checkout paths
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold uppercase text-[#191A1C] md:text-4xl">
            Keep browsing the live catalog.
          </h2>
          <p className="mt-2 max-w-2xl font-body text-sm leading-6 text-[#4b5563]">
            Product cards, wishlist behavior, search, cart, and checkout entry
            points remain connected to the existing ecommerce foundation.
          </p>
        </div>
        <Link
          href="#best-sellers"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-6 py-3 font-ui text-xs font-bold uppercase text-white transition-colors hover:bg-[#ea580c]"
        >
          View best sellers <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  )
}

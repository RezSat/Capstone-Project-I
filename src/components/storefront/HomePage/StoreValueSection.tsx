import { SearchCheck, ShieldCheck, Sparkles, Truck } from 'lucide-react'
import type { StoreValueItem } from './homepage-content'

interface StoreValueSectionProps {
  items: StoreValueItem[]
}

const icons = {
  shield: ShieldCheck,
  search: SearchCheck,
  truck: Truck,
  sparkles: Sparkles,
}

export default function StoreValueSection({ items }: StoreValueSectionProps) {
  return (
    <section className="bg-[#191A1C] px-4 py-14 text-white sm:px-6 lg:px-12">
      <div className="mx-auto grid max-w-[1440px] gap-8 lg:grid-cols-[0.72fr_1fr] lg:items-start">
        <div>
          <p className="font-ui text-xs font-bold uppercase text-[#fdba74]">
            Storefront foundations
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold uppercase leading-tight md:text-5xl">
            Built around practical shopping flows.
          </h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => {
            const Icon = icons[item.icon]
            return (
              <article
                key={item.title}
                className="rounded-lg border border-white/10 bg-white/[0.04] p-5"
              >
                <Icon className="h-6 w-6 text-[#fb923c]" />
                <h3 className="mt-5 font-display text-xl font-semibold uppercase text-white">
                  {item.title}
                </h3>
                <p className="mt-2 font-body text-sm leading-6 text-white/70">
                  {item.description}
                </p>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

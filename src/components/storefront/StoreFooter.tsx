import Link from 'next/link'
import { GitBranch, Mail, PackageCheck, ShieldCheck } from 'lucide-react'
import StorefrontLogo from '@/components/common/StorefrontLogo'

const quickLinks = [
  { label: 'Home', href: '/' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Checkout', href: '/checkout' },
  { label: 'Dashboard', href: '/dashboard' },
]

const features = [
  'Inventory tracking',
  'Product catalog',
  'Cart and checkout',
  'Admin operations',
]

const technology = ['Next.js', 'PostgreSQL', 'Drizzle ORM', 'Tailwind CSS']

export default function StoreFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-black/[0.06] bg-[#111112] px-10 py-12 text-white md:px-12">
      <div className="absolute right-10 top-8 h-40 w-40 rounded-full bg-[#f97316]/15 blur-3xl" />

      <div className="relative z-10 mx-auto grid max-w-[1440px] gap-10 md:grid-cols-[1.35fr_0.7fr_0.8fr_0.8fr]">
        <section>
          <StorefrontLogo tone="dark" />
          <p className="mt-6 max-w-[460px] font-body text-sm leading-7 text-white/70">
            Storefront Inventory Platform is an academic Capstone Project I
            implementation of an inventory management system with an ecommerce
            frontend.
          </p>

          <div className="mt-6 grid max-w-xl grid-cols-2 gap-3">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="font-ui text-[11px] font-bold uppercase tracking-[0.18em] text-[#fdba74]">
                Project
              </p>
              <p className="mt-2 font-display text-xl font-semibold uppercase">
                Capstone Project I
              </p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
              <p className="font-ui text-[11px] font-bold uppercase tracking-[0.18em] text-[#fdba74]">
                Index No
              </p>
              <p className="mt-2 font-display text-xl font-semibold uppercase">
                23CDS0843
              </p>
            </div>
          </div>
        </section>

        <FooterList title="Quick navigation" items={quickLinks} />

        <section>
          <h3 className="font-ui text-xs font-bold uppercase tracking-[0.18em] text-[#fdba74]">
            System features
          </h3>
          <ul className="mt-5 space-y-3">
            {features.map((item) => (
              <li key={item} className="flex items-center gap-3 font-body text-sm text-white/72">
                <PackageCheck className="h-4 w-4 text-[#f97316]" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="font-ui text-xs font-bold uppercase tracking-[0.18em] text-[#fdba74]">
            Project info
          </h3>
          <ul className="mt-5 space-y-3">
            {technology.map((item) => (
              <li key={item} className="flex items-center gap-3 font-body text-sm text-white/72">
                <ShieldCheck className="h-4 w-4 text-[#f97316]" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-6 space-y-2 font-body text-sm text-white/72">
            <p className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-[#f97316]" />
              contact@example.edu
            </p>
            <p className="flex items-center gap-3">
              <GitBranch className="h-4 w-4 text-[#f97316]" />
              Public academic repository
            </p>
          </div>
        </section>
      </div>

      <div className="relative z-10 mx-auto mt-10 flex max-w-[1440px] items-center justify-between border-t border-white/10 pt-6">
        <p className="font-ui text-xs uppercase tracking-[0.14em] text-white/50">
          Inventory Management System with E-Commerce Frontend
        </p>
        <p className="font-ui text-xs uppercase tracking-[0.14em] text-white/50">
          Academic showcase
        </p>
      </div>
    </footer>
  )
}

function FooterList({ title, items }: { title: string; items: typeof quickLinks }) {
  return (
    <section>
      <h3 className="font-ui text-xs font-bold uppercase tracking-[0.18em] text-[#fdba74]">
        {title}
      </h3>
      <ul className="mt-5 space-y-3">
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className="font-body text-sm text-white/72 transition-colors hover:text-[#fdba74]">
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

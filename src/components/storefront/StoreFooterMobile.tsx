import Link from 'next/link'
import { Mail, PackageCheck } from 'lucide-react'
import StorefrontLogo from '@/components/common/StorefrontLogo'

const links = [
  { label: 'Home', href: '/' },
  { label: 'Wishlist', href: '/wishlist' },
  { label: 'Checkout', href: '/checkout' },
  { label: 'Dashboard', href: '/dashboard' },
]

const features = ['Inventory tracking', 'Product catalog', 'Cart flow', 'Admin dashboard']

export default function StoreFooterMobile() {
  return (
    <footer className="lg:hidden border-t border-black/[0.06] bg-[#111112] px-5 py-8 text-white">
      <StorefrontLogo tone="dark" />

      <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04] p-4">
        <p className="font-ui text-[11px] font-bold uppercase tracking-[0.18em] text-[#fdba74]">
          Capstone Project I
        </p>
        <h2 className="mt-2 font-display text-2xl font-semibold uppercase leading-tight">
          Storefront Inventory Platform
        </h2>
        <p className="mt-3 font-body text-sm leading-6 text-white/70">
          Inventory Management System with E-Commerce Frontend
        </p>
        <p className="mt-4 font-ui text-xs font-bold uppercase tracking-[0.16em] text-[#fdba74]">
          Index No: 23CDS0843
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <section>
          <h3 className="font-ui text-xs font-bold uppercase tracking-[0.16em] text-[#fdba74]">
            Navigation
          </h3>
          <ul className="mt-4 space-y-3">
            {links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="font-body text-sm text-white/72">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="font-ui text-xs font-bold uppercase tracking-[0.16em] text-[#fdba74]">
            Features
          </h3>
          <ul className="mt-4 space-y-3">
            {features.map((item) => (
              <li key={item} className="flex items-center gap-2 font-body text-sm text-white/72">
                <PackageCheck className="h-4 w-4 text-[#f97316]" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <p className="mt-8 flex items-center gap-2 border-t border-white/10 pt-5 font-body text-sm text-white/60">
        <Mail className="h-4 w-4 text-[#f97316]" />
        contact@example.edu
      </p>
    </footer>
  )
}

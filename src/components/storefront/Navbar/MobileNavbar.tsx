'use client'

import Link from 'next/link'
import { Menu, User, Search, ShoppingBag, Heart } from 'lucide-react'
import StorefrontLogo from '@/components/common/StorefrontLogo'
import { useCart } from '@/context/cart-context'
import { useAuthModal } from '@/context/auth-modal-context'

interface MobileNavbarProps {
  onMenuToggle: () => void
  onSearchToggle?: () => void
}

export default function MobileNavbar({ onMenuToggle, onSearchToggle }: MobileNavbarProps) {
  const { items, openCart } = useCart()
  const { openLoginModal } = useAuthModal()
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return (
    <div className="lg:hidden sticky top-0 left-0 right-0 z-[99] w-full bg-white/90 backdrop-blur-md border-b border-neutral-100/80 h-14 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} aria-label="Open menu">
          <Menu size={22} />
        </button>
        <button aria-label="User account" onClick={openLoginModal}>
          <User size={22} />
        </button>
      </div>

      <StorefrontLogo className="absolute left-1/2 top-2 z-50 -translate-x-1/2" showText={false} />

      <div className="flex items-center gap-4">
        <Link href="/wishlist" className="p-1 text-neutral-800" aria-label="Favorites">
          <Heart size={22} />
        </Link>
        <button aria-label="Search" onClick={onSearchToggle}>
          <Search size={22} />
        </button>
        <button aria-label="Shopping bag" onClick={openCart} className="relative">
          <ShoppingBag size={22} />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#f97316] text-[10px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}

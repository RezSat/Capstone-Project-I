'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search, User, Heart, ShoppingBag } from 'lucide-react'
import StorefrontLogo from '@/components/common/StorefrontLogo'
import MegaMenu from './MegaMenu'
import ContactMegaMenu from './ContactMegaMenu'
import MobileNavbar from './MobileNavbar'
import MobileMenuDrawer from './MobileMenuDrawer'
import SearchModal from '@/components/navigation/SearchModal'
import { storefrontNavItems } from '../../../data/storefront-nav-config'
import { useCart } from '@/context/cart-context'
import { useAuthModal } from '@/context/auth-modal-context'

export default function StoreHeader() {
  const [openMenuLabel, setOpenMenuLabel] = useState<string | null>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const { items, openCart } = useCart()
  const { openLoginModal } = useAuthModal()
  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0)

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/storefront/session')
        const json = await res.json()
        setIsAuthenticated(json.authenticated === true)
      } catch {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  const handleUserClick = () => {
    if (isAuthenticated) {
      router.push('/account')
    } else {
      openLoginModal()
    }
  }

  const handleMenuEnter = (label: string) => {
    setOpenMenuLabel(label)
  }

  const handleMenuLeave = () => {
    setOpenMenuLabel(null)
  }

  return (
    <div className="sticky top-0 z-[100]">
      <header className="hidden lg:block bg-white w-full relative">
      <StorefrontLogo className="absolute left-6 top-5 z-50" />

      {/* Top info bar with separator line */}
      <div className="relative">
        <div className="px-8 py-1.5 flex items-center justify-end min-h-8">
          {/* Address text - right side */}
          <div className="text-xs text-[#191A1C] font-inter">
            Inventory Management System with E-Commerce Frontend
          </div>
        </div>
        {/* Separator line - starts after logo area, ends near address */}
        <div className="absolute bottom-0 left-36 h-px bg-gray-300" style={{ right: '30px' }} />
      </div>

      {/* Main navigation bar */}
      <nav className="px-8 py-4 relative">
        {/* Grid-based three-zone layout for proper centering */}
        <div className="grid grid-cols-[10rem_minmax(0,1fr)_auto] items-center">
          {/* Left zone: reserved for logo area */}
          <div />

          {/* Center zone: nav links with mega menu */}
          <div
            className="mx-auto flex w-full max-w-[980px] items-center justify-center gap-x-16 relative"
            onMouseLeave={handleMenuLeave}
          >
            {storefrontNavItems.map((item) => (
              <div
                key={item.label}
                className="relative group"
                onMouseEnter={() => handleMenuEnter(item.label)}
              >
                <a
                  href={item.href}
                  className={`font-open-sans text-md font-semibold uppercase tracking-wide transition-colors whitespace-nowrap ${
                    openMenuLabel === item.label
                      ? 'text-[#f97316] border-b-2 border-[#f97316] pb-1'
                      : 'text-[#191A1C] hover:text-[#f97316]'
                  }`}
                  aria-current={openMenuLabel === item.label ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </div>
            ))}
            {openMenuLabel && (
              <div
                className="absolute top-full left-1/2 h-3 w-[calc(100%+88px)] max-w-[calc(100vw-320px)] -translate-x-1/2"
                aria-hidden="true"
              />
            )}
            {/* Mega menu rendered at nav group level */}
            {(() => {
              const categoryItem = storefrontNavItems.find(item => item.megaMenu && item.megaMenu.type !== 'contact' && openMenuLabel === item.label)
              const contactItem = storefrontNavItems.find(item => item.megaMenu && item.megaMenu.type === 'contact' && openMenuLabel === item.label)
              
              if (contactItem && contactItem.megaMenu?.type === 'contact') {
                return <ContactMegaMenu item={contactItem} isOpen={openMenuLabel !== null} />
              }
              
              if (categoryItem && categoryItem.megaMenu) {
                return <MegaMenu item={categoryItem} isOpen={openMenuLabel !== null} />
              }
              
              return null
            })()}
          </div>

          {/* Right zone: icon buttons */}
          <div className="flex min-w-[13rem] items-center justify-end gap-6">
            <button
              className="text-[#191A1C] hover:text-[#f97316] transition-colors"
              aria-label="Search"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search size={20} />
            </button>
            <button
              className="text-[#191A1C] hover:text-[#f97316] transition-colors"
              aria-label={isAuthenticated ? "My account" : "Login or create account"}
              onClick={handleUserClick}
            >
              <User size={20} />
            </button>
            <Link
              href="/wishlist"
              className="text-[#191A1C] hover:text-[#f97316] transition-colors"
              aria-label="Favorites"
            >
              <Heart size={20} />
            </Link>
            <button
              className="relative text-[#191A1C] hover:text-[#f97316] transition-colors"
              aria-label="Shopping bag"
              onClick={openCart}
            >
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#f97316] text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>
</header>
      <MobileNavbar onMenuToggle={() => setIsMobileMenuOpen(true)} onSearchToggle={() => setIsSearchOpen(true)} />
      <MobileMenuDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  )
}

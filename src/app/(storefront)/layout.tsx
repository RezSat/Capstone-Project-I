import type { ReactNode } from 'react'
import { db } from '@/core/db/client'
import { shippingSettingsTable } from '@/core/db/schema'
import { CartProvider } from '@/context/cart-context'
import StoreFooter from '@/components/storefront/StoreFooter'
import StoreFooterMobile from '@/components/storefront/StoreFooterMobile'
import StoreHeader from '@/components/storefront/Navbar/StoreHeader'
import CartDrawer from '@/components/storefront/cart/CartDrawer'

export const dynamic = 'force-dynamic'

interface StorefrontLayoutProps {
  children: ReactNode
}

async function getShippingSettings() {
  let settings = await db.query.shippingSettingsTable.findFirst()
  if (!settings) {
    const [newSettings] = await db.insert(shippingSettingsTable).values({}).returning()
    settings = newSettings
  }
  return {
    freeShippingThresholdMinor: settings.freeShippingThresholdMinor,
    baseShippingFeeMinor: settings.baseShippingFeeMinor,
  }
}

export default async function StorefrontLayout({ children }: StorefrontLayoutProps) {
  const { freeShippingThresholdMinor, baseShippingFeeMinor } = await getShippingSettings()

  return (
    <CartProvider>
      <div className="bg-white">
        <StoreHeader />
        <main>{children}</main>
        <div className="hidden md:block"><StoreFooter /></div>
        <div className="block md:hidden"><StoreFooterMobile /></div>
        <CartDrawer freeShippingThresholdMinor={freeShippingThresholdMinor} baseShippingFeeMinor={baseShippingFeeMinor} />
      </div>
    </CartProvider>
  )
}

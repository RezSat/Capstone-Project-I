"use client"

import Image from 'next/image'
import Link from 'next/link'
import { X, Plus, Minus, ShoppingBag } from 'lucide-react'
import { useCart, type CartLineItem } from '@/context/cart-context'

interface CartDrawerProps {
  freeShippingThresholdMinor: number
  baseShippingFeeMinor?: number
}

function formatPrice(minor: number): string {
  return `LKR ${(minor / 100).toLocaleString('en-LK', { minimumFractionDigits: 0 })}`
}

function FreeDeliveryProgress({ totalMinor, threshold }: { totalMinor: number; threshold: number }) {
  const remaining = Math.max(0, threshold - totalMinor)
  const progress = Math.min(100, (totalMinor / threshold) * 100)
  const qualifies = totalMinor >= threshold

  return (
    <div className="px-4 py-3 bg-[#F8F8F8] rounded-md mb-4">
      {qualifies ? (
        <p className="text-xs font-semibold text-green-600">You qualify for FREE DELIVERY!</p>
      ) : (
        <p className="text-xs text-[#777777] mb-2">
          Spend <span className="font-semibold text-[#191A1C]">{formatPrice(remaining)}</span> more for FREE DELIVERY
        </p>
      )}
      <div className="h-1.5 w-full rounded-full bg-[#D9D9D9] overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${qualifies ? 'bg-green-500' : 'bg-[#f97316]'}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

function CartLineItemRow({ item }: { item: CartLineItem }) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex items-start gap-3 py-4 border-b border-[#E5E5E5] last:border-b-0">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-[#F8F8F8]">
        {item.imageUrl ? (
          <Image src={item.imageUrl} alt={item.name} width={64} height={64} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ShoppingBag size={20} className="text-[#D9D9D9]" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-oswald text-sm uppercase leading-tight text-[#191A1C] truncate">{item.name}</p>
        <p className="mt-0.5 font-open-sans text-xs text-[#777777]">{item.optionSignature}</p>
        <p className="mt-1 font-open-sans text-xs font-semibold text-[#191A1C]">{formatPrice(item.priceMinor)}</p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => removeItem(item.variantId)}
          className="text-[#D9D9D9] hover:text-[#f97316] transition-colors"
          aria-label="Remove item"
        >
          <X size={14} />
        </button>

        <div className="flex items-center gap-1 rounded-sm border border-[#D9D9D9]">
          <button
            type="button"
            onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
            className="flex h-6 w-6 items-center justify-center text-[#191A1C] hover:text-[#f97316]"
          >
            <Minus size={10} />
          </button>
          <span className="w-6 text-center font-open-sans text-xs text-[#191A1C]">{item.quantity}</span>
          <button
            type="button"
            onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
            disabled={item.quantity >= item.stockAvailable}
            className="flex h-6 w-6 items-center justify-center text-[#191A1C] hover:text-[#f97316] disabled:opacity-30"
          >
            <Plus size={10} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CartDrawer({ freeShippingThresholdMinor }: CartDrawerProps) {
  const { items, isOpen, closeCart, totalMinor } = useCart()

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
          onClick={closeCart}
          aria-hidden="true"
        />
      )}

      <div
        className={`fixed right-0 top-0 z-[100] h-full w-full max-w-md bg-white shadow-2xl transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[#E5E5E5] px-5 py-4">
            <div className="flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#f97316]" />
              <h2 className="font-oswald text-lg font-semibold uppercase text-[#191A1C]">
                My Cart ({items.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F8F8F8] text-[#191A1C] hover:bg-[#E5E5E5] transition-colors"
              aria-label="Close cart"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <ShoppingBag size={40} className="text-[#D9D9D9]" />
                <p className="font-open-sans text-sm text-[#777777]">Your cart is empty</p>
              </div>
            ) : (
              <>
                <FreeDeliveryProgress totalMinor={totalMinor} threshold={freeShippingThresholdMinor} />
                {items.map((item) => (
                  <CartLineItemRow key={item.variantId} item={item} />
                ))}
              </>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-[#E5E5E5] px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-open-sans text-sm text-[#777777]">Subtotal</span>
                <span className="font-oswald text-lg font-semibold text-[#191A1C]">{formatPrice(totalMinor)}</span>
              </div>
              <Link
                href="/checkout"
                className="block w-full rounded-md bg-[#f97316] py-3 text-center font-ui text-sm font-semibold uppercase tracking-wide text-white hover:bg-[#ea580c] transition-colors"
                onClick={closeCart}
              >
                CHECKOUT
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

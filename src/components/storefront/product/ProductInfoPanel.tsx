'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'

import { type ProductDetail } from '@/data/products'
import { useCart } from '@/context/cart-context'

interface ProductInfoPanelProps {
  product: ProductDetail
}

type SelectedOptions = Record<string, string>

function buildInitialSelectedOptions(product: ProductDetail): SelectedOptions {
  const pairs = product.optionGroups
    .map((group) => {
      const firstAvailable = group.values.find((value) => value.available !== false) ?? group.values[0]
      return firstAvailable ? [group.id, firstAvailable.value] : null
    })
    .filter((entry): entry is [string, string] => entry !== null)

  return Object.fromEntries(pairs)
}

function findVariantByOptions(
  variants: ProductDetail['variants'] | undefined | null,
  optionGroups: ProductDetail['optionGroups'],
  selected: SelectedOptions
): ProductDetail['variants'][0] | null {
  if (!variants || !Array.isArray(variants)) {
    console.warn("⚠️ ProductInfoPanel: Variants prop is missing or not an iterable array:", variants);
    return null;
  }

  for (const variant of variants) {
    if (!variant.optionSignature) continue;

    const parts = variant.optionSignature.split(" / ").map(p => p.trim().toLowerCase());
    const match = optionGroups.every(group => {
      const selectedValue = selected[group.id];
      return selectedValue ? parts.includes(selectedValue.toLowerCase()) : false;
    });

    if (match) return variant;
  }

  return null;
}

export default function ProductInfoPanel({ product }: ProductInfoPanelProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>(() => buildInitialSelectedOptions(product))
  const { addItem, openCart } = useCart()

  const selectedVariant = useMemo(
    () => findVariantByOptions(product.variants, product.optionGroups, selectedOptions),
    [product.variants, product.optionGroups, selectedOptions]
  )

  const availableStock = selectedVariant?.availableStock ?? 0
  const isOutOfStock = availableStock <= 0

  const priceToShow = selectedVariant && selectedVariant.priceMinor > 0
    ? selectedVariant.priceMinor / 100
    : product.price
  const oldPriceToShow = selectedVariant && selectedVariant.compareAtPriceMinor !== null && selectedVariant.compareAtPriceMinor > 0
    ? selectedVariant.compareAtPriceMinor / 100
    : product.oldPrice

  const currencyLabel = product.currencyLabel ?? 'LKR'
  const formattedPrice = `${currencyLabel} ${priceToShow.toLocaleString('en-LK')}`
  const formattedOldPrice = oldPriceToShow ? `${currencyLabel} ${oldPriceToShow.toLocaleString('en-LK')}` : null

  function selectOption(groupId: string, value: string, available?: boolean) {
    if (available === false) return
    setSelectedOptions((previous) => ({ ...previous, [groupId]: value }))
  }

  function updateQuantity(change: number) {
    setQuantity((current) => Math.max(1, current + change))
  }

  function handleAddToCart() {
    if (isOutOfStock || !selectedVariant) return
    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.title,
      optionSignature: selectedVariant.optionSignature,
      priceMinor: selectedVariant.priceMinor,
      quantity,
      imageUrl: product.images[0]?.src ?? '',
      stockAvailable: availableStock,
    })
    toast.success(`${product.title} added to cart`)
    openCart()
  }

  return (
    <section className="w-full min-w-0 overflow-visible bg-white p-6">
      <h1 className="font-oswald font-[500] text-2xl uppercase leading-tight text-[#191A1C]">{product.title}</h1>
      <p className="mt-2 font-open-sans text-xs text-[#777777]">{product.category}</p>

      <p className="mt-3 break-words font-open-sans text-xs leading-7 text-[#191A1C]">{product.description}</p>

      <div className="mt-6 flex items-baseline gap-3">
        <p className="font-oswald text-lg font-[400] text-[#191A1C]">{formattedPrice}</p>
        {formattedOldPrice ? <p className="font-oswald font-[400] text-sm text-[#777777] line-through">{formattedOldPrice}</p> : null}
      </div>

      {selectedVariant && (
        <p className={`mt-1 font-open-sans text-xs ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
          {isOutOfStock ? 'Out of stock' : `${availableStock} in stock`}
        </p>
      )}

      <div className="mt-5 space-y-2">
        {product.paymentPromos.map((promo, index) => (
          <div key={`${promo.text}-${index}`} className="flex flex-wrap items-center gap-2">
            <p className="break-words font-open-sans text-xs text-[#191A1C]">{promo.text}</p>
            {promo.badgeImage ? (
              <Image src={promo.badgeImage} alt={promo.badgeAlt ?? 'Payment provider badge'} width={68} height={24} className="h-3 w-auto max-w-full object-contain" />
            ) : null}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {product.optionGroups.map((group) => {
          const selectedValue = selectedOptions[group.id]
          const selectedOption = group.values.find((value) => value.value === selectedValue)

          return (
            <div key={group.id} className="min-w-0 w-full">
              <p className="font-open-sans text-xs font-[300] text-[#191A1C]">
                {group.label} :
                {selectedOption ? <span className="ml-2 font-open-sans text-xs text-[#777777]">{selectedOption.label}</span> : null}
              </p>

              {group.type === 'button' ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.values.map((value) => {
                    const isSelected = selectedValue === value.value
                    return (
                      <button key={value.id} type="button" onClick={() => selectOption(group.id, value.value, value.available)} disabled={value.available === false} className={`rounded-md border px-4 py-2 font-open-sans text-xs transition ${isSelected ? 'border-[#f97316] bg-[#f97316] text-white' : 'border-[#D9D9D9] bg-white text-[#191A1C]'} disabled:cursor-not-allowed disabled:opacity-50`}>
                        {value.label}
                      </button>
                    )
                  })}
                </div>
              ) : group.type === 'color' ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.values.map((value) => {
                    const isSelected = selectedValue === value.value
                    return (
                      <button key={value.id} type="button" onClick={() => selectOption(group.id, value.value, value.available)} disabled={value.available === false} title={value.label} className={`flex h-8 w-8 items-center justify-center rounded-sm border-2 transition ${isSelected ? 'border-[#f97316]' : 'border-[#D9D9D9]'} disabled:cursor-not-allowed disabled:opacity-50`}>
                        <span className="h-5 w-5 rounded-[2px] border border-[#E5E5E5]" style={{ background: value.color ?? '#FFFFFF' }} />
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="mt-3">
                  <select 
                    value={selectedValue || ""} 
                    onChange={(e) => selectOption(group.id, e.target.value, true)}
                    className="rounded-md border border-[#D9D9D9] bg-white px-3 py-2 text-xs"
                  >
                    <option value="">Select {group.label}</option>
                    {group.values.map((value) => (
                      <option key={value.id} value={value.value} disabled={value.available === false}>
                        {value.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-8 flex flex-col gap-4 items-start sm:flex-row sm:items-stretch">
        <div className="inline-flex shrink-0 flex-nowrap items-center rounded-sm border border-[#D9D9D9]">
          <button type="button" onClick={() => updateQuantity(-1)} className="flex-none h-10 w-10 font-open-sans text-xs text-[#191A1C]">
            -
          </button>
          <span className="flex h-10 w-12 flex-none items-center justify-center border-x border-[#D9D9D9] px-3 text-center font-open-sans text-xs text-[#191A1C]">
            {quantity}
          </span>
          <button type="button" onClick={() => updateQuantity(1)} className="flex-none h-10 w-10 font-open-sans text-xs text-[#191A1C]">
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`w-full rounded-md px-6 py-3 font-ui text-sm font-semibold uppercase tracking-wide sm:min-w-[220px] sm:flex-1 ${isOutOfStock ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#f97316] text-white hover:bg-[#ea580c]'}`}
        >
          {isOutOfStock ? 'NO STOCK' : 'ADD TO CART'}
        </button>
      </div>
    </section>
  )
}

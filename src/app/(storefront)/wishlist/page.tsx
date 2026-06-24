"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Heart } from "lucide-react"
import ProductCard from "@/components/common/ProductCard"
import { useWishlist } from "@/context/wishlist-context"

interface WishlistProduct {
  id: string
  name: string
  slug: string
  categoryName?: string
  priceFormatted: string
  href: string
  images?: { publicUrl: string; isPrimary: boolean }[]
  variants?: {
    id: string
    optionSignature: string
    metadata?: Record<string, unknown>
    options: { name: string; value: string; hex: string | null }[]
  }[]
}

function formatPrice(minor: number, currency: string): string {
  const price = minor / 100
  return `${currency} ${price.toLocaleString("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export default function WishlistPage() {
  const { productIds, isLoggedIn } = useWishlist()
  const [products, setProducts] = useState<WishlistProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    async function fetchWishlist() {
      setIsLoading(true)
      try {
        if (isLoggedIn) {
          const res = await fetch("/api/wishlist")
          if (res.status === 200) {
            const items = await res.json()
            const formatted = items.map((item: {
              productId: string
              productName: string
              productSlug: string
              basePriceMinor: number
              currencyCode: string
              imagePublicUrl: string | null
              isPrimary: boolean | null
              categoryName: string | null
            }) => ({
              id: item.productId,
              name: item.productName,
              slug: item.productSlug,
              categoryName: item.categoryName ?? undefined,
              priceFormatted: formatPrice(item.basePriceMinor, item.currencyCode),
              href: `/products/${item.productSlug}`,
              images: item.imagePublicUrl
                ? [{ publicUrl: item.imagePublicUrl, isPrimary: item.isPrimary ?? true }]
                : [],
              variants: [],
            }))
            setProducts(formatted)
          }
        } else if (productIds.length > 0) {
          const res = await fetch(`/api/wishlist/guest?ids=${productIds.join(",")}`)
          if (res.ok) {
            const data = await res.json()
            if (data.success && data.data) {
              const formatted = data.data.map((item: {
                id: string
                name: string
                slug: string
                basePriceMinor: number
                categoryName: string | null
                images?: { publicUrl: string; isPrimary: boolean }[]
                variants?: { id: string; optionSignature: string; metadata?: Record<string, unknown>; options: { name: string; value: string; hex: string | null }[] }[]
              }) => ({
                id: item.id,
                name: item.name,
                slug: item.slug,
                categoryName: item.categoryName ?? undefined,
                priceFormatted: formatPrice(item.basePriceMinor, "LKR"),
                href: `/products/${item.slug}`,
                images: item.images ?? [],
                variants: item.variants ?? [],
              }))
              setProducts(formatted)
            }
          }
        }
      } catch {
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchWishlist()
  }, [isLoggedIn, productIds, isMounted])

  if (!isMounted) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16 min-h-screen bg-white">
        <h1 className="font-oswald text-2xl sm:text-3xl font-bold uppercase tracking-wider text-neutral-900 mb-8 md:mb-12 border-b border-neutral-100 pb-4">
          MY WISHLIST
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10 w-full">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-[260px] bg-neutral-100 rounded-md mb-3" />
              <div className="h-4 bg-neutral-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-neutral-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-10 md:py-16 min-h-screen bg-white">
      <h1 className="font-oswald text-2xl sm:text-3xl font-bold uppercase tracking-wider text-neutral-900 mb-8 md:mb-12 border-b border-neutral-100 pb-4">
        MY WISHLIST
      </h1>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10 w-full">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-[260px] bg-neutral-100 rounded-md mb-3" />
              <div className="h-4 bg-neutral-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-neutral-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="py-24 px-4 flex flex-col items-center justify-center text-center border-2 border-dashed border-neutral-100 rounded-3xl">
          <div className="mb-6">
            <Heart size={48} className="text-neutral-200" />
          </div>
          <p className="font-oswald text-lg md:text-xl font-medium tracking-wide text-neutral-400 uppercase mb-4">
            YOUR WISHLIST IS CURRENTLY EMPTY
          </p>
          <p className="text-neutral-500 text-sm mb-6">
            Explore our collection to find your favorites!
          </p>
          <Link
            href="/"
            className="inline-block bg-neutral-900 hover:bg-[#f97316] text-white font-oswald text-xs tracking-widest font-medium uppercase px-6 py-3 rounded-xl transition-all duration-300"
          >
            EXPLORE ITEMS
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-8 md:gap-x-6 md:gap-y-10 w-full">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      )}
    </div>
  )
}

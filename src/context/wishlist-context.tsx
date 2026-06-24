"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

const STORAGE_KEY = "storefront_wishlist"

interface WishlistContextValue {
  productIds: string[]
  isInWishlist: (productId: string) => boolean
  toggleWishlist: (productId: string) => Promise<void>
  isLoggedIn: boolean
  setIsLoggedIn: (value: boolean) => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [hasSynced, setHasSynced] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setProductIds(parsed)
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  useEffect(() => {
    if (!isLoggedIn || hasSynced) return

    async function syncWishlist() {
      try {
        const res = await fetch("/api/wishlist")
        if (res.status === 401) {
          setIsLoggedIn(false)
          return
        }

        const items = await res.json()
        if (Array.isArray(items)) {
          const dbIds = items
            .map((item: { productId?: string }) => item.productId)
            .filter((id): id is string => typeof id === "string")
          setProductIds((prev) => {
            const combined = [...new Set([...prev, ...dbIds])]
            localStorage.setItem(STORAGE_KEY, JSON.stringify(combined))
            return combined
          })
        }

        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          try {
            const localItems = JSON.parse(stored)
            if (Array.isArray(localItems) && localItems.length > 0) {
              for (const productId of localItems) {
                await fetch("/api/wishlist", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ productId }),
                })
              }
            }
          } catch {
          }
          localStorage.removeItem(STORAGE_KEY)
        }

        setHasSynced(true)
      } catch {
        setHasSynced(true)
      }
    }

    syncWishlist()
  }, [isLoggedIn, hasSynced])

  function isInWishlist(productId: string): boolean {
    return productIds.includes(productId)
  }

  async function toggleWishlist(productId: string): Promise<void> {
    const inWishlist = productIds.includes(productId)

    if (!isLoggedIn) {
      setProductIds((prev) => {
        const next = inWishlist ? prev.filter((id) => id !== productId) : [...prev, productId]
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
        return next
      })
      return
    }

    setProductIds((prev) => {
      const next = inWishlist ? prev.filter((id) => id !== productId) : [...prev, productId]
      return next
    })

    const method = inWishlist ? "DELETE" : "POST"
    const url = inWishlist ? `/api/wishlist?productId=${productId}` : "/api/wishlist"

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "POST" ? JSON.stringify({ productId }) : undefined,
      })
    } catch {
      setProductIds((prev) => {
        const next = inWishlist ? [...prev, productId] : prev.filter((id) => id !== productId)
        return next
      })
    }
  }

  return (
    <WishlistContext.Provider
      value={{
        productIds,
        isInWishlist,
        toggleWishlist,
        isLoggedIn,
        setIsLoggedIn,
      }}
    >
      {children}
    </WishlistContext.Provider>
  )
}

export function useWishlist(): WishlistContextValue {
  const ctx = useContext(WishlistContext)
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider")
  return ctx
}
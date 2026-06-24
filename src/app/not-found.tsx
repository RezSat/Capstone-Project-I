'use client'

import Link from "next/link"
import { CartProvider } from "@/context/cart-context"
import { AuthModalProvider } from "@/context/auth-modal-context"
import { WishlistProvider } from "@/context/wishlist-context"
import { Home } from "lucide-react"

function NotFoundContent() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-md">
          <h1
            className="text-6xl font-bold text-[#f97316] mb-4"
            style={{ fontFamily: "var(--font-oswald-next)" }}
          >
            404
          </h1>
          <h2
            className="text-3xl font-semibold uppercase tracking-tight text-[#191A1C] mb-3"
            style={{ fontFamily: "var(--font-oswald-next)" }}
          >
            Page Not Found
          </h2>
          <p className="font-open-sans text-[#777777] mb-8">
            Sorry, the page you are looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md bg-[#f97316] px-6 py-3 font-oswald text-sm font-medium tracking-widest text-white uppercase transition-colors hover:bg-[#ea580c]"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}

export default function NotFound() {
  return (
    <AuthModalProvider>
      <WishlistProvider>
        <CartProvider>
          <NotFoundContent />
        </CartProvider>
      </WishlistProvider>
    </AuthModalProvider>
  )
}

'use client'

import { AuthModalProvider } from '@/context/auth-modal-context'
import { WishlistProvider } from '@/context/wishlist-context'
import type { ReactNode } from 'react'

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthModalProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </AuthModalProvider>
  )
}
'use client'

import { createContext, useContext, useState, type ReactNode } from 'react'
import LoginModal from '@/components/auth/login-modal'

interface AuthModalContextValue {
  isLoginModalOpen: boolean
  openLoginModal: () => void
  closeLoginModal: () => void
}

const AuthModalContext = createContext<AuthModalContextValue>({
  isLoginModalOpen: false,
  openLoginModal: () => {},
  closeLoginModal: () => {},
})

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)

  return (
    <AuthModalContext.Provider
      value={{
        isLoginModalOpen,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
      }}
    >
      {children}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </AuthModalContext.Provider>
  )
}

export function useAuthModal() {
  return useContext(AuthModalContext)
}
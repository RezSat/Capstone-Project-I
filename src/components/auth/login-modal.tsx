'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { loginAction } from '@/app/actions/auth'
import StorefrontLogo from '@/components/common/StorefrontLogo'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const submissionLockRef = useRef(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (submissionLockRef.current) return
    submissionLockRef.current = true
    setIsLoading(true)
    setErrorMessage('')

    try {
      const result = await loginAction({ email, password })

      if (!result.isSuccess) {
        setErrorMessage(result.message || 'Invalid email or password.')
        submissionLockRef.current = false
        setIsLoading(false)
        return
      }

      setIsLoading(false)
      onClose()
      if (result.redirectTo) {
        router.push(result.redirectTo)
      }

    } catch (error) {
      if ((error as Error)?.message?.includes('NEXT_REDIRECT')) return
      setErrorMessage('Unable to sign in. Please try again.')
      submissionLockRef.current = false
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm animate-fade-in flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[440px] bg-white rounded-sm p-6 shadow-2xl relative animate-scale-up">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors z-20"
        >
          <X size={16} />
        </button>

        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50">
          <div className="rounded-full bg-white p-1 shadow-lg">
            <StorefrontLogo showText={false} />
          </div>
        </div>

        <div className="pt-10">
          <div className="flex flex-col items-start mb-3">
            <h1
              className="text-2xl font-bold uppercase tracking-tight text-gray-900 text-left"
              style={{ fontFamily: 'var(--font-oswald-next)' }}
            >
              SIGN IN
            </h1>
            <p className="mt-0.5 text-sm text-gray-600 text-left">Sign in or create an account</p>
          </div>

          <Link
            href="/"
            onClick={onClose}
            className="block w-full rounded-sm bg-[#f97316] py-2 text-center text-sm font-medium text-white transition-colors hover:bg-[#ea580c] mb-3"
          >
            Continue With Shop
          </Link>

          <div className="relative my-3 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <span className="relative bg-white px-4 font-open-sans text-xs text-[#777777] lowercase">
              or
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-1 focus:ring-[#f97316]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                className="w-full rounded-sm border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-1 focus:ring-[#f97316]"
              />
            </div>
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600" role="alert">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 w-full rounded-sm bg-black py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Continue'}
          </button>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="newsletter"
              className="h-3.5 w-3.5 rounded border-gray-300 text-[#f97316] focus:ring-[#f97316]"
            />
            <label htmlFor="newsletter" className="text-xs text-gray-600">
              Email me with news and offers
            </label>
          </div>
        </form>

        <p className="mt-4 text-center text-xs text-gray-400">
          By continuing, you agree to our Terms of services
        </p>
      </div>
    </div>
  )
}

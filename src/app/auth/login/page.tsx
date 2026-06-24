'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { loginAction } from '@/app/actions/auth'
import StorefrontLogo from '@/components/common/StorefrontLogo'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const submissionLockRef = useRef(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (submissionLockRef.current) {
      return
    }
    
    submissionLockRef.current = true
    setIsLoading(true)
    setErrorMessage('')
    
    try {
      const result = await loginAction({ email, password })
      
      if (!result.isSuccess) {
        setErrorMessage(result.message || 'Invalid email or password.')
        submissionLockRef.current = false
        setIsLoading(false)
      }
    } catch (error) {
      if ((error as Error)?.message?.includes('NEXT_REDIRECT')) {
        return
      }
      setErrorMessage('Unable to sign in. Please try again.')
      submissionLockRef.current = false
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4">
      <div className="relative w-full max-w-sm">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-10">
          <div className="rounded-full bg-white p-1 shadow-lg">
            <StorefrontLogo showText={false} />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 pt-12">
          <div className="text-center mb-6">
            <h1
              className="text-2xl font-bold uppercase tracking-tight text-gray-900"
              style={{ fontFamily: 'var(--font-oswald-next)' }}
            >
              SIGN IN
            </h1>
            <p className="mt-1 text-sm text-gray-600">Sign in or create an account</p>
          </div>

          <Link
            href="/"
            className="block w-full rounded-lg bg-[#f97316] py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#ea580c]"
          >
            Continue With Shop
          </Link>

          <div className="my-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-500">or</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-3">
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-1 focus:ring-[#f97316]"
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
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-1 focus:ring-[#f97316]"
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
              className="mt-4 w-full rounded-lg bg-black py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:bg-gray-600 disabled:cursor-not-allowed"
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
    </main>
  )
}

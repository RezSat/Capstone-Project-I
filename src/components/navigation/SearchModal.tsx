'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'

interface SearchResult {
  id: string
  name: string
  price: number
  slug: string
  categoryDescription: string | null
  currentImage: string | null
}

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

const FEATURED_CATEGORIES = [
  { label: 'Catalog picks', image: '/images/storefront-generic/marketplace-hero.png' },
  { label: 'Everyday goods', image: '/images/storefront-generic/collection-shelves.png' },
  { label: 'Ready to ship', image: '/images/storefront-generic/checkout-packages.png' },
]

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      if (data.success && data.data) {
        setResults(data.data)
      }
    } catch {
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query, performSearch])

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
      setResults([])
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/40 z-50"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[540px] z-50"
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
          >
            <div className="bg-white rounded-2xl shadow-lg inner-shadow p-5">
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SEARCH EQUIPMENTS, ACCESSORIES AND CLOTHING"
                  className="w-full border-b border-gray-400 pb-2 text-sm uppercase tracking-wide focus:outline-none font-ui text-[#191A1C] placeholder:text-[#777777]"
                  autoFocus
                />
                <div className="absolute right-0 bottom-2.5 flex items-center gap-2">
                  {query && (
                    <button
                      type="button"
                      onClick={() => setQuery('')}
                      className="text-[#777777] hover:text-[#191A1C] transition-colors"
                      aria-label="Clear search"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <Search size={18} className="text-[#191A1C]" />
                </div>
              </div>

              <div className="mt-4">
                {query.trim() === '' ? (
                  <div className="grid grid-cols-3 gap-3">
                    {FEATURED_CATEGORIES.map((category) => (
                      <button
                        key={category.label}
                        type="button"
                        onClick={onClose}
                        className="flex flex-col items-center gap-2 group"
                      >
                        <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#F7F7F7]">
                          <Image
                            src={category.image}
                            alt={category.label}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        </div>
                        <span className="font-oswald text-xs uppercase text-[#191A1C] group-hover:text-[#f97316] transition-colors">
                          {category.label}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : results.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {results.map((result) => (
                      <a
                        key={result.id}
                        href={`/products/${result.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F7F7F7] transition-colors"
                      >
                        {result.currentImage ? (
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#F7F7F7] flex-shrink-0">
                            <Image
                              src={result.currentImage}
                              alt={result.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-[#F7F7F7] flex items-center justify-center flex-shrink-0">
                            <Search size={16} className="text-[#D9D9D9]" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-oswald text-sm uppercase text-[#191A1C] truncate">
                            {result.name}
                          </p>
                          {result.categoryDescription && (
                            <p className="font-open-sans text-xs text-[#777777]">
                              {result.categoryDescription}
                            </p>
                          )}
                        </div>
                        <p className="font-ui text-sm font-semibold text-[#191A1C] flex-shrink-0">
                          LKR {(result.price / 100).toLocaleString()}
                        </p>
                      </a>
                    ))}
                  </div>
                ) : isLoading ? (
                  <div className="py-8 text-center">
                    <p className="font-open-sans text-sm text-[#777777]">Searching...</p>
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="font-open-sans text-sm text-[#777777]">
                      No results found for &quot;{query}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

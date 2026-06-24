'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { NavItem } from '../../../data/storefront-nav-config'

interface MegaMenuProps {
  item: NavItem
  isOpen: boolean
}

export default function MegaMenu({ item, isOpen }: MegaMenuProps) {
  if (!item.megaMenu || item.megaMenu.type === 'contact' || !item.megaMenu.columns) return null

  const isDense = item.megaMenu.columns.length > 3

  const menuGridClass = isDense
    ? "px-8 py-6 grid w-full items-start gap-8"
    : "px-10 py-8 grid grid-cols-[minmax(130px,max-content)_minmax(190px,max-content)_minmax(150px,max-content)_minmax(0,1fr)] gap-10 items-start"

  const menuGridStyle = isDense
    ? { gridTemplateColumns: 'repeat(4, minmax(max-content, 1fr)) 220px' }
    : undefined

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="absolute top-[calc(100%+6px)] left-1/2 w-[calc(100%+88px)] max-w-[calc(100vw-320px)] -translate-x-1/2 bg-white rounded-b-lg shadow-lg z-40 pointer-events-auto"
        >
          <div className={menuGridClass} style={menuGridStyle}>
            {/* Text columns */}
            {item.megaMenu.columns.map((column, idx) => (
              <div key={idx} className="min-w-0">
                <h3 className="font-inter text-md font-bold uppercase tracking-wide text-[#191A1C] mb-4 whitespace-nowrap">
                  {column.heading}
                </h3>
                <ul className="space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="font-inter text-sm text-[#191A1C] hover:text-[#f97316] transition-colors whitespace-nowrap block"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* Featured Image */}
            {item.megaMenu.imageSrc && (
              <div className={isDense ? '' : 'min-w-0 justify-self-stretch'}>
                <div className={`bg-transparent rounded-md overflow-hidden flex items-center justify-center ${
                  isDense ? 'w-[220px] h-[220px]' : 'w-full h-[220px]'
                }`}>
                  <Image
                    src={item.megaMenu.imageSrc || '/placeholder.png'}
                    alt={item.megaMenu.imageAlt || 'Menu image'}
                    width={isDense ? 220 : 500}
                    height={isDense ? 220 : 220}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

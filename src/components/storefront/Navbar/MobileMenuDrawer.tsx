'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronDown, MapPin, Mail, Phone, X } from 'lucide-react'
import { useState } from 'react'
import { storefrontNavItems, type NavItem } from '@/data/storefront-nav-config'

interface MobileMenuDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileMenuDrawer({ isOpen, onClose }: MobileMenuDrawerProps) {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null)
  const [expandedColumns, setExpandedColumns] = useState<Record<string, boolean>>({})

  const toggleItem = (label: string) => {
    setActiveAccordion((prev) => (prev === label ? null : label))
    if (activeAccordion !== label) {
      setExpandedColumns({})
    }
  }

  const toggleColumn = (columnHeading: string) => {
    setExpandedColumns((prev) => ({
      ...prev,
      [columnHeading]: !prev[columnHeading],
    }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="fixed inset-y-0 left-0 w-full max-w-[340px] bg-white z-50 shadow-2xl flex flex-col overflow-y-auto"
          >
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <span className="font-inter text-md font-bold uppercase tracking-wide text-[#191A1C]">
                MENU
              </span>
              <button onClick={onClose} aria-label="Close menu" className="p-1">
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 py-2">
              {storefrontNavItems.map((item) => (
                <NavItemRow
                  key={item.label}
                  item={item}
                  isExpanded={activeAccordion === item.label}
                  expandedColumns={expandedColumns}
                  onToggle={() => toggleItem(item.label)}
                  onColumnToggle={toggleColumn}
                  onLinkClick={onClose}
                />
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

interface NavItemRowProps {
  item: NavItem
  isExpanded: boolean
  expandedColumns: Record<string, boolean>
  onToggle: () => void
  onColumnToggle: (heading: string) => void
  onLinkClick: () => void
}

function NavItemRow({ item, isExpanded, expandedColumns, onToggle, onColumnToggle, onLinkClick }: NavItemRowProps) {
  const hasSubmenu = !!(item.megaMenu?.columns && item.megaMenu.columns.length > 0)
  const isContact = item.megaMenu?.type === 'contact'

  const handleItemClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasSubmenu || isContact) {
      e.preventDefault()
      onToggle()
    } else if (item.href !== '#') {
      onLinkClick()
    }
  }

  return (
    <div className="border-b border-gray-100">
      <div className="flex items-center">
        <button
          type="button"
          onClick={handleItemClick}
          className="flex-1 font-inter text-sm font-bold uppercase tracking-wide text-[#191A1C] px-4 py-4 hover:text-[#f97316] transition-colors text-left flex items-center justify-between"
        >
          <span>{item.label}</span>
        </button>
        {(hasSubmenu || isContact) && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle() }}
            className="px-4 py-4"
            aria-label={`Expand ${item.label} submenu`}
          >
            <ChevronRight
              size={18}
              className={`text-[#191A1C] transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
            />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && hasSubmenu && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 py-4 bg-gray-50">
              {item.megaMenu!.columns!.map((column) => {
                const isColumnExpanded = expandedColumns[column.heading] ?? false
                return (
                  <div key={column.heading} className="mb-4 last:mb-0">
                    <button
                      onClick={() => onColumnToggle(column.heading)}
                      className="flex items-center justify-between w-full py-2"
                    >
                      <h4 className="font-inter text-xs font-bold uppercase tracking-wide text-[#191A1C]">
                        {column.heading}
                      </h4>
                      <ChevronDown
                        size={14}
                        className={`text-[#191A1C] transition-transform duration-200 ${isColumnExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>

                    <AnimatePresence>
                      {isColumnExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <ul className="space-y-2 pb-2">
                            {column.links.map((link) => (
                              <li key={link.label}>
                                <Link
                                  href={link.href}
                                  className="font-inter text-xs text-[#191A1C] hover:text-[#f97316] transition-colors block py-1 pl-2 border-l-2 border-gray-200"
                                  onClick={onLinkClick}
                                >
                                  {link.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}

              {item.megaMenu!.imageSrc && (
                <div className="mt-4 w-full h-40 relative rounded-lg overflow-hidden bg-white">
                  <Image
                    src={item.megaMenu!.imageSrc!}
                    alt={item.megaMenu!.imageAlt || 'Menu preview'}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isExpanded && isContact && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="px-4 py-4 bg-gray-50">
            <div className="font-inter text-xs text-[#191A1C] leading-relaxed mb-4">
              <p className="mb-3 uppercase font-bold">Contact Us</p>
              <p className="mb-3 opacity-70">
                WE&apos;RE HERE TO HELP YOU WITH ANY QUESTIONS ABOUT OUR PRODUCTS, ORDERS, OR SERVICES.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span className="font-inter text-xs font-semibold uppercase text-[#191A1C]">
                  123 Store Street, Colombo, Sri Lanka
                </span>
              </div>
              <div className="flex items-start gap-2">
                <Mail size={14} className="mt-0.5 shrink-0" />
                <a href="mailto:CONTACT@YOURSTORE.COM" className="font-inter text-xs font-semibold uppercase text-[#191A1C] hover:text-[#f97316]">
                  CONTACT@YOURSTORE.COM
                </a>
              </div>
              <div className="flex items-start gap-2">
                <Phone size={14} className="mt-0.5 shrink-0" />
                <a href="tel:0000000000" className="font-inter text-xs font-semibold uppercase text-[#191A1C] hover:text-[#f97316]">
                  +00 000 0000
                </a>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-200">
              <p className="font-inter text-xs font-bold uppercase text-[#191A1C] mb-1">
                Working Hours
              </p>
              <p className="font-inter text-xs text-[#191A1C] uppercase">
                Monday - Saturday:<br />
                <span className="font-semibold">9:00 AM - 6:00 PM</span><br />
                <span className="opacity-50">Sunday: Closed</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

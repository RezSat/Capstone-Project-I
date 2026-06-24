'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Mail, Phone } from 'lucide-react'
import StorefrontLogo from '@/components/common/StorefrontLogo'
import type { NavItem } from '../../../data/storefront-nav-config'

interface ContactMegaMenuProps {
  item: NavItem
  isOpen: boolean
}

export default function ContactMegaMenu({ item, isOpen }: ContactMegaMenuProps) {
  if (!item.megaMenu || item.megaMenu.type !== 'contact') return null

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
          <div className="pl-10 pr-4 py-8 grid grid-cols-[minmax(0,1fr)_160px_210px] gap-6 items-start">
            {/* Left section - Contact text and details */}
            <div className="justify-self-start">
              <h3 className="font-inter text-md font-bold uppercase tracking-wide text-[#191A1C] mb-4">
                CONTACT US
              </h3>
              <p className="font-inter text-sm text-[#191A1C] leading-relaxed mb-6">
                WE&apos;RE HERE TO HELP YOU WITH ANY QUESTIONS ABOUT OUR PRODUCTS,
                ORDERS, OR SERVICES. FEEL FREE TO REACH OUT TO US ANYTIME.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="mt-1 text-[#191A1C] shrink-0" />
                  <span className="font-inter text-sm font-semibold text-[#191A1C]">
                    123 STORE STREET, COLOMBO, SRI LANKA
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Mail size={16} className="mt-1 text-[#191A1C] shrink-0 mb-1" />
                  <a href="mailto:CONTACT@YOURSTORE.COM">
                    <span className="font-inter text-sm font-semibold text-[#191A1C] hover:text-[#f97316]">
                      CONTACT@YOURSTORE.COM
                    </span>
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <Phone size={16} className="mt-1 text-[#191A1C] shrink-0" />
                  <a href="tel:0000000000">
                    <span className="font-inter text-sm font-semibold text-[#191A1C] hover:text-[#f97316]">
                      +00 000 0000
                    </span>
                  </a>
                </div>
              </div>
            </div>

            {/* Middle section - Working hours */}
            <div className="justify-self-start">
              <h3 className="font-inter text-md font-bold uppercase tracking-wide text-[#191A1C] mb-4">
                WORKING HOURS
              </h3>
              <div className="font-inter text-sm text-[#191A1C] leading-relaxed whitespace-nowrap">
                MONDAY - SATURDAY:<br />
                <span className="font-semibold">9:00 AM - 6:00 PM</span><br />
                <span className="opacity-60 font-semibold">SUNDAY: CLOSED</span>
              </div>
            </div>

            <div className="justify-self-end shrink-0 pr-3">
              <div className="flex h-[220px] w-[220px] items-center justify-center rounded-lg bg-orange-50">
                <StorefrontLogo showText={false} />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

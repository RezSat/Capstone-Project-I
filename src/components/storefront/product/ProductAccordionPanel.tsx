'use client'

import { useState } from 'react'

import { type ProductAccordionSection } from '@/data/products'

interface ProductAccordionPanelProps {
  accordions: ProductAccordionSection[]
}

function splitBulletLine(line: string) {
  const match = line.match(/^(.+?)\s*:\s*(.+)$/)
  if (!match) return { label: null, value: line }
  return { label: match[1].trim(), value: match[2].trim() }
}

export default function ProductAccordionPanel({ accordions }: ProductAccordionPanelProps) {
  const [openId, setOpenId] = useState<string | null>(() => {
    const defaultOpen = accordions.find((section) => section.defaultOpen)
    return defaultOpen?.id ?? null
  })

  function toggleSection(id: string) {
    setOpenId((current) => (current === id ? null : id))
  }

  return (
    <aside className="w-full min-w-0 overflow-visible bg-white p-6">
      {accordions.map((section) => {
        const isOpen = openId === section.id

        return (
          <div key={section.id} className="border-b border-[#191A1C] py-4 first:pt-0 last:border-b-0 last:pb-0">
            <button
              type="button"
              onClick={() => toggleSection(section.id)}
              className="flex w-full items-center justify-between gap-4 text-left"
            >
              <span className="min-w-0 break-words font-display text-lg uppercase text-[#191A1C]">{section.title}</span>
              <span className="shrink-0 font-ui text-2xl leading-none text-[#191A1C]" aria-hidden>
                {isOpen ? '-' : '+'}
              </span>
            </button>

            <div
              className="grid transition-[grid-template-rows] duration-500 ease-in-out"
              style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
            >
              <div className="overflow-hidden min-h-0">
                <div className="pt-4">
                  {section.contentType === 'bullets' ? (
                    <ul className="space-y-2">
                      {(section.bullets ?? []).map((line, index) => {
                        const { label, value } = splitBulletLine(line)

                        return (
                          <li key={`${section.id}-${index}`} className="break-words font-body text-sm leading-relaxed text-[#191A1C]">
                            {label ? (
                              <>
                                <strong>{label}</strong>
                                {` : ${value}`}
                              </>
                            ) : (
                              value
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    <div className="space-y-3">
                      {(section.paragraphs ?? []).map((paragraph, index) => (
                        <p key={`${section.id}-${index}`} className="break-words font-body text-sm leading-relaxed text-[#191A1C]">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </aside>
  )
}

'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import type { CategoryPageFilter } from '@/modules/products/public-category.service'

interface CategoryFilterSidebarProps {
  filters: CategoryPageFilter[]
  selectedFilters?: Record<string, string[]>
  onFilterChange?: (filterSlug: string, optionValue: string, checked: boolean) => void
}

export default function CategoryFilterSidebar({
  filters,
  selectedFilters = {},
  onFilterChange,
}: CategoryFilterSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  function toggleGroup(label: string) {
    setExpandedGroups((current) => ({
      ...current,
      [label]: !current[label],
    }))
  }

  function handleCheckboxChange(filterSlug: string, optionValue: string, checked: boolean) {
    onFilterChange?.(filterSlug, optionValue, checked)
  }

  return (
    <aside className="w-full">
      <div className="flex flex-col">
        {filters.map((group) => {
          const isExpanded = Boolean(expandedGroups[group.label])
          const selectedValues = selectedFilters[group.slug] ?? []

          return (
            <div key={group.label} className="border-b border-[#E5E5E5]">
              <button
                type="button"
                onClick={() => toggleGroup(group.label)}
                className="flex w-full items-center justify-between py-4 text-left"
                aria-expanded={isExpanded}
                aria-label={`Toggle ${group.label} filter`}
              >
                <span className="font-oswald text-[15px] uppercase tracking-wide text-[#191A1C]">
                  {group.label}
                </span>
                <ChevronDown
                  size={18}
                  className={`text-[#191A1C] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              {isExpanded && (
                <div className="pb-4">
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isChecked = selectedValues.includes(option.value)
                      return (
                        <label
                          key={`${group.slug}-${option.value}`}
                          className="flex items-center gap-2.5"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-[#D9D9D9]"
                            checked={isChecked}
                            onChange={(e) =>
                              handleCheckboxChange(group.slug, option.value, e.target.checked)
                            }
                          />
                          <span className="font-open-sans text-sm text-[#191A1C]">
                            {option.label}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

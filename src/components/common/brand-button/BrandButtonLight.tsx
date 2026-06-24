import { ChevronRight } from 'lucide-react'
import { type BrandButtonProps } from './types'

const sizeClasses = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-xs',
  lg: 'px-8 py-4 text-md',
}

export default function BrandButtonLight({
  children,
  size = 'md',
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}: BrandButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]}
        group
        relative
        inline-flex
        items-center
        justify-center
        overflow-hidden
        rounded-[3px]
        border
        border-[#E5E5E5]
        bg-[#F5F5F5]
        font-inter
        font-semibold
        text-[#191A1C]
        cursor-pointer
        transition-[background-color,border-color]
        duration-150
        hover:bg-transparent
        hover:border-transparent
        disabled:cursor-not-allowed
        disabled:opacity-50
        ${className}
      `}
    >
      <span
        aria-hidden="true"
        className="
          absolute
          inset-0
          z-0
          origin-left
          scale-x-0
          bg-[#f97316]
          transition-transform
          duration-300
          ease-out
          delay-200
          group-hover:scale-x-100
        "
      />
      <span
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          z-[1]
          rounded-[3px]
          border
          border-[#fb923c]
          opacity-0
          transition-opacity
          duration-100
          delay-[450ms]
          group-hover:opacity-100
        "
      />
      <span className="relative z-10 inline-flex items-center justify-center text-current transition-colors duration-150 group-hover:text-white">
        <span className="inline-block transition-transform duration-200 ease-out group-hover:-translate-x-3">
          {children}
        </span>
        <span className="absolute left-full ml-[1px] inline-flex translate-x-3 items-center justify-center text-white opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100">
          <ChevronRight size={18} strokeWidth={2} />
        </span>
      </span>
    </button>
  )
}

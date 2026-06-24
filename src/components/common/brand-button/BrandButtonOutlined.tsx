import { ChevronRight } from 'lucide-react'
import { type BrandButtonProps } from './types'

const sizeClasses = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-xs',
  lg: 'px-8 py-4 text-md',
}

export default function BrandButtonOutlined({
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
        rounded-[4px]
        border
        border-white
        bg-transparent
        font-inter
        font-semibold
        text-white
        cursor-pointer
        transition-[background-color,border-color]
        duration-150
        hover:bg-white
        hover:border-white
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
          bg-white
          transition-transform
          duration-300
          ease-out
          delay-200
          group-hover:scale-x-100
        "
      />
      <span className="relative z-10 inline-flex items-center justify-center text-current transition-colors duration-150 group-hover:text-[#f97316]">
        <span className="inline-block transition-transform duration-200 ease-out group-hover:-translate-x-3">
          {children}
        </span>
        <span className="absolute left-full ml-[1px] inline-flex translate-x-3 items-center justify-center text-[#f97316] opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100">
          <ChevronRight size={18} strokeWidth={2} />
        </span>
      </span>
    </button>
  )
}

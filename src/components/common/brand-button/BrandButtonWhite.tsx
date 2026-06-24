import { type BrandButtonProps } from './types'

const sizeClasses = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-xs',
  lg: 'px-8 py-4 text-md',
}

export default function BrandButtonWhite({
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
        bg-white text-[#191A1C] hover:bg-gray-100 transition-colors
        font-inter font-semibold cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </button>
  )
}
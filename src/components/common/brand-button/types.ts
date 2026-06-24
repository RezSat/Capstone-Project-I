import { ReactNode } from 'react'

export type BrandButtonVariant = 'primary' | 'white' | 'light' | 'outlined'

export type BrandButtonSize = 'sm' | 'md' | 'lg'

export interface BrandButtonProps {
  children: ReactNode
  variant?: BrandButtonVariant
  size?: BrandButtonSize
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}
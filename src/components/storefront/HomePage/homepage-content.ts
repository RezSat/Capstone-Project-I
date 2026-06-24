import type { ProductCardProps } from '@/components/common/ProductCard'

export interface CollectionTile {
  title: string
  label: string
  description: string
  imageSrc: string
  href: string
}

export interface StoreValueItem {
  title: string
  description: string
  icon: 'shield' | 'search' | 'truck' | 'sparkles'
}

export type HomeProduct = ProductCardProps

export type ProductImage = {
  src: string
  alt: string
  orientation?: 'portrait' | 'landscape' | 'square'
}

export type ProductPaymentPromo = {
  text: string
  badgeImage?: string
  badgeAlt?: string
}

export type ProductOptionValue = {
  id: string
  label: string
  value: string
  color?: string
  hex?: string | null
  image?: string
  available?: boolean
}

export type ProductVariant = {
  id: string
  title: string
  priceMinor: number
  compareAtPriceMinor: number | null
  optionSignature: string
  availableStock: number
}

export type ProductOptionGroup = {
  id: string
  label: string
  selectedLabel?: string
  type: 'color' | 'button' | 'swatch'
  values: ProductOptionValue[]
}

export type ProductAccordionSection = {
  id: string
  title: string
  defaultOpen?: boolean
  contentType: 'bullets' | 'paragraphs'
  bullets?: string[]
  paragraphs?: string[]
}

export type ProductDetail = {
  id: string
  slug: string
  group?: string
  categorySlug?: string
  title: string
  category: string
  description: string
  currencyLabel: string
  price: number
  oldPrice?: number
  images: ProductImage[]
  paymentPromos: ProductPaymentPromo[]
  optionGroups: ProductOptionGroup[]
  accordions: ProductAccordionSection[]
  variants: ProductVariant[]
  recommendedProductSlugs?: string[]
}



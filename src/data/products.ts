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

export const products: ProductDetail[] = [
  {
    id: 'yonex-astrox-88d-pro',
    slug: 'yonex-astrox-88d-pro',
    group: 'badminton',
    categorySlug: 'racquets',
    title: 'YONEX ASTROX 88D PRO',
    category: 'Badminton Racquet',
    description:
      'Maximize explosive power and offensive play with the ASTROX 88D PRO. Designed for a double specialist to dominate from the backcourt, it uses the Rotational Generator System to distribute weight for smooth transitions and maximum control. Enhanced with Namd™ graphite, this racquet delivers faster snapback for imposing power on every shot.',
    currencyLabel: 'LKR',
    price: 45000,
    oldPrice: 48000,
    images: [
      {
        src: '/images/productpage/badminton.png',
        alt: 'YONEX ASTROX 88D PRO racquet front angle view',
        orientation: 'portrait',
      },
      {
        src: '/images/sample/new_arrival.png',
        alt: 'YONEX ASTROX 88D PRO racquet side profile',
        orientation: 'landscape',
      },
      {
        src: '/images/sample/new_arrival.png',
        alt: 'YONEX ASTROX 88D PRO handle and frame close-up',
        orientation: 'square',
      },
    ],
    paymentPromos: [
      {
        text: '10% Discount When You Pay By Card Payment Method',
      },
    ],
    optionGroups: [
      {
        id: 'color',
        label: 'Color',
        selectedLabel: 'SMOKE MINT',
        type: 'color',
        values: [
          { id: 'smoke-mint', label: 'Smoke Mint', value: 'smoke-mint', color: '#EAF3EF', available: true },
          { id: 'black', label: 'Black', value: 'black', color: '#191A1C', available: true },
        ],
      },
      {
        id: 'weight-grip',
        label: 'Weight & Grip Size',
        selectedLabel: '4UG5',
        type: 'button',
        values: [
          { id: '4ug5', label: '4UG5', value: '4ug5', available: true },
          { id: '4ug6', label: '4UG6', value: '4ug6', available: true },
        ],
      },
      
    ],
    accordions: [
      {
        id: 'product-details',
        title: 'PRODUCT DETAILS',
        contentType: 'bullets',
        defaultOpen: false,
        bullets: [
          'Weight & Grip : 4UG5',
          'Performance : Power',
          'Stringing Advice : 20-28lbs',
          'Balance : Head Heavy',
          'Material : HM GRAPHITE, CSR, TUNGSTEN, 2G-Namd™ FLEX FORCE',
          'Racquet Length : 5mm Longer',
          'Shaft Flex : Stiff',
          'Product Tier : PRO',
          'String Pattern : 22 X 21',
          'Parent SKU : AX88D',
        ],
      },
      {
        id: 'shipping-returns',
        title: 'SHIPPING & RETURNS',
        contentType: 'paragraphs',
        defaultOpen: false,
        paragraphs: [
          'Shipping includes Standard ($10 or free over $99) and Expedited 2-day ($25) options, with 1-3 business day processing and delivery ranging from 1-7 days (standard) or 2 days (expedited). Orders placed before 2 PM PST (Mon-Fri) with expedited shipping ship the same day. No international shipping or delivery to PO boxes is available.',
          'Returns are accepted within 30 days for unused items with original tags/packaging. A $8 fee applies unless due to defect, wrong item, or damage. After approval, a UPS label is provided, and refunds are processed in 3-5 days, may take 10-15 days to appear. No exchanges or store credit.',
        ],
      },
    ],
    recommendedProductSlugs: ['astrox-100', 'nanoflare-800-pro', 'arcsaber-11-pro', 'duora-z-strike', 'vcore-100'],
    variants: [],
  },
]

export function getProductBySlug(slug: string): ProductDetail | undefined {
  return products.find((product) => product.slug === slug)
}

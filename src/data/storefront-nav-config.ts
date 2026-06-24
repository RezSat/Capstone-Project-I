export interface NavItem {
  label: string
  href: string
  megaMenu?: {
    type?: 'category' | 'contact'
    columns?: {
      heading: string
      links: { label: string; href: string }[]
    }[]
    imageSrc?: string
    imageAlt?: string
  }
}

export const storefrontNavItems: NavItem[] = [
  { label: 'HOME', href: '/' },
  {
    label: 'FEATURED',
    href: '#',
    megaMenu: {
      columns: [
        {
          heading: 'PRODUCTS',
          links: [
            { label: 'FEATURED ITEMS', href: '/category/badminton/racquets' },
            { label: 'REPLACEMENT PARTS', href: '/category/badminton/strings' },
            { label: 'CONSUMABLES', href: '/category/badminton/shuttlecocks' },
            { label: 'HANDHELD GOODS', href: '/category/badminton/grips' },
            { label: 'SETUP TOOLS', href: '/category/badminton/nets' },
          ],
        },
        {
          heading: 'APPAREL',
          links: [
            { label: "MEN'S RANGE", href: '/category/badminton/men-s-clothing' },
            { label: "WOMEN'S RANGE", href: '/category/badminton/women-s-clothing' },
            { label: 'ACTIVEWEAR', href: '/category/badminton/badminton-clothing' },
            { label: 'FOOTWEAR', href: '/category/badminton/badminton-shoes' },
          ],
        },
        {
          heading: 'ACCESSORIES',
          links: [{ label: 'BAGS', href: '/category/badminton/bags' }, { label: 'GRIP POWDER', href: '/category/badminton/grip-powder' }],
        },
      ],
      imageSrc: '/images/storefront-generic/marketplace-hero.png',
      imageAlt: 'Generic ecommerce product collection',
    },
  },
  {
    label: 'CATALOG',
    href: '#',
    megaMenu: {
      columns: [
        {
          heading: 'CORE GOODS',
          links: [
            { label: 'PRIMARY ITEMS', href: '/category/cricket/bats' },
            { label: 'ALL PRODUCTS', href: '/category/cricket/all-balls' },
            { label: 'PROTECTIVE GOODS', href: '/category/cricket/pads' },
            { label: 'HAND ACCESSORIES', href: '/category/cricket/gloves' },
            { label: 'SAFETY ITEMS', href: '/category/cricket/helmets' },
          ],
        },
        {
          heading: 'WEARABLES',
          links: [{ label: 'CLOTHING', href: '/category/cricket/cricket-clothing' }, { label: 'FOOTWEAR', href: '/category/cricket/shoes' }],
        },
        {
          heading: 'ACCESSORIES',
          links: [{ label: 'BAGS', href: '/category/cricket/bags' }, { label: 'EXTRAS', href: '/category/cricket/extras' }],
        },
      ],
      imageSrc: '/images/storefront-generic/collection-shelves.png',
      imageAlt: 'Generic ecommerce shelves',
    },
  },
  {
    label: 'ESSENTIALS',
    href: '#',
    megaMenu: {
      columns: [
        {
          heading: 'DAILY USE',
          links: [
            { label: 'SMALL ACCESSORIES', href: '/category/accessories/wrist-bands' },
            { label: 'WEARABLE ADD-ONS', href: '/category/accessories/headbands' },
            { label: 'SOCKS', href: '/category/accessories/socks' },
          ],
        },
        {
          heading: 'SUPPORT',
          links: [{ label: 'SUPPORTERS', href: '/category/accessories/supporters' }, { label: 'INSOLES', href: '/category/accessories/insoles' }],
        },
        {
          heading: 'EXTRAS',
          links: [{ label: 'GIFT VOUCHERS', href: '/category/accessories/gift-vouchers' }],
        },
      ],
      imageSrc: '/images/storefront-generic/checkout-packages.png',
      imageAlt: 'Generic ecommerce packages',
    },
  },
  {
    label: 'COLLECTIONS',
    href: '#',
    megaMenu: {
      columns: [
        {
          heading: 'COMPACT ITEMS',
          links: [
            { label: 'SMALL GOODS', href: '/category/tennis/balls' },
            { label: 'FOOTWEAR', href: '/category/tennis/shoes' },
            { label: 'CLOTHING', href: '/category/tennis/clothing' },
          ],
        },
        {
          heading: 'BULK GOODS',
          links: [
            { label: 'STANDARD ITEMS', href: '/category/volleyball/balls' },
            { label: 'SUPPORT ITEMS', href: '/category/volleyball/knee-pads' },
            { label: 'FOOTWEAR', href: '/category/volleyball/shoes' },
            { label: 'CLOTHING', href: '/category/volleyball/clothing' },
            { label: 'ACCESSORIES', href: '/category/volleyball/accessories' },
          ],
        },
        {
          heading: 'HANDHELD',
          links: [{ label: 'TOOLS', href: '/category/pickleball/paddles' }, { label: 'SMALL GOODS', href: '/category/pickleball/balls' }],
        },
        {
          heading: 'SEASONAL',
          links: [
            { label: 'CAPS', href: '/category/swimming/swimming-caps' },
            { label: 'SUITS', href: '/category/swimming/swimming-suits' },
            { label: 'EYEWEAR', href: '/category/swimming/swimming-goggles' },
            { label: 'EXTRAS', href: '/category/swimming/swimming-extras' },
          ],
        },
      ],
      imageSrc: '/images/storefront-generic/marketplace-hero.png',
      imageAlt: 'Generic marketplace collection',
    },
  },
  { label: 'CONTACT US', href: '#', megaMenu: { type: 'contact' } },
]

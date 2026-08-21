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
    label: 'RACQUET SPORTS',
    href: '/category/badminton/racquets',
    megaMenu: {
      columns: [
        {
          heading: 'BADMINTON',
          links: [
            { label: 'RACQUETS', href: '/category/badminton/racquets' },
            { label: 'STRINGS', href: '/category/badminton/strings' },
            { label: 'SHUTTLECOCKS', href: '/category/badminton/shuttlecocks' },
          ],
        },
        {
          heading: 'TEAM SPORTS',
          links: [{ label: 'VOLLEYBALLS', href: '/category/volleyball/balls' }],
        },
      ],
      imageSrc: '/images/storefront-generic/marketplace-hero.png',
      imageAlt: 'Demo sports equipment collection',
    },
  },
  {
    label: 'CRICKET',
    href: '/category/cricket/bats',
    megaMenu: {
      columns: [
        {
          heading: 'EQUIPMENT',
          links: [
            { label: 'BATS', href: '/category/cricket/bats' },
            { label: 'BALLS', href: '/category/cricket/balls' },
            { label: 'BATTING GLOVES', href: '/category/cricket/gloves' },
          ],
        },
      ],
      imageSrc: '/images/storefront-generic/collection-shelves.png',
      imageAlt: 'Demo cricket equipment collection',
    },
  },
  {
    label: 'FITNESS & RUNNING',
    href: '/category/fitness/dumbbells',
    megaMenu: {
      columns: [
        {
          heading: 'FITNESS',
          links: [
            { label: 'DUMBBELLS', href: '/category/fitness/dumbbells' },
            { label: 'RESISTANCE BANDS', href: '/category/fitness/resistance-bands' },
          ],
        },
        {
          heading: 'RUNNING',
          links: [
            { label: 'RUNNING SHOES', href: '/category/running/shoes' },
            { label: 'SPORTS SOCKS', href: '/category/running/socks' },
          ],
        },
      ],
      imageSrc: '/images/storefront-generic/marketplace-hero.png',
      imageAlt: 'Demo fitness and running collection',
    },
  },
  {
    label: 'ACCESSORIES',
    href: '/category/accessories/water-bottles',
    megaMenu: {
      columns: [
        {
          heading: 'EVERYDAY ESSENTIALS',
          links: [
            { label: 'WATER BOTTLES', href: '/category/accessories/water-bottles' },
            { label: 'SPORTS BAGS', href: '/category/accessories/sports-bags' },
            { label: 'WRIST BANDS', href: '/category/accessories/wrist-bands' },
          ],
        },
      ],
      imageSrc: '/images/storefront-generic/checkout-packages.png',
      imageAlt: 'Demo sports accessories collection',
    },
  },
  { label: 'CONTACT US', href: '/#contact', megaMenu: { type: 'contact' } },
]

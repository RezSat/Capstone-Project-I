export interface SportsCategorySlide {
  title: string
  tagline: string
  image: string
}

export const sportsCategorySlides: SportsCategorySlide[] = [
  { title: 'SWIMMING', tagline: 'TRAIN YOUR BREATH, CONTROL YOUR SPEED', image: '/images/storefront-generic/marketplace-hero.png' },
  { title: 'BADMINTON', tagline: 'FAST FEET, FASTER REACTIONS', image: '/images/storefront-generic/marketplace-hero.png' },
  { title: 'VOLLEYBALL', tagline: 'JUMP HIGHER, HIT HARDER', image: '/images/storefront-generic/checkout-packages.png' },
  { title: 'CRICKET', tagline: "WATCH THE BOWLER'S HAND, NOT THE BALL", image: '/images/storefront-generic/collection-shelves.png' },
  { title: 'BASEBALL', tagline: 'SWING WITH POWER AND PRECISION', image: '/images/storefront-generic/checkout-packages.png' },
  { title: 'TENNIS', tagline: 'CONTROL THE COURT WITH EVERY SHOT', image: '/images/storefront-generic/marketplace-hero.png' },
  { title: 'SWIMMING', tagline: 'RHYTHM MATTERS MORE THAN FORCE', image: '/images/storefront-generic/collection-shelves.png' },
]

export const sideCardToneByDistance = {
  1: { opacity: 1, backgroundColor: '#F7F7F7', color: '#555555' },
  2: { opacity: 0.75, backgroundColor: '#FAFAFA', color: '#8A8A8A' },
  3: { opacity: 0.45, backgroundColor: '#FFFFFF', color: '#B5B5B5' },
} as const

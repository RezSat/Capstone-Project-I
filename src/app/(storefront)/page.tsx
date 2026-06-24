import type { Metadata } from 'next'
import ProductSlider from '@/components/common/ProductSlider'
import HomeFinalCta from '@/components/storefront/HomePage/HomeFinalCta'
import HomeReveal from '@/components/storefront/HomePage/HomeReveal'
import ModernIntroSection from '@/components/storefront/HomePage/ModernIntroSection'
import ProductDiscoverySection from '@/components/storefront/HomePage/ProductDiscoverySection'
import StoreValueSection from '@/components/storefront/HomePage/StoreValueSection'
import { fetchPromoProducts } from '@/components/storefront/HomePage/home-page-products'
import type {
  CollectionTile,
  StoreValueItem,
} from '@/components/storefront/HomePage/homepage-content'

export const metadata: Metadata = {
  title: 'Storefront Inventory Platform | Modern Ecommerce Catalog',
  description: 'Browse a fast, responsive ecommerce storefront with product discovery, categories, wishlist, cart, and checkout flows.',
}

const collections: CollectionTile[] = [
  {
    title: 'Featured catalog',
    label: 'Featured path',
    description: 'A focused route into highlighted products for shoppers comparing active catalog items.',
    imageSrc: '/images/storefront-generic/marketplace-hero.png',
    href: '/category/badminton/racquets',
  },
  {
    title: 'Everyday essentials',
    label: 'Daily goods',
    description: 'Useful accessories and dependable staples for repeat purchase flows.',
    imageSrc: '/images/storefront-generic/collection-shelves.png',
    href: '/category/accessories/wrist-bands',
  },
  {
    title: 'Ready-to-ship picks',
    label: 'Browse more',
    description: 'Category-first shopping for customers moving across multiple product groups.',
    imageSrc: '/images/storefront-generic/checkout-packages.png',
    href: '/category/volleyball/balls',
  },
]

const valueItems: StoreValueItem[] = [
  {
    title: 'Reliable inventory',
    description: 'Product areas are backed by the existing catalog and inventory foundation.',
    icon: 'shield',
  },
  {
    title: 'Fast discovery',
    description: 'Search, category navigation, and product rails stay easy to scan on every screen.',
    icon: 'search',
  },
  {
    title: 'Checkout ready',
    description: 'Cart and checkout entry points remain wired through the current storefront shell.',
    icon: 'truck',
  },
  {
    title: 'Reusable UI',
    description: 'Sections are composed from small, prop-driven storefront components.',
    icon: 'sparkles',
  },
]

export default async function Home() {
  const [newArrivals, bestSellers] = await Promise.all([
    fetchPromoProducts('new_arrival', 8),
    fetchPromoProducts('best_seller', 8),
  ])
  const introProducts = newArrivals.length > 0 ? newArrivals : bestSellers

  return (
    <>
      <ModernIntroSection products={introProducts.slice(0, 2)} collections={collections} />
      <HomeReveal>
        <StoreValueSection items={valueItems} />
      </HomeReveal>
      {newArrivals.length > 0 && (
        <HomeReveal>
          <ProductSlider id="new-arrivals" title="New arrivals" products={newArrivals} />
        </HomeReveal>
      )}
      <HomeReveal>
        <ProductDiscoverySection collections={collections} />
      </HomeReveal>
      {bestSellers.length > 0 && (
        <HomeReveal>
          <ProductSlider id="best-sellers" title="Best sellers" products={bestSellers} />
        </HomeReveal>
      )}
      <HomeReveal>
        <HomeFinalCta />
      </HomeReveal>
    </>
  )
}

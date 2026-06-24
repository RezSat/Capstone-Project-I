import ProductSlider from '@/components/common/ProductSlider'
import { fetchPromoProducts } from './home-page-products'

export default async function BestSellingProducts() {
  const products = await fetchPromoProducts('best_seller', 6)

  if (products.length === 0) return null

  return <ProductSlider title="BEST SELLING PRODUCTS" products={products} />
}

import ProductSlider from '@/components/common/ProductSlider'
import { fetchPromoProducts } from './home-page-products'

export default async function NewArrivals() {
  const products = await fetchPromoProducts('new_arrival', 6)

  if (products.length === 0) return null

  return <ProductSlider id="new-arrivals" title="NEW ARRIVALS" products={products} />
}

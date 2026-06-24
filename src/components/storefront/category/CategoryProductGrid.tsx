import ProductCard from '../../common/ProductCard'
import type { StorefrontCategoryProduct } from '@/modules/products/public-category.service'

interface CategoryProductGridProps {
  products: StorefrontCategoryProduct[]
}

export default function CategoryProductGrid({ products }: CategoryProductGridProps) {
  if (products.length === 0) {
    return <p className="font-open-sans text-base text-[#191A1C]">No products found.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  )
}

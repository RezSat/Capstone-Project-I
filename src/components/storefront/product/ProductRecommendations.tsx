import ProductCard, { type ProductCardProps } from '@/components/common/ProductCard'

interface ProductRecommendationsProps {
  products: ProductCardProps[]
}

export default function ProductRecommendations({ products }: ProductRecommendationsProps) {
  if (products.length === 0) return null

  return (
    <section className="w-full bg-white px-5 py-12 md:px-8 lg:px-10 xl:px-[40px]">
      <h2 className="font-oswald text-2xl font-semibold uppercase text-[#191A1C] md:text-3xl">RECOMMEND FOR YOU</h2>
      <div className="mt-6 grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
        {products.slice(0, 5).map((product) => (
          <ProductCard key={`${product.name}-${product.categoryName ?? ''}-${product.id}`} {...product} />
        ))}
      </div>
    </section>
  )
}

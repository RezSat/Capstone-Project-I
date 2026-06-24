import Image from 'next/image'

export default function ShopImageSection() {
  return (
    <section className="relative h-[300px] w-full overflow-hidden">
      <Image src="/images/storefront-generic/checkout-packages.png" alt="Generic ecommerce package display" fill className="object-cover" />
    </section>
  )
}

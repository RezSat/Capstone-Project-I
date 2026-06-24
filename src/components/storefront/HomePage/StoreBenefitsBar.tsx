import Image from 'next/image'

const benefits = [
  {
    icon: '/images/icons/clock.png',
    label: '24 HOURS',
    title: 'ORDER PROCESSING',
  },
  {
    icon: '/images/icons/shipping.png',
    label: 'FAST SHIPPING',
    title: '1-5 DAYS DELIVERY',
  },
  {
    icon: '/images/icons/message.png',
    label: 'PRIORITY SUPPORT',
    title: '24/7 CHAT SUPPORT',
  },
  {
    icon: '/images/icons/like.png',
    label: '100% SATISFACTION',
    title: 'BEST REVIEWED BRANDS',
  },
]

export default function StoreBenefitsBar() {
  return (
    <section className="hidden lg:block h-[120px] w-full bg-[#F8F8F8]">
      <div className="flex h-full w-full items-center justify-between px-[42px]">
        {benefits.map((benefit) => (
          <article
            key={benefit.title}
            className="flex shrink-0 items-center gap-6"
          >
            <Image
              src={benefit.icon}
              alt={benefit.title}
              width={56}
              height={56}
              className="h-14 w-14 shrink-0 object-contain"
            />

            <div className="flex flex-col items-start">
              <p className="whitespace-nowrap font-open-sans text-xs font-semibold uppercase tracking-[0.06em] text-[#f97316]">
                {benefit.label}
              </p>

              <p className="whitespace-nowrap font-open-sans text-[0.9rem] font-semibold uppercase leading-tight text-[#191A1C]">
                {benefit.title}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
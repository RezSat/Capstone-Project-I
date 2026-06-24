import Link from 'next/link'

interface StorefrontLogoProps {
  className?: string
  showText?: boolean
  tone?: 'light' | 'dark'
}

export default function StorefrontLogo({
  className = '',
  showText = true,
  tone = 'light',
}: StorefrontLogoProps) {
  const titleColor = tone === 'dark' ? 'text-white' : 'text-[#191A1C]'

  return (
    <Link href="/" className={`inline-flex items-center gap-3 ${className}`} aria-label="Go to homepage">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f97316] font-ui text-2xl font-black text-white shadow-[0_12px_30px_rgba(249,115,22,0.28)]">
        S
      </span>
      {showText && (
        <span className="flex flex-col leading-none">
          <span className={`font-display text-lg font-semibold uppercase ${titleColor}`}>
            Storefront
          </span>
          <span className="mt-1 font-ui text-[10px] font-bold uppercase tracking-[0.18em] text-[#f97316]">
            Capstone
          </span>
        </span>
      )}
    </Link>
  )
}

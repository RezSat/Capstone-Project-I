import type { ReactNode } from 'react'

interface HomeRevealProps {
  children: ReactNode
  className?: string
}

export default function HomeReveal({
  children,
  className = '',
}: HomeRevealProps) {
  return <div className={className}>{children}</div>
}

'use client'

import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react'
import styles from './BlockTextReveal.module.css'

interface BlockTextRevealProps {
  children: ReactNode
  className?: string
  textClassName?: string
  blockColor?: string
  duration?: number
  delay?: number
  threshold?: number
  reverse?: boolean
}

export default function BlockTextReveal({
  children,
  className = '',
  textClassName = '',
  blockColor = '#f97316',
  duration = 1.1,
  delay = 0,
  threshold = 0.25,
  reverse = false,
}: BlockTextRevealProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const element = rootRef.current
    if (!element || isActive) return

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches

    if (prefersReducedMotion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsActive(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsActive(true)
          observer.disconnect()
        }
      },
      { threshold },
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [isActive, threshold])

  const style = {
    '--block-reveal-color': blockColor,
    '--block-reveal-duration': `${duration}s`,
    '--block-reveal-delay': `${delay}s`,
    '--block-reveal-text-delay': `${delay + duration * 0.55}s`,
  } as CSSProperties

  return (
    <div
      ref={rootRef}
      className={`${styles.reveal} ${reverse ? styles.reverse : ''} ${isActive ? styles.active : ''} ${className}`}
      style={style}
    >
      <span className={styles.block} aria-hidden="true" />
      <div className={`${styles.text} ${textClassName}`}>{children}</div>
    </div>
  )
}

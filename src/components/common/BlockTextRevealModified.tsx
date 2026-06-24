'use client'

import {
  type CSSProperties,
  useEffect,
  useRef,
  useState,
} from 'react'
import styles from './BlockTextReveal.module.css'

interface BlockTextRevealModifiedProps {
  text: string 
  className?: string
  textClassName?: string
  blockColor?: string
  duration?: number
  delay?: number
  threshold?: number
  reverse?: boolean
}

interface LineGroup {
  words: string[]
  top: number
}

export default function BlockTextRevealModified({
  text,
  className = '',
  textClassName = '',
  blockColor = '#f97316',
  duration = 1.1,
  delay = 0,
  threshold = 0.25,
  reverse = false,
}: BlockTextRevealModifiedProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [lines, setLines] = useState<LineGroup[]>([])
  const [isActive, setIsActive] = useState(false)
  const isCalculated = useRef(false)

  // 1. Calculate dynamic wrapping rows based on layout width safely
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let currentWidth = window.innerWidth

    const computeLines = () => {
      // Prevent running recalculations if the horizontal layout size didn't change (e.g. mobile address bar vertical scrolling)
      if (isCalculated.current && window.innerWidth === currentWidth) {
        return
      }
      
      currentWidth = window.innerWidth
      const wordElements = container.querySelectorAll('.reveal-word-span')
      if (wordElements.length === 0) return

      const groups: LineGroup[] = []

      wordElements.forEach((el) => {
        const rect = el.getBoundingClientRect()
        // Use a 4px safety buffer zone to group inline words together reliably on high-dpi mobile screens
        const matchingGroup = groups.find((g) => Math.abs(g.top - rect.top) < 4)

        if (matchingGroup) {
          matchingGroup.words.push(el.textContent || '')
        } else {
          groups.push({
            words: [el.textContent || ''],
            top: rect.top,
          })
        }
      })

      setLines(groups)
      isCalculated.current = true
    }

    // Debounce recalculations to protect GPU cycles on high-frequency resize events
    let resizeTimeout: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        computeLines()
      }, 150)
    }

    // Initial Execution
    computeLines()

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [])

  // 2. Intersection Observer tracking active view frame positions
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsActive(true)
          observer.unobserve(container)
        }
      },
      { threshold }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [threshold])

  // If the hook state hasn't populated yet, output standard string architecture so SEO engines capture the words cleanly
  if (lines.length === 0) {
    return (
      <div
        ref={containerRef}
        className={`w-full flex flex-wrap justify-center text-center ${className}`}
      >
        {text.split(' ').map((word, idx) => (
          <span
            key={idx}
            className="reveal-word-span inline-block mx-1 invisible select-none text-lg font-bold"
          >
            {word}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={`w-full flex flex-col items-center text-center gap-0 ${className}`}
    >
      {lines.map((line, lineIdx) => {
        const currentLineText = line.words.join(' ')
        const incrementalDelay = delay + lineIdx * 0.15

        const style = {
          '--block-reveal-color': blockColor,
          '--block-reveal-duration': `${duration}s`,
          '--block-reveal-delay': `${incrementalDelay}s`,
          '--block-reveal-text-delay': `${incrementalDelay + duration * 0.55}s`,
        } as CSSProperties

        return (
          <div
            key={lineIdx}
            className={`${styles.reveal} ${reverse ? styles.reverse : ''} ${
              isActive ? styles.active : ''
            } inline-block mx-auto`}
            style={style}
          >
            <span className={styles.block} />
            <span className={`${styles.text} ${textClassName}`}>
              {currentLineText}
            </span>
          </div>
        )
      })}
    </div>
  )
}

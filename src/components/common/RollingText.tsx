'use client'

import type { CSSProperties } from 'react'
import styles from './RollingText.module.css'

interface RollingTextProps {
  words: string[]
  duration?: number
  className?: string
}

export default function RollingText({
  words,
  duration = 7,
  className = '',
}: RollingTextProps) {
  const safeWords = words.length > 0 ? words : ['BADMINTON']

  const longestWord = safeWords.reduce((longest, word) => {
    return word.length > longest.length ? word : longest
  }, safeWords[0])

  const style = {
    '--rolling-duration': `${duration}s`,
    '--rolling-width': `${longestWord.length}ch`,
  } as CSSProperties

  return (
    <span className={`${styles.roller} ${className}`} style={style}>
      <span className={styles.track}>
        {safeWords.map((word) => (
          <span className={styles.word} key={word}>
            {word}
          </span>
        ))}
      </span>
    </span>
  )
}
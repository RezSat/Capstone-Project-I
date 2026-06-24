'use client'

import { useState } from 'react'
import { X, ChevronLeft } from 'lucide-react'
import Image from 'next/image'
import { SPORT_QUIZ_DATA, type QuizOption } from '@/data/sportMatcher'

const SPORTS = SPORT_QUIZ_DATA.map((s) => ({ id: s.sportId, name: s.sportName }))

interface MobileWrapperProps {
  children: React.ReactNode
  className?: string
}

function MobileWrapper({ children, className = '' }: MobileWrapperProps) {
  return (
    <div className={`bg-white border border-neutral-200/60 shadow-xl rounded-3xl overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

interface SportHeaderBannerProps {
  sportId: string
  currentStep: number
  totalSteps: number
  onBack: () => void
  onClose: () => void
}

function SportHeaderBanner({ sportId, currentStep, totalSteps, onBack, onClose }: SportHeaderBannerProps) {
  const imageSrc = sportId === 'pickleball'
    ? '/images/storefront-generic/checkout-packages.png'
    : `/images/storefront-generic/collection-shelves.png`

  return (
    <div className="relative w-full h-[180px] bg-neutral-100">
      <Image
        src={imageSrc}
        alt={sportId}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute inset-0 flex items-center justify-between px-4">
        <button
          onClick={onBack}
          className="bg-white/90 text-neutral-800 p-2 rounded-full shadow-sm active:scale-95 transition-transform"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStep ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/50'
              }`}
            />
          ))}
        </div>

        <button
          onClick={onClose}
          className="bg-white/90 text-neutral-800 p-2 rounded-full shadow-sm active:scale-95 transition-transform"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

interface MobileSelectionViewProps {
  onSelect: (sportId: string) => void
}

export function MobileSelectionView({ onSelect }: MobileSelectionViewProps) {
  return (
    <div className="relative min-h-[500px] w-full overflow-hidden">
      <Image
        src="/images/storefront-generic/collection-shelves.png"
        alt="Sport background"
        fill
        priority
        className="object-cover pointer-events-none z-0"
      />

      <div className="absolute inset-0 bg-black/50 z-10" />

      <div className="relative z-20 w-full flex flex-col justify-center space-y-3 px-4 py-8">
        <h2 className="font-oswald text-2xl font-semibold uppercase tracking-wide text-white text-center mb-6">
          SELECT YOUR SPORT
        </h2>
        {SPORTS.map((sport) => (
          <button
            key={sport.id}
            onClick={() => onSelect(sport.id)}
            className="flex items-center justify-center w-full bg-white/50 border border-white/20 hover:bg-white/20 hover:border-white/30 rounded-xl p-3 transition-all duration-200 active:scale-[0.98]"
          >
            <span className="font-oswald text-lg font-medium text-white text-center tracking-wide uppercase">
              {sport.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

interface MobileQuizViewProps {
  sportId: string
  onClose: () => void
  onComplete: (answers: Record<number, QuizOption>) => void
}

export function MobileQuizView({ sportId, onClose, onComplete }: MobileQuizViewProps) {
  const quizData = SPORT_QUIZ_DATA.find((q) => q.sportId === sportId)
  const questions = quizData?.questions || []
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, QuizOption>>({})

  const currentQuestion = questions[currentIndex]
  const selectedOption = answers[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1
  const canGoNext = selectedOption !== undefined

  const handleSelect = (option: QuizOption) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: option }))
  }

  const handleNext = () => {
    if (isLastQuestion) {
      onComplete(answers)
    } else {
      setCurrentIndex((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentIndex === 0) {
      onClose()
    } else {
      setCurrentIndex((prev) => prev - 1)
    }
  }

  if (!quizData || !currentQuestion) {
    return (
      <MobileWrapper>
        <div className="flex items-center justify-center h-full">
          <p className="text-neutral-400">Quiz not available</p>
        </div>
      </MobileWrapper>
    )
  }

  return (
    <MobileWrapper>
      <SportHeaderBanner
        sportId={sportId}
        currentStep={currentIndex}
        totalSteps={questions.length}
        onBack={handleBack}
        onClose={onClose}
      />

      <div className="p-6 flex flex-col flex-1">
        <span className="text-[#f97316] font-oswald text-xs tracking-widest font-bold uppercase mb-1">
          Question {currentIndex + 1} of {questions.length}
        </span>

        <h3 className="font-oswald text-xl font-semibold text-neutral-900 uppercase leading-tight mb-6">
          {currentQuestion.text}
        </h3>

        <div className="space-y-3 flex-1">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(option)}
              className={`w-full text-left bg-white hover:bg-neutral-50 border border-neutral-200 hover:border-neutral-400 rounded-xl p-4 text-neutral-800 text-sm font-medium shadow-sm transition-all duration-200 active:scale-[0.99] ${
                selectedOption?.title === option.title ? 'border-[#f97316] bg-orange-50' : ''
              }`}
            >
              {option.title}
            </button>
          ))}
        </div>

        <div className="pt-6 mt-6">
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`w-full py-4 rounded-xl font-ui font-semibold uppercase tracking-wide transition-all duration-200 ${
              canGoNext
                ? 'bg-[#f97316] text-white hover:bg-[#ea580c] active:scale-[0.98]'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {isLastQuestion ? 'See Results' : 'Next Question'}
          </button>
        </div>
      </div>
    </MobileWrapper>
  )
}

interface MobileResultViewProps {
  sportId: string
  answers: Record<number, QuizOption>
  onRestart: () => void
}

export function MobileResultView({ sportId, answers, onRestart }: MobileResultViewProps) {
  const quizData = SPORT_QUIZ_DATA.find((q) => q.sportId === sportId)

  const resultKey = Object.values(answers)
    .map((a) => a.title.replace(/[^a-zA-Z]/g, ''))
    .join('-')

  const recommendedProducts = quizData?.results[resultKey] || []
  const primaryProduct = recommendedProducts[0]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <MobileWrapper>
      <SportHeaderBanner
        sportId={sportId}
        currentStep={0}
        totalSteps={3}
        onBack={onRestart}
        onClose={onRestart}
      />

      <div className="p-6 flex flex-col items-center">
        <h3 className="font-oswald text-lg font-bold text-neutral-900 uppercase tracking-wide mb-4">
          YOUR RECOMMENDED GEAR
        </h3>

        <div className="flex-1 flex items-center justify-center">
          {primaryProduct ? (
            <div className="w-full max-w-[280px] bg-neutral-50 border border-neutral-200 rounded-2xl p-5">
              <div className="relative w-full aspect-square rounded-xl overflow-hidden mb-4 bg-neutral-100">
                <Image
                  src={primaryProduct.image}
                  alt={primaryProduct.name}
                  fill
                  className="object-cover"
                />
              </div>
              <p className="font-oswald text-md font-semibold text-neutral-900 uppercase text-center">
                {primaryProduct.name}
              </p>
              <p className="font-ui text-xl font-bold text-[#f97316] text-center mt-1">
                {formatPrice(primaryProduct.price)}
              </p>
              <p className="font-open-sans text-sm text-neutral-500 text-center mt-2">
                {primaryProduct.whyItMatches}
              </p>
              <button className="w-full py-3 mt-4 bg-[#f97316] hover:bg-[#ea580c] rounded-xl font-ui font-semibold uppercase tracking-wide text-white transition-colors active:scale-[0.98]">
                View Product
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <p className="text-neutral-400">No recommendations found</p>
            </div>
          )}
        </div>

        <div className="pt-6 mt-6 border-t border-neutral-200 w-full">
          <button
            onClick={onRestart}
            className="w-full py-4 text-neutral-500 hover:text-neutral-700 font-ui text-sm uppercase tracking-wide transition-colors underline underline-offset-4"
          >
            Retake Quiz
          </button>
        </div>
      </div>
    </MobileWrapper>
  )
}
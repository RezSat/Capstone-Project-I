'use client'

import { useState } from 'react'
import { ChevronRight, X, ChevronLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { SPORT_QUIZ_DATA, type QuizOption, type RecommendedProduct } from '@/data/sportMatcher'
import BlockTextRevealModified from '@/components/common/BlockTextRevealModified'
import { MobileSelectionView, MobileQuizView, MobileResultView } from './SportMatcherMobile'

const sports = [
  { id: 'badminton', name: 'BADMINTON', image: '/images/storefront-generic/marketplace-hero.png' },
  { id: 'cricket', name: 'CRICKET', image: '/images/storefront-generic/collection-shelves.png' },
  { id: 'volleyball', name: 'VOLLEYBALL', image: '/images/storefront-generic/collection-shelves.png' },
  { id: 'pickleball', name: 'PICKLEBALL', image: '/images/storefront-generic/checkout-packages.png' },
  { id: 'tennis', name: 'TENNIS', image: '/images/storefront-generic/collection-shelves.png' },
  { id: 'swimming', name: 'SWIMMING', image: '/images/storefront-generic/collection-shelves.png' },
]

type View = 'selection' | 'quiz' | 'result'

function RollingButton({
  sportName,
  onClick,
  onHover,
  onUnhover,
}: {
  sportName: string
  onClick: () => void
  onHover: () => void
  onUnhover: () => void
}) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onUnhover}
      className="group relative flex h-12 w-[85%] items-center justify-between overflow-hidden rounded-lg bg-transparent px-6 text-left transition-all duration-300 hover:bg-gray-50"
      style={{ fontFamily: 'var(--font-oswald-next)' }}
    >
      <div className="relative h-6 overflow-hidden">
        <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:-translate-y-6">
          <span className="h-6 text-lg font-bold uppercase tracking-wide text-gray-900">
            {sportName}
          </span>
          <span className="h-6 text-lg font-bold uppercase tracking-wide text-[#f97316]">
            START GEAR FINDER
          </span>
        </div>
      </div>
      <ChevronRight
        className="h-5 w-5 flex-shrink-0 text-gray-400 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:text-gray-900 group-hover:opacity-100"
      />
    </button>
  )
}

function SelectionView({
  onSelect,
  onSportHover,
  onSportUnhover,
}: {
  onSelect: (sportId: string) => void
  onSportHover: (sportId: string) => void
  onSportUnhover: () => void
}) {
  return (
    <>
      <h2 className="text-xs font-opensans text-gray-700 -mt-5">SELECT YOUR SPORT</h2>
      <div className="space-y-2 has-[button:hover]:[&>div:not(:hover)]:opacity-40">
        {sports.map((sport) => (
          <div key={sport.id} className="transition-opacity duration-300">
            <RollingButton
              sportName={sport.name}
              onClick={() => onSelect(sport.id)}
              onHover={() => onSportHover(sport.id)}
              onUnhover={onSportUnhover}
            />
          </div>
        ))}
      </div>
    </>
  )
}

function QuizOptionBlock({
  option,
  isSelected,
  onClick,
}: {
  option: QuizOption
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-lg border-2 p-3 text-left transition-all duration-300 ${
        isSelected
          ? 'border-[#f97316] bg-orange-50'
          : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
      }`}
    >
      <p className={`font-bold text-sm ${isSelected ? 'text-[#f97316]' : 'text-gray-900'}`}>
        {option.title}
      </p>
      <p className="mt-0.5 text-xs text-gray-500 leading-snug">{option.description}</p>
    </button>
  )
}

function QuizView({
  sportId,
  onClose,
  onComplete,
}: {
  sportId: string
  onClose: () => void
  onComplete: (answers: Record<number, QuizOption>) => void
}) {
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
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Quiz not available</p>
      </div>
    )
  }

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <button
        onClick={onClose}
        className="absolute top-0 right-0 p-1.5 z-10 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>

      <div className="flex flex-col h-full overflow-y-auto pr-1">
        <div className="mb-3">
          <span className="text-xs font-medium text-gray-500">
            Q {currentIndex + 1}/{questions.length}
          </span>
          <h3 className="mt-1 text-base font-bold text-gray-900 leading-tight">{currentQuestion.text}</h3>
        </div>

        <div className="space-y-2 flex-1">
          {currentQuestion.options.map((option, idx) => (
            <QuizOptionBlock
              key={idx}
              option={option}
              isSelected={selectedOption?.title === option.title}
              onClick={() => handleSelect(option)}
            />
          ))}
        </div>

        <div className="mt-3 flex justify-end gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={handleBack}
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <ChevronLeft className="h-3 w-3" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              canGoNext
                ? 'bg-[#f97316] text-white hover:bg-[#ea580c]'
                : 'cursor-not-allowed bg-gray-300 text-gray-500'
            }`}
          >
            {isLastQuestion ? 'See Results' : 'Next'}
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductCard({ product }: { product: RecommendedProduct }) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="flex items-center gap-3 rounded-lg bg-white p-2.5 shadow-sm">
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-gray-900 truncate">{product.name}</h4>
        <p className="text-sm font-bold text-[#f97316]">{formatPrice(product.price)}</p>
      </div>
      <button className="flex-shrink-0 rounded-md bg-[#f97316] px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-[#ea580c]">
        View
      </button>
    </div>
  )
}

function ResultView({
  sportId,
  answers,
  onRestart,
}: {
  sportId: string
  answers: Record<number, QuizOption>
  onRestart: () => void
}) {
  const quizData = SPORT_QUIZ_DATA.find((q) => q.sportId === sportId)
  
  const resultKey = Object.values(answers)
    .map((a) => a.title.replace(/[^a-zA-Z]/g, ''))
    .join('-')

  const recommendedProducts = quizData?.results[resultKey] || []

  const whyItMatches = recommendedProducts[0]?.whyItMatches || ''

  return (
    <div className="relative flex flex-col h-full overflow-hidden">
      <div className="flex flex-col h-full overflow-y-auto pr-1">
        <h3 className="text-base font-bold text-gray-900 mb-3">Recommended for you:</h3>

        <div className="space-y-3 flex-1 overflow-y-auto">
          {recommendedProducts.length > 0 ? (
            recommendedProducts.map((product, idx) => (
              <ProductCard key={idx} product={product} />
            ))
          ) : (
            <div className="rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-4 text-center">
              <p className="text-gray-500 font-medium text-xs">No recommendations found</p>
            </div>
          )}
        </div>

        {whyItMatches && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-700">
              <span className="font-bold">Best for:</span> {whyItMatches}
            </p>
          </div>
        )}

        <div className="mt-3 flex gap-2 pt-2 border-t border-gray-100">
          <button
            onClick={onRestart}
            className="flex-1 rounded-lg border-2 border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Retake Quiz
          </button>
          <button
            onClick={onRestart}
            className="flex-1 rounded-lg border-2 border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            See Similar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SportMatcher() {
  const [view, setView] = useState<View>('selection')
  const [selectedSport, setSelectedSport] = useState<string | null>(null)
  const [hoveredSport, setHoveredSport] = useState<string | null>(null)
  const [resultAnswers, setResultAnswers] = useState<Record<number, QuizOption>>({})

  const handleSelect = (sportId: string) => {
    setSelectedSport(sportId)
    setView('quiz')
  }

  const handleClose = () => {
    setView('selection')
    setSelectedSport(null)
  }

  const handleComplete = (answers: Record<number, QuizOption>) => {
    setResultAnswers(answers)
    setView('result')
  }

  const handleRestart = () => {
    setView('selection')
    setSelectedSport(null)
    setResultAnswers({})
  }

  const activeSport = view === 'quiz' || view === 'result' ? selectedSport : hoveredSport

  return (
    <section className="py-12 md:py-16 pb-16 lg:pb-24 bg-white">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="mb-2 font-oswald text-2xl font-semibold uppercase tracking-wide text-[#191A1C] md:text-3xl">
            FIND YOUR MATCH
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
            
          </p>
          <div className="mt-6 w-full max-w-[340px] md:max-w-full mx-auto">
            <BlockTextRevealModified
              text="Not sure which racket, bat, or gear suits you best?"
              blockColor="#f97316"
              delay={0.25}
              textClassName="font-open-sans text-md md:text-md leading-relaxed text-[#191A1C] text-center"
            />
          </div>
          <div className="w-full max-w-full md:max-w-full mx-auto">
            <BlockTextRevealModified
              text="Answer a few quick questions and let the storefront guide you toward products that match your preferences and browsing intent."
              blockColor="#f97316"
              delay={0.25}
              textClassName="font-open-sans text-md md:text-md leading-relaxed text-[#191A1C] text-center"
            />
          </div>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
          </p>
        </div>
        <div className="hidden md:block w-full mx-auto max-w-[1200px]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[320px] lg:h-[350px] px-4 lg:px-6">
            <div className="lg:col-span-8 h-[95%]">
              <div className="relative rounded-sm overflow-hidden h-full">
                {view === 'selection' ? (
                  <div className="grid grid-cols-6 h-full">
                    {sports.map((sport) => (
                      <div
                        key={sport.id}
                        className="h-full"
                        onMouseEnter={() => setHoveredSport(sport.id)}
                        onMouseLeave={() => setHoveredSport(null)}
                      >
                        <img
                          src={sport.image}
                          alt={sport.name}
                          className={`w-full h-full object-cover transition-all duration-500 ${
                            activeSport === null || activeSport === sport.id
                              ? 'grayscale-0'
                              : 'grayscale'
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <AnimatePresence mode="wait">
                    {sports.map((sport) => (
                      <motion.div
                        key={sport.id}
                        initial={{ width: 0, opacity: 0 }}
                        animate={{
                          width: selectedSport === sport.id ? '100%' : 0,
                          opacity: selectedSport === sport.id ? 1 : 0,
                        }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                        className="absolute inset-0"
                      >
                        {selectedSport === sport.id && (
                          <img
                            src={sport.image}
                            alt={sport.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </div>
            <div className="lg:col-span-4 h-full flex flex-col justify-between py-2">
              <AnimatePresence mode="wait">
                {view === 'selection' && (
                  <motion.div
                    key="selection"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <SelectionView
                    onSelect={handleSelect}
                    onSportHover={setHoveredSport}
                    onSportUnhover={() => setHoveredSport(null)}
                  />
                  </motion.div>
                )}
                {view === 'quiz' && selectedSport && (
                  <motion.div
                    key="quiz"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <QuizView
                      sportId={selectedSport}
                      onClose={handleClose}
                      onComplete={handleComplete}
                    />
                  </motion.div>
                )}
                {view === 'result' && selectedSport && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ResultView
                      sportId={selectedSport}
                      answers={resultAnswers}
                      onRestart={handleRestart}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <div className="block md:hidden w-full">
          {view === 'selection' && <MobileSelectionView onSelect={handleSelect} />}
          {view === 'quiz' && selectedSport && (
            <MobileQuizView
              sportId={selectedSport}
              onClose={handleClose}
              onComplete={handleComplete}
            />
          )}
          {view === 'result' && selectedSport && (
            <MobileResultView
              sportId={selectedSport}
              answers={resultAnswers}
              onRestart={handleRestart}
            />
          )}
        </div>
      </div>
    </section>
  )
}

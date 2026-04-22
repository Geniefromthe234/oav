import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import SectionIntro from '../components/site/SectionIntro'

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
}

const MOBILE_BREAKPOINT = 760
const AUTO_SCROLL_DELAY_MS = 3200
const AUTO_SCROLL_RESUME_MS = 900

export default function ReviewsSection({ reviews }) {
  const [isMobileReviews, setIsMobileReviews] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
  })
  const marqueeRef = useRef(null)
  const autoAdvanceTimeoutRef = useRef(0)
  const resumeTimeoutRef = useRef(0)
  const isPausedRef = useRef(false)
  const displayedReviews = isMobileReviews ? reviews : [...reviews, ...reviews]

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`)
    const syncViewport = () => setIsMobileReviews(mediaQuery.matches)

    syncViewport()
    mediaQuery.addEventListener('change', syncViewport)

    return () => mediaQuery.removeEventListener('change', syncViewport)
  }, [])

  useEffect(() => {
    if (!isMobileReviews) {
      return undefined
    }

    const marquee = marqueeRef.current

    if (!marquee) {
      return undefined
    }

    const stopAutoScroll = () => {
      window.clearTimeout(autoAdvanceTimeoutRef.current)
    }

    const stopResumeTimer = () => {
      window.clearTimeout(resumeTimeoutRef.current)
    }

    const getActiveCardIndex = (cards) => {
      if (!cards.length) {
        return 0
      }

      const anchorX = marquee.scrollLeft + marquee.clientWidth / 2
      let nearestIndex = 0
      let nearestDistance = Number.POSITIVE_INFINITY

      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2
        const distance = Math.abs(cardCenter - anchorX)

        if (distance < nearestDistance) {
          nearestDistance = distance
          nearestIndex = index
        }
      })

      return nearestIndex
    }

    const scheduleAutoScroll = (cards) => {
      stopAutoScroll()

      if (
        !cards.length
        || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return
      }

      autoAdvanceTimeoutRef.current = window.setTimeout(() => {
        if (!marquee.isConnected || isPausedRef.current || !cards.length) {
          return
        }

        const nextIndex = (getActiveCardIndex(cards) + 1) % cards.length
        cards[nextIndex]?.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start',
        })

        scheduleAutoScroll(cards)
      }, AUTO_SCROLL_DELAY_MS)
    }

    const pauseAutoScroll = () => {
      isPausedRef.current = true
      stopAutoScroll()
      stopResumeTimer()
    }

    const resumeAutoScroll = (cards) => {
      stopResumeTimer()
      resumeTimeoutRef.current = window.setTimeout(() => {
        if (!marquee.isConnected) {
          return
        }

        isPausedRef.current = false
        scheduleAutoScroll(cards)
      }, AUTO_SCROLL_RESUME_MS)
    }

    const handleTouchStart = () => {
      pauseAutoScroll()
    }

    const handleTouchEnd = () => {
      resumeAutoScroll(cards)
    }

    const cards = Array.from(
      marquee.querySelectorAll('.oav-reviews-track .oav-review-card'),
    )

    isPausedRef.current = false
    marquee.scrollTo({ left: 0, behavior: 'auto' })
    marquee.addEventListener('touchstart', handleTouchStart, { passive: true })
    marquee.addEventListener('touchend', handleTouchEnd, { passive: true })
    marquee.addEventListener('touchcancel', handleTouchEnd, { passive: true })
    scheduleAutoScroll(cards)

    return () => {
      pauseAutoScroll()
      stopResumeTimer()
      marquee.removeEventListener('touchstart', handleTouchStart)
      marquee.removeEventListener('touchend', handleTouchEnd)
      marquee.removeEventListener('touchcancel', handleTouchEnd)
    }
  }, [isMobileReviews, reviews.length])

  const ReviewCardTag = isMobileReviews ? 'article' : motion.article

  return (
    <section id="reviews" className="oav-section oav-section--steel">
      <div className="oav-shell">
        <SectionIntro
          eyebrow="Client Reviews"
          title="What clients say after handover."
          description="Feedback from residential, office, and developer jobs where clean finishing, dependable timing, and professional site conduct mattered."
        />

        <div
          className={`oav-reviews-marquee ${isMobileReviews ? 'is-mobile' : ''}`}
          ref={marqueeRef}
        >
          <div className={`oav-reviews-track ${isMobileReviews ? 'is-mobile' : ''}`}>
            {displayedReviews.map((review, index) => (
              <ReviewCardTag
                key={`${review.project}-${review.location}-${index}`}
                aria-hidden={index >= reviews.length}
                className="oav-review-card"
                {...(isMobileReviews ? {} : reveal)}
              >
                <div className="oav-review-meta">
                  <span className="oav-card-tag">{review.project}</span>
                  <span className="oav-review-location">{review.location}</span>
                </div>

                <p className="oav-review-quote">"{review.quote}"</p>

                <div className="oav-review-client">
                  <strong>{review.client}</strong>
                  <span>{review.role}</span>
                </div>
              </ReviewCardTag>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

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
const EDGE_TOLERANCE = 16

function ArrowIcon({ direction = 'right' }) {
  return (
    <svg
      aria-hidden="true"
      style={{ transform: direction === 'left' ? 'rotate(180deg)' : 'none' }}
      viewBox="0 0 24 24"
    >
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  )
}

export default function ReviewsSection({ reviews }) {
  const [isMobileReviews, setIsMobileReviews] = useState(() => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
  })
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: reviews.length > 1,
  })
  const marqueeRef = useRef(null)
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

    marquee.scrollTo({ left: 0, behavior: 'auto' })

    const updateScrollState = () => {
      const maxScrollLeft = marquee.scrollWidth - marquee.clientWidth
      const canScrollLeft = marquee.scrollLeft > EDGE_TOLERANCE
      const canScrollRight = marquee.scrollLeft < maxScrollLeft - EDGE_TOLERANCE

      setScrollState((currentState) => {
        if (
          currentState.canScrollLeft === canScrollLeft
          && currentState.canScrollRight === canScrollRight
        ) {
          return currentState
        }

        return { canScrollLeft, canScrollRight }
      })
    }

    let frameId = 0

    const scheduleScrollStateUpdate = () => {
      if (frameId) {
        return
      }

      frameId = window.requestAnimationFrame(() => {
        frameId = 0
        updateScrollState()
      })
    }

    updateScrollState()
    marquee.addEventListener('scroll', scheduleScrollStateUpdate, { passive: true })
    window.addEventListener('resize', scheduleScrollStateUpdate)

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }

      marquee.removeEventListener('scroll', scheduleScrollStateUpdate)
      window.removeEventListener('resize', scheduleScrollStateUpdate)
    }
  }, [isMobileReviews, reviews.length])

  const scrollRail = (direction) => {
    const marquee = marqueeRef.current

    if (!marquee) {
      return
    }

    marquee.scrollBy({
      left: direction * Math.max(marquee.clientWidth * 0.82, 280),
      behavior: 'smooth',
    })
  }

  const ReviewCardTag = isMobileReviews ? 'article' : motion.article

  return (
    <section id="reviews" className="oav-section oav-section--steel">
      <div className="oav-shell">
        <SectionIntro
          eyebrow="Client Reviews"
          title="What clients say after handover."
          description="Feedback from residential, office, and developer jobs where clean finishing, dependable timing, and professional site conduct mattered."
        />

        {isMobileReviews ? (
          <div className="oav-reviews-stage oav-reviews-stage--mobile">
            <button
              aria-label="Scroll reviews left"
              className="oav-reviews-arrow oav-reviews-arrow--left"
              disabled={!scrollState.canScrollLeft}
              onClick={() => scrollRail(-1)}
              type="button"
            >
              <ArrowIcon direction="left" />
            </button>

            <div
              aria-label="Client review cards"
              className="oav-reviews-marquee is-mobile"
              ref={marqueeRef}
              tabIndex={0}
            >
              <div className="oav-reviews-track is-mobile">
                {displayedReviews.map((review, index) => (
                  <ReviewCardTag
                    key={`${review.project}-${review.location}-${index}`}
                    aria-hidden={index >= reviews.length}
                    className="oav-review-card"
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

            <button
              aria-label="Scroll reviews right"
              className="oav-reviews-arrow oav-reviews-arrow--right"
              disabled={!scrollState.canScrollRight}
              onClick={() => scrollRail(1)}
              type="button"
            >
              <ArrowIcon />
            </button>
          </div>
        ) : (
          <div className="oav-reviews-marquee" ref={marqueeRef}>
            <div className="oav-reviews-track">
              {displayedReviews.map((review, index) => (
                <ReviewCardTag
                  key={`${review.project}-${review.location}-${index}`}
                  aria-hidden={index >= reviews.length}
                  className="oav-review-card"
                  {...reveal}
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
        )}
      </div>
    </section>
  )
}

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import SectionIntro from '../components/site/SectionIntro'

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
}

export default function ReviewsSection({ reviews }) {
  const [isMobileReviews, setIsMobileReviews] = useState(false)
  const marqueeRef = useRef(null)
  const swipeStartXRef = useRef(0)
  const swipeStartYRef = useRef(0)
  const isSwipingRef = useRef(false)
  const resumeTimeoutRef = useRef(0)
  const loopWidthRef = useRef(0)
  const displayedReviews = [...reviews, ...reviews]

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 760px)')
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

    let frameId = 0
    let lastTimestamp = 0
    const speed = 34

    const updateLoopWidth = () => {
      loopWidthRef.current = marquee.scrollWidth / 2
    }

    const normalizeScrollPosition = () => {
      const loopWidth = loopWidthRef.current

      if (!loopWidth) {
        return
      }

      if (marquee.scrollLeft >= loopWidth) {
        marquee.scrollLeft -= loopWidth
      }

      if (marquee.scrollLeft <= 0) {
        marquee.scrollLeft += loopWidth
      }
    }

    updateLoopWidth()
    marquee.scrollLeft = 1

    const animate = (timestamp) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp
      }

      const delta = timestamp - lastTimestamp
      lastTimestamp = timestamp

      if (!isSwipingRef.current) {
        marquee.scrollLeft += (speed * delta) / 1000
        normalizeScrollPosition()
      }

      frameId = window.requestAnimationFrame(animate)
    }

    window.addEventListener('resize', updateLoopWidth)
    frameId = window.requestAnimationFrame(animate)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.clearTimeout(resumeTimeoutRef.current)
      window.removeEventListener('resize', updateLoopWidth)
    }
  }, [isMobileReviews, reviews.length])

  const scheduleResume = () => {
    window.clearTimeout(resumeTimeoutRef.current)
    resumeTimeoutRef.current = window.setTimeout(() => {
      isSwipingRef.current = false
    }, 650)
  }

  const handleTouchStart = (event) => {
    swipeStartXRef.current = event.touches[0]?.clientX ?? 0
    swipeStartYRef.current = event.touches[0]?.clientY ?? 0
  }

  const handleTouchMove = (event) => {
    const currentX = event.touches[0]?.clientX ?? swipeStartXRef.current
    const currentY = event.touches[0]?.clientY ?? swipeStartYRef.current

    if (
      Math.abs(currentX - swipeStartXRef.current) > 8
      && Math.abs(currentX - swipeStartXRef.current) > Math.abs(currentY - swipeStartYRef.current)
    ) {
      isSwipingRef.current = true
      window.clearTimeout(resumeTimeoutRef.current)
    }
  }

  const handleTouchEnd = () => {
    swipeStartXRef.current = 0
    swipeStartYRef.current = 0

    if (isSwipingRef.current) {
      scheduleResume()
    }
  }

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
          onTouchEnd={isMobileReviews ? handleTouchEnd : undefined}
          onTouchMove={isMobileReviews ? handleTouchMove : undefined}
          onTouchStart={isMobileReviews ? handleTouchStart : undefined}
          ref={marqueeRef}
        >
          <div className={`oav-reviews-track ${isMobileReviews ? 'is-mobile' : ''}`}>
            {displayedReviews.map((review, index) => (
              <motion.article
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
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

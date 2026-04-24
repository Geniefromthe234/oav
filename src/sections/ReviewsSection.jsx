import { useEffect, useRef, useState } from 'react'
import SectionIntro from '../components/site/SectionIntro'

const MOBILE_BREAKPOINT = 760
const EDGE_TOLERANCE = 16
const DESKTOP_AUTO_SCROLL_SPEED = 26

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
  const mobileMarqueeRef = useRef(null)
  const desktopStageRef = useRef(null)
  const desktopTrackRef = useRef(null)

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

    const marquee = mobileMarqueeRef.current

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

  useEffect(() => {
    if (isMobileReviews) {
      return undefined
    }

    const stage = desktopStageRef.current
    const track = desktopTrackRef.current

    if (!stage || !track) {
      return undefined
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reduceMotion = prefersReducedMotion.matches
    let frameId = 0
    let lastTimestamp = 0
    let maxOffset = 0
    let currentOffset = 0
    let direction = 1
    let isPaused = false
    let isDocumentVisible = document.visibilityState === 'visible'
    let resizeObserver

    const applyOffset = () => {
      track.style.transform = `translate3d(${-currentOffset}px, 0, 0)`
    }

    const stopLoop = () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
        frameId = 0
      }

      lastTimestamp = 0
    }

    const measureBounds = () => {
      maxOffset = Math.max(track.scrollWidth - stage.clientWidth, 0)

      if (maxOffset <= EDGE_TOLERANCE) {
        currentOffset = 0
        direction = 1
      } else if (currentOffset > maxOffset) {
        currentOffset = maxOffset
      }

      applyOffset()
    }

    const step = (timestamp) => {
      frameId = 0

      if (reduceMotion || isPaused || !isDocumentVisible || maxOffset <= EDGE_TOLERANCE) {
        lastTimestamp = 0
        return
      }

      const elapsed = lastTimestamp ? Math.min(timestamp - lastTimestamp, 32) : 16
      const distance = (DESKTOP_AUTO_SCROLL_SPEED * elapsed) / 1000
      const nextOffset = currentOffset + distance * direction

      if (nextOffset >= maxOffset) {
        currentOffset = maxOffset
        direction = -1
      } else if (nextOffset <= 0) {
        currentOffset = 0
        direction = 1
      } else {
        currentOffset = nextOffset
      }

      lastTimestamp = timestamp
      applyOffset()
      frameId = window.requestAnimationFrame(step)
    }

    const scheduleLoop = () => {
      if (frameId || reduceMotion || isPaused || !isDocumentVisible || maxOffset <= EDGE_TOLERANCE) {
        return
      }

      frameId = window.requestAnimationFrame(step)
    }

    const syncReducedMotion = () => {
      reduceMotion = prefersReducedMotion.matches

      if (reduceMotion) {
        stopLoop()
        return
      }

      scheduleLoop()
    }

    const handleResize = () => {
      measureBounds()
      stopLoop()
      scheduleLoop()
    }

    const handlePointerEnter = () => {
      isPaused = true
      stopLoop()
    }

    const handlePointerLeave = () => {
      isPaused = false
      scheduleLoop()
    }

    const handleVisibilityChange = () => {
      isDocumentVisible = document.visibilityState === 'visible'

      if (!isDocumentVisible) {
        stopLoop()
        return
      }

      measureBounds()
      scheduleLoop()
    }

    if (typeof prefersReducedMotion.addEventListener === 'function') {
      prefersReducedMotion.addEventListener('change', syncReducedMotion)
    } else if (typeof prefersReducedMotion.addListener === 'function') {
      prefersReducedMotion.addListener(syncReducedMotion)
    }

    stage.addEventListener('pointerenter', handlePointerEnter)
    stage.addEventListener('pointerleave', handlePointerLeave)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    if ('ResizeObserver' in window) {
      resizeObserver = new window.ResizeObserver(handleResize)
      resizeObserver.observe(stage)
      resizeObserver.observe(track)
    } else {
      window.addEventListener('resize', handleResize)
    }

    measureBounds()
    scheduleLoop()

    return () => {
      stopLoop()
      track.style.transform = ''
      stage.removeEventListener('pointerenter', handlePointerEnter)
      stage.removeEventListener('pointerleave', handlePointerLeave)
      document.removeEventListener('visibilitychange', handleVisibilityChange)

      if (resizeObserver) {
        resizeObserver.disconnect()
      } else {
        window.removeEventListener('resize', handleResize)
      }

      if (typeof prefersReducedMotion.removeEventListener === 'function') {
        prefersReducedMotion.removeEventListener('change', syncReducedMotion)
      } else if (typeof prefersReducedMotion.removeListener === 'function') {
        prefersReducedMotion.removeListener(syncReducedMotion)
      }
    }
  }, [isMobileReviews, reviews.length])

  const scrollRail = (direction) => {
    const marquee = mobileMarqueeRef.current

    if (!marquee) {
      return
    }

    marquee.scrollBy({
      left: direction * Math.max(marquee.clientWidth * 0.82, 280),
      behavior: 'smooth',
    })
  }

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
              ref={mobileMarqueeRef}
              tabIndex={0}
            >
              <div className="oav-reviews-track is-mobile">
                {reviews.map((review, index) => (
                  <article
                    key={`${review.project}-${review.location}-${index}`}
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
                  </article>
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
          <div
            className="oav-reviews-stage oav-reviews-stage--desktop"
            ref={desktopStageRef}
          >
            <div className="oav-reviews-track" ref={desktopTrackRef}>
              {reviews.map((review, index) => (
                <article
                  key={`${review.project}-${review.location}-${index}`}
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
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

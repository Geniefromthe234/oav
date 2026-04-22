import { AnimatePresence, motion } from 'framer-motion'
import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import PortfolioCard from '../components/site/PortfolioCard'
import SectionIntro from '../components/site/SectionIntro'

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

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </svg>
  )
}

export default function PortfolioSection({ projects }) {
  const railRef = useRef(null)
  const [activeProject, setActiveProject] = useState(null)
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: projects.length > 1,
  })

  useEffect(() => {
    const rail = railRef.current

    if (!rail) {
      return undefined
    }

    const updateScrollState = () => {
      const maxScrollLeft = rail.scrollWidth - rail.clientWidth
      const canScrollLeft = rail.scrollLeft > EDGE_TOLERANCE
      const canScrollRight = rail.scrollLeft < maxScrollLeft - EDGE_TOLERANCE

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
    rail.addEventListener('scroll', scheduleScrollStateUpdate, { passive: true })
    window.addEventListener('resize', scheduleScrollStateUpdate)

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId)
      }

      rail.removeEventListener('scroll', scheduleScrollStateUpdate)
      window.removeEventListener('resize', scheduleScrollStateUpdate)
    }
  }, [projects.length])

  const scrollRail = (direction) => {
    const rail = railRef.current

    if (!rail) {
      return
    }

    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.82, 280),
      behavior: 'smooth',
    })
  }

  const handleRailWheel = (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || event.shiftKey) {
      return
    }

    event.preventDefault()
    window.scrollBy(0, event.deltaY)
  }

  useEffect(() => {
    if (!activeProject) {
      document.body.style.removeProperty('overflow')
      return undefined
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setActiveProject(null)
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.removeProperty('overflow')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeProject])

  const lightbox =
    typeof document !== 'undefined'
      ? createPortal(
        <AnimatePresence>
          {activeProject ? (
            <motion.div
              animate={{ opacity: 1 }}
              aria-label={`Full image view for ${activeProject.title}`}
              aria-modal="true"
              className="oav-portfolio-lightbox"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0 }}
              onClick={() => setActiveProject(null)}
              role="dialog"
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              <motion.div
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="oav-portfolio-lightbox-dialog"
                exit={{ opacity: 0, scale: 0.98, y: 16 }}
                initial={{ opacity: 0, scale: 0.96, y: 24 }}
                onClick={(event) => event.stopPropagation()}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <button
                  aria-label="Close full image"
                  className="oav-portfolio-lightbox-close"
                  onClick={() => setActiveProject(null)}
                  type="button"
                >
                  <CloseIcon />
                </button>

                <figure className="oav-portfolio-lightbox-figure">
                  <img
                    alt={activeProject.alt ?? activeProject.title}
                    decoding="async"
                    src={activeProject.imageLightbox ?? activeProject.image}
                    style={activeProject.imagePosition ? { objectPosition: activeProject.imagePosition } : undefined}
                  />
                  <figcaption className="oav-portfolio-lightbox-caption">
                    <strong>{activeProject.title}</strong>
                    <span>{activeProject.subtitle}</span>
                  </figcaption>
                </figure>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>,
        document.body,
      )
      : null

  return (
    <section id="portfolio" className="oav-section oav-section--dark">
      <div className="oav-shell">
        <SectionIntro
          eyebrow="Portfolio"
          title="Selected projects."
          description="Swipe through residential envelopes, interior glass, and finished metalwork delivered with OAV's clean installation language."
        />
        <div className="oav-portfolio-stage">
          <button
            aria-label="Scroll projects left"
            className="oav-portfolio-arrow oav-portfolio-arrow--left"
            disabled={!scrollState.canScrollLeft}
            onClick={() => scrollRail(-1)}
            type="button"
          >
            <ArrowIcon direction="left" />
          </button>

          <div
            aria-label="Selected OAV project cards"
            className="oav-portfolio-rail"
            onWheel={handleRailWheel}
            ref={railRef}
          >
            {projects.map((project, index) => (
              <PortfolioCard
                key={project.title}
                index={index + 1}
                onOpen={setActiveProject}
                project={project}
              />
            ))}
          </div>

          <button
            aria-label="Scroll projects right"
            className="oav-portfolio-arrow oav-portfolio-arrow--right"
            disabled={!scrollState.canScrollRight}
            onClick={() => scrollRail(1)}
            type="button"
          >
            <ArrowIcon />
          </button>
        </div>
      </div>

      {lightbox}
    </section>
  )
}

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import HeroCardStack from '../components/site/HeroCardStack'

const heroServices = [
  { label: 'Window Installation', icon: 'window' },
  { label: 'Door Installation', icon: 'door' },
  { label: 'Home Maintenance', icon: 'home' },
  { label: 'Water Collectors', icon: 'water' },
  { label: 'Stainless Railings', icon: 'railing' },
]

const slideVariants = {
  enter:  (d) => ({ opacity: 0, x: d >= 0 ? 60 : -60 }),
  center: { opacity: 1, x: 0, transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } },
  exit:   (d) => ({ opacity: 0, x: d >= 0 ? -60 : 60, transition: { duration: 0.6, ease: [0.4, 0, 1, 1] } }),
}

const TYPE_SPEED = 54
const DELETE_SPEED = 26

function slideTitleToText(slide) {
  return (slide.titleLines ?? [slide.title]).join('\n')
}

function renderEyebrow(slide) {
  if (!slide.eyebrowMobileLines?.length) {
    return slide.eyebrow
  }

  return slide.eyebrowMobileLines.map((line) => (
    <span key={`${slide.title}-${line}`} className="oav-hero-kicker-mobile-line">
      {line}
    </span>
  ))
}

function ServiceIcon({ type }) {
  if (type === 'window') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect x="4" y="5" width="16" height="14" rx="1" />
        <path d="M12 5v14M4 12h16" />
      </svg>
    )
  }

  if (type === 'door') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M7 20V5l9-2v17" />
        <path d="M7 20h10" />
        <circle cx="13" cy="12" r="1" fill="currentColor" stroke="none" />
      </svg>
    )
  }

  if (type === 'home') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M4 11.5 12 5l8 6.5" />
        <path d="M6 10.5V19h12v-8.5" />
      </svg>
    )
  }

  if (type === 'water') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <path d="M12 4c3 4 5 6.4 5 9a5 5 0 1 1-10 0c0-2.6 2-5 5-9Z" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 18h14" />
      <path d="M7 18V8h10v10" />
      <path d="M7 12h10" />
    </svg>
  )
}

export default function HeroSection({ isActive = true, slides }) {
  const prefersReducedMotion = useReducedMotion()
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState(1)
  const [typedTitle, setTypedTitle] = useState(() => (
    prefersReducedMotion ? slideTitleToText(slides[0]) : ''
  ))
  const typedTitleRef = useRef(typedTitle)

  useEffect(() => {
    if (prefersReducedMotion || !isActive) return undefined

    const id = window.setInterval(() => {
      setDirection(1)
      setActiveIndex((c) => (c + 1) % slides.length)
    }, 13000)

    return () => window.clearInterval(id)
  }, [activeIndex, isActive, prefersReducedMotion, slides.length])

  useEffect(() => {
    typedTitleRef.current = typedTitle
  }, [typedTitle])

  const activeSlide = slides[activeIndex]
  const typedLines = typedTitle.split('\n')
  const renderedTitleLines =
    typedLines.length > 1 && typedLines[typedLines.length - 1] === ''
      ? typedLines.slice(0, -1)
      : typedLines
  const cursorLineIndex = Math.max(renderedTitleLines.length - 1, 0)

  const goToSlide = (i) => {
    if (i === activeIndex) return
    setDirection(i > activeIndex ? 1 : -1)
    setActiveIndex(i)
  }

  useEffect(() => {
    const nextTitle = slideTitleToText(slides[activeIndex])

    if (prefersReducedMotion || !isActive) {
      setTypedTitle(nextTitle)
      typedTitleRef.current = nextTitle
      return undefined
    }

    let timeoutId
    let cancelled = false

    const deleteCurrent = () => {
      if (cancelled) {
        return
      }

      const currentValue = typedTitleRef.current

      if (!currentValue.length) {
        typeNext(0)
        return
      }

      const nextValue = currentValue.slice(0, -1)
      typedTitleRef.current = nextValue
      setTypedTitle(nextValue)
      timeoutId = window.setTimeout(deleteCurrent, DELETE_SPEED)
    }

    const typeNext = (index) => {
      if (cancelled) {
        return
      }

      const nextValue = nextTitle.slice(0, index + 1)
      typedTitleRef.current = nextValue
      setTypedTitle(nextValue)

      if (index < nextTitle.length - 1) {
        timeoutId = window.setTimeout(
          () => typeNext(index + 1),
          nextTitle[index] === '\n' ? TYPE_SPEED * 2 : TYPE_SPEED,
        )
      }
    }

    if (typedTitleRef.current === nextTitle) {
      return undefined
    }

    timeoutId = window.setTimeout(deleteCurrent, typedTitleRef.current ? 140 : 0)

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [activeIndex, isActive, prefersReducedMotion, slides])

  return (
    <section id="home" className={`oav-hero-section ${isActive ? 'is-active' : ''}`.trim()}>
      <div className="oav-shell oav-hero-layout">
        <div className="oav-hero-grid">
          <div className="oav-hero-copy">
            <div className="oav-hero-slide">
              <AnimatePresence custom={direction} mode="wait">
                <motion.p
                  key={`${activeSlide.title}-eyebrow`}
                  animate="center"
                  className={`oav-hero-kicker ${activeSlide.eyebrowClassName ?? ''}`.trim()}
                  custom={direction}
                  exit="exit"
                  initial="enter"
                  variants={prefersReducedMotion ? undefined : slideVariants}
                >
                  {renderEyebrow(activeSlide)}
                </motion.p>
              </AnimatePresence>

              <h1 aria-label={activeSlide.title}>
                {renderedTitleLines.map((line, index) => (
                  <span key={`typed-line-${index}`} className="oav-hero-type-line">
                    {line}
                    {index === cursorLineIndex ? (
                      <span aria-hidden="true" className="oav-hero-type-cursor" />
                    ) : null}
                  </span>
                ))}
              </h1>

              <AnimatePresence custom={direction} mode="wait">
                <motion.p
                  key={`${activeSlide.title}-description`}
                  animate="center"
                  className="oav-hero-description"
                  custom={direction}
                  exit="exit"
                  initial="enter"
                  variants={prefersReducedMotion ? undefined : slideVariants}
                >
                  {activeSlide.copy}
                </motion.p>
              </AnimatePresence>
            </div>

            <div className="oav-hero-actions">
              <a className="oav-button oav-button--primary" href="#services">Explore Services</a>
              <a className="oav-button oav-button--secondary oav-button--hero-outline" href="#portfolio">View Portfolio</a>
            </div>

            <div className="oav-slide-nav" role="tablist" aria-label="Hero navigation">
              {slides.map((slide, i) => (
                <button
                  key={slide.label}
                  aria-selected={activeIndex === i}
                  className={activeIndex === i ? 'is-active' : ''}
                  onClick={() => goToSlide(i)}
                  type="button"
                >
                  <span>{String(i + 1).padStart(2, '0')}</span>
                  <strong>{slide.label}</strong>
                </button>
              ))}
            </div>
          </div>

          <HeroCardStack isActive={isActive} prefersReducedMotion={prefersReducedMotion} />
        </div>
      </div>

      <div className="oav-shell oav-hero-bottom">
        <div className="oav-hero-lineup-band">
          <div
            className={`oav-hero-lineup-track ${prefersReducedMotion ? 'is-static' : ''}`}
          >
            {[...heroServices, ...heroServices].map((service, index) => (
              <div
                key={`${service.label}-${index}`}
                aria-hidden={index >= heroServices.length}
                className="oav-hero-lineup-item"
              >
                <span className="oav-hero-lineup-icon">
                  <ServiceIcon type={service.icon} />
                </span>
                <span>{service.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

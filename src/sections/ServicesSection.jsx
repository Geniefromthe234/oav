import { useEffect, useRef, useState } from 'react'
import ServiceCard from '../components/site/ServiceCard'
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

export default function ServicesSection({ services }) {
  const railRef = useRef(null)
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: services.length > 1,
  })

  useEffect(() => {
    const rail = railRef.current

    if (!rail) {
      return undefined
    }

    const updateScrollState = () => {
      const maxScrollLeft = rail.scrollWidth - rail.clientWidth

      setScrollState({
        canScrollLeft: rail.scrollLeft > EDGE_TOLERANCE,
        canScrollRight: rail.scrollLeft < maxScrollLeft - EDGE_TOLERANCE,
      })
    }

    updateScrollState()
    rail.addEventListener('scroll', updateScrollState, { passive: true })
    window.addEventListener('resize', updateScrollState)

    return () => {
      rail.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
    }
  }, [services.length])

  const scrollRail = (direction) => {
    const rail = railRef.current

    if (!rail) {
      return
    }

    rail.scrollBy({
      left: direction * Math.max(rail.clientWidth * 0.86, 280),
      behavior: 'smooth',
    })
  }

  return (
    <section id="services" className="oav-section oav-section--steel">
      <div className="oav-shell">
        <SectionIntro
          eyebrow="Core Services"
          title="Five service areas. One installation standard."
          description="Windows, doors, railings, maintenance, and water collection - handled by one team, nationwide."
        />

        <div className="oav-services-grid oav-services-grid--desktop">
          {services.map((service, index) => (
            <ServiceCard key={service.title} index={index} service={service} />
          ))}
        </div>

        <div className="oav-services-stage oav-services-stage--mobile">
          <button
            aria-label="Scroll services left"
            className="oav-services-arrow oav-services-arrow--left"
            disabled={!scrollState.canScrollLeft}
            onClick={() => scrollRail(-1)}
            type="button"
          >
            <ArrowIcon direction="left" />
          </button>

          <div
            aria-label="Core services"
            className="oav-services-rail"
            ref={railRef}
            tabIndex={0}
          >
            {services.map((service, index) => (
              <article key={service.title} className="oav-service-mobile-card">
                <span className="oav-card-index">{String(index + 1).padStart(2, '0')}</span>
                <h3>{service.title}</h3>
                <p>{service.summary}</p>
                <ul className="oav-service-mobile-points">
                  {service.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <button
            aria-label="Scroll services right"
            className="oav-services-arrow oav-services-arrow--right"
            disabled={!scrollState.canScrollRight}
            onClick={() => scrollRail(1)}
            type="button"
          >
            <ArrowIcon />
          </button>
        </div>
      </div>
    </section>
  )
}

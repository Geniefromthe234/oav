import { useEffect, useRef, useState } from 'react'
import MetricStrip from '../components/site/MetricStrip'
import SectionIntro from '../components/site/SectionIntro'

export default function AboutSection({ highlights, isActive = true, principles, stats }) {
  const [activePrinciple, setActivePrinciple] = useState(0)
  const [isMobilePrinciples, setIsMobilePrinciples] = useState(false)
  const touchStartX = useRef(0)
  const touchCurrentX = useRef(0)
  const totalPrinciples = principles.length

  const goToPrinciple = (index) => {
    setActivePrinciple((index + totalPrinciples) % totalPrinciples)
  }

  const shiftPrinciple = (step) => {
    setActivePrinciple((current) => (current + step + totalPrinciples) % totalPrinciples)
  }

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 760px)')
    const syncViewport = () => setIsMobilePrinciples(mediaQuery.matches)

    syncViewport()
    mediaQuery.addEventListener('change', syncViewport)

    return () => mediaQuery.removeEventListener('change', syncViewport)
  }, [])

  useEffect(() => {
    if (!isActive || !isMobilePrinciples || totalPrinciples <= 1) {
      return undefined
    }

    const intervalId = window.setInterval(() => {
      shiftPrinciple(1)
    }, 7000)

    return () => window.clearInterval(intervalId)
  }, [activePrinciple, isActive, isMobilePrinciples, totalPrinciples])

  useEffect(() => {
    if (!isMobilePrinciples) {
      setActivePrinciple(0)
    }
  }, [isMobilePrinciples])

  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0]?.clientX ?? 0
    touchCurrentX.current = touchStartX.current
  }

  const handleTouchMove = (event) => {
    touchCurrentX.current = event.touches[0]?.clientX ?? touchCurrentX.current
  }

  const handleTouchEnd = () => {
    const swipeDistance = touchCurrentX.current - touchStartX.current

    if (Math.abs(swipeDistance) < 48) {
      return
    }

    if (swipeDistance < 0) {
      shiftPrinciple(1)
      return
    }

    shiftPrinciple(-1)
  }

  return (
    <section
      id="about"
      className={`oav-section oav-section--deep ${isActive ? 'is-active' : ''}`.trim()}
    >
      <div className="oav-shell">
        <SectionIntro
          eyebrow="About OAV"
          title="Built in Lagos. Delivered nationwide."
          description="Founded in 2019, OAV installs aluminium, glass, and stainless steel systems across residential and commercial properties throughout Nigeria."
        />

        <div className="oav-about-grid">
          <article className="oav-about-story">
            <p>
              We work on new builds, private residences, commercial frontages, and upgrade projects
              that demand exact finishing and dependable site management. Every installation is
              handled by certified engineers — from first measurement to final handover.
            </p>
            <ul className="oav-rail-list">
              {highlights.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <MetricStrip className="oav-metric-strip--about" items={stats} />
          </article>

          <article className="oav-about-visual">
            <div className="oav-visual-stack">
              <span className="oav-card-tag">Project delivery</span>
              <h3>Structured for homes, offices, and multi-site work.</h3>
              <p>
                From consultation and fabrication coordination to installation and aftercare,
                the workflow keeps quality consistent regardless of project scale.
              </p>
            </div>
          </article>
        </div>

        <div className={`oav-principle-slider ${isMobilePrinciples ? 'is-mobile' : ''}`}>
          <div
            className="oav-principle-viewport"
            onTouchEnd={isMobilePrinciples ? handleTouchEnd : undefined}
            onTouchMove={isMobilePrinciples ? handleTouchMove : undefined}
            onTouchStart={isMobilePrinciples ? handleTouchStart : undefined}
          >
            <div
              className={`oav-principle-grid ${isMobilePrinciples ? 'is-carousel' : ''}`}
              style={
                isMobilePrinciples
                  ? { transform: `translateX(-${activePrinciple * 100}%)` }
                  : undefined
              }
            >
              {principles.map((principle, index) => (
                <article key={principle.title} className="oav-principle-card">
                  <span className="oav-card-index">{String(index + 1).padStart(2, '0')}</span>
                  <h3>{principle.title}</h3>
                  <p>{principle.copy}</p>
                </article>
              ))}
            </div>

            {isMobilePrinciples ? (
              <div className="oav-principle-dots" aria-label="Principles navigation" role="tablist">
                {principles.map((principle, index) => (
                  <button
                    key={principle.title}
                    aria-label={`Show principle ${index + 1}`}
                    aria-selected={activePrinciple === index}
                    className={`oav-principle-dot ${activePrinciple === index ? 'is-active' : ''}`}
                    onClick={() => goToPrinciple(index)}
                    role="tab"
                    type="button"
                  />
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}

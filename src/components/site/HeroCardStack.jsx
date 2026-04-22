import { useEffect, useState } from 'react'

const heroStackImages = [
  'https://res.cloudinary.com/dmeaeg0oy/image/upload/v1776648682/heroimage1_rrxjrt.jpg',
  'https://res.cloudinary.com/dmeaeg0oy/image/upload/v1776648682/heroimage5_zlhhko.jpg',
  'https://res.cloudinary.com/dmeaeg0oy/image/upload/v1776648682/heroimage4_vu28dl.jpg',
  'https://res.cloudinary.com/dmeaeg0oy/image/upload/v1776648681/heroimage3_pwymgl.jpg',
  'https://res.cloudinary.com/dmeaeg0oy/image/upload/v1776648681/heroimage6_rrp4iq.jpg',
  'https://res.cloudinary.com/dmeaeg0oy/image/upload/v1776648681/heroimage2_zchej6.jpg',
]

const stackTransforms = [
  { x: 34, y: 56, rotate: 10, scale: 1, hoverX: 46, hoverY: 68, hoverRotate: 13 },
  { x: 28, y: 46, rotate: 8, scale: 1, hoverX: 38, hoverY: 56, hoverRotate: 10 },
  { x: 22, y: 36, rotate: 6, scale: 1, hoverX: 30, hoverY: 44, hoverRotate: 8 },
  { x: 16, y: 26, rotate: 4, scale: 1, hoverX: 22, hoverY: 34, hoverRotate: 6 },
  { x: 8, y: 14, rotate: 1, scale: 1, hoverX: 12, hoverY: 20, hoverRotate: 3 },
  { x: -8, y: 0, rotate: -6, scale: 1, hoverX: -14, hoverY: 6, hoverRotate: -9 },
]

const FLIP_DURATION_MS = 1800
const HOLD_DURATION_MS = 6000

export default function HeroCardStack({ prefersReducedMotion = false }) {
  const [cards, setCards] = useState(heroStackImages)
  const [isFlipping, setIsFlipping] = useState(false)

  useEffect(() => {
    if (prefersReducedMotion) {
      return undefined
    }

    let holdTimeoutId
    let flipTimeoutId
    let cancelled = false

    const queueFlip = () => {
      holdTimeoutId = window.setTimeout(() => {
        if (cancelled) {
          return
        }

        setIsFlipping(true)

        flipTimeoutId = window.setTimeout(() => {
          if (cancelled) {
            return
          }

          setCards((currentCards) => [...currentCards.slice(1), currentCards[0]])
          setIsFlipping(false)
          queueFlip()
        }, FLIP_DURATION_MS)
      }, HOLD_DURATION_MS)
    }

    queueFlip()

    return () => {
      cancelled = true
      window.clearTimeout(holdTimeoutId)
      window.clearTimeout(flipTimeoutId)
    }
  }, [prefersReducedMotion])

  return (
    <div className="oav-hero-visual" aria-hidden="true">
      <div className="oav-hero-stack">
        <div className="oav-hero-stack-glass" />
        {cards.map((image, index) => {
          const nextImage = cards[(index + 1) % cards.length]
          const visibleIndex = cards.length - index - 1
          const transform = stackTransforms[visibleIndex]

          return (
            <article
              key={`${image}-${index}`}
              className={`oav-hero-stack-card ${isFlipping && index === 0 ? 'is-flipping' : ''}`.trim()}
              style={{
                '--stack-x': `${transform.x}px`,
                '--stack-y': `${transform.y}px`,
                '--stack-rotate': `${transform.rotate}deg`,
                '--stack-scale': `${transform.scale}`,
                '--stack-hover-x': `${transform.hoverX}px`,
                '--stack-hover-y': `${transform.hoverY}px`,
                '--stack-hover-rotate': `${transform.hoverRotate}deg`,
                '--stack-z': `${visibleIndex + 1}`,
              }}
            >
              <div className="oav-hero-stack-card-inner">
                <div className="oav-hero-stack-face oav-hero-stack-face--front">
                  <img
                    alt=""
                    decoding="async"
                    loading={index >= heroStackImages.length - 2 ? 'eager' : 'lazy'}
                    src={image}
                  />
                </div>

                <div className="oav-hero-stack-face oav-hero-stack-face--back">
                  <img alt="" decoding="async" loading="lazy" src={nextImage} />
                </div>
              </div>
            </article>
          )
        })}

        <div className="oav-hero-stack-badge">
          <span>Where Glass</span>
          <span>Meets Craft</span>
        </div>
      </div>
    </div>
  )
}

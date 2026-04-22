import { useEffect, useMemo, useRef, useState } from 'react'
import { useInView, useReducedMotion } from 'framer-motion'

const parseMetricValue = (value = '') => {
  const match = value.match(/^([^0-9]*)([\d,.]+)(.*)$/)

  if (!match) {
    return {
      decimals: 0,
      prefix: '',
      suffix: value,
      target: 0,
    }
  }

  const [, prefix, numericValue, suffix] = match
  const normalizedValue = numericValue.replace(/,/g, '')
  const [, decimals = ''] = normalizedValue.split('.')

  return {
    decimals: decimals.length,
    prefix,
    suffix,
    target: Number.parseFloat(normalizedValue) || 0,
  }
}

const formatMetricValue = (parsedValue, amount) => {
  const safeValue = Math.max(0, Math.min(parsedValue.target, amount))
  const formattedNumber = safeValue.toLocaleString('en-US', {
    minimumFractionDigits: parsedValue.decimals,
    maximumFractionDigits: parsedValue.decimals,
  })

  return `${parsedValue.prefix}${formattedNumber}${parsedValue.suffix}`
}

function CountUpMetric({ start, value }) {
  const prefersReducedMotion = useReducedMotion()
  const parsedValue = useMemo(() => parseMetricValue(value), [value])
  const [displayValue, setDisplayValue] = useState(
    prefersReducedMotion ? value : formatMetricValue(parsedValue, 0),
  )

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value)
      return undefined
    }

    if (!start) {
      setDisplayValue(formatMetricValue(parsedValue, 0))
      return undefined
    }

    let animationFrame = 0
    let startTime = 0
    const duration = 2400

    const animate = (timestamp) => {
      if (!startTime) {
        startTime = timestamp
      }

      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easedProgress = 1 - (1 - progress) ** 3
      setDisplayValue(formatMetricValue(parsedValue, parsedValue.target * easedProgress))

      if (progress < 1) {
        animationFrame = window.requestAnimationFrame(animate)
      }
    }

    animationFrame = window.requestAnimationFrame(animate)

    return () => window.cancelAnimationFrame(animationFrame)
  }, [parsedValue, prefersReducedMotion, start, value])

  return <>{displayValue}</>
}

export default function MetricStrip({ className = '', items }) {
  const metricStripRef = useRef(null)
  const metricsInView = useInView(metricStripRef, { amount: 0.4, once: true })

  return (
    <div
      ref={metricStripRef}
      className={['oav-metric-strip', className].filter(Boolean).join(' ')}
    >
      {items.map((item) => (
        <article key={item.label} className="oav-metric-item">
          <strong>
            <CountUpMetric start={metricsInView} value={item.value} />
          </strong>
          <span>{item.label}</span>
        </article>
      ))}
    </div>
  )
}

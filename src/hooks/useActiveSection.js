import { useEffect, useRef, useState } from 'react'
import {
  findActiveStackSectionFromMetrics,
  getCachedScrollStackMetrics,
  getHeaderBottomOffset,
  getScrollYForSectionProgress,
  getSectionTranslateY,
  getTrackingLineY,
  getViewportHeight,
  measureScrollStack,
} from '../utils/scrollStack'

function getInitialSection(sectionIds) {
  if (typeof window === 'undefined') {
    return sectionIds[0] ?? 'home'
  }

  const hashSection = window.location.hash.replace('#', '')

  return sectionIds.includes(hashSection) ? hashSection : (sectionIds[0] ?? 'home')
}

function getScrollBehavior() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
}

function getDocumentScrollHeight() {
  return Math.max(
    document.documentElement?.scrollHeight ?? 0,
    document.body?.scrollHeight ?? 0,
  )
}

function getScrollTargetTop(targetTop) {
  const headerBottomOffset = getHeaderBottomOffset()
  const maxScrollTop = Math.max(getDocumentScrollHeight() - getViewportHeight(), 0)

  return Math.min(Math.max(targetTop - headerBottomOffset, 0), maxScrollTop)
}

function getSections(sectionIds) {
  return sectionIds
    .map((id) => document.getElementById(id))
    .filter((section) => section instanceof HTMLElement)
}

function hasReachedTrackedLine(metrics, sectionId) {
  if (!metrics?.sections.length) {
    return false
  }

  const index = metrics.sections.findIndex((section) => section.id === sectionId)

  if (index < 0) {
    return false
  }

  const top = getSectionTranslateY(metrics, index, window.scrollY)
  const bottom = top + metrics.heights[index]
  const trackingLineY = getTrackingLineY()

  return trackingLineY >= top && trackingLineY < bottom
}

function getMetrics(sectionIds, metricsRef) {
  const sharedMetrics = getCachedScrollStackMetrics(sectionIds)

  if (sharedMetrics) {
    metricsRef.current = sharedMetrics
    return sharedMetrics
  }

  const measuredMetrics = measureScrollStack(sectionIds)

  metricsRef.current = measuredMetrics
  return measuredMetrics
}

export default function useActiveSection(sectionIds) {
  const [activeSection, setActiveSection] = useState(() => getInitialSection(sectionIds))
  const pendingTargetRef = useRef(null)
  const metricsRef = useRef(null)
  const scrollFrameRef = useRef(0)
  const sectionKey = sectionIds?.join('|') ?? ''

  useEffect(() => {
    if (!sectionIds.length) {
      return undefined
    }

    const resolveMetrics = () => getMetrics(sectionIds, metricsRef)

    const scrollToSection = (sectionId, { behavior = getScrollBehavior(), pushHash = false } = {}) => {
      const targetSection = document.getElementById(sectionId)
      const metrics = resolveMetrics()
      const targetTop = getScrollYForSectionProgress(metrics, sectionId, 0)

      if (!(targetSection instanceof HTMLElement) || targetTop === null) {
        return
      }

      pendingTargetRef.current = {
        id: sectionId,
        startedAt: window.performance.now(),
      }

      if (pushHash) {
        const nextHash = `#${sectionId}`

        if (window.location.hash !== nextHash) {
          window.history.pushState(null, '', nextHash)
        }
      }

      setActiveSection((current) => (current === sectionId ? current : sectionId))
      window.scrollTo({
        top: getScrollTargetTop(targetTop),
        behavior,
      })
    }

    const syncActiveSection = (metricsOverride = null) => {
      const metrics = metricsOverride || resolveMetrics()

      if (!metrics) {
        return
      }

      const pendingTarget = pendingTargetRef.current

      if (pendingTarget) {
        const pendingAge = window.performance.now() - pendingTarget.startedAt

        if (pendingAge < 2400 && !hasReachedTrackedLine(metrics, pendingTarget.id)) {
          setActiveSection((current) => (
            current === pendingTarget.id ? current : pendingTarget.id
          ))
          return
        }

        pendingTargetRef.current = null
      }

      const nextSection = findActiveStackSectionFromMetrics(metrics, sectionIds[0] ?? 'home')

      setActiveSection((current) => (current === nextSection ? current : nextSection))
    }

    const scheduleSyncActiveSection = () => {
      if (scrollFrameRef.current) {
        return
      }

      scrollFrameRef.current = window.requestAnimationFrame(() => {
        scrollFrameRef.current = 0
        syncActiveSection()
      })
    }

    const handleSectionLinkClick = (event) => {
      if (
        event.defaultPrevented
        || event.button !== 0
        || event.metaKey
        || event.ctrlKey
        || event.shiftKey
        || event.altKey
      ) {
        return
      }

      const target = event.target

      if (!(target instanceof Element)) {
        return
      }

      const link = target.closest('a[href^="#"]')
      const href = link?.getAttribute('href')

      if (!href || href === '#') {
        return
      }

      const sectionId = href.slice(1)

      if (!sectionIds.includes(sectionId)) {
        return
      }

      event.preventDefault()
      scrollToSection(sectionId, { pushHash: true })
    }

    const handleLocationChange = () => {
      const hashSection = window.location.hash.replace('#', '')

      if (!sectionIds.includes(hashSection)) {
        syncActiveSection()
        return
      }

      scrollToSection(hashSection, { behavior: 'auto' })
      syncActiveSection()
    }

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
          scheduleSyncActiveSection()
        })
        : null

    if (resizeObserver) {
      getSections(sectionIds).forEach((section) => resizeObserver.observe(section))
    }

    const visualViewport = window.visualViewport

    if (sectionIds.includes(window.location.hash.replace('#', ''))) {
      window.requestAnimationFrame(handleLocationChange)
    } else {
      syncActiveSection()
    }

    window.addEventListener('scroll', scheduleSyncActiveSection, { passive: true })
    window.addEventListener('resize', scheduleSyncActiveSection)
    window.addEventListener('hashchange', handleLocationChange)
    window.addEventListener('popstate', handleLocationChange)
    document.addEventListener('click', handleSectionLinkClick, true)

    if (visualViewport) {
      visualViewport.addEventListener('resize', scheduleSyncActiveSection, { passive: true })
    }

    return () => {
      if (scrollFrameRef.current) {
        window.cancelAnimationFrame(scrollFrameRef.current)
        scrollFrameRef.current = 0
      }

      window.removeEventListener('scroll', scheduleSyncActiveSection)
      window.removeEventListener('resize', scheduleSyncActiveSection)
      window.removeEventListener('hashchange', handleLocationChange)
      window.removeEventListener('popstate', handleLocationChange)
      document.removeEventListener('click', handleSectionLinkClick, true)

      if (visualViewport) {
        visualViewport.removeEventListener('resize', scheduleSyncActiveSection)
      }

      resizeObserver?.disconnect()
    }
  }, [sectionKey])

  const setManualActiveSection = (sectionId) => {
    if (!sectionIds.includes(sectionId)) {
      return
    }

    pendingTargetRef.current = {
      id: sectionId,
      startedAt: window.performance.now(),
    }
    setActiveSection(sectionId)
  }

  return { activeSection, setActiveSection: setManualActiveSection }
}

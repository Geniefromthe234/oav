import { useEffect, useRef, useState } from 'react'
import {
  findActiveStackSectionFromMetrics,
  getSectionTranslateY,
  getTrackingLineY,
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

export default function useActiveSection(sectionIds) {
  const [activeSection, setActiveSection] = useState(() => getInitialSection(sectionIds))
  const pendingTargetRef = useRef(null)
  const metricsRef = useRef(null)
  const scrollFrameRef = useRef(0)
  const metricsFrameRef = useRef(0)
  const viewportSnapshotRef = useRef(null)
  const sectionKey = sectionIds?.join('|') ?? ''

  useEffect(() => {
    if (!sectionIds.length) {
      return undefined
    }

    const refreshMetrics = () => {
      metricsRef.current = measureScrollStack(sectionIds)
      viewportSnapshotRef.current = getViewportSnapshot()
      return metricsRef.current
    }

    const getMetrics = () => metricsRef.current || refreshMetrics()

    function getViewportSnapshot() {
      const visualViewport = window.visualViewport

      return {
        height: visualViewport?.height ?? window.innerHeight,
        width: visualViewport?.width ?? window.innerWidth,
      }
    }

    function hasMeaningfulViewportChange() {
      const nextSnapshot = getViewportSnapshot()
      const previousSnapshot = viewportSnapshotRef.current

      if (!previousSnapshot) {
        viewportSnapshotRef.current = nextSnapshot
        return true
      }

      const metrics = metricsRef.current

      if (!metrics?.isStickyMode) {
        viewportSnapshotRef.current = nextSnapshot
        return true
      }

      const widthDelta = Math.abs(nextSnapshot.width - previousSnapshot.width)
      const heightDelta = Math.abs(nextSnapshot.height - previousSnapshot.height)
      const hasMeaningfulChange = widthDelta > 2 || heightDelta > 120

      if (hasMeaningfulChange) {
        viewportSnapshotRef.current = nextSnapshot
      }

      return hasMeaningfulChange
    }

    const hasReachedTrackedLine = (metrics, sectionId) => {
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

    const scrollToSection = (sectionId, { behavior = getScrollBehavior(), pushHash = false } = {}) => {
      const metrics = getMetrics()

      if (!metrics) {
        return
      }

      const index = metrics.sections.findIndex((section) => section.id === sectionId)
      const targetTop = index >= 0 ? metrics.zoneStarts[index] : null

      if (targetTop === null) {
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
      window.scrollTo({ top: targetTop, behavior })
    }

    const syncActiveSection = (metricsOverride = null) => {
      const metrics = metricsOverride || getMetrics()

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

    const scheduleMetricsRefresh = ({ force = false } = {}) => {
      if (!force && !hasMeaningfulViewportChange()) {
        return
      }

      if (metricsFrameRef.current) {
        return
      }

      metricsFrameRef.current = window.requestAnimationFrame(() => {
        metricsFrameRef.current = 0
        const metrics = refreshMetrics()

        syncActiveSection(metrics)
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

    refreshMetrics()

    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
          scheduleMetricsRefresh({ force: true })
        })
        : null

    if (resizeObserver) {
      sectionIds
        .map((id) => document.getElementById(id))
        .filter(Boolean)
        .forEach((section) => resizeObserver.observe(section))
    }

    const visualViewport = window.visualViewport

    if (sectionIds.includes(window.location.hash.replace('#', ''))) {
      window.requestAnimationFrame(handleLocationChange)
    } else {
      syncActiveSection()
    }

    window.addEventListener('scroll', scheduleSyncActiveSection, { passive: true })
    window.addEventListener('resize', scheduleMetricsRefresh)
    window.addEventListener('hashchange', handleLocationChange)
    window.addEventListener('popstate', handleLocationChange)
    document.addEventListener('click', handleSectionLinkClick, true)

    if (visualViewport) {
      visualViewport.addEventListener('resize', scheduleMetricsRefresh, { passive: true })
    }

    return () => {
      if (scrollFrameRef.current) {
        window.cancelAnimationFrame(scrollFrameRef.current)
        scrollFrameRef.current = 0
      }

      if (metricsFrameRef.current) {
        window.cancelAnimationFrame(metricsFrameRef.current)
        metricsFrameRef.current = 0
      }

      window.removeEventListener('scroll', scheduleSyncActiveSection)
      window.removeEventListener('resize', scheduleMetricsRefresh)
      window.removeEventListener('hashchange', handleLocationChange)
      window.removeEventListener('popstate', handleLocationChange)
      document.removeEventListener('click', handleSectionLinkClick, true)

      if (visualViewport) {
        visualViewport.removeEventListener('resize', scheduleMetricsRefresh)
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

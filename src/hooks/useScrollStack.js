import { useEffect } from 'react'
import {
  findActiveStackSectionFromMetrics,
  getScrollYForSectionProgress,
  getSectionScrollProgress,
  getSectionTranslateY,
  measureScrollStack,
} from '../utils/scrollStack'

export default function useScrollStack(sectionIds) {
  const sectionKey = sectionIds?.join('|') ?? ''

  useEffect(() => {
    if (!sectionIds || sectionIds.length < 2) {
      return undefined
    }

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean)

    if (sections.length < 2) {
      return undefined
    }

    const siteEl = sections[0].closest('.oav-site')
    const origStyles = sections.map((section) => section.getAttribute('style') || '')
    let metrics = null
    let updateFrameId = 0
    let measureFrameId = 0
    let preserveScrollOnMeasure = false
    let viewportSnapshot = null

    function getViewportSnapshot() {
      const visualViewport = window.visualViewport

      return {
        height: visualViewport?.height ?? window.innerHeight,
        width: visualViewport?.width ?? window.innerWidth,
      }
    }

    function isTextInputFocused() {
      const activeElement = document.activeElement

      if (!(activeElement instanceof HTMLElement)) {
        return false
      }

      const tagName = activeElement.tagName

      return (
        tagName === 'INPUT'
        || tagName === 'TEXTAREA'
        || tagName === 'SELECT'
        || activeElement.isContentEditable
      )
    }

    function shouldPreserveScrollPosition() {
      return !metrics?.isStickyMode
    }

    function hasMeaningfulViewportChange() {
      const nextSnapshot = getViewportSnapshot()

      if (!viewportSnapshot) {
        viewportSnapshot = nextSnapshot
        return true
      }

      if (!metrics?.isStickyMode) {
        viewportSnapshot = nextSnapshot
        return true
      }

      const widthDelta = Math.abs(nextSnapshot.width - viewportSnapshot.width)
      const heightDelta = Math.abs(nextSnapshot.height - viewportSnapshot.height)
      const hasMeaningfulChange = widthDelta > 2 || (heightDelta > 120 && isTextInputFocused())

      if (hasMeaningfulChange) {
        viewportSnapshot = nextSnapshot
      }

      return hasMeaningfulChange
    }

    function measure() {
      sections.forEach((section, index) => {
        if (origStyles[index]) {
          section.setAttribute('style', origStyles[index])
        } else {
          section.removeAttribute('style')
        }
      })

      if (siteEl) {
        siteEl.style.minHeight = ''
      }

      metrics = measureScrollStack(sectionIds)
      viewportSnapshot = getViewportSnapshot()

      if (!metrics) {
        return
      }

      sections.forEach((section, index) => {
        section.style.position = 'fixed'
        section.style.top = '0'
        section.style.left = '0'
        section.style.width = '100%'
        section.style.zIndex = String(index + 2)
        section.style.willChange = 'transform'
      })

      if (siteEl) {
        siteEl.style.minHeight = metrics.isStickyMode
          ? `${metrics.totalScrollHeight}px`
          : `${metrics.totalScrollHeight + metrics.viewportHeight}px`
      }
    }

    function scheduleUpdate() {
      if (updateFrameId || !metrics) {
        return
      }

      updateFrameId = requestAnimationFrame(() => {
        updateFrameId = 0

        const scrollY = window.scrollY

        sections.forEach((section, index) => {
          const translateY = Math.round(getSectionTranslateY(metrics, index, scrollY))

          section.style.transform = `translate3d(0, ${translateY}px, 0)`
        })
      })
    }

    function remeasure({ preserveScroll = false } = {}) {
      const shouldPreserveScroll = preserveScroll && shouldPreserveScrollPosition()
      const currentSectionId = shouldPreserveScroll && metrics
        ? findActiveStackSectionFromMetrics(metrics, sectionIds[0] ?? 'home')
        : null
      const currentSectionProgress = currentSectionId
        ? getSectionScrollProgress(metrics, currentSectionId)
        : 0

      measure()

      if (currentSectionId) {
        const preservedScrollY = getScrollYForSectionProgress(
          metrics,
          currentSectionId,
          currentSectionProgress,
        )

        if (
          typeof preservedScrollY === 'number'
          && Math.abs(window.scrollY - preservedScrollY) > 2
        ) {
          window.scrollTo({ top: preservedScrollY, behavior: 'auto' })
        }
      }

      scheduleUpdate()
    }

    function scheduleMeasure({ preserveScroll = false } = {}) {
      preserveScrollOnMeasure = preserveScrollOnMeasure || preserveScroll

      if (measureFrameId) {
        return
      }

      measureFrameId = requestAnimationFrame(() => {
        measureFrameId = 0

        const nextPreserveScroll = preserveScrollOnMeasure

        preserveScrollOnMeasure = false
        remeasure({ preserveScroll: nextPreserveScroll })
      })
    }

    function onResize() {
      if (!hasMeaningfulViewportChange()) {
        return
      }

      scheduleMeasure({ preserveScroll: shouldPreserveScrollPosition() })
    }

    measure()
    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    const visualViewport = window.visualViewport
    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
          if (metrics?.isStickyMode && !hasMeaningfulViewportChange()) {
            return
          }

          scheduleMeasure({ preserveScroll: shouldPreserveScrollPosition() })
        })
        : null

    if (visualViewport) {
      visualViewport.addEventListener('resize', onResize, { passive: true })
    }

    sections.forEach((section) => resizeObserver?.observe(section))

    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', onResize)

      if (visualViewport) {
        visualViewport.removeEventListener('resize', onResize)
      }

      if (updateFrameId) {
        cancelAnimationFrame(updateFrameId)
      }

      if (measureFrameId) {
        cancelAnimationFrame(measureFrameId)
      }

      resizeObserver?.disconnect()

      sections.forEach((section, index) => {
        if (origStyles[index]) {
          section.setAttribute('style', origStyles[index])
        } else {
          section.removeAttribute('style')
        }
      })

      if (siteEl) {
        siteEl.style.minHeight = ''
      }
    }
  }, [sectionKey])
}

import { useLayoutEffect } from 'react'
import {
  clearCachedScrollStackMetrics,
  measureScrollStack,
  setCachedScrollStackMetrics,
} from '../utils/scrollStack'

export default function useScrollStack(sectionIds) {
  const sectionKey = sectionIds?.join('|') ?? ''

  useLayoutEffect(() => {
    if (!sectionIds || sectionIds.length < 2) {
      return undefined
    }

    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter((section) => section instanceof HTMLElement)

    if (sections.length < 2) {
      return undefined
    }

    const lastIndex = sections.length - 1
    let metrics = null
    let measureFrameId = 0
    let viewportSnapshot = null

    function getViewportSnapshot() {
      const visualViewport = window.visualViewport

      return {
        height: visualViewport?.height ?? window.innerHeight,
        scale: visualViewport?.scale ?? 1,
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

    function hasMeaningfulViewportChange() {
      const nextSnapshot = getViewportSnapshot()

      if (!viewportSnapshot) {
        viewportSnapshot = nextSnapshot
        return true
      }

      const widthDelta = Math.abs(nextSnapshot.width - viewportSnapshot.width)
      const heightDelta = Math.abs(nextSnapshot.height - viewportSnapshot.height)
      const scaleDelta = Math.abs(nextSnapshot.scale - viewportSnapshot.scale)
      const heightThreshold = isTextInputFocused() ? 120 : 24
      const hasMeaningfulChange =
        widthDelta > 2
        || heightDelta > heightThreshold
        || scaleDelta > 0.01

      if (hasMeaningfulChange) {
        viewportSnapshot = nextSnapshot
      }

      return hasMeaningfulChange
    }

    function clearStackStyles(section) {
      if (!(section instanceof HTMLElement)) {
        return
      }

      section.style.removeProperty('--oav-stack-top')
      section.style.removeProperty('--oav-stack-layer')
      section.style.removeProperty('--oav-stack-trigger')
      section.style.removeProperty('--oav-stack-height')
      section.style.removeProperty('z-index')
      section.style.removeProperty('top')
      section.style.removeProperty('position')
      section.style.removeProperty('transform')
      section.style.removeProperty('will-change')
      section.style.removeProperty('left')
      section.style.removeProperty('width')
      delete section.dataset.stackPanel
    }

    function applyMetrics() {
      sections.forEach((section) => {
        delete section.dataset.stackPanel
      })

      metrics = measureScrollStack(sectionIds)
      setCachedScrollStackMetrics(sectionIds, metrics)
      viewportSnapshot = getViewportSnapshot()

      if (!metrics) {
        return
      }

      sections.forEach((section, index) => {
        const panelHeight = metrics.heights[index]
        const stickyTop = metrics.stackTriggerY - panelHeight

        clearStackStyles(section)

        if (index >= lastIndex) {
          return
        }

        section.dataset.stackPanel = 'true'
        section.style.setProperty('--oav-stack-height', `${panelHeight}px`)
        section.style.setProperty('--oav-stack-layer', String(index + 2))
        section.style.setProperty('--oav-stack-top', `${stickyTop}px`)
        section.style.setProperty('--oav-stack-trigger', `${metrics.stackTriggerY}px`)
      })
    }

    function scheduleMeasure() {
      if (measureFrameId) {
        return
      }

      measureFrameId = window.requestAnimationFrame(() => {
        measureFrameId = 0
        applyMetrics()
      })
    }

    function onResize() {
      if (!hasMeaningfulViewportChange()) {
        return
      }

      scheduleMeasure()
    }

    applyMetrics()
    window.addEventListener('resize', onResize, { passive: true })

    const visualViewport = window.visualViewport
    const resizeObserver =
      typeof ResizeObserver !== 'undefined'
        ? new ResizeObserver(() => {
          scheduleMeasure()
        })
        : null

    if (visualViewport) {
      visualViewport.addEventListener('resize', onResize, { passive: true })
    }

    sections.forEach((section) => resizeObserver?.observe(section))

    return () => {
      window.removeEventListener('resize', onResize)

      if (visualViewport) {
        visualViewport.removeEventListener('resize', onResize)
      }

      if (measureFrameId) {
        window.cancelAnimationFrame(measureFrameId)
      }

      resizeObserver?.disconnect()

      sections.forEach((section) => {
        clearStackStyles(section)
      })

      clearCachedScrollStackMetrics(sectionIds)
    }
  }, [sectionKey])
}

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
        siteEl.style.minHeight = `${metrics.totalScrollHeight + metrics.viewportHeight}px`
      }
    }

    let pending = false

    function scheduleUpdate() {
      if (pending || !metrics) {
        return
      }

      pending = true

      requestAnimationFrame(() => {
        pending = false

        const scrollY = window.scrollY

        sections.forEach((section, index) => {
          section.style.transform = `translateY(${getSectionTranslateY(metrics, index, scrollY)}px)`
        })
      })
    }

    function onResize() {
      const currentSectionId = findActiveStackSectionFromMetrics(metrics, sectionIds[0] ?? 'home')
      const currentSectionProgress = getSectionScrollProgress(metrics, currentSectionId)

      measure()

      const resizedSectionId = findActiveStackSectionFromMetrics(metrics, sectionIds[0] ?? 'home')

      if (currentSectionId !== resizedSectionId) {
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

    measure()
    scheduleUpdate()
    window.addEventListener('scroll', scheduleUpdate, { passive: true })
    window.addEventListener('resize', onResize, { passive: true })

    return () => {
      window.removeEventListener('scroll', scheduleUpdate)
      window.removeEventListener('resize', onResize)

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

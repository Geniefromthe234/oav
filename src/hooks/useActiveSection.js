import { useEffect, useRef, useState } from 'react'
import {
  findActiveStackSection,
  getSectionScrollTop,
  hasReachedStackSection,
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
  const sectionKey = sectionIds?.join('|') ?? ''

  useEffect(() => {
    if (!sectionIds.length) {
      return undefined
    }

    const scrollToSection = (sectionId, { behavior = getScrollBehavior(), pushHash = false } = {}) => {
      const targetTop = getSectionScrollTop(sectionIds, sectionId)

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

    const syncActiveSection = () => {
      const pendingTarget = pendingTargetRef.current

      if (pendingTarget) {
        const pendingAge = window.performance.now() - pendingTarget.startedAt

        if (pendingAge < 2400 && !hasReachedStackSection(sectionIds, pendingTarget.id)) {
          setActiveSection((current) => (
            current === pendingTarget.id ? current : pendingTarget.id
          ))
          return
        }

        pendingTargetRef.current = null
      }

      const nextSection = findActiveStackSection(sectionIds)

      setActiveSection((current) => (current === nextSection ? current : nextSection))
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

    if (sectionIds.includes(window.location.hash.replace('#', ''))) {
      window.requestAnimationFrame(handleLocationChange)
    } else {
      syncActiveSection()
    }

    window.addEventListener('scroll', syncActiveSection, { passive: true })
    window.addEventListener('resize', syncActiveSection)
    window.addEventListener('hashchange', handleLocationChange)
    window.addEventListener('popstate', handleLocationChange)
    document.addEventListener('click', handleSectionLinkClick, true)

    return () => {
      window.removeEventListener('scroll', syncActiveSection)
      window.removeEventListener('resize', syncActiveSection)
      window.removeEventListener('hashchange', handleLocationChange)
      window.removeEventListener('popstate', handleLocationChange)
      document.removeEventListener('click', handleSectionLinkClick, true)
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

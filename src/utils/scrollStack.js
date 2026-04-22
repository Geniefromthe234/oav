export const TRANSITION_PX = 600
const MOBILE_BREAKPOINT = 760

function isMobileViewport() {
  return typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
}

function getHeaderHeight() {
  return document.querySelector('.oav-header')?.offsetHeight ?? 0
}

function getViewportHeight() {
  if (typeof window === 'undefined') {
    return 0
  }

  const visualViewport = window.visualViewport

  if (visualViewport && visualViewport.scale === 1 && visualViewport.height > 0) {
    return visualViewport.height
  }

  return document.documentElement?.clientHeight || window.innerHeight
}

export function getStackSections(sectionIds) {
  return sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean)
}

function getMobileStackTriggerY(viewportHeight) {
  const headerHeight = getHeaderHeight()

  return headerHeight + Math.max((viewportHeight - headerHeight) * 0.5, 0)
}

function getNaturalZoneStarts(sections) {
  const originalStyles = sections.map((section) => section.getAttribute('style'))

  sections.forEach((section) => {
    section.removeAttribute('style')
  })

  const zoneStarts = sections.map((section) => (
    Math.round(section.getBoundingClientRect().top + window.scrollY)
  ))

  sections.forEach((section, index) => {
    const originalStyle = originalStyles[index]

    if (originalStyle === null) {
      section.removeAttribute('style')
      return
    }

    section.setAttribute('style', originalStyle)
  })

  return zoneStarts
}

export function measureScrollStack(sectionIds) {
  if (typeof window === 'undefined') {
    return null
  }

  const sections = getStackSections(sectionIds)

  if (!sections.length) {
    return null
  }

  const viewportHeight = getViewportHeight()
  const heights = sections.map((section) => section.offsetHeight)

  if (isMobileViewport()) {
    const zoneStarts = getNaturalZoneStarts(sections)

    const lastIndex = sections.length - 1
    const zoneLengths = sections.map((_, i) => {
      if (i < lastIndex) {
        return zoneStarts[i + 1] - zoneStarts[i]
      }

      return heights[i]
    })

    return {
      contentScrollHeights: heights.map((height) => Math.max(height - viewportHeight, 0)),
      heights,
      isStickyMode: true,
      sections,
      stackTriggerY: getMobileStackTriggerY(viewportHeight),
      totalScrollHeight: zoneStarts[lastIndex] + heights[lastIndex],
      viewportHeight,
      zoneLengths,
      zoneStarts,
    }
  }

  const contentScrollHeights = heights.map((height) => Math.max(height - viewportHeight, 0))
  const zoneLengths = heights.map((_, index) => (
    contentScrollHeights[index] + (index < heights.length - 1 ? TRANSITION_PX : 0)
  ))

  let cumulativeLength = 0
  const zoneStarts = zoneLengths.map((length) => {
    const zoneStart = cumulativeLength
    cumulativeLength += length
    return zoneStart
  })

  return {
    contentScrollHeights,
    heights,
    sections,
    totalScrollHeight: cumulativeLength,
    viewportHeight,
    zoneLengths,
    zoneStarts,
  }
}

export function getSectionTranslateY(metrics, index, scrollY) {
  if (metrics.isStickyMode) {
    const naturalTop = metrics.zoneStarts[index] - scrollY
    const nextZoneStart = metrics.zoneStarts[index + 1]

    if (typeof nextZoneStart !== 'number') {
      return naturalTop
    }

    const stackTriggerY = metrics.stackTriggerY ?? getMobileStackTriggerY(metrics.viewportHeight)
    const freezeStart = nextZoneStart - stackTriggerY

    if (scrollY >= freezeStart) {
      return stackTriggerY - metrics.heights[index]
    }

    return naturalTop
  }

  const zoneStart = metrics.zoneStarts[index]
  const contentScrollHeight = metrics.contentScrollHeights[index]
  const height = metrics.heights[index]
  const contentEnd = zoneStart + contentScrollHeight
  const lastIndex = metrics.sections.length - 1
  const nextFullyIn = index < lastIndex ? metrics.zoneStarts[index + 1] : Infinity

  if (index > 0 && scrollY <= zoneStart - TRANSITION_PX) {
    return metrics.viewportHeight
  }

  if (index > 0 && scrollY <= zoneStart) {
    return metrics.viewportHeight * (1 - (scrollY - (zoneStart - TRANSITION_PX)) / TRANSITION_PX)
  }

  const scrollStart = index === 0 ? 0 : zoneStart

  if (scrollY <= contentEnd) {
    return -(scrollY - scrollStart)
  }

  if (scrollY < nextFullyIn) {
    return -contentScrollHeight
  }

  return -height
}

export function getTrackingLineY() {
  const headerHeight = getHeaderHeight()
  const viewportOffset = Math.min(Math.max(getViewportHeight() * 0.32, 120), 240)

  return headerHeight + viewportOffset
}

export function findActiveStackSectionFromMetrics(metrics, fallbackSectionId = 'home', scrollY = window.scrollY) {
  if (!metrics?.sections.length) {
    return fallbackSectionId
  }

  if (metrics.isStickyMode) {
    const trackingLineY = getTrackingLineY()
    let active = metrics.sections[0].id

    for (let i = 0; i < metrics.sections.length; i++) {
      const rect = metrics.sections[i].getBoundingClientRect()

      if (rect.top <= trackingLineY && rect.bottom > 0) {
        active = metrics.sections[i].id
      }
    }

    return active
  }

  if (scrollY >= metrics.totalScrollHeight - 4) {
    return metrics.sections[metrics.sections.length - 1].id
  }

  const trackingLineY = getTrackingLineY()
  let fallbackId = metrics.sections[0].id
  let activeId = null

  metrics.sections.forEach((section, index) => {
    const top = getSectionTranslateY(metrics, index, scrollY)
    const bottom = top + metrics.heights[index]

    if (top <= trackingLineY) {
      fallbackId = section.id
    }

    if (trackingLineY >= top && trackingLineY < bottom) {
      activeId = section.id
    }
  })

  return activeId ?? fallbackId
}

export function getSectionScrollProgress(metrics, sectionId, scrollY = window.scrollY) {
  if (!metrics?.sections.length) {
    return 0
  }

  const index = metrics.sections.findIndex((section) => section.id === sectionId)

  if (index < 0) {
    return 0
  }

  const zoneStart = metrics.zoneStarts[index]
  const zoneLength = metrics.zoneLengths[index]

  if (zoneLength <= 0) {
    return 0
  }

  const offset = Math.min(Math.max(scrollY - zoneStart, 0), zoneLength)

  return offset / zoneLength
}

export function getScrollYForSectionProgress(metrics, sectionId, progress = 0) {
  if (!metrics?.sections.length) {
    return null
  }

  const index = metrics.sections.findIndex((section) => section.id === sectionId)

  if (index < 0) {
    return null
  }

  const clampedProgress = Math.min(Math.max(progress, 0), 1)

  return metrics.zoneStarts[index] + Math.round(metrics.zoneLengths[index] * clampedProgress)
}

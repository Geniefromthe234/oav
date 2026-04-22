export const TRANSITION_PX = 600
const MOBILE_TRANSITION_PX = 320
const MOBILE_BREAKPOINT = 760

function getTransitionPx() {
  if (typeof window !== 'undefined' && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches) {
    return MOBILE_TRANSITION_PX
  }

  return TRANSITION_PX
}

export function getStackSections(sectionIds) {
  return sectionIds
    .map((id) => document.getElementById(id))
    .filter(Boolean)
}

export function measureScrollStack(sectionIds) {
  if (typeof window === 'undefined') {
    return null
  }

  const sections = getStackSections(sectionIds)

  if (!sections.length) {
    return null
  }

  const viewportHeight = window.innerHeight
  const transitionPx = getTransitionPx()
  const heights = sections.map((section) => section.offsetHeight)
  const contentScrollHeights = heights.map((height) => Math.max(height - viewportHeight, 0))
  const zoneLengths = heights.map((_, index) => (
    contentScrollHeights[index] + (index < heights.length - 1 ? transitionPx : 0)
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
    transitionPx,
    zoneLengths,
    zoneStarts,
  }
}

export function getSectionTranslateY(metrics, index, scrollY) {
  const zoneStart = metrics.zoneStarts[index]
  const contentScrollHeight = metrics.contentScrollHeights[index]
  const height = metrics.heights[index]
  const transitionPx = metrics.transitionPx ?? TRANSITION_PX
  const contentEnd = zoneStart + contentScrollHeight
  const lastIndex = metrics.sections.length - 1
  const nextFullyIn = index < lastIndex ? metrics.zoneStarts[index + 1] : Infinity

  if (index > 0 && scrollY <= zoneStart - transitionPx) {
    return metrics.viewportHeight
  }

  if (index > 0 && scrollY <= zoneStart) {
    return metrics.viewportHeight * (1 - (scrollY - (zoneStart - transitionPx)) / transitionPx)
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

export function getSectionScrollTop(sectionIds, sectionId) {
  const metrics = measureScrollStack(sectionIds)

  if (!metrics) {
    return null
  }

  const index = metrics.sections.findIndex((section) => section.id === sectionId)

  return index >= 0 ? metrics.zoneStarts[index] : null
}

export function getTrackingLineY() {
  const header = document.querySelector('.oav-header')
  const headerHeight = header?.offsetHeight ?? 0
  const viewportOffset = Math.min(Math.max(window.innerHeight * 0.32, 120), 240)

  return headerHeight + viewportOffset
}

export function findActiveStackSectionFromMetrics(metrics, fallbackSectionId = 'home', scrollY = window.scrollY) {
  if (!metrics?.sections.length) {
    return fallbackSectionId
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

export function findActiveStackSection(sectionIds) {
  const metrics = measureScrollStack(sectionIds)

  return findActiveStackSectionFromMetrics(metrics, sectionIds[0] ?? 'home')
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

export function hasReachedStackSection(sectionIds, sectionId) {
  const metrics = measureScrollStack(sectionIds)

  if (!metrics) {
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

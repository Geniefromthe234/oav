const MOBILE_BREAKPOINT = 760
const MOBILE_TRIGGER_RATIO = 0.5
const DESKTOP_TRIGGER_RATIO = 0.8
let cachedMetrics = null
let cachedSectionKey = ''

function getSectionKey(sectionIds) {
  return sectionIds?.join('|') ?? ''
}

function isMobileViewport() {
  return typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
}

function getHeaderElement() {
  return document.querySelector('.oav-header')
}

export function getViewportHeight() {
  if (typeof window === 'undefined') {
    return 0
  }

  const visualViewport = window.visualViewport

  if (visualViewport && visualViewport.scale === 1 && visualViewport.height > 0) {
    return visualViewport.height
  }

  return document.documentElement?.clientHeight || window.innerHeight
}

export function getHeaderBottomOffset() {
  const header = getHeaderElement()

  if (!(header instanceof HTMLElement)) {
    return 0
  }

  return Math.max(header.getBoundingClientRect().bottom, header.offsetHeight, 0)
}

export function getTrackingLineY() {
  const headerBottomOffset = getHeaderBottomOffset()
  const viewportOffset = Math.min(Math.max(getViewportHeight() * 0.32, 120), 240)

  return headerBottomOffset + viewportOffset
}

export function getStackTriggerY(viewportHeight = getViewportHeight()) {
  const desiredTriggerY = Math.round(
    viewportHeight * (isMobileViewport() ? MOBILE_TRIGGER_RATIO : DESKTOP_TRIGGER_RATIO),
  )

  return Math.max(desiredTriggerY, getHeaderBottomOffset() + 8)
}

export function getStackSections(sectionIds) {
  return sectionIds
    .map((id) => document.getElementById(id))
    .filter((section) => section instanceof HTMLElement)
}

export function getCachedScrollStackMetrics(sectionIds) {
  const sectionKey = getSectionKey(sectionIds)

  if (!sectionKey || cachedSectionKey !== sectionKey) {
    return null
  }

  return cachedMetrics
}

export function setCachedScrollStackMetrics(sectionIds, metrics) {
  cachedSectionKey = getSectionKey(sectionIds)
  cachedMetrics = metrics
}

export function clearCachedScrollStackMetrics(sectionIds) {
  const sectionKey = getSectionKey(sectionIds)

  if (sectionKey && cachedSectionKey !== sectionKey) {
    return
  }

  cachedSectionKey = ''
  cachedMetrics = null
}

function withNaturalFlow(sections, callback) {
  const snapshots = sections.map((section) => ({
    stackPanel: section.dataset.stackPanel,
    style: section.getAttribute('style'),
  }))

  sections.forEach((section) => {
    delete section.dataset.stackPanel
    section.removeAttribute('style')
  })

  const result = callback()

  sections.forEach((section, index) => {
    const snapshot = snapshots[index]

    if (snapshot.style === null) {
      section.removeAttribute('style')
    } else {
      section.setAttribute('style', snapshot.style)
    }

    if (typeof snapshot.stackPanel === 'string') {
      section.dataset.stackPanel = snapshot.stackPanel
    } else {
      delete section.dataset.stackPanel
    }
  })

  return result
}

export function measureScrollStack(sectionIds) {
  if (typeof window === 'undefined') {
    return null
  }

  const sections = getStackSections(sectionIds)

  if (!sections.length) {
    return null
  }

  return withNaturalFlow(sections, () => {
    const viewportHeight = getViewportHeight()
    const heights = sections.map((section) => Math.round(section.getBoundingClientRect().height))
    const zoneStarts = sections.map((section) => (
      Math.round(section.getBoundingClientRect().top + window.scrollY)
    ))
    const lastIndex = sections.length - 1
    const zoneLengths = sections.map((_, index) => (
      index < lastIndex
        ? Math.max(zoneStarts[index + 1] - zoneStarts[index], 0)
        : heights[index]
    ))

    return {
      heights,
      sections,
      stackTriggerY: getStackTriggerY(viewportHeight),
      totalScrollHeight: zoneStarts[lastIndex] + heights[lastIndex],
      viewportHeight,
      zoneLengths,
      zoneStarts,
    }
  })
}

export function getSectionTranslateY(metrics, index, scrollY = window.scrollY) {
  const naturalTop = metrics.zoneStarts[index] - scrollY
  const nextZoneStart = metrics.zoneStarts[index + 1]

  if (typeof nextZoneStart !== 'number') {
    return naturalTop
  }

  const stackTriggerY = metrics.stackTriggerY ?? getStackTriggerY(metrics.viewportHeight)
  const freezeStart = nextZoneStart - stackTriggerY

  if (scrollY >= freezeStart) {
    return stackTriggerY - metrics.heights[index]
  }

  return naturalTop
}

export function findActiveStackSectionFromMetrics(
  metrics,
  fallbackSectionId = 'home',
  scrollY = window.scrollY,
) {
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

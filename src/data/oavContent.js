import { createCloudinaryImageSet } from '../utils/cloudinary'

const aluminiumSecurityDoors =
  'https://res.cloudinary.com/dmeaeg0oy/image/upload/v1776805088/aluminium-security-doors_l7stao.jpg'
const duplexGlazing =
  'https://res.cloudinary.com/dmeaeg0oy/image/upload/v1776805090/duplex-glazing_a5w6ks.jpg'
const estateWindowFinish =
  'https://res.cloudinary.com/dmeaeg0oy/image/upload/v1776805090/estate-window-finish_h3flhh.jpg'
const framelessGlassEntry =
  'https://res.cloudinary.com/dmeaeg0oy/image/upload/v1776805090/frameless-glass-entry_svam7y.jpg'
const glassPartitionSuite =
  'https://res.cloudinary.com/dmeaeg0oy/image/upload/v1776805092/glass-partition-suite_blqok5.jpg'
const residentialFrontage =
  'https://res.cloudinary.com/dmeaeg0oy/image/upload/v1776805091/residential-frontage_kgv1vl.jpg'
const showerEnclosure =
  'https://res.cloudinary.com/dmeaeg0oy/image/upload/v1776805092/shower-enclosure_rhi5bj.jpg'
const stairRailInstallation =
  'https://res.cloudinary.com/dmeaeg0oy/image/upload/v1776805093/stair-rail-installation_j5lzg9.jpg'
const verticalFeatureGlazing =
  'https://res.cloudinary.com/dmeaeg0oy/image/upload/v1776805092/vertical-feature-glazing_wh63zi.jpg'

const attachPortfolioImageSet = (project) => {
  const imageSet = createCloudinaryImageSet(project.image)

  return {
    ...project,
    imageCard: imageSet.card,
    imageCardSizes: imageSet.cardSizes,
    imageCardSrcSet: imageSet.cardSrcSet,
    imageLightbox: imageSet.lightbox,
  }
}

export const siteNavigation = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'services', label: 'Services' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'reviews', label: 'Reviews' },
  { id: 'contact', label: 'Contact' },
]

export const sectionIds = siteNavigation.map((item) => item.id)

export const heroSlides = [
  {
    eyebrow: 'Custom aluminium systems',
    eyebrowMobileLines: ['Custom aluminium', 'systems'],
    label: 'Windows',
    title: 'Aluminium Windows',
    titleLines: ['Aluminium', 'Windows'],
    copy:
      'Clean frames, better airflow, and dependable installation for homes, offices, and mixed-use developments.',
  },
  {
    eyebrow: 'Architectural glass installations',
    eyebrowMobileLines: ['Architectural glass', 'installations'],
    label: 'Glass Doors',
    title: 'Glass Door Systems',
    titleLines: ['Glass Door', 'Systems'],
    copy:
      'Sharper entrances and glazed fronts fitted with the right balance of structure, finish, and control.',
  },
  {
    eyebrow: 'Stainless finishing and maintenance',
    eyebrowMobileLines: ['Stainless finishing', 'and maintenance'],
    eyebrowClassName: 'oav-hero-kicker--compact',
    label: 'Railings',
    title: 'Stainless Railings',
    titleLines: ['Stainless', 'Railings'],
    copy:
      'Structural finishing, water collector solutions, and maintenance support delivered with consistent site standards.',
  },
]

export const heroStats = [
  { value: '200+', label: 'Projects completed' },
  { value: '12+', label: 'States\nCovered' },
  { value: '5+', label: 'Years in operation' },
  { value: '100%', label: 'Client satisfaction' },
]

export const aboutHighlights = [
  'Founded in 2019 and based in Lagos, Nigeria.',
  'Certified installation engineers handling residential and commercial work.',
  'Nationwide delivery and installation reach across more than 12 states.',
  'Focused on aluminium, glass, stainless steel, and property maintenance support.',
]

export const operatingPrinciples = [
  {
    title: 'Measured planning',
    copy:
      'Every project starts with scope review, site understanding, and a practical installation path that avoids guesswork.',
  },
  {
    title: 'Precise execution',
    copy:
      'We install with attention to alignment, fit, finish, and durability so the final result looks refined and performs every day.',
  },
  {
    title: 'Aftercare mindset',
    copy:
      'Maintenance support and client follow-through are built into the service, not treated as an afterthought.',
  },
]

export const services = [
  {
    title: 'Window Installation',
    summary:
      'Aluminium window systems tailored for ventilation, security, and a cleaner architectural finish.',
    details: [
      'Sliding, casement, and fixed window formats',
      'Residential upgrades and new-build installations',
      'Site measurement, fabrication coordination, and fitting',
    ],
  },
  {
    title: 'Door Installation',
    summary:
      'Glass and aluminium door systems built for entrances, internal transitions, and commercial access points.',
    details: [
      'Framed and frameless glass door applications',
      'Residential entry systems and office partitions',
      'Hardware alignment and finish detailing',
    ],
  },
  {
    title: 'Home Maintenance',
    summary:
      'Support services that keep installed systems functional, secure, and visually consistent over time.',
    details: [
      'Repairs, adjustment, and replacement support',
      'Routine upkeep for aluminium and glass fixtures',
      'Maintenance response for occupied properties',
    ],
  },
  {
    title: 'Water Collectors',
    summary:
      'Integrated water collection solutions planned to work cleanly with the building envelope and site flow.',
    details: [
      'Residential and commercial drainage support',
      'Installation planning around roofline and access',
      'Durable finishing suited to local conditions',
    ],
  },
  {
    title: 'Stainless Railings',
    summary:
      'Stainless steel railing systems that add structure, safety, and a polished finish to stairways and balconies.',
    details: [
      'Balcony, staircase, and landing installations',
      'Interior and exterior applications',
      'Clean fabrication lines with secure fitting',
    ],
  },
]

export const portfolioProjects = [
  {
    title: 'Residential Frontage',
    subtitle: 'Multi-floor exterior glazing',
    copy:
      'Dark aluminium frames and stacked balconies give the residence a sharper, more modern street presence.',
    alt:
      'Exterior of a multi-floor residential building with dark-framed windows and glass balcony rails.',
    image: residentialFrontage,
  },
  {
    title: 'Aluminium Security Doors',
    subtitle: 'Powder-coated access system',
    copy:
      'Full-height aluminium doors deliver privacy, sturdier access control, and a clean finish at the point of entry.',
    alt:
      'Set of grey aluminium security doors installed at a building entrance.',
    image: aluminiumSecurityDoors,
    imagePosition: 'center center',
  },
  {
    title: 'Frameless Glass Entry',
    subtitle: 'Double-leaf entrance glazing',
    copy:
      'A full-height glass entry sharpens the arrival experience with balanced hardware and clearer sightlines.',
    alt:
      'Frameless double glass entrance doors with long pull handles at a building frontage.',
    image: framelessGlassEntry,
    imagePosition: 'center center',
  },
  {
    title: 'Glass Partition Suite',
    subtitle: 'Black-track interior partition',
    copy:
      'Dark-framed sliding glass creates separation without shutting out light, keeping the interior open and refined.',
    alt:
      'Interior glass partition with dark track hardware creating a separate room zone.',
    image: glassPartitionSuite,
    imagePosition: 'center top',
  },
  {
    title: 'Vertical Feature Glazing',
    subtitle: 'Stairwell light strip',
    copy:
      'Tall fixed glazing introduces daylight and gives the facade a slim architectural accent from base to roofline.',
    alt:
      'Tall vertical glazing strip installed on a white exterior wall.',
    image: verticalFeatureGlazing,
    imagePosition: 'center center',
  },
  {
    title: 'Estate Window Finish',
    subtitle: 'Compound-wide window package',
    copy:
      'Matching aluminium windows across multiple units keep the compound consistent, durable, and neatly finished.',
    alt:
      'Residential compound with multiple units fitted with consistent aluminium windows.',
    image: estateWindowFinish,
    imagePosition: 'center center',
  },
  {
    title: 'Stair Rail Installation',
    subtitle: 'On-site stainless assembly',
    copy:
      'The install process shows the precision behind each stainless rail, from post setting to final alignment.',
    alt:
      'Workers installing a stainless steel stair railing on a concrete staircase.',
    image: stairRailInstallation,
    imagePosition: 'center center',
  },
  {
    title: 'Duplex Glazing',
    subtitle: 'Balcony glass and framed openings',
    copy:
      'Clear balustrades and dark-framed openings keep the duplex crisp, light, and premium from the street.',
    alt:
      'Front view of a duplex with glazed balcony rails and dark aluminium window frames.',
    image: duplexGlazing,
  },
  {
    title: 'Shower Enclosure',
    subtitle: 'Frameless bathroom partition',
    copy:
      'Minimal glass lines and neat stainless hardware create a brighter bathing zone with a cleaner luxury finish.',
    alt:
      'Interior bathroom shower enclosure finished with frameless glass panels and stainless hardware.',
    image: showerEnclosure,
  },
].map(attachPortfolioImageSet)

export const clientReviews = [
  {
    project: 'Residential aluminium windows',
    location: 'Lekki Phase 1, Lagos',
    quote:
      'The measurements were accurate, the finishing was neat, and the team kept the site organised from start to handover. We did not have to chase updates or corrections after installation.',
    client: 'Residential client',
    role: 'Homeowner',
  },
  {
    project: 'Office glass partition fit-out',
    location: 'Victoria Island, Lagos',
    quote:
      'We needed a presentable office finish on a tight schedule. OAV communicated clearly, showed up when agreed, and delivered a clean glass partition setup that felt right for our workspace.',
    client: 'Corporate client',
    role: 'Operations manager',
  },
  {
    project: 'Stainless railing installation',
    location: 'Abuja',
    quote:
      'The railing lines came out straight, secure, and properly finished. What stood out was the professionalism on site and the fact that the final work matched what was promised at approval stage.',
    client: 'Development client',
    role: 'Project representative',
  },
  {
    project: 'Door and maintenance support',
    location: 'Ikeja GRA, Lagos',
    quote:
      'After the main installation, their follow-through was solid. Adjustments were handled quickly, and the team treated the property with care, which matters a lot when work is happening in an occupied building.',
    client: 'Property client',
    role: 'Facility lead',
  },
]

export const contactCard = {
  tagline: 'Where Glass Meets Craft',
  location: 'Lagos, Nigeria',
  reach: 'Nationwide delivery',
  handle: '@OAV.DESIGNS',
  summary:
    'OAV works with homeowners, developers, and commercial clients who need sharper finishing, clear communication, and dependable installation standards.',
}

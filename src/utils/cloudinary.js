const CLOUDINARY_HOST = 'https://res.cloudinary.com/'
const CLOUDINARY_UPLOAD_SEGMENT = '/upload/'
const DEFAULT_DELIVERY = 'f_auto,q_auto,dpr_auto'

export function applyCloudinaryTransforms(source, transforms = '') {
  if (
    typeof source !== 'string'
    || !source.startsWith(CLOUDINARY_HOST)
    || !source.includes(CLOUDINARY_UPLOAD_SEGMENT)
  ) {
    return source
  }

  const [prefix, suffix] = source.split(CLOUDINARY_UPLOAD_SEGMENT)
  const normalizedSuffix = suffix.replace(/^\/+/, '')
  const normalizedTransforms = [DEFAULT_DELIVERY, transforms].filter(Boolean).join(',')

  return `${prefix}${CLOUDINARY_UPLOAD_SEGMENT}${normalizedTransforms}/${normalizedSuffix}`
}

export function createCloudinaryImageSet(source) {
  if (typeof source !== 'string' || !source.startsWith(CLOUDINARY_HOST)) {
    return {
      card: source,
      cardSizes: undefined,
      cardSrcSet: undefined,
      lightbox: source,
    }
  }

  return {
    card: applyCloudinaryTransforms(source, 'c_fill,g_auto,h_720,w_720'),
    cardSizes: '(max-width: 760px) 82vw, (max-width: 1180px) 42vw, 340px',
    cardSrcSet: [
      [480, 480],
      [720, 720],
      [960, 960],
    ]
      .map(
        ([width, height]) =>
          `${applyCloudinaryTransforms(source, `c_fill,g_auto,h_${height},w_${width}`)} ${width}w`,
      )
      .join(', '),
    lightbox: applyCloudinaryTransforms(source, 'c_limit,h_1800,w_1800'),
  }
}

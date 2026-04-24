import { createPortal } from 'react-dom'

const WHATSAPP_LINK = 'https://wa.me/2348068930774'

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path
        d="M12.05 3.85c-4.95 0-8.95 3.27-8.95 7.3 0 2.14 1.13 4.05 2.93 5.39L4.95 20.2l3.92-1.67c.99.26 2.04.39 3.18.39 4.95 0 8.95-3.27 8.95-7.3s-4-7.77-8.95-7.77Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.7"
      />
      <path
        d="m9.42 8.92.94.57c.34.2.45.64.24.98l-.39.66c.39.74 1 1.35 1.73 1.74l.66-.38c.34-.2.78-.09.98.25l.57.94c.22.36.11.83-.25 1.04-.59.35-1.37.61-2.01.46-1.53-.35-3.14-1.74-4.02-3.29-.43-.76-.68-1.62-.51-2.23.09-.32.28-.62.52-.87.26-.27.67-.33 1.01-.13Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function FloatingWhatsAppButton() {
  if (typeof document === 'undefined') {
    return null
  }

  return createPortal(
    <a
      aria-label="Chat with OAV on WhatsApp"
      className="oav-whatsapp-float"
      href={WHATSAPP_LINK}
      rel="noreferrer"
      target="_blank"
    >
      <span className="oav-whatsapp-float-icon">
        <WhatsAppIcon />
      </span>
    </a>,
    document.body,
  )
}

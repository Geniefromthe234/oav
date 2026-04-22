import { createPortal } from 'react-dom'

const WHATSAPP_LINK = 'https://wa.me/2348068930774'

function WhatsAppIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path
        d="M19.11 4.89A10 10 0 0 0 4.28 17.48L3 21l3.63-1.23A10 10 0 1 0 19.11 4.89Zm-7.13 15.39a8.26 8.26 0 0 1-4.21-1.15l-.3-.18-2.15.73.73-2.09-.2-.33a8.31 8.31 0 1 1 6.13 3.02Zm4.56-6.22c-.25-.13-1.46-.72-1.68-.8-.22-.08-.38-.13-.55.12-.17.25-.63.8-.78.97-.15.17-.29.19-.54.06-.25-.13-1.05-.39-2-.13-.74-.33-1.38-.74-1.93-1.25-.14-.12-.03-.37.1-.5.12-.12.25-.32.37-.48.12-.16.16-.27.25-.45.08-.18.04-.34-.02-.48-.06-.13-.55-1.33-.75-1.82-.2-.48-.41-.42-.55-.43h-.48c-.17 0-.45.06-.68.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.02 2.61.12.17 1.76 2.68 4.25 3.76 2.5 1.08 2.5.72 2.95.67.45-.04 1.46-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.1-.22-.17-.47-.3Z"
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

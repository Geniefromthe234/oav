import { useEffect, useRef, useState } from 'react'
import logo from '../../assets/oav/oav-logo-main.png'

export default function SiteHeader({ activeSection, navigation, setActiveSection }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const headerRef = useRef(null)

  const renderNavigationLinks = () => (
    navigation.map((item) => (
      <a
        key={item.id}
        className={activeSection === item.id ? 'is-active' : ''}
        href={`#${item.id}`}
        onClick={() => handleNavSelect(item.id)}
      >
        {item.label}
      </a>
    ))
  )

  const handleNavSelect = (sectionId) => {
    setActiveSection(sectionId)
    setMenuOpen(false)
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 18)

    handleScroll()
    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [activeSection])

  useEffect(() => {
    if (!menuOpen) {
      return undefined
    }

    const handlePointerDown = (event) => {
      if (headerRef.current?.contains(event.target)) {
        return
      }

      setMenuOpen(false)
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
      }
    }

    const handleResize = () => {
      if (window.innerWidth > 760) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [menuOpen])

  return (
    <>
      <div ref={headerRef}>
        <header className={`oav-header ${isScrolled ? 'is-scrolled' : ''}`}>
          <div className="oav-shell oav-header-bar">
            <a className="oav-brand" href="#home">
              <img alt="OAV logo" src={logo} />
            </a>

            <nav className="oav-nav oav-nav--desktop" id="site-navigation">
              {renderNavigationLinks()}
            </nav>

            <div className="oav-header-actions">
              <a className="oav-button oav-button--primary oav-header-quote" href="#contact">
                Get a Quote
              </a>

              <button
                aria-controls="site-navigation-mobile"
                aria-expanded={menuOpen}
                aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                className={`oav-menu-toggle ${menuOpen ? 'is-open' : ''}`}
                onClick={() => setMenuOpen((current) => !current)}
                type="button"
              >
                <span aria-hidden="true" className="oav-menu-toggle-icon">
                  <span className="oav-menu-toggle-bar" />
                  <span className="oav-menu-toggle-bar" />
                  <span className="oav-menu-toggle-bar" />
                </span>
              </button>
            </div>
          </div>
        </header>

        <nav
          className={`oav-nav-drawer ${menuOpen ? 'is-open' : ''}`}
          id="site-navigation-mobile"
        >
          {renderNavigationLinks()}

          <a
            className="oav-button oav-button--primary oav-header-quote oav-nav-quote"
            href="#contact"
            onClick={() => handleNavSelect('contact')}
          >
            Get a Quote
          </a>
        </nav>
      </div>

      <button
        aria-label="Close navigation menu"
        className={`oav-nav-backdrop ${menuOpen ? 'is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        tabIndex={menuOpen ? 0 : -1}
        type="button"
      />
    </>
  )
}

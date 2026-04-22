import logo from '../../assets/oav/oav-logo-main.png'

const footerColumns = [
  {
    title: 'Offerings',
    items: [
      { label: 'Window Installation', href: '#services' },
      { label: 'Door Installation', href: '#services' },
      { label: 'Home Maintenance', href: '#services' },
      { label: 'Water Collectors', href: '#services' },
    ],
  },
  {
    title: 'About OAV',
    items: [
      { label: 'About', href: '#about' },
      { label: 'Portfolio', href: '#portfolio' },
      { label: 'Reviews', href: '#reviews' },
      { label: 'Case Studies', href: '#portfolio' },
    ],
  },
  {
    title: 'Connect',
    items: [
      { label: 'Contact', href: '#contact' },
      { label: 'Lagos Office' },
      { label: '@OAV.DESIGNS' },
      { label: 'Nationwide Delivery' },
    ],
  },
]

function FooterArrow() {
  return (
    <svg
      aria-hidden="true"
      className="oav-footer-arrow"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 19V5M5 12l7-7 7 7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.9"
      />
    </svg>
  )
}

export default function SiteFooter() {
  return (
    <footer className="oav-footer" id="footer">
      <span aria-hidden="true" className="oav-footer-monogram">
        <span className="oav-footer-monogram-letter oav-footer-monogram-letter--o">O</span>
        <span className="oav-footer-monogram-letter">A</span>
        <span className="oav-footer-monogram-letter">V</span>
      </span>

      <div className="oav-shell oav-footer-panel">
        <div className="oav-footer-top">
          <a aria-label="OAV home" className="oav-footer-brand" href="#home">
            <img alt="OAV logo" src={logo} />
          </a>

          <a className="oav-button oav-footer-cta oav-footer-cta--top" href="#contact">
            START A PROJECT
          </a>
        </div>

        <div className="oav-footer-main">
          <div className="oav-footer-intro">
            <p className="oav-footer-kicker">WHERE GLASS MEETS CRAFT</p>
            <p className="oav-footer-description">
              OAV builds aluminium, glass, and stainless installations from Lagos
              for projects across Nigeria with a sharp focus on fit, finish, and
              dependable site delivery.
            </p>

            <a className="oav-button oav-footer-cta oav-footer-cta--mobile" href="#contact">
              START A PROJECT
            </a>
          </div>

          <nav aria-label="Footer links" className="oav-footer-columns">
            {footerColumns.map((column) => (
              <section className="oav-footer-column" key={column.title}>
                <h3>{column.title}</h3>

                <ul className="oav-footer-list">
                  {column.items.map((item) => (
                    <li key={item.label}>
                      {item.href ? (
                        <a href={item.href}>{item.label}</a>
                      ) : (
                        <span>{item.label}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>
        </div>

        <div className="oav-footer-bottom">
          <p className="oav-footer-copyright">
            &copy; 2026 OLA ALUMINUM VENTURE - All Rights Reserved
          </p>

          <a className="oav-footer-backtotop" href="#home">
            <span>BACK TO TOP</span>
            <FooterArrow />
          </a>
        </div>
      </div>
    </footer>
  )
}

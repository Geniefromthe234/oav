export default function ContactSection({ contact, services }) {
  return (
    <section id="contact" className="oav-section oav-section--contact">
      <div className="oav-shell">
        <div className="oav-contact-band">
          <div className="oav-contact-copy">
            <div className="oav-section-intro" style={{ marginBottom: 0 }}>
              <span>Get in touch</span>
              <h2>Bring your brief. We'll take it from there.</h2>
              <p>{contact.summary}</p>
            </div>
            <div className="oav-hero-actions" style={{ marginTop: 32 }}>
              <a className="oav-button oav-button--primary" href="#services">Review Services</a>
              <a className="oav-button oav-button--secondary" href="#portfolio">Browse Portfolio</a>
            </div>
          </div>

          <form className="oav-contact-form">
            <div className="oav-field">
              <label className="oav-field-label" htmlFor="contact-name">Full Name</label>
              <input
                autoComplete="name"
                className="oav-contact-input"
                id="contact-name"
                name="name"
                placeholder="Your name"
                type="text"
              />
            </div>

            <div className="oav-field">
              <label className="oav-field-label" htmlFor="contact-phone">Phone</label>
              <input
                autoComplete="tel"
                className="oav-contact-input"
                id="contact-phone"
                name="phone"
                placeholder="0901 234 5678"
                type="tel"
              />
            </div>

            <div className="oav-field oav-field--full">
              <label className="oav-field-label" htmlFor="contact-email">Email</label>
              <input
                autoComplete="email"
                className="oav-contact-input"
                id="contact-email"
                name="email"
                placeholder="you@example.com"
                type="email"
              />
            </div>

            <div className="oav-field oav-field--full">
              <label className="oav-field-label" htmlFor="contact-service">Service</label>
              <select
                className="oav-contact-input oav-contact-select"
                defaultValue=""
                id="contact-service"
                name="service"
              >
                <option value="" disabled>Select a service</option>
                {services.map((service) => (
                  <option key={service.title} value={service.title}>
                    {service.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="oav-field oav-field--full">
              <label className="oav-field-label" htmlFor="contact-message">Message</label>
              <textarea
                className="oav-contact-input oav-contact-textarea"
                id="contact-message"
                name="message"
                placeholder="Tell us about your project..."
                rows="6"
              />
            </div>

            <div className="oav-contact-form-actions">
              <button className="oav-button oav-button--primary" type="submit">
                Send Enquiry
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M5 12h14" />
      <path d="m13 5 7 7-7 7" />
    </svg>
  )
}

export default function PortfolioCard({ onOpen, project, index }) {
  return (
    <article className="oav-portfolio-card">
      <div className="oav-portfolio-media">
        <img
          alt={project.alt ?? project.title}
          decoding="async"
          loading="lazy"
          sizes={project.imageCardSizes}
          src={project.imageCard ?? project.image}
          srcSet={project.imageCardSrcSet}
          style={project.imagePosition ? { objectPosition: project.imagePosition } : undefined}
        />
      </div>
      <div className="oav-portfolio-body">
        <span className="oav-card-index">{String(index).padStart(2, '0')}</span>
        <h3>{project.title}</h3>
        <span className="oav-card-tag">{project.subtitle}</span>
        <p>{project.copy}</p>
      </div>
      <button
        aria-label={`View full image for ${project.title}`}
        className="oav-portfolio-card-hit"
        onClick={() => onOpen(project)}
        type="button"
      >
        <span className="oav-portfolio-card-overlay">
          <span className="oav-portfolio-card-cta">
            <ArrowIcon />
            <span>Click/Tap To View Full Image</span>
          </span>
        </span>
      </button>
    </article>
  )
}

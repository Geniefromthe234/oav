export default function SectionIntro({ eyebrow, title, description, align = 'left' }) {
  return (
    <div className={`oav-section-intro oav-section-intro--${align}`}>
      {eyebrow && <span>{eyebrow}</span>}
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  )
}

export default function ServiceCard({ index, service }) {
  return (
    <article className="oav-service-row">
      <div className="oav-service-no">{String(index + 1).padStart(2, '0')}</div>

      <div className="oav-service-head">
        <h3>{service.title}</h3>
        <p>{service.summary}</p>
      </div>

      <ul className="oav-service-points">
        {service.details.map((detail) => (
          <li key={detail}>{detail}</li>
        ))}
      </ul>
    </article>
  )
}

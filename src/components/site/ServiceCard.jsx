import { motion } from 'framer-motion'

const riseIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
}

export default function ServiceCard({ index, service }) {
  return (
    <motion.article className="oav-service-row" {...riseIn}>
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
    </motion.article>
  )
}

import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'

function ComingSoon({
  title,
  role,
  roleLabel,
  homePath,
  headingEyebrow = 'Funcionalidad planificada',
}) {
  return (
    <DashboardLayout title={title} role={role} roleLabel={roleLabel} headingEyebrow={headingEyebrow}>
      <section className="panel dashboard-section coming-soon-panel">
        <p className="eyebrow">Próximamente</p>
        <h2>{title}</h2>
        <p>Esta funcionalidad queda prevista para una etapa posterior del prototipo.</p>
        <Link className="button-link" to={homePath}>
          Volver al panel
        </Link>
      </section>
    </DashboardLayout>
  )
}

export default ComingSoon

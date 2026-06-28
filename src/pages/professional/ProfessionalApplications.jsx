import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import SimpleTable from '../../components/SimpleTable'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/useAuth'
import { listProfessionalApplications } from '../../services/professionalService'
import { formatCurrency, formatDate } from '../../utils/formatters'

function ProfessionalApplications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadApplications() {
      setLoading(true)
      setError(null)

      try {
        const data = await listProfessionalApplications(user.id)
        if (isMounted) setApplications(data)
      } catch (applicationError) {
        if (isMounted) setError(applicationError.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (user?.id) loadApplications()

    return () => {
      isMounted = false
    }
  }, [user?.id])

  const columns = [
    { header: 'Arreglo', key: 'repair', render: (application) => application.repair_requests?.title || '-' },
    { header: 'Presupuesto', key: 'estimated_budget', render: (application) => formatCurrency(application.estimated_budget) },
    { header: 'Fecha', key: 'created_at', render: (application) => formatDate(application.created_at?.slice(0, 10)) },
    { header: 'Estado', key: 'status', render: (application) => <StatusBadge status={application.status} /> },
  ]

  return (
    <DashboardLayout title="Mis postulaciones" role="Profesional externo">
      <section className="panel dashboard-section">
        {loading ? <p className="loading-feedback">Cargando postulaciones...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        <SimpleTable columns={columns} rows={applications} emptyMessage="Todavia no realizaste postulaciones." />
      </section>
    </DashboardLayout>
  )
}

export default ProfessionalApplications

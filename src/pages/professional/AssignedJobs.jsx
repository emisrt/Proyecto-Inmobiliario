import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import SimpleTable from '../../components/SimpleTable'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/useAuth'
import { listAssignedRepairs } from '../../services/repairService'

function AssignedJobs() {
  const { user } = useAuth()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadJobs() {
      setLoading(true)
      setError(null)

      try {
        const data = await listAssignedRepairs(user.id)
        if (isMounted) setJobs(data)
      } catch (jobError) {
        if (isMounted) setError(jobError.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (user?.id) loadJobs()

    return () => {
      isMounted = false
    }
  }, [user?.id])

  const columns = [
    { header: 'Trabajo', accessor: 'title' },
    { header: 'Propiedad', key: 'property', render: (job) => job.properties?.title || '-' },
    { header: 'Tipo', accessor: 'repair_type' },
    { header: 'Prioridad', key: 'priority', render: (job) => <StatusBadge status={job.priority} /> },
    { header: 'Estado', key: 'status', render: (job) => <StatusBadge status={job.status} /> },
  ]

  return (
    <DashboardLayout title="Trabajos asignados" role="Profesional externo">
      <section className="panel dashboard-section">
        {loading ? <p className="loading-feedback">Cargando trabajos asignados...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        <SimpleTable columns={columns} rows={jobs} emptyMessage="No tenes trabajos asignados." />
      </section>
    </DashboardLayout>
  )
}

export default AssignedJobs

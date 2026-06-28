import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import SimpleTable from '../../components/SimpleTable'
import StatusBadge from '../../components/StatusBadge'
import { acceptApplication, listRepairApplications, rejectApplication } from '../../services/professionalService'
import { getRepair } from '../../services/repairService'
import { formatCurrency, formatDate, formatDisplayText } from '../../utils/formatters'

function RepairApplications() {
  const { id } = useParams()
  const [repair, setRepair] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [repairData, applicationData] = await Promise.all([
        getRepair(id),
        listRepairApplications(id),
      ])
      setRepair(repairData)
      setApplications(applicationData)
    } catch (applicationError) {
      setError(applicationError.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  async function handleAccept(application) {
    const shouldContinue = window.confirm('¿Confirmás que querés aceptar esta postulación y asignar el trabajo al profesional?')
    if (!shouldContinue) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await acceptApplication(application)
      setSuccess('Postulacion aceptada. El arreglo paso a en proceso.')
      await loadData()
    } catch (applicationError) {
      setError(applicationError.message)
    } finally {
      setSaving(false)
    }
  }

  async function handleReject(applicationId) {
    const shouldContinue = window.confirm('¿Confirmás que querés rechazar esta postulación?')
    if (!shouldContinue) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await rejectApplication(applicationId)
      setSuccess('Postulacion rechazada.')
      await loadData()
    } catch (applicationError) {
      setError(applicationError.message)
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { header: 'Profesional', key: 'professional', render: (application) => application.professional?.full_name || 'Profesional sin datos visibles' },
    { header: 'Contacto', key: 'contact', render: (application) => application.professional?.email || application.professional?.phone || 'No especificado' },
    { header: 'Especialidad', key: 'specialty', render: (application) => formatDisplayText(application.professional_profile?.specialty) },
    { header: 'Disponibilidad', key: 'availability', render: (application) => formatDisplayText(application.professional_profile?.availability) },
    { header: 'Mensaje', accessor: 'message' },
    { header: 'Presupuesto', key: 'estimated_budget', render: (application) => formatCurrency(application.estimated_budget) },
    { header: 'Fecha', key: 'created_at', render: (application) => formatDate(application.created_at?.slice(0, 10)) },
    { header: 'Estado', key: 'status', render: (application) => <StatusBadge status={application.status} /> },
    {
      header: 'Acciones',
      key: 'actions',
      render: (application) => (
        <div className="table-actions">
          <button type="button" disabled={saving || application.status === 'aceptada'} onClick={() => handleAccept(application)}>
            Aceptar
          </button>
          <button type="button" disabled={saving || application.status === 'rechazada'} onClick={() => handleReject(application.id)}>
            Rechazar
          </button>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout title="Postulaciones del arreglo" role="Inmobiliaria">
      <section className="panel dashboard-section">
        {loading ? <p className="loading-feedback">Cargando postulaciones...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        {success ? <p className="success-message">{success}</p> : null}
        {repair ? (
          <div className="section-header">
            <div>
              <p className="eyebrow">{repair.repair_type}</p>
              <h2>{repair.title}</h2>
              <p className="muted">Estado actual: <StatusBadge status={repair.status} /></p>
            </div>
            <Link to={`/inmobiliaria/arreglos/${repair.id}`}>Volver al arreglo</Link>
          </div>
        ) : null}
        <SimpleTable columns={columns} rows={applications} emptyMessage="Este arreglo no tiene postulaciones." />
      </section>
    </DashboardLayout>
  )
}

export default RepairApplications

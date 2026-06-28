import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import SimpleTable from '../../components/SimpleTable'
import StatusBadge from '../../components/StatusBadge'
import { listAgentRepairs, updateRepairStatus } from '../../services/repairService'
import { formatDate } from '../../utils/formatters'
import { toUserErrorMessage } from '../../utils/userMessages'

function normalizeRepairStatus(status) {
  if (status === 'publicada') return 'publicado'
  if (status === 'resuelta') return 'resuelto'
  if (status === 'cancelada') return 'cancelado'
  return status
}

function AgentRepairList() {
  const [status, setStatus] = useState('')
  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function loadRepairs(nextStatus = status) {
    setLoading(true)
    setError(null)

    try {
      const data = await listAgentRepairs({ status: nextStatus })
      setRepairs(data)
    } catch (repairError) {
      setError(toUserErrorMessage(repairError, 'No se pudieron cargar las solicitudes de arreglo.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRepairs()
  }, [])

  function handleStatusChange(event) {
    const nextStatus = event.target.value
    setStatus(nextStatus)
    loadRepairs(nextStatus)
  }

  async function changeRepairStatus(repair, nextStatus) {
    const actionLabels = {
      publicado: 'publicar este arreglo para profesionales',
      pendiente_confirmacion: 'marcar este arreglo como pendiente de confirmación',
      resuelto: 'marcar este arreglo como resuelto',
      cancelado: 'cancelar este arreglo',
    }
    const shouldContinue = window.confirm(`¿Confirmás que querés ${actionLabels[nextStatus] || 'cambiar el estado de esta solicitud'}?`)
    if (!shouldContinue) return

    setSavingId(repair.id)
    setError(null)
    setSuccess(null)

    try {
      await updateRepairStatus(repair.id, nextStatus)
      setSuccess('Estado de la solicitud actualizado.')
      await loadRepairs()
    } catch (statusError) {
      setError(toUserErrorMessage(statusError, 'No se pudo actualizar la solicitud.'))
    } finally {
      setSavingId(null)
    }
  }

  function renderRepairActions(repair) {
    const currentStatus = normalizeRepairStatus(repair.status)

    if (currentStatus === 'pendiente') {
      return (
        <div className="table-actions">
          <button type="button" disabled={savingId === repair.id} onClick={() => changeRepairStatus(repair, 'publicado')}>
            Publicar arreglo
          </button>
          <Link to={`/inmobiliaria/arreglos/${repair.id}`}>Gestionar</Link>
        </div>
      )
    }

    if (currentStatus === 'publicado') {
      return (
        <div className="table-actions">
          <Link to={`/inmobiliaria/arreglos/${repair.id}/postulaciones`}>Ver postulaciones</Link>
          <Link to={`/inmobiliaria/arreglos/${repair.id}`}>Gestionar</Link>
        </div>
      )
    }

    if (currentStatus === 'en_proceso') {
      return (
        <div className="table-actions">
          <button type="button" disabled={savingId === repair.id} onClick={() => changeRepairStatus(repair, 'pendiente_confirmacion')}>
            Pendiente confirmación
          </button>
          <button type="button" disabled={savingId === repair.id} onClick={() => changeRepairStatus(repair, 'resuelto')}>
            Resolver
          </button>
        </div>
      )
    }

    if (currentStatus === 'pendiente_confirmacion') {
      return (
        <div className="table-actions">
          <button type="button" disabled={savingId === repair.id} onClick={() => changeRepairStatus(repair, 'resuelto')}>
            Confirmar resuelto
          </button>
          <Link to={`/inmobiliaria/arreglos/${repair.id}`}>Gestionar</Link>
        </div>
      )
    }

    return <span className="muted">Sin acciones</span>
  }

  const columns = [
    {
      header: 'Solicitud',
      key: 'summary',
      render: (repair) => (
        <div className="table-main-copy">
          <strong>{repair.title}</strong>
          <span>{repair.description || 'Sin descripción cargada.'}</span>
        </div>
      ),
    },
    {
      header: 'Propiedad',
      key: 'property',
      render: (repair) => (
        <div className="table-main-copy">
          <strong>{repair.properties?.address || repair.properties?.title || '-'}</strong>
          <span>{[repair.properties?.title, repair.properties?.city].filter(Boolean).join(' · ')}</span>
        </div>
      ),
    },
    {
      header: 'Profesional',
      key: 'professional',
      render: (repair) => repair.assigned_professional?.full_name || <span className="muted">Sin asignar</span>,
    },
    { header: 'Prioridad', key: 'priority', render: (repair) => <StatusBadge status={repair.priority} /> },
    { header: 'Estado', key: 'status', render: (repair) => <StatusBadge status={normalizeRepairStatus(repair.status)} /> },
    { header: 'Fecha generación', key: 'created_at', render: (repair) => formatDate(repair.created_at?.slice(0, 10)) },
    { header: 'Acciones', key: 'actions', render: renderRepairActions },
  ]

  return (
    <DashboardLayout title="Solicitudes de arreglo" role="Inmobiliaria">
      <section className="panel dashboard-section">
        <div className="section-header">
          <h2>Arreglos</h2>
          <div className="section-actions">
            <Link className="button-link" to="/inmobiliaria/arreglos/nuevo">
              Nueva solicitud
            </Link>
            <select value={status} onChange={handleStatusChange}>
              <option value="">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="publicado">Publicado</option>
              <option value="en_proceso">En proceso</option>
              <option value="pendiente_confirmacion">Pendiente confirmación</option>
              <option value="resuelto">Resuelto</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
        {loading ? <p className="loading-feedback">Cargando arreglos...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        {success ? <p className="success-message">{success}</p> : null}
        <SimpleTable columns={columns} rows={repairs} emptyMessage="No hay solicitudes de arreglo." />
      </section>
    </DashboardLayout>
  )
}

export default AgentRepairList

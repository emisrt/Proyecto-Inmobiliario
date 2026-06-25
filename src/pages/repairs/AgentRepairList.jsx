import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import SimpleTable from '../../components/SimpleTable'
import StatusBadge from '../../components/StatusBadge'
import { listAgentRepairs } from '../../services/repairService'
import { formatDate } from '../../utils/formatters'

function AgentRepairList() {
  const [status, setStatus] = useState('')
  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadRepairs(nextStatus = status) {
    setLoading(true)
    setError(null)

    try {
      const data = await listAgentRepairs({ status: nextStatus })
      setRepairs(data)
    } catch (repairError) {
      setError(repairError.message)
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

  const columns = [
    { header: 'Solicitud', accessor: 'title' },
    { header: 'Propiedad', key: 'property', render: (repair) => repair.properties?.title || '-' },
    { header: 'Inquilino', key: 'tenant', render: (repair) => repair.tenant?.full_name || '-' },
    { header: 'Prioridad', key: 'priority', render: (repair) => <StatusBadge status={repair.priority} /> },
    { header: 'Estado', key: 'status', render: (repair) => <StatusBadge status={repair.status} /> },
    { header: 'Fecha', key: 'created_at', render: (repair) => formatDate(repair.created_at?.slice(0, 10)) },
    {
      header: 'Acciones',
      key: 'actions',
      render: (repair) => (
        <div className="table-actions">
          <Link to={`/inmobiliaria/arreglos/${repair.id}`}>Gestionar</Link>
          <Link to={`/inmobiliaria/arreglos/${repair.id}/postulaciones`}>Postulaciones</Link>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout title="Solicitudes de arreglo" role="Inmobiliaria">
      <section className="panel dashboard-section">
        <div className="section-header">
          <h2>Arreglos</h2>
          <select value={status} onChange={handleStatusChange}>
            <option value="">Todos los estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="publicada">Publicado</option>
            <option value="en_proceso">En proceso</option>
            <option value="resuelta">Resuelto</option>
            <option value="cancelada">Cancelado</option>
          </select>
        </div>
        {loading ? <p className="muted">Cargando arreglos...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        <SimpleTable columns={columns} rows={repairs} emptyMessage="No hay solicitudes de arreglo." />
      </section>
    </DashboardLayout>
  )
}

export default AgentRepairList

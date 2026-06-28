import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import SimpleTable from '../../components/SimpleTable'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/useAuth'
import { listTenantRepairs } from '../../services/repairService'
import { formatDate } from '../../utils/formatters'
import { toUserErrorMessage } from '../../utils/userMessages'

function TenantRepairList() {
  const { user } = useAuth()
  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadRepairs() {
      setLoading(true)
      setError(null)

      try {
        const data = await listTenantRepairs(user.id)
        if (isMounted) setRepairs(data)
      } catch (repairError) {
        if (isMounted) setError(toUserErrorMessage(repairError, 'No se pudieron cargar tus solicitudes de arreglo.'))
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (user?.id) loadRepairs()

    return () => {
      isMounted = false
    }
  }, [user?.id])

  const columns = [
    { header: 'Solicitud', accessor: 'title' },
    { header: 'Propiedad', key: 'property', render: (repair) => repair.properties?.title || '-' },
    { header: 'Tipo', accessor: 'repair_type' },
    { header: 'Prioridad', key: 'priority', render: (repair) => <StatusBadge status={repair.priority} /> },
    { header: 'Estado', key: 'status', render: (repair) => <StatusBadge status={repair.status} /> },
    { header: 'Fecha', key: 'created_at', render: (repair) => formatDate(repair.created_at?.slice(0, 10)) },
    { header: 'Acciones', key: 'actions', render: (repair) => <Link to={`/inquilino/arreglos/${repair.id}`}>Ver solicitud</Link> },
  ]

  return (
    <DashboardLayout title="Mis solicitudes de arreglo" role="Inquilino">
      <section className="panel dashboard-section">
        <div className="section-header">
          <h2>Solicitudes</h2>
          <Link className="button-link" to="/inquilino/arreglos/nuevo">
            Solicitar arreglo
          </Link>
        </div>
        {loading ? <p className="loading-feedback">Cargando solicitudes...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        <SimpleTable
          columns={columns}
          rows={repairs}
          emptyMessage="Todavía no cargaste solicitudes."
          emptyDescription="Si necesitás reportar un problema en la propiedad, creá una solicitud para la inmobiliaria."
          emptyAction={<Link className="button-link" to="/inquilino/arreglos/nuevo">Solicitar arreglo</Link>}
        />
      </section>
    </DashboardLayout>
  )
}

export default TenantRepairList

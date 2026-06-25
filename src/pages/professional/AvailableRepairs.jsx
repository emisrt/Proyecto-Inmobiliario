import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import SimpleTable from '../../components/SimpleTable'
import StatusBadge from '../../components/StatusBadge'
import { listPublishedRepairs } from '../../services/repairService'
import { formatDate } from '../../utils/formatters'

function AvailableRepairs() {
  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadRepairs() {
      setLoading(true)
      setError(null)

      try {
        const data = await listPublishedRepairs()
        if (isMounted) setRepairs(data)
      } catch (repairError) {
        if (isMounted) setError(repairError.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadRepairs()

    return () => {
      isMounted = false
    }
  }, [])

  const columns = [
    { header: 'Trabajo', accessor: 'title' },
    { header: 'Propiedad', key: 'property', render: (repair) => repair.properties?.title || '-' },
    { header: 'Tipo', accessor: 'repair_type' },
    { header: 'Prioridad', key: 'priority', render: (repair) => <StatusBadge status={repair.priority} /> },
    { header: 'Publicado', key: 'created_at', render: (repair) => formatDate(repair.created_at?.slice(0, 10)) },
    { header: 'Acciones', key: 'actions', render: (repair) => <Link to={`/profesional/arreglos-disponibles/${repair.id}`}>Ver detalle</Link> },
  ]

  return (
    <DashboardLayout title="Arreglos disponibles" role="Profesional de arreglos">
      <section className="panel dashboard-section">
        {loading ? <p className="muted">Cargando trabajos disponibles...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        <SimpleTable columns={columns} rows={repairs} emptyMessage="No hay arreglos publicados disponibles." />
      </section>
    </DashboardLayout>
  )
}

export default AvailableRepairs

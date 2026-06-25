import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import SimpleTable from '../../components/SimpleTable'
import StatusBadge from '../../components/StatusBadge'
import { listProperties, updatePropertyStatus } from '../../services/propertyService'
import { formatCurrency } from '../../utils/formatters'

function PropertyList() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function loadProperties() {
    setLoading(true)
    setError(null)

    try {
      const data = await listProperties()
      setProperties(data)
    } catch (propertyError) {
      setError(propertyError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProperties()
  }, [])

  async function changeStatus(id, status) {
    setError(null)
    setSuccess(null)

    try {
      await updatePropertyStatus(id, status)
      setSuccess('Estado de propiedad actualizado.')
      await loadProperties()
    } catch (statusError) {
      setError(statusError.message)
    }
  }

  const columns = [
    { header: 'Propiedad', accessor: 'title' },
    { header: 'Direccion', key: 'address', render: (property) => `${property.address}${property.city ? `, ${property.city}` : ''}` },
    { header: 'Operacion', accessor: 'operation_type' },
    { header: 'Precio', key: 'price', render: (property) => formatCurrency(property.price) },
    { header: 'Estado', key: 'status', render: (property) => <StatusBadge status={property.status} /> },
    {
      header: 'Acciones',
      key: 'actions',
      render: (property) => (
        <div className="table-actions">
          <Link to={`/inmobiliaria/propiedades/${property.id}`}>Ver</Link>
          <Link to={`/inmobiliaria/propiedades/${property.id}/editar`}>Editar</Link>
          <button type="button" onClick={() => changeStatus(property.id, 'suspendida')}>
            Suspender
          </button>
          <button type="button" onClick={() => changeStatus(property.id, 'disponible')}>
            Reactivar
          </button>
          <button type="button" onClick={() => changeStatus(property.id, 'anulada')}>
            Anular
          </button>
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout title="Propiedades" role="Inmobiliaria">
      <section className="panel dashboard-section">
        <div className="section-header">
          <h2>Listado de propiedades</h2>
          <Link className="button-link" to="/inmobiliaria/propiedades/nueva">
            Nueva propiedad
          </Link>
        </div>
        {loading ? <p className="muted">Cargando propiedades...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        {success ? <p className="success-message">{success}</p> : null}
        <SimpleTable columns={columns} rows={properties} emptyMessage="No hay propiedades registradas." />
      </section>
    </DashboardLayout>
  )
}

export default PropertyList

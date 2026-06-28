import { useEffect, useState } from 'react'
import { MoreVertical } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import StatusBadge from '../../components/StatusBadge'
import { listProperties } from '../../services/propertyService'
import { formatCurrency } from '../../utils/formatters'

function PropertyList() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  function getLocation(property) {
    return [property.address, property.neighborhood, property.city, property.province].filter(Boolean).join(', ')
  }

  return (
    <DashboardLayout title="Propiedades" role="Inmobiliaria">
      <section className="panel dashboard-section">
        <div className="section-header">
          <h2>Listado de propiedades</h2>
          <Link className="button-link" to="/inmobiliaria/propiedades/nueva">
            Nueva propiedad
          </Link>
        </div>
        {loading ? <p className="loading-feedback">Cargando propiedades...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        <div className="table-wrapper">
          <table className="simple-table interactive-table">
            <thead>
              <tr>
                <th>Propiedad</th>
                <th>Ubicación</th>
                <th>Operacion</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Estado</th>
                <th aria-label="Acciones" />
              </tr>
            </thead>
            <tbody>
              {properties.length === 0 ? (
                <tr>
                  <td className="table-empty-cell" colSpan="7">
                    <strong>No hay propiedades registradas.</strong>
                    <span>Cuando cargues una propiedad, aparecerá en este listado.</span>
                  </td>
                </tr>
              ) : (
                properties.map((property) => (
                  <tr
                    className="clickable-row"
                    key={property.id}
                    onClick={() => navigate(`/inmobiliaria/propiedades/${property.id}`)}
                    tabIndex="0"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault()
                        navigate(`/inmobiliaria/propiedades/${property.id}`)
                      }
                    }}
                  >
                    <td>{property.title}</td>
                    <td>{getLocation(property)}</td>
                    <td>{property.operation_type}</td>
                    <td>{property.property_type}</td>
                    <td>{formatCurrency(property.price, property.currency || 'ARS')}</td>
                    <td><StatusBadge status={property.status} /></td>
                    <td className="row-menu-cell" onClick={(event) => event.stopPropagation()}>
                      <div className="context-menu">
                        <button
                          aria-label={`Opciones de ${property.title}`}
                          className="icon-button"
                          type="button"
                          onClick={() => setOpenMenuId((currentId) => (currentId === property.id ? null : property.id))}
                        >
                          <MoreVertical size={17} />
                        </button>
                        {openMenuId === property.id ? (
                          <div className="context-menu-panel">
                            <Link to={`/inmobiliaria/propiedades/${property.id}/editar`}>Editar propiedad</Link>
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default PropertyList

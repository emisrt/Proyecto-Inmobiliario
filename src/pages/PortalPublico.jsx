import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import StatusBadge from '../components/StatusBadge'
import { listPublicProperties } from '../services/propertyService'
import { formatCurrency } from '../utils/formatters'

function PortalPublico() {
  const [properties, setProperties] = useState([])
  const [filters, setFilters] = useState({ search: '', operationType: '' })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadProperties = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await listPublicProperties(filters)
      setProperties(data)
    } catch (propertyError) {
      setError(propertyError.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadProperties()
  }, [loadProperties])

  function handleChange(event) {
    const { name, value } = event.target
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    loadProperties()
  }

  return (
    <>
      <PublicHeader />
      <main className="page">
        <section className="page-heading">
          <p>Locative</p>
          <h1>Propiedades disponibles</h1>
        </section>
        <form className="filters" onSubmit={handleSubmit}>
          <input
            name="search"
            type="search"
            placeholder="Buscar por direccion, ciudad o titulo"
            value={filters.search}
            onChange={handleChange}
          />
          <select name="operationType" value={filters.operationType} onChange={handleChange}>
            <option value="">Operacion</option>
            <option value="alquiler">Alquiler</option>
            <option value="venta">Venta</option>
          </select>
          <button type="submit">Filtrar</button>
        </form>
        {loading ? <p className="muted">Cargando propiedades...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        <section className="property-grid">
          {properties.map((property) => (
            <Link
              aria-label={`Ver detalle de ${property.title}`}
              className="property-card property-card-link"
              key={property.id}
              to={`/portal/propiedades/${property.id}`}
            >
              {property.image_url ? (
                <img className="property-card-image" src={property.image_url} alt={property.title} />
              ) : (
                <div className="image-placeholder">Imagen</div>
              )}
              <p className="eyebrow">{property.operation_type}</p>
              <h2>{property.title}</h2>
              <p>{property.address}{property.city ? `, ${property.city}` : ''}</p>
              <p><StatusBadge status={property.status} /></p>
              <strong className="property-price">{formatCurrency(property.price)}</strong>
            </Link>
          ))}
          {!loading && properties.length === 0 ? <p className="muted">No hay propiedades publicadas.</p> : null}
        </section>
      </main>
    </>
  )
}

export default PortalPublico

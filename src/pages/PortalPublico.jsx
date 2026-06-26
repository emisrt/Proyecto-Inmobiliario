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

  const hasActiveFilter = Boolean(filters.search || filters.operationType)
  const operationLabel = filters.operationType ? `Resultados para: ${filters.operationType}` : null

  return (
    <>
      <PublicHeader />
      <main className="public-portal">
        <section className="portal-hero">
          <div className="portal-hero-inner">
            <div className="portal-hero-copy">
              <p className="eyebrow">Locative</p>
              <h1>Encontrá tu próximo lugar</h1>
              <p>Explorá inmuebles disponibles y encontrá la opción ideal para alquilar o comprar.</p>
            </div>
            <form className="portal-search-card" onSubmit={handleSubmit}>
              <input
                name="search"
                type="search"
                placeholder="Buscar por dirección, ciudad o título"
                value={filters.search}
                onChange={handleChange}
              />
              <select name="operationType" value={filters.operationType} onChange={handleChange}>
                <option value="">Operación</option>
                <option value="alquiler">Alquiler</option>
                <option value="venta">Venta</option>
              </select>
              <button type="submit">Filtrar</button>
            </form>
          </div>
        </section>

        <section className="portal-results">
          <div className="portal-results-header">
            <div>
              <p className="eyebrow">Inmuebles</p>
              <h2>Propiedades disponibles</h2>
            </div>
            <div className="portal-results-meta">
              <span>Mostrando {properties.length} propiedades</span>
              {operationLabel ? <span>{operationLabel}</span> : null}
              {hasActiveFilter && filters.search ? <span>Búsqueda: {filters.search}</span> : null}
            </div>
          </div>

          {loading ? <p className="muted">Cargando propiedades...</p> : null}
          {error ? <p className="error-message">{error}</p> : null}

          {!loading && properties.length === 0 ? (
            <div className="empty-state">
              <h2>No encontramos propiedades con esos filtros.</h2>
              <p>Probá cambiar la búsqueda o seleccionar otra operación.</p>
            </div>
          ) : (
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
                  <span className="operation-badge">{property.operation_type}</span>
                  <h2>{property.title}</h2>
                  <p>{property.address}{property.city ? `, ${property.city}` : ''}</p>
                  <p><StatusBadge status={property.status} /></p>
                  <strong className="property-price">{formatCurrency(property.price)}</strong>
                </Link>
              ))}
            </section>
          )}

          <section className="portal-cta">
            <div>
              <p className="eyebrow">Locative para equipos</p>
              <h2>¿Trabajás en la inmobiliaria?</h2>
              <p>Administrá propiedades, contratos, pagos y arreglos de la inmobiliaria desde un solo sistema.</p>
            </div>
            <Link className="button-link" to="/login">Ingresar al sistema</Link>
          </section>
        </section>
      </main>
    </>
  )
}

export default PortalPublico

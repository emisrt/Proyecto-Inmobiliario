import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicHeader from '../components/PublicHeader'
import StatusBadge from '../components/StatusBadge'
import { agencyConfig } from '../config/agencyConfig'
import { useAuth } from '../context/useAuth'
import { listPublicProperties } from '../services/propertyService'
import { formatCurrency } from '../utils/formatters'
import { getRoleHome } from '../utils/roles'
import { toUserErrorMessage } from '../utils/userMessages'

function PortalPublico() {
  const { isAuthenticated, profile } = useAuth()
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
      setError(toUserErrorMessage(propertyError, 'No se pudieron cargar las propiedades publicadas.'))
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

  const hasActiveFilter = Boolean(filters.search || filters.operationType)
  const operationLabel = filters.operationType ? `Resultados para: ${filters.operationType}` : null
  const panelPath = isAuthenticated ? getRoleHome(profile?.role) : '/login'

  function getLocation(property) {
    return [property.neighborhood, property.city, property.province].filter(Boolean).join(', ')
  }

  return (
    <>
      <PublicHeader />
      <main className="public-portal">
        <section className="portal-hero">
          <img
            aria-hidden="true"
            className="portal-hero-watermark"
            src="/locative-mark.png"
            alt=""
          />
          <div className="portal-hero-inner">
            <div className="portal-hero-copy">
              <p className="eyebrow">BUSCÁ TU PRÓXIMO LUGAR</p>
              <h1>Tu próximo lugar empieza acá.</h1>
              <p>Explorá propiedades disponibles y encontrá una opción que se adapte a vos.</p>
            </div>
            <div className="portal-search-card" role="search" aria-label="Buscar propiedades">
              <input
                aria-label="Buscar por ciudad, barrio o dirección"
                name="search"
                type="search"
                placeholder="Buscar por ciudad, barrio o dirección"
                value={filters.search}
                onChange={handleChange}
              />
              <select
                aria-label="Seleccionar modalidad"
                name="operationType"
                value={filters.operationType}
                onChange={handleChange}
              >
                <option value="">Todos</option>
                <option value="alquiler">Alquiler</option>
                <option value="venta">Venta</option>
              </select>
            </div>
          </div>
        </section>

        <section className="portal-results">
          <div className="portal-results-header">
            <div>
              <p className="eyebrow">Inmuebles</p>
              <h2>{agencyConfig.publicPortalTitle}</h2>
            </div>
            <div className="portal-results-meta">
              <span>Mostrando {properties.length} propiedades</span>
              {operationLabel ? <span>{operationLabel}</span> : null}
              {hasActiveFilter && filters.search ? <span>Búsqueda: {filters.search}</span> : null}
            </div>
          </div>

          {loading ? <p className="loading-feedback">Cargando propiedades...</p> : null}
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
                  <p>{getLocation(property) || property.address}</p>
                  <div className="property-card-features">
                    <span>{property.property_type}</span>
                    <span>{property.bedrooms || 0} dorm.</span>
                    <span>{property.bathrooms || 0} baños</span>
                    {property.total_area ? <span>{property.total_area} m²</span> : null}
                  </div>
                  <p><StatusBadge status={property.status} /></p>
                  <strong className="property-price">{formatCurrency(property.price, property.currency || 'ARS')}</strong>
                </Link>
              ))}
            </section>
          )}

          <section className="portal-cta">
            <div>
              <p className="eyebrow">Acceso institucional</p>
              <h2>Panel de gestión de {agencyConfig.name}</h2>
              <p>Acceso exclusivo para usuarios autorizados: agentes, propietarios, inquilinos y profesionales registrados.</p>
            </div>
            <Link className="button-link" to={panelPath}>Ingresar al panel</Link>
          </section>

          <section className="portal-contact">
            <div>
              <p className="eyebrow">Contacto</p>
              <h2>Consultá por una propiedad</h2>
              <p>Coordiná una visita o solicitá más información con {agencyConfig.name}.</p>
            </div>
            <div className="portal-contact-grid">
              <article>
                <strong>WhatsApp</strong>
                <span>{agencyConfig.whatsapp}</span>
              </article>
              <article>
                <strong>Dirección</strong>
                <span>{agencyConfig.address}</span>
              </article>
              <article>
                <strong>Horario</strong>
                <span>{agencyConfig.businessHours}</span>
              </article>
            </div>
          </section>
        </section>
      </main>
    </>
  )
}

export default PortalPublico

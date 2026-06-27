import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Bath, BedDouble, Car, Droplets, Home, MapPin, Ruler, Trees } from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import PublicHeader from '../../components/PublicHeader'
import StatusBadge from '../../components/StatusBadge'
import { getProperty, updatePropertyStatus } from '../../services/propertyService'
import { formatCurrency } from '../../utils/formatters'

const assignableRentalStatuses = ['disponible', 'disponible_alquiler']

function PropertyDetail({ publicView = false }) {
  const { id } = useParams()
  const [property, setProperty] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const loadProperty = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getProperty(id)
      if (!data) throw new Error('No se encontro la propiedad.')
      setProperty(data)
    } catch (propertyError) {
      setError(propertyError.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadProperty()
  }, [loadProperty])

  async function changeStatus(status) {
    setError(null)
    setSuccess(null)

    try {
      const data = await updatePropertyStatus(id, status)
      setProperty(data)
      setSuccess('Estado actualizado.')
    } catch (statusError) {
      setError(statusError.message)
    }
  }

  function getLocation() {
    return [property.address, property.neighborhood, property.city, property.province].filter(Boolean).join(', ')
  }

  function getShortLocation() {
    return [property.city, property.province].filter(Boolean).join(', ') || property.address || 'Ubicación a consultar'
  }

  function yesNo(value) {
    return value ? 'Sí' : 'No'
  }

  function getFeatureChips() {
    if (!property) return []

    return [
      property.bedrooms ? { icon: BedDouble, label: `${property.bedrooms} dorm.` } : null,
      property.bathrooms ? { icon: Bath, label: `${property.bathrooms} baños` } : null,
      property.total_area ? { icon: Ruler, label: `${property.total_area} m² totales` } : null,
      !property.total_area && property.covered_area ? { icon: Ruler, label: `${property.covered_area} m² cubiertos` } : null,
      property.has_garage ? { icon: Car, label: 'Cochera' } : null,
      property.has_yard ? { icon: Trees, label: 'Patio' } : null,
      property.has_pool ? { icon: Droplets, label: 'Pileta' } : null,
    ].filter(Boolean)
  }

  function getDescriptionSummary() {
    if (!property.description) return 'Consultá más información sobre esta propiedad.'
    return property.description.split('.').filter(Boolean)[0].trim()
  }

  function getPublicFeatures() {
    if (!property) return []

    return [
      { label: 'Tipo de inmueble', value: property.property_type },
      { label: 'Provincia', value: property.province },
      { label: 'Ciudad', value: property.city },
      { label: 'Barrio', value: property.neighborhood },
      { label: 'Superficie total', value: property.total_area ? `${property.total_area} m²` : null },
      { label: 'Superficie cubierta', value: property.covered_area ? `${property.covered_area} m²` : null },
      { label: 'Cochera', value: property.has_garage ? 'Sí' : null },
      { label: 'Patio', value: property.has_yard ? 'Sí' : null },
      { label: 'Pileta', value: property.has_pool ? 'Sí' : null },
      { label: 'Mascotas permitidas', value: property.pets_allowed ? 'Sí' : null },
    ].filter((item) => item.value)
  }

  const content = (
    <section className="panel dashboard-section">
      {loading ? <p className="muted">Cargando propiedad...</p> : null}
      {error ? <p className="error-message">{error}</p> : null}
      {success ? <p className="success-message">{success}</p> : null}
      {property ? (
        <div className="detail-layout">
          {property.image_url ? (
            <img className="detail-image" src={property.image_url} alt={property.title} />
          ) : (
            <div className="image-placeholder">Sin imagen</div>
          )}
          <div>
            <p className="eyebrow">{property.operation_type}</p>
            <h2>{property.title}</h2>
            <p className="muted">{getLocation()}</p>
            <strong className="detail-price">{formatCurrency(property.price, property.currency || 'ARS')}</strong>
            <p><StatusBadge status={property.status} /></p>
            <div className="property-feature-list">
              <span>{property.bedrooms || 0} dorm.</span>
              <span>{property.bathrooms || 0} baños</span>
              {property.total_area ? <span>{property.total_area} m² totales</span> : null}
              {property.covered_area ? <span>{property.covered_area} m² cubiertos</span> : null}
            </div>
            <p>{property.description || 'Sin descripcion cargada.'}</p>
            <dl className="detail-list">
              <div><dt>Tipo</dt><dd>{property.property_type}</dd></div>
              <div><dt>Provincia</dt><dd>{property.province || '-'}</dd></div>
              <div><dt>Ciudad</dt><dd>{property.city || '-'}</dd></div>
              <div><dt>Barrio</dt><dd>{property.neighborhood || '-'}</dd></div>
              <div><dt>Cochera</dt><dd>{yesNo(property.has_garage)}</dd></div>
              <div><dt>Patio</dt><dd>{yesNo(property.has_yard)}</dd></div>
              <div><dt>Pileta</dt><dd>{yesNo(property.has_pool)}</dd></div>
              <div><dt>Mascotas</dt><dd>{yesNo(property.pets_allowed)}</dd></div>
              <div><dt>Propietario</dt><dd>{property.owner?.full_name || property.owner_id || '-'}</dd></div>
              <div><dt>Agente</dt><dd>{property.agent?.full_name || property.agent_id || '-'}</dd></div>
            </dl>
            {!publicView ? (
              <div className="form-actions">
                <Link className="button-link" to={`/inmobiliaria/propiedades/${property.id}/editar`}>
                  Editar
                </Link>
                {property.operation_type === 'alquiler' && assignableRentalStatuses.includes(property.status) ? (
                  <Link className="button-link" to={`/inmobiliaria/propiedades/${property.id}/asignar-inquilino`}>
                    Asignar inquilino
                  </Link>
                ) : null}
                <button type="button" onClick={() => changeStatus('suspendida')}>Suspender</button>
                <button type="button" onClick={() => changeStatus('disponible')}>Reactivar</button>
                <button type="button" onClick={() => changeStatus('anulada')}>Anular</button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  )

  if (publicView) {
    return (
      <>
        <PublicHeader />
        <main className="public-property-detail">
          {loading ? <p className="muted">Cargando propiedad...</p> : null}
          {error ? <p className="error-message">{error}</p> : null}
          {property ? (
            <>
              <section className="public-detail-heading">
                <Link to="/portal">
                  <ArrowLeft size={16} />
                  Volver a propiedades
                </Link>
                <p className="eyebrow">Propiedad</p>
                <h1>{property.title}</h1>
                <span>
                  <MapPin size={16} />
                  {getShortLocation()}
                </span>
              </section>

              <section className="public-detail-main">
                <div className="public-detail-media">
                  {property.image_url ? (
                    <img src={property.image_url} alt={property.title} />
                  ) : (
                    <div className="public-detail-placeholder">
                      <Home size={34} />
                      <span>Imagen no disponible</span>
                    </div>
                  )}
                </div>

                <aside className="public-detail-summary">
                  <span className="operation-badge">{property.operation_type}</span>
                  <h2>{property.title}</h2>
                  <p className="public-detail-location">{getShortLocation()}</p>
                  <strong className="public-detail-price">{formatCurrency(property.price, property.currency || 'ARS')}</strong>
                  <p><StatusBadge status={property.status} /></p>
                  {getFeatureChips().length > 0 ? (
                    <div className="public-detail-chips">
                      {getFeatureChips().map((feature) => {
                        const Icon = feature.icon
                        return (
                          <span key={feature.label}>
                            <Icon size={15} />
                            {feature.label}
                          </span>
                        )
                      })}
                    </div>
                  ) : null}
                  <p className="public-detail-summary-text">{getDescriptionSummary()}</p>
                  <div className="public-detail-actions">
                    <a className="button-link" href="#consulta-propiedad">Consultar por esta propiedad</a>
                    <Link className="secondary-button" to="/portal">Volver a propiedades</Link>
                  </div>
                </aside>
              </section>

              <section className="public-detail-sections">
                <article className="public-detail-card">
                  <h2>Descripción</h2>
                  <p>{property.description || 'Esta propiedad no tiene descripción adicional por el momento.'}</p>
                </article>

                <article className="public-detail-card">
                  <h2>Características del inmueble</h2>
                  {getPublicFeatures().length > 0 ? (
                    <div className="public-feature-grid">
                      {getPublicFeatures().map((feature) => (
                        <div key={feature.label}>
                          <span>{feature.label}</span>
                          <strong>{feature.value}</strong>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No hay características adicionales cargadas por el momento.</p>
                  )}
                </article>

                <article className="public-detail-card public-contact-card" id="consulta-propiedad">
                  <h2>¿Te interesa esta propiedad?</h2>
                  <p>Comunicate con la inmobiliaria para coordinar una visita o solicitar más información.</p>
                  <Link className="button-link" to="/portal">Ver más propiedades</Link>
                </article>
              </section>
            </>
          ) : null}
        </main>
      </>
    )
  }

  return (
    <DashboardLayout title="Detalle de propiedad" role="Inmobiliaria">
      {content}
    </DashboardLayout>
  )
}

export default PropertyDetail

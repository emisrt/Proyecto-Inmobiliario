import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
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
            <p className="muted">{property.address}{property.city ? `, ${property.city}` : ''}</p>
            <strong className="detail-price">{formatCurrency(property.price)}</strong>
            <p><StatusBadge status={property.status} /></p>
            <p>{property.description || 'Sin descripcion cargada.'}</p>
            <dl className="detail-list">
              <div><dt>Tipo</dt><dd>{property.property_type}</dd></div>
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
        <main className="page">
          <section className="page-heading">
            <p>Locative</p>
            <h1>Detalle de propiedad</h1>
          </section>
          {content}
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

import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Bath,
  BedDouble,
  Car,
  ClipboardList,
  Droplets,
  Edit3,
  FileText,
  Home,
  MapPin,
  Ruler,
  ShieldAlert,
  Trash2,
  Trees,
  UserRound,
} from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import PublicHeader from '../../components/PublicHeader'
import StatusBadge from '../../components/StatusBadge'
import {
  deleteProperty,
  getProperty,
  getPropertyContractSummary,
  getPropertyDeletionSummary,
  updatePropertyStatus,
} from '../../services/propertyService'
import { formatCurrency, formatDate } from '../../utils/formatters'

const assignableRentalStatuses = ['disponible', 'disponible_alquiler']
const blockedAssignmentStatuses = ['vendida', 'anulada', 'suspendida']
const propertyStatusOptions = [
  'disponible',
  'disponible_alquiler',
  'disponible_venta',
  'alquilada',
  'vendida',
  'suspendida',
  'anulada',
]

function PropertyDetail({ publicView = false }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [property, setProperty] = useState(null)
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [contractLoading, setContractLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [contactNotice, setContactNotice] = useState(null)
  const [statusToConfirm, setStatusToConfirm] = useState(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteSummary, setDeleteSummary] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteError, setDeleteError] = useState(null)

  const loadProperty = useCallback(async () => {
    setLoading(true)
    setContractLoading(!publicView)
    setError(null)
    setDeleteSummary(null)

    try {
      const data = await getProperty(id)
      if (!data) throw new Error('No se encontro la propiedad.')
      setProperty(data)

      if (!publicView) {
        const contractData = await getPropertyContractSummary(id)
        setContract(contractData)
      }
    } catch (propertyError) {
      setError(propertyError.message)
    } finally {
      setLoading(false)
      setContractLoading(false)
    }
  }, [id, publicView])

  useEffect(() => {
    loadProperty()
  }, [loadProperty])

  async function changeStatus(status) {
    setError(null)
    setSuccess(null)
    setStatusLoading(true)

    try {
      const data = await updatePropertyStatus(id, status)
      setProperty(data)
      setSuccess('Estado actualizado.')
    } catch (statusError) {
      setError(statusError.message)
    } finally {
      setStatusLoading(false)
      setStatusToConfirm(null)
    }
  }

  function handleStatusChange(event) {
    const nextStatus = event.target.value

    if (['suspendida', 'anulada'].includes(nextStatus)) {
      setStatusToConfirm(nextStatus)
      return
    }

    changeStatus(nextStatus)
  }

  async function openDeleteModal() {
    setDeleteModalOpen(true)
    setDeleteError(null)
    setDeleteSummary(null)
    setDeleteLoading(true)

    try {
      const summary = await getPropertyDeletionSummary(id)
      setDeleteSummary(summary)
    } catch (summaryError) {
      setDeleteError(summaryError.message)
    } finally {
      setDeleteLoading(false)
    }
  }

  async function confirmDelete() {
    if (!deleteSummary) return

    if (deleteSummary.activeContracts > 0 || deleteSummary.activeRepairs > 0) {
      setDeleteError('No se puede eliminar una propiedad con contratos o arreglos activos.')
      return
    }

    setDeleteError(null)
    setDeleteLoading(true)

    try {
      await deleteProperty(id)
      navigate('/inmobiliaria/propiedades', { replace: true })
    } catch (deletePropertyError) {
      setDeleteError(deletePropertyError.message)
      setDeleteLoading(false)
    }
  }

  function getLocation() {
    return [property.address, property.neighborhood, property.city, property.province].filter(Boolean).join(', ')
  }

  function getShortLocation() {
    return [property.city, property.province].filter(Boolean).join(', ') || property.address || 'Ubicación a consultar'
  }

  function formatPublicValue(value) {
    if (value === null || value === undefined || value === '' || value === 0) {
      return 'No especificado'
    }

    return value
  }

  function formatBoolean(value) {
    return value ? 'Sí' : 'No'
  }

  function formatDetailValue(value) {
    if (value === null || value === undefined || value === '' || value === 0) {
      return 'No especificado'
    }

    return value
  }

  function formatLabel(value) {
    if (!value) return 'No especificado'
    return value.replaceAll('_', ' ')
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
      { label: 'Tipo de inmueble', value: formatPublicValue(property.property_type) },
      { label: 'Provincia', value: formatPublicValue(property.province) },
      { label: 'Ciudad', value: formatPublicValue(property.city) },
      { label: 'Barrio', value: formatPublicValue(property.neighborhood) },
      { label: 'Dormitorios', value: formatPublicValue(property.bedrooms) },
      { label: 'Baños', value: formatPublicValue(property.bathrooms) },
      { label: 'Superficie total', value: property.total_area ? `${property.total_area} m²` : 'No especificado' },
      { label: 'Superficie cubierta', value: property.covered_area ? `${property.covered_area} m²` : 'No especificado' },
      { label: 'Cochera', value: formatBoolean(property.has_garage) },
      { label: 'Patio', value: formatBoolean(property.has_yard) },
      { label: 'Pileta', value: formatBoolean(property.has_pool) },
      { label: 'Mascotas', value: formatBoolean(property.pets_allowed) },
    ]
  }

  function getPublicationInfo() {
    if (!property) return []

    return [
      { label: 'Operación', value: formatLabel(property.operation_type) },
      { label: 'Estado', value: <StatusBadge status={property.status} /> },
      { label: 'Tipo', value: formatDetailValue(property.property_type) },
      { label: 'Precio', value: formatCurrency(property.price, property.currency || 'ARS') },
      { label: 'Moneda', value: formatDetailValue(property.currency) },
      { label: 'Dirección', value: formatDetailValue(property.address) },
      { label: 'Barrio', value: formatDetailValue(property.neighborhood) },
      { label: 'Ciudad', value: formatDetailValue(property.city) },
      { label: 'Provincia', value: formatDetailValue(property.province) },
    ]
  }

  function getPropertyFeatures() {
    if (!property) return []

    return [
      { label: 'Dormitorios', value: formatDetailValue(property.bedrooms), icon: BedDouble },
      { label: 'Baños', value: formatDetailValue(property.bathrooms), icon: Bath },
      { label: 'Superficie total', value: property.total_area ? `${property.total_area} m²` : 'No especificado', icon: Ruler },
      { label: 'Superficie cubierta', value: property.covered_area ? `${property.covered_area} m²` : 'No especificado', icon: Ruler },
      { label: 'Cochera', value: formatBoolean(property.has_garage), icon: Car },
      { label: 'Patio', value: formatBoolean(property.has_yard), icon: Trees },
      { label: 'Pileta', value: formatBoolean(property.has_pool), icon: Droplets },
      { label: 'Mascotas', value: formatBoolean(property.pets_allowed), icon: Home },
    ]
  }

  const isRental = property?.operation_type === 'alquiler'
  const isSale = property?.operation_type === 'venta'
  const canAssignTenant =
    isRental &&
    assignableRentalStatuses.includes(property?.status) &&
    !blockedAssignmentStatuses.includes(property?.status) &&
    !contract
  const deleteBlocked = Boolean(deleteSummary && (deleteSummary.activeContracts > 0 || deleteSummary.activeRepairs > 0))

  const internalContent = (
    <section className="internal-property-page">
      {loading ? <p className="muted">Cargando propiedad...</p> : null}
      {error ? <p className="error-message">{error}</p> : null}
      {success ? <p className="success-message">{success}</p> : null}

      {property ? (
        <>
          <header className="internal-property-heading">
            <div>
              <p className="eyebrow">Panel interno de la inmobiliaria</p>
              <h2>Detalle de propiedad</h2>
              <span>{property.title}</span>
            </div>
            <Link className="secondary-button" to="/inmobiliaria/propiedades">
              <ArrowLeft size={16} />
              Volver al listado
            </Link>
          </header>

          <section className="internal-property-summary-card">
            <div className="internal-property-media">
              {property.image_url ? (
                <img src={property.image_url} alt={property.title} />
              ) : (
                <div className="internal-property-placeholder">
                  <Home size={34} />
                  <span>Sin imagen cargada</span>
                </div>
              )}
            </div>
            <div className="internal-property-summary-copy">
              <span className="operation-badge">{formatLabel(property.operation_type)}</span>
              <h3>{property.title}</h3>
              <p className="internal-property-address">
                <MapPin size={16} />
                {getLocation() || 'No especificado'}
              </p>
              <strong className="internal-property-price">{formatCurrency(property.price, property.currency || 'ARS')}</strong>
              <StatusBadge status={property.status} />
              <p>{property.description || 'Sin descripción cargada.'}</p>
              <div className="internal-management-note">
                <UserRound size={16} />
                <span>Propietario: {property.owner?.full_name || 'Sin asignar'}</span>
              </div>
              <div className="internal-management-note">
                <ShieldAlert size={16} />
                <span>Administrada por la inmobiliaria</span>
              </div>
            </div>
          </section>

          <section className="internal-property-grid">
            <article className="internal-property-card">
              <div className="internal-card-title">
                <ClipboardList size={18} />
                <h3>Información de publicación</h3>
              </div>
              <div className="internal-info-grid">
                {getPublicationInfo().map((item) => (
                  <div className="internal-info-item" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="internal-property-card">
              <div className="internal-card-title">
                <Home size={18} />
                <h3>Características del inmueble</h3>
              </div>
              <div className="internal-feature-grid">
                {getPropertyFeatures().map((feature) => {
                  const Icon = feature.icon
                  return (
                    <div className="internal-feature-item" key={feature.label}>
                      <Icon size={17} />
                      <span>{feature.label}</span>
                      <strong>{feature.value}</strong>
                    </div>
                  )
                })}
              </div>
            </article>
          </section>

          <section className="internal-property-card">
            <div className="internal-card-title">
              <FileText size={18} />
              <h3>Inquilino y contrato asociado</h3>
            </div>
            {contractLoading ? <p className="muted">Consultando contrato asociado...</p> : null}
            {isSale ? (
              <div className="internal-warning-box">
                <AlertTriangle size={18} />
                <p>Esta propiedad está configurada para venta. La asignación de inquilino solo aplica a propiedades en alquiler.</p>
              </div>
            ) : null}
            {!contractLoading && contract ? (
              <div className="contract-summary-card">
                <div>
                  <span>Inquilino</span>
                  <strong>{contract.tenant?.full_name || 'Sin asignar'}</strong>
                  <small>{contract.tenant?.email || 'Email no especificado'}</small>
                  <small>{contract.tenant?.phone || 'Teléfono no especificado'}</small>
                </div>
                <div>
                  <span>Vigencia</span>
                  <strong>{formatDate(contract.start_date)} - {formatDate(contract.end_date)}</strong>
                  <small>Estado: {formatLabel(contract.status)}</small>
                </div>
                <div>
                  <span>Monto mensual</span>
                  <strong>{formatCurrency(contract.monthly_amount, property.currency || 'ARS')}</strong>
                </div>
              </div>
            ) : null}
            {!contractLoading && !contract && !isSale ? (
              <div className="internal-empty-state">
                <strong>Sin contrato activo o pendiente</strong>
                <p>La propiedad todavía no tiene un inquilino asociado.</p>
                {canAssignTenant ? (
                  <Link className="button-link" to={`/inmobiliaria/propiedades/${property.id}/asignar-inquilino`}>
                    Asignar inquilino
                  </Link>
                ) : (
                  <span>No disponible para asignación con el estado actual.</span>
                )}
              </div>
            ) : null}
          </section>

          <section className="internal-property-grid">
            <article className="internal-property-card">
              <div className="internal-card-title">
                <Edit3 size={18} />
                <h3>Acciones administrativas</h3>
              </div>
              <div className="admin-action-list">
                <Link className="button-link" to={`/inmobiliaria/propiedades/${property.id}/editar`}>
                  Editar propiedad
                </Link>
                {canAssignTenant ? (
                  <Link className="secondary-button" to={`/inmobiliaria/propiedades/${property.id}/asignar-inquilino`}>
                    Asignar inquilino
                  </Link>
                ) : null}
                {contract ? (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setSuccess('La vista de contrato se integrará próximamente.')}
                  >
                    Ver contrato
                  </button>
                ) : null}
                <label className="status-control">
                  <span>Cambiar estado</span>
                  <select value={property.status || ''} onChange={handleStatusChange} disabled={statusLoading}>
                    {propertyStatusOptions.map((status) => (
                      <option key={status} value={status}>{formatLabel(status)}</option>
                    ))}
                  </select>
                </label>
              </div>
            </article>

            <article className="internal-property-card danger-zone-card">
              <div className="internal-card-title">
                <Trash2 size={18} />
                <h3>Zona peligrosa</h3>
              </div>
              <p>Eliminar una propiedad puede afectar contratos, pagos y solicitudes de arreglo vinculadas. Se validarán asociaciones antes de continuar.</p>
              <button type="button" className="danger-button" onClick={openDeleteModal}>
                Eliminar propiedad
              </button>
            </article>
          </section>
        </>
      ) : null}

      {statusToConfirm ? (
        <div className="internal-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="status-modal-title">
          <div className="internal-modal">
            <div className="internal-modal-icon">
              <AlertTriangle size={22} />
            </div>
            <h3 id="status-modal-title">Confirmar cambio de estado</h3>
            <p>
              Vas a cambiar esta propiedad a <strong>{formatLabel(statusToConfirm)}</strong>. Esta acción puede ocultarla del portal o bloquear operaciones internas.
            </p>
            <div className="internal-modal-actions">
              <button type="button" className="secondary-button" onClick={() => setStatusToConfirm(null)} disabled={statusLoading}>
                Cancelar
              </button>
              <button type="button" onClick={() => changeStatus(statusToConfirm)} disabled={statusLoading}>
                Confirmar
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteModalOpen ? (
        <div className="internal-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
          <div className="internal-modal">
            <div className="internal-modal-icon internal-modal-icon-danger">
              <Trash2 size={22} />
            </div>
            <h3 id="delete-modal-title">Eliminar propiedad</h3>
            <p>Antes de eliminar, Locative revisa si la propiedad tiene contratos, pagos o arreglos asociados.</p>
            {deleteLoading && !deleteSummary ? <p className="muted">Validando asociaciones...</p> : null}
            {deleteError ? <p className="error-message">{deleteError}</p> : null}
            {deleteSummary ? (
              <>
                <div className="delete-summary-grid">
                  <div><span>Contratos</span><strong>{deleteSummary.contracts}</strong></div>
                  <div><span>Contratos activos/pendientes</span><strong>{deleteSummary.activeContracts}</strong></div>
                  <div><span>Arreglos</span><strong>{deleteSummary.repairs}</strong></div>
                  <div><span>Arreglos activos</span><strong>{deleteSummary.activeRepairs}</strong></div>
                  <div><span>Pagos asociados</span><strong>{deleteSummary.payments}</strong></div>
                </div>
                {deleteBlocked ? (
                  <div className="internal-warning-box">
                    <AlertTriangle size={18} />
                    <p>No se puede eliminar esta propiedad mientras tenga contratos o arreglos activos.</p>
                  </div>
                ) : (
                  <div className="internal-warning-box">
                    <AlertTriangle size={18} />
                    <p>Si existen asociaciones históricas, revisá que la eliminación sea coherente con las reglas de la base de datos.</p>
                  </div>
                )}
              </>
            ) : null}
            <div className="internal-modal-actions">
              <button type="button" className="secondary-button" onClick={() => setDeleteModalOpen(false)} disabled={deleteLoading}>
                Cancelar
              </button>
              <button type="button" className="danger-button" onClick={confirmDelete} disabled={deleteLoading || !deleteSummary || deleteBlocked}>
                Eliminar definitivamente
              </button>
            </div>
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
                  <div>
                    <h2>¿Te interesa esta propiedad?</h2>
                    <p>Comunicate con la inmobiliaria para coordinar una visita o solicitar más información.</p>
                    {contactNotice ? <p className="public-contact-notice">{contactNotice}</p> : null}
                  </div>
                  <button
                    className="button-link"
                    type="button"
                    onClick={() => setContactNotice('La funcionalidad de contacto se integrará próximamente.')}
                  >
                    Solicitar información
                  </button>
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
      {internalContent}
    </DashboardLayout>
  )
}

export default PropertyDetail

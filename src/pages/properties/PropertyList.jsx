import { useEffect, useMemo, useState } from 'react'
import { Bath, BedDouble, Building2, Grid3X3, Home, MoreVertical, Plus, Ruler, Search, Table2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import StatusBadge from '../../components/StatusBadge'
import { listProperties } from '../../services/propertyService'
import { formatCurrency, formatDisplayText } from '../../utils/formatters'
import { toUserErrorMessage } from '../../utils/userMessages'

const operationOptions = [
  { value: '', label: 'Todas' },
  { value: 'alquiler', label: 'Alquiler' },
  { value: 'venta', label: 'Venta' },
]

const statusOptions = [
  { value: '', label: 'Todos' },
  { value: 'disponible_alquiler', label: 'Disponible alquiler' },
  { value: 'disponible_venta', label: 'Disponible venta' },
  { value: 'alquilada', label: 'Alquilada' },
  { value: 'vendida', label: 'Vendida' },
  { value: 'suspendida', label: 'Suspendida' },
  { value: 'anulada', label: 'Anulada' },
  { value: 'registrada', label: 'Registrada' },
]

const typeOptions = [
  { value: '', label: 'Todos' },
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'local', label: 'Local' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'galpon', label: 'Galpón' },
  { value: 'quinta', label: 'Quinta' },
  { value: 'otro', label: 'Otro' },
]

const sortOptions = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'price_asc', label: 'Precio ascendente' },
  { value: 'price_desc', label: 'Precio descendente' },
  { value: 'title_asc', label: 'Título A-Z' },
]

const rentalStatuses = ['disponible', 'disponible_alquiler']

function getLocation(property) {
  return [property.address, property.neighborhood, property.city, property.province].filter(Boolean).join(', ')
}

function getShortLocation(property) {
  return [property.neighborhood, property.city, property.province].filter(Boolean).join(', ') || property.address || 'Ubicación no especificada'
}

function matchesSearch(property, search) {
  if (!search) return true

  const query = search.trim().toLowerCase()
  const searchable = [
    property.title,
    property.address,
    property.neighborhood,
    property.city,
    property.province,
    property.property_type,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return searchable.includes(query)
}

function sortProperties(properties, sortBy) {
  const sorted = [...properties]

  if (sortBy === 'price_asc') {
    return sorted.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
  }

  if (sortBy === 'price_desc') {
    return sorted.sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
  }

  if (sortBy === 'title_asc') {
    return sorted.sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'es'))
  }

  return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
}

function PropertyList() {
  const navigate = useNavigate()
  const [properties, setProperties] = useState([])
  const [openMenuId, setOpenMenuId] = useState(null)
  const [viewMode, setViewMode] = useState('cards')
  const [filters, setFilters] = useState({
    search: '',
    operation: '',
    status: '',
    type: '',
    sortBy: 'recent',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function loadProperties() {
    setLoading(true)
    setError(null)

    try {
      const data = await listProperties()
      setProperties(data)
    } catch (propertyError) {
      setError(toUserErrorMessage(propertyError, 'No se pudo cargar el listado de propiedades.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProperties()
  }, [])

  const stats = useMemo(() => ({
    total: properties.length,
    rentals: properties.filter((property) => property.operation_type === 'alquiler').length,
    sales: properties.filter((property) => property.operation_type === 'venta').length,
    rented: properties.filter((property) => property.status === 'alquilada').length,
    inactive: properties.filter((property) => ['suspendida', 'anulada'].includes(property.status)).length,
  }), [properties])

  const filteredProperties = useMemo(() => {
    const filtered = properties.filter((property) => (
      matchesSearch(property, filters.search)
      && (!filters.operation || property.operation_type === filters.operation)
      && (!filters.status || property.status === filters.status)
      && (!filters.type || property.property_type === filters.type)
    ))

    return sortProperties(filtered, filters.sortBy)
  }, [filters, properties])

  const hasFilters = Boolean(filters.search || filters.operation || filters.status || filters.type)

  function handleFilterChange(event) {
    const { name, value } = event.target
    setFilters((currentFilters) => ({ ...currentFilters, [name]: value }))
  }

  function clearFilters() {
    setFilters({
      search: '',
      operation: '',
      status: '',
      type: '',
      sortBy: 'recent',
    })
  }

  function openProperty(propertyId) {
    navigate(`/inmobiliaria/propiedades/${propertyId}`)
  }

  function handleCardKeyDown(event, propertyId) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openProperty(propertyId)
    }
  }

  function renderPropertyMenu(property) {
    return (
      <div className="context-menu" onClick={(event) => event.stopPropagation()}>
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
            <Link to={`/inmobiliaria/propiedades/${property.id}`}>Ver detalle</Link>
            <Link to={`/inmobiliaria/propiedades/${property.id}/editar`}>Editar propiedad</Link>
            {property.operation_type === 'alquiler' && rentalStatuses.includes(property.status) ? (
              <Link to={`/inmobiliaria/propiedades/${property.id}/asignar-inquilino`}>Asignar inquilino</Link>
            ) : null}
          </div>
        ) : null}
      </div>
    )
  }

  function renderEmptyState() {
    if (properties.length === 0) {
      return (
        <div className="empty-state property-management-empty">
          <Home size={34} />
          <h2>No hay propiedades cargadas</h2>
          <p>Todavía no se registraron propiedades en el sistema.</p>
          <Link className="button-link" to="/inmobiliaria/propiedades/nueva">
            <Plus size={17} />
            Nueva propiedad
          </Link>
        </div>
      )
    }

    return (
      <div className="empty-state property-management-empty">
        <Search size={34} />
        <h2>No se encontraron propiedades con los filtros aplicados.</h2>
        <p>Probá ajustar la búsqueda o limpiar los filtros para volver al listado completo.</p>
        <button type="button" className="secondary-button" onClick={clearFilters}>
          Limpiar filtros
        </button>
      </div>
    )
  }

  return (
    <DashboardLayout title="Propiedades" role="Inmobiliaria">
      <section className="property-management-page">
        <div className="property-management-header">
          <div>
            <p className="eyebrow">Panel de gestión</p>
            <h1>Propiedades</h1>
            <p>Gestioná las propiedades publicadas por la inmobiliaria.</p>
          </div>
          <Link className="button-link property-management-create" to="/inmobiliaria/propiedades/nueva">
            <Plus size={17} />
            Nueva propiedad
          </Link>
        </div>

        <section className="property-metrics-grid" aria-label="Métricas de propiedades">
          <article>
            <span>Total</span>
            <strong>{stats.total}</strong>
            <small>propiedades</small>
          </article>
          <article>
            <span>En alquiler</span>
            <strong>{stats.rentals}</strong>
            <small>publicadas o gestionadas</small>
          </article>
          <article>
            <span>En venta</span>
            <strong>{stats.sales}</strong>
            <small>publicadas o gestionadas</small>
          </article>
          <article>
            <span>Alquiladas</span>
            <strong>{stats.rented}</strong>
            <small>con contrato vigente</small>
          </article>
          <article>
            <span>Suspendidas / anuladas</span>
            <strong>{stats.inactive}</strong>
            <small>fuera de publicación</small>
          </article>
        </section>

        <section className="property-management-toolbar" aria-label="Filtros de propiedades">
          <label className="property-search-field">
            <Search size={17} />
            <span className="sr-only">Buscar propiedad</span>
            <input
              name="search"
              placeholder="Buscar por título, dirección o ciudad"
              type="search"
              value={filters.search}
              onChange={handleFilterChange}
            />
          </label>

          <label>
            <span>Operación</span>
            <select name="operation" value={filters.operation} onChange={handleFilterChange}>
              {operationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label>
            <span>Estado</span>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label>
            <span>Tipo</span>
            <select name="type" value={filters.type} onChange={handleFilterChange}>
              {typeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <label>
            <span>Ordenar</span>
            <select name="sortBy" value={filters.sortBy} onChange={handleFilterChange}>
              {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>

          <div className="view-toggle" aria-label="Seleccionar vista">
            <button
              aria-pressed={viewMode === 'cards'}
              className={viewMode === 'cards' ? 'active' : ''}
              type="button"
              onClick={() => setViewMode('cards')}
            >
              <Grid3X3 size={16} />
              Tarjetas
            </button>
            <button
              aria-pressed={viewMode === 'table'}
              className={viewMode === 'table' ? 'active' : ''}
              type="button"
              onClick={() => setViewMode('table')}
            >
              <Table2 size={16} />
              Tabla
            </button>
          </div>
        </section>

        <div className="property-results-summary">
          <span>{filteredProperties.length} de {properties.length} propiedades</span>
          {hasFilters ? <button type="button" onClick={clearFilters}>Limpiar filtros</button> : null}
        </div>

        {loading ? <p className="loading-feedback">Cargando propiedades...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}

        {!loading && filteredProperties.length === 0 ? renderEmptyState() : null}

        {!loading && filteredProperties.length > 0 && viewMode === 'cards' ? (
          <section className="property-management-grid" aria-label="Listado visual de propiedades">
            {filteredProperties.map((property) => (
              <article
                className="management-property-card"
                key={property.id}
                role="button"
                tabIndex="0"
                onClick={() => openProperty(property.id)}
                onKeyDown={(event) => handleCardKeyDown(event, property.id)}
              >
                <div className="management-property-media">
                  {property.image_url ? (
                    <img src={property.image_url} alt={property.title} />
                  ) : (
                    <div className="management-property-placeholder">
                      <Building2 size={30} />
                      <span>Sin imagen</span>
                    </div>
                  )}
                  <span className="operation-badge">{property.operation_type}</span>
                  <div className="management-card-menu">{renderPropertyMenu(property)}</div>
                </div>

                <div className="management-property-body">
                  <div className="management-property-title">
                    <h2>{property.title}</h2>
                    <StatusBadge status={property.status} />
                  </div>
                  <p>{getShortLocation(property)}</p>
                  <strong>{formatCurrency(property.price, property.currency || 'ARS')}</strong>
                  <div className="property-card-features">
                    <span>{formatDisplayText(property.property_type)}</span>
                    <span><BedDouble size={14} /> {property.bedrooms || 0} dorm.</span>
                    <span><Bath size={14} /> {property.bathrooms || 0} baños</span>
                    {property.total_area ? <span><Ruler size={14} /> {property.total_area} m²</span> : null}
                  </div>
                  <div className="management-property-actions" onClick={(event) => event.stopPropagation()}>
                    <Link to={`/inmobiliaria/propiedades/${property.id}`}>Ver detalle</Link>
                    <Link to={`/inmobiliaria/propiedades/${property.id}/editar`}>Editar</Link>
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : null}

        {!loading && filteredProperties.length > 0 && viewMode === 'table' ? (
          <section className="panel dashboard-section">
            <div className="table-wrapper">
              <table className="simple-table interactive-table">
                <thead>
                  <tr>
                    <th>Propiedad</th>
                    <th>Ubicación</th>
                    <th>Operación</th>
                    <th>Tipo</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th aria-label="Acciones" />
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((property) => (
                    <tr
                      className="clickable-row"
                      key={property.id}
                      onClick={() => openProperty(property.id)}
                      tabIndex="0"
                      onKeyDown={(event) => handleCardKeyDown(event, property.id)}
                    >
                      <td>
                        <div className="table-main-copy">
                          <strong>{property.title}</strong>
                          <span>{formatDisplayText(property.property_type)}</span>
                        </div>
                      </td>
                      <td>{getLocation(property)}</td>
                      <td>{formatDisplayText(property.operation_type)}</td>
                      <td>{formatDisplayText(property.property_type)}</td>
                      <td>{formatCurrency(property.price, property.currency || 'ARS')}</td>
                      <td><StatusBadge status={property.status} /></td>
                      <td className="row-menu-cell">
                        {renderPropertyMenu(property)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </section>
    </DashboardLayout>
  )
}

export default PropertyList

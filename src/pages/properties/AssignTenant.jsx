import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/useAuth'
import {
  assignTenantToProperty,
  getActiveContractByProperty,
  getActiveContractByTenant,
  searchAssignableProfiles,
} from '../../services/assignmentService'
import { getProperty } from '../../services/propertyService'
import { formatCurrency } from '../../utils/formatters'

const availableRentalStatuses = ['disponible', 'disponible_alquiler']
const blockedRoles = ['agente_inmobiliario', 'profesional']

function getToday() {
  return new Date().toISOString().slice(0, 10)
}

function getDefaultEndDate() {
  const date = new Date()
  date.setFullYear(date.getFullYear() + 2)
  return date.toISOString().slice(0, 10)
}

function AssignTenant() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [property, setProperty] = useState(null)
  const [profileSearch, setProfileSearch] = useState('')
  const [profileResults, setProfileResults] = useState([])
  const [tenant, setTenant] = useState(null)
  const [form, setForm] = useState({
    startDate: getToday(),
    endDate: getDefaultEndDate(),
    monthlyAmount: '',
    status: 'activo',
    rules: '',
  })
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const canAssignProperty = useMemo(
    () => property && property.operation_type === 'alquiler' && availableRentalStatuses.includes(property.status),
    [property],
  )

  const loadProperty = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getProperty(id)
      if (!data) throw new Error('No se encontro la propiedad.')
      setProperty(data)
      setForm((currentForm) => ({
        ...currentForm,
        monthlyAmount: currentForm.monthlyAmount || data.price || '',
      }))
    } catch (propertyError) {
      setError(propertyError.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadProperty()
  }, [loadProperty])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  async function handleSearch(event) {
    event.preventDefault()
    setSearching(true)
    setError(null)
    setSuccess(null)
    setTenant(null)
    setProfileResults([])

    try {
      const profiles = await searchAssignableProfiles(profileSearch)
      setProfileResults(profiles)
      if (profiles.length === 0) {
        setError('Usuario no encontrado.')
      }
    } catch (searchError) {
      setError(searchError.message)
    } finally {
      setSearching(false)
    }
  }

  async function validateAssignment() {
    if (!property) throw new Error('No se encontro la propiedad.')
    if (!canAssignProperty) throw new Error('La propiedad no está disponible para alquiler.')
    if (!tenant) throw new Error('Primero buscá y seleccioná un usuario.')
    if (blockedRoles.includes(tenant.role)) {
      throw new Error('No se puede asignar como inquilino a un agente inmobiliario o profesional.')
    }
    if (Number(form.monthlyAmount) <= 0) throw new Error('El monto mensual debe ser mayor a 0.')
    if (!form.startDate || !form.endDate) throw new Error('Completá fecha de inicio y finalización.')
    if (form.startDate >= form.endDate) throw new Error('La fecha de inicio debe ser anterior a la finalización.')

    const [propertyContract, tenantContract] = await Promise.all([
      getActiveContractByProperty(property.id),
      getActiveContractByTenant(tenant.id),
    ])

    if (propertyContract) throw new Error('Esta propiedad ya tiene un contrato activo.')
    if (tenantContract) throw new Error('El usuario ya tiene un contrato activo.')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await validateAssignment()
      await assignTenantToProperty({
        propertyId: property.id,
        tenantId: tenant.id,
        agentId: user.id,
        startDate: form.startDate,
        endDate: form.endDate,
        monthlyAmount: form.monthlyAmount,
        status: form.status,
        rules: form.rules,
      })
      setSuccess('Asignación realizada correctamente.')
      setTimeout(() => navigate(`/inmobiliaria/propiedades/${property.id}`), 900)
    } catch (assignmentError) {
      setError(assignmentError.message || 'No se pudo crear el contrato.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Asignar inquilino" role="Inmobiliaria">
      <section className="panel dashboard-section">
        {loading ? <p className="loading-feedback">Cargando propiedad...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        {success ? <p className="success-message">{success}</p> : null}

        {property ? (
          <div className="assignment-summary">
            <div>
              <p className="eyebrow">{property.operation_type}</p>
              <h2>{property.title}</h2>
              <p className="muted">{property.address}{property.city ? `, ${property.city}` : ''}</p>
            </div>
            <div>
              <StatusBadge status={property.status} />
              <strong>{formatCurrency(property.price)}</strong>
            </div>
          </div>
        ) : null}

        {property && !canAssignProperty ? (
          <p className="error-message">La propiedad no está disponible para alquiler.</p>
        ) : null}

        <form className="form assignment-search" onSubmit={handleSearch}>
          <label>
            Buscar usuario
            <input
              value={profileSearch}
              onChange={(event) => setProfileSearch(event.target.value)}
              placeholder="Nombre o email"
            />
          </label>
          <button type="submit" disabled={searching}>
            {searching ? 'Buscando...' : 'Buscar usuario'}
          </button>
        </form>

        {profileResults.length > 0 ? (
          <section className="assignment-results" aria-label="Usuarios encontrados">
            {profileResults.map((profile) => (
              <button
                className={`tenant-option ${tenant?.id === profile.id ? 'selected' : ''}`}
                key={profile.id}
                type="button"
                onClick={() => setTenant(profile)}
              >
                <span>
                  <strong>{profile.full_name || 'Sin nombre cargado'}</strong>
                  <small>{profile.email || profile.phone || 'Sin contacto cargado'}</small>
                </span>
                <StatusBadge status={profile.role} />
              </button>
            ))}
          </section>
        ) : null}

        {tenant ? (
          <article className="tenant-result">
            <div>
              <p className="eyebrow">Usuario seleccionado</p>
              <h2>{tenant.full_name || 'Sin nombre cargado'}</h2>
              <p>{tenant.email || 'Email no especificado'}</p>
              <p className="muted">{tenant.phone || 'Sin teléfono'}</p>
            </div>
            <StatusBadge status={tenant.role} />
          </article>
        ) : null}

        <form className="form two-column-form" onSubmit={handleSubmit}>
          <label>
            Fecha de inicio
            <input name="startDate" type="date" value={form.startDate} onChange={handleChange} required />
          </label>
          <label>
            Fecha de finalización
            <input name="endDate" type="date" value={form.endDate} onChange={handleChange} required />
          </label>
          <label>
            Monto mensual
            <input name="monthlyAmount" type="number" min="1" value={form.monthlyAmount} onChange={handleChange} required />
          </label>
          <label>
            Estado inicial
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="activo">Activo</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </label>
          <label className="full-row">
            Reglamento o cláusulas
            <textarea name="rules" rows="5" value={form.rules} onChange={handleChange} />
          </label>
          <div className="form-actions full-row">
            <button type="submit" disabled={saving || !canAssignProperty || !tenant}>
              {saving ? 'Confirmando...' : 'Confirmar asignación'}
            </button>
            <Link className="secondary-button" to={`/inmobiliaria/propiedades/${id}`}>
              Cancelar
            </Link>
          </div>
        </form>
      </section>
    </DashboardLayout>
  )
}

export default AssignTenant

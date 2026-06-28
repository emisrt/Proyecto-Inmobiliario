import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../context/useAuth'
import {
  createAgentRepair,
  getActiveContractByProperty,
  listRepairProperties,
} from '../../services/repairService'
import { toUserErrorMessage } from '../../utils/userMessages'

const initialValues = {
  property_id: '',
  contract_id: '',
  tenant_id: '',
  title: '',
  description: '',
  repair_type: 'mantenimiento_general',
  priority: 'media',
  status: 'pendiente',
  agent_notes: '',
}

function AgentRepairForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [properties, setProperties] = useState([])
  const [values, setValues] = useState(initialValues)
  const [activeContract, setActiveContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checkingContract, setCheckingContract] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadProperties() {
      setLoading(true)
      setError(null)

      try {
        const data = await listRepairProperties(user.id)
        if (isMounted) setProperties(data)
      } catch (propertyError) {
        if (isMounted) setError(toUserErrorMessage(propertyError, 'No se pudieron cargar las propiedades.'))
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (user?.id) loadProperties()

    return () => {
      isMounted = false
    }
  }, [user?.id])

  async function loadActiveContract(propertyId) {
    if (!propertyId) {
      setValues((currentValues) => ({ ...currentValues, contract_id: '', tenant_id: '' }))
      setActiveContract(null)
      return
    }

    setCheckingContract(true)
    setError(null)

    try {
      const contract = await getActiveContractByProperty(propertyId)
      setActiveContract(contract)
      setValues((currentValues) => ({
        ...currentValues,
        contract_id: contract?.id || '',
        tenant_id: contract?.tenant_id || '',
      }))
    } catch (contractError) {
      setError(toUserErrorMessage(contractError, 'No se pudo validar el contrato activo.'))
    } finally {
      setCheckingContract(false)
    }
  }

  function handleChange(event) {
    const { name, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: value }))

    if (name === 'property_id') {
      loadActiveContract(value)
    }
  }

  function getContractLabel() {
    if (checkingContract) return 'Buscando contrato...'
    if (!values.contract_id) return 'Sin contrato activo'

    const tenantName = activeContract?.tenant?.full_name
    const tenantContact = activeContract?.tenant?.email || activeContract?.tenant?.phone
    return ['Contrato activo', tenantName, tenantContact].filter(Boolean).join(' · ')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    if (!values.property_id || !values.title || !values.description || !values.repair_type || !values.priority) {
      setError('Completá propiedad, título, descripción, tipo y prioridad.')
      setSaving(false)
      return
    }

    try {
      const repairId = await createAgentRepair(user.id, values)
      setSuccess('Solicitud creada correctamente.')
      setTimeout(() => navigate(`/inmobiliaria/arreglos/${repairId}`), 800)
    } catch (repairError) {
      setError(toUserErrorMessage(repairError, 'No se pudo crear la solicitud de arreglo.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Nueva solicitud de arreglo" role="Inmobiliaria">
      <section className="panel dashboard-section">
        {loading ? <p className="loading-feedback">Cargando propiedades...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        {success ? <p className="success-message">{success}</p> : null}

        <form className="form two-column-form" onSubmit={handleSubmit}>
          <label className="full-row">
            Propiedad
            <select name="property_id" value={values.property_id} onChange={handleChange} required>
              <option value="">Seleccionar propiedad</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.title} - {property.address}{property.city ? `, ${property.city}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label>
            Contrato activo
            <input
              value={getContractLabel()}
              disabled
              readOnly
            />
          </label>
          <label>
            Estado inicial
            <select name="status" value={values.status} onChange={handleChange}>
              <option value="pendiente">Pendiente</option>
              <option value="publicado">Publicado</option>
            </select>
          </label>
          <label>
            Título del problema
            <input name="title" value={values.title} onChange={handleChange} required />
          </label>
          <label>
            Tipo de arreglo
            <select name="repair_type" value={values.repair_type} onChange={handleChange}>
              <option value="plomeria">Plomería</option>
              <option value="electricidad">Electricidad</option>
              <option value="gas">Gas</option>
              <option value="pintura">Pintura</option>
              <option value="carpinteria">Carpintería</option>
              <option value="mantenimiento_general">Mantenimiento general</option>
              <option value="otro">Otro</option>
            </select>
          </label>
          <label>
            Prioridad
            <select name="priority" value={values.priority} onChange={handleChange}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </label>
          <label className="full-row">
            Descripción
            <textarea name="description" value={values.description} onChange={handleChange} rows="4" required />
          </label>
          <label className="full-row">
            Observaciones internas
            <textarea name="agent_notes" value={values.agent_notes} onChange={handleChange} rows="3" />
          </label>
          <div className="form-actions full-row">
            <button type="submit" disabled={saving}>
              {saving ? 'Creando...' : 'Crear solicitud de arreglo'}
            </button>
            <button type="button" className="secondary-button" onClick={() => navigate('/inmobiliaria/arreglos')}>
              Cancelar
            </button>
          </div>
        </form>
      </section>
    </DashboardLayout>
  )
}

export default AgentRepairForm

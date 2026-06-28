import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../context/useAuth'
import { createTenantRepair, getActiveTenantContract } from '../../services/repairService'
import { toUserErrorMessage } from '../../utils/userMessages'

const initialValues = {
  title: '',
  description: '',
  repair_type: 'mantenimiento_general',
  priority: 'media',
}

function RepairForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [contract, setContract] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadContract() {
      setLoading(true)
      setError(null)

      try {
        const activeContract = await getActiveTenantContract(user.id)
        if (isMounted) setContract(activeContract)
      } catch (contractError) {
        if (isMounted) setError(toUserErrorMessage(contractError, 'No se pudo buscar tu contrato activo.'))
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (user?.id) loadContract()

    return () => {
      isMounted = false
    }
  }, [user?.id])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!values.title || !values.repair_type) {
      setError('Completá titulo y tipo de arreglo.')
      return
    }

    setSaving(true)

    try {
      const repair = await createTenantRepair(user.id, values)
      navigate(`/inquilino/arreglos/${repair.id}`)
    } catch (repairError) {
      setError(toUserErrorMessage(repairError, 'No se pudo crear la solicitud de arreglo.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Solicitar arreglo" role="Inquilino">
      <section className="panel dashboard-section">
        {loading ? <p className="muted">Buscando contrato activo...</p> : null}
        {contract ? (
          <p className="muted">La solicitud se asociara a {contract.properties?.title || 'tu propiedad alquilada'}.</p>
        ) : (
          !loading && <p className="error-message">No se encontro un contrato activo para este usuario.</p>
        )}
        {error ? <p className="error-message">{error}</p> : null}
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Titulo
            <input name="title" value={values.title} onChange={handleChange} required />
          </label>
          <label>
            Tipo de arreglo
            <select name="repair_type" value={values.repair_type} onChange={handleChange}>
              <option value="plomeria">Plomeria</option>
              <option value="electricidad">Electricidad</option>
              <option value="gas">Gas</option>
              <option value="pintura">Pintura</option>
              <option value="carpinteria">Carpinteria</option>
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
          <label>
            Descripcion
            <textarea name="description" value={values.description} onChange={handleChange} rows="4" />
          </label>
          <div className="form-actions">
            <button type="submit" disabled={saving || !contract}>
              {saving ? 'Enviando...' : 'Crear solicitud de arreglo'}
            </button>
            <button type="button" className="secondary-button" onClick={() => navigate('/inquilino/arreglos')}>
              Cancelar
            </button>
          </div>
        </form>
      </section>
    </DashboardLayout>
  )
}

export default RepairForm

import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import StatusBadge from '../../components/StatusBadge'
import { useAuth } from '../../context/useAuth'
import { applyToRepair, getApplicationForRepair } from '../../services/professionalService'
import { getRepair } from '../../services/repairService'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { toUserErrorMessage } from '../../utils/userMessages'

function AvailableRepairDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [repair, setRepair] = useState(null)
  const [application, setApplication] = useState(null)
  const [values, setValues] = useState({ message: '', estimated_budget: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const [repairData, applicationData] = await Promise.all([
        getRepair(id),
        getApplicationForRepair(id, user.id),
      ])
      setRepair(repairData)
      setApplication(applicationData)
    } catch (repairError) {
      setError(toUserErrorMessage(repairError, 'No se pudo cargar el arreglo disponible.'))
    } finally {
      setLoading(false)
    }
  }, [id, user?.id])

  useEffect(() => {
    if (user?.id) loadData()
  }, [loadData, user?.id])

  function handleChange(event) {
    const { name, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!values.message.trim()) {
      setError('Contanos brevemente cómo abordarías el trabajo.')
      return
    }
    if (values.estimated_budget !== '' && Number(values.estimated_budget) < 0) {
      setError('El presupuesto no puede ser negativo.')
      return
    }

    const shouldContinue = window.confirm('¿Confirmás que querés postularte a este trabajo?')
    if (!shouldContinue) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await applyToRepair(id, user.id, values)
      setApplication(result.data)
      setSuccess(result.alreadyApplied ? 'Ya estabas postulado a este arreglo.' : 'Postulación enviada correctamente.')
    } catch (applicationError) {
      setError(toUserErrorMessage(applicationError, 'No se pudo enviar la postulación.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Detalle de arreglo disponible" role="Profesional externo">
      <section className="panel dashboard-section">
        {loading ? <p className="loading-feedback">Cargando arreglo...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        {success ? <p className="success-message">{success}</p> : null}
        {repair ? (
          <div className="detail-layout">
            <div>
              <p className="eyebrow">{repair.repair_type}</p>
              <h2>{repair.title}</h2>
              <p>{repair.description || 'Sin descripción cargada.'}</p>
              <dl className="detail-list">
                <div><dt>Propiedad</dt><dd>{repair.properties?.title || '-'}</dd></div>
                <div><dt>Direccion</dt><dd>{repair.properties?.address || '-'}</dd></div>
                <div><dt>Prioridad</dt><dd><StatusBadge status={repair.priority} /></dd></div>
                <div><dt>Publicado</dt><dd>{formatDate(repair.created_at?.slice(0, 10))}</dd></div>
              </dl>
            </div>
            <form className="form compact-form" onSubmit={handleSubmit}>
              {application ? (
                <p className="success-message">
                  Ya te postulaste. Estado: <StatusBadge status={application.status} />
                  {application.estimated_budget ? ` Presupuesto: ${formatCurrency(application.estimated_budget)}` : ''}
                </p>
              ) : null}
              <label>
                Mensaje
                <textarea name="message" value={values.message} onChange={handleChange} rows="4" required />
              </label>
              <label>
                Presupuesto estimado
                <input name="estimated_budget" type="number" min="0" value={values.estimated_budget} onChange={handleChange} />
              </label>
              <button type="submit" disabled={saving || Boolean(application)}>
                {saving ? 'Enviando...' : 'Postularme'}
              </button>
            </form>
          </div>
        ) : null}
        <Link to="/profesional/arreglos-disponibles">Volver a disponibles</Link>
      </section>
    </DashboardLayout>
  )
}

export default AvailableRepairDetail

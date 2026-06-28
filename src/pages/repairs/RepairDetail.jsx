import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import StatusBadge from '../../components/StatusBadge'
import { agencyConfig } from '../../config/agencyConfig'
import { getRepair, updateRepairByAgent } from '../../services/repairService'
import { formatDate } from '../../utils/formatters'
import { toUserErrorMessage } from '../../utils/userMessages'

function RepairDetail({ mode = 'tenant' }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [repair, setRepair] = useState(null)
  const [form, setForm] = useState({ status: 'pendiente', priority: 'media', agent_notes: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const isAgent = mode === 'agent'

  function formatPerson(profile, emptyLabel) {
    if (!profile) return emptyLabel
    return [profile.full_name, profile.email || profile.phone].filter(Boolean).join(' · ') || emptyLabel
  }

  const loadRepair = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await getRepair(id)
      if (!data) throw new Error('No se encontro la solicitud.')
      setRepair(data)
      setForm({
        status: data.status || 'pendiente',
        priority: data.priority || 'media',
        agent_notes: data.agent_notes || '',
      })
    } catch (repairError) {
      setError(toUserErrorMessage(repairError, 'No se pudo cargar la solicitud de arreglo.'))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadRepair()
  }, [loadRepair])

  function handleChange(event) {
    const { name, value } = event.target
    setForm((currentForm) => ({ ...currentForm, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (['cancelado', 'resuelto'].includes(form.status) && form.status !== repair?.status) {
      const label = form.status === 'cancelado' ? 'cancelar este arreglo' : 'marcar este arreglo como resuelto'
      const shouldContinue = window.confirm(`¿Confirmás que querés ${label}?`)
      if (!shouldContinue) return
    }

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const data = await updateRepairByAgent(id, form)
      setRepair(data)
      setSuccess('Solicitud actualizada.')
    } catch (repairError) {
      setError(toUserErrorMessage(repairError, 'No se pudo guardar la solicitud.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Detalle de arreglo" role={isAgent ? 'Inmobiliaria' : 'Inquilino'}>
      <section className="panel dashboard-section">
        {loading ? <p className="loading-feedback">Cargando solicitud...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        {success ? <p className="success-message">{success}</p> : null}
        {repair ? (
          <div className="detail-layout">
            <div>
              <p className="eyebrow">{repair.repair_type}</p>
              <h2>{repair.title}</h2>
              <p>{repair.description || 'Sin descripción cargada.'}</p>
              <dl className="detail-list">
                <div><dt>Propiedad</dt><dd>{[repair.properties?.title, repair.properties?.address].filter(Boolean).join(' · ') || 'Sin propiedad asociada'}</dd></div>
                <div><dt>Inquilino</dt><dd>{formatPerson(repair.tenant, 'Sin inquilino asociado')}</dd></div>
                <div><dt>Creado</dt><dd>{formatDate(repair.created_at?.slice(0, 10))}</dd></div>
                <div><dt>Prioridad</dt><dd><StatusBadge status={repair.priority} /></dd></div>
                <div><dt>Estado</dt><dd><StatusBadge status={repair.status} /></dd></div>
                <div><dt>Profesional asignado</dt><dd>{formatPerson(repair.assigned_professional, 'Sin asignar')}</dd></div>
              </dl>
              {!isAgent ? <p className="muted">Observaciones: {repair.agent_notes || `Sin observaciones de ${agencyConfig.name}.`}</p> : null}
            </div>
            {isAgent ? (
              <form className="form compact-form" onSubmit={handleSubmit}>
                <label>
                  Estado
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="pendiente">Pendiente</option>
                    <option value="publicado">Publicado</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="pendiente_confirmacion">Pendiente confirmación</option>
                    <option value="resuelto">Resuelto</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </label>
                <label>
                  Prioridad
                  <select name="priority" value={form.priority} onChange={handleChange}>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </label>
                <label>
                  Observaciones
                  <textarea name="agent_notes" value={form.agent_notes} onChange={handleChange} rows="4" />
                </label>
                <div className="form-actions">
                  <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar cambios'}</button>
                  <button type="button" className="secondary-button" onClick={() => navigate(`/inmobiliaria/arreglos/${id}/postulaciones`)}>
                    Ver postulaciones
                  </button>
                </div>
              </form>
            ) : null}
          </div>
        ) : null}
        <Link to={isAgent ? '/inmobiliaria/arreglos' : '/inquilino/arreglos'}>Volver al listado</Link>
      </section>
    </DashboardLayout>
  )
}

export default RepairDetail

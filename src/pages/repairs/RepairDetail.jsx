import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import StatusBadge from '../../components/StatusBadge'
import { getRepair, updateRepairByAgent } from '../../services/repairService'
import { formatDate } from '../../utils/formatters'

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
      setError(repairError.message)
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
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const data = await updateRepairByAgent(id, form)
      setRepair(data)
      setSuccess('Solicitud actualizada.')
    } catch (repairError) {
      setError(repairError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Detalle de arreglo" role={isAgent ? 'Inmobiliaria' : 'Inquilino'}>
      <section className="panel dashboard-section">
        {loading ? <p className="muted">Cargando solicitud...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        {success ? <p className="success-message">{success}</p> : null}
        {repair ? (
          <div className="detail-layout">
            <div>
              <p className="eyebrow">{repair.repair_type}</p>
              <h2>{repair.title}</h2>
              <p>{repair.description || 'Sin descripcion.'}</p>
              <dl className="detail-list">
                <div><dt>Propiedad</dt><dd>{repair.properties?.title || '-'}</dd></div>
                <div><dt>Inquilino</dt><dd>{repair.tenant?.full_name || repair.tenant_id}</dd></div>
                <div><dt>Creado</dt><dd>{formatDate(repair.created_at?.slice(0, 10))}</dd></div>
                <div><dt>Prioridad</dt><dd><StatusBadge status={repair.priority} /></dd></div>
                <div><dt>Estado</dt><dd><StatusBadge status={repair.status} /></dd></div>
                <div><dt>Profesional asignado</dt><dd>{repair.assigned_professional?.full_name || '-'}</dd></div>
              </dl>
              {!isAgent ? <p className="muted">Observaciones: {repair.agent_notes || 'Sin observaciones de la inmobiliaria.'}</p> : null}
            </div>
            {isAgent ? (
              <form className="form compact-form" onSubmit={handleSubmit}>
                <label>
                  Estado
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="pendiente">Pendiente</option>
                    <option value="publicada">Publicado</option>
                    <option value="en_proceso">En proceso</option>
                    <option value="pendiente_confirmacion">Pendiente confirmacion</option>
                    <option value="resuelta">Resuelto</option>
                    <option value="cancelada">Cancelado</option>
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

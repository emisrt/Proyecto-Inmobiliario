import { useEffect, useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../context/useAuth'
import { getProfessionalProfile, saveProfessionalProfile } from '../../services/professionalService'

const initialValues = {
  specialty: '',
  work_zone: '',
  service_description: '',
  availability: '',
}

function ProfessionalProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [values, setValues] = useState(initialValues)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      setLoading(true)
      setError(null)

      try {
        const data = await getProfessionalProfile(user.id)
        if (!isMounted) return
        setProfile(data)
        setValues({
          specialty: data?.specialty || '',
          work_zone: data?.work_zone || '',
          service_description: data?.service_description || '',
          availability: data?.availability || '',
        })
      } catch (profileError) {
        if (isMounted) setError(profileError.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    if (user?.id) loadProfile()

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
    setSaving(true)
    setError(null)
    setSuccess(null)

    if (!values.specialty) {
      setError('Completá la especialidad.')
      setSaving(false)
      return
    }

    try {
      const savedProfile = await saveProfessionalProfile(user.id, values, profile?.id)
      setProfile(savedProfile)
      setSuccess('Perfil profesional guardado.')
    } catch (profileError) {
      setError(profileError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Perfil profesional" role="Profesional externo">
      <section className="panel dashboard-section">
        {loading ? <p className="muted">Cargando perfil...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        {success ? <p className="success-message">{success}</p> : null}
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Especialidad
            <input name="specialty" value={values.specialty} onChange={handleChange} required />
          </label>
          <label>
            Zona de trabajo
            <input name="work_zone" value={values.work_zone} onChange={handleChange} />
          </label>
          <label>
            Disponibilidad
            <input name="availability" value={values.availability} onChange={handleChange} placeholder="Ej: lunes a viernes" />
          </label>
          <label>
            Descripción del servicio
            <textarea name="service_description" value={values.service_description} onChange={handleChange} rows="4" />
          </label>
          <button type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar perfil'}</button>
        </form>
      </section>
    </DashboardLayout>
  )
}

export default ProfessionalProfile

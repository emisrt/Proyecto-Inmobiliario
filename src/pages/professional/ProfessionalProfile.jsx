import { useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck,
  BriefcaseBusiness,
  Clock,
  FileText,
  MapPin,
  Pencil,
  Phone,
  Star,
} from 'lucide-react'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../context/useAuth'
import { citiesByProvince, provinces } from '../../data/argentinaLocations'
import {
  availabilityOptions,
  getProfessionalProfile,
  getProfessionalStats,
  normalizeSpecialty,
  professionalSpecialties,
  saveProfessionalProfile,
} from '../../services/professionalService'

const initialValues = {
  full_name: '',
  business_name: '',
  phone: '',
  whatsapp: '',
  email: '',
  specialty: 'mantenimiento_general',
  secondary_specialties: '',
  work_zone: '',
  city: '',
  province: '',
  service_description: '',
  availability: 'disponible',
  working_days: '',
  working_hours: '',
  experience_years: 0,
  license_number: '',
  availability_notes: '',
}

const initialStats = {
  applications: 0,
  assignedJobs: 0,
  jobsInProgress: 0,
  finishedJobs: 0,
}

function getSpecialtyLabel(value) {
  return professionalSpecialties.find((specialty) => specialty.value === value)?.label || 'Otro'
}

function getAvailabilityLabel(value) {
  return availabilityOptions.find((option) => option.value === value)?.label || 'Disponible'
}

function normalizeAvailability(value) {
  return availabilityOptions.some((option) => option.value === value) ? value : 'disponible'
}

function getInitials(name) {
  const words = String(name || 'Profesional externo').trim().split(/\s+/)
  return words.slice(0, 2).map((word) => word[0]).join('').toUpperCase()
}

function isValidEmail(value) {
  if (!value) return true
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function ProfileField({ label, value }) {
  return (
    <div className="professional-view-field">
      <span>{label}</span>
      <strong>{value || '-'}</strong>
    </div>
  )
}

function ProfessionalProfile() {
  const { profile: authProfile, user } = useAuth()
  const [professionalProfile, setProfessionalProfile] = useState(null)
  const [values, setValues] = useState(initialValues)
  const [stats, setStats] = useState(initialStats)
  const [isEditing, setIsEditing] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const displayName = values.business_name || values.full_name || authProfile?.full_name || user?.email || 'Profesional externo'
  const normalizedSpecialty = normalizeSpecialty(values.specialty)
  const cityOptions = useMemo(() => {
    const baseCities = citiesByProvince[values.province] || []
    if (values.city && !baseCities.includes(values.city)) {
      return [...baseCities, values.city]
    }
    return baseCities
  }, [values.city, values.province])

  useEffect(() => {
    let isMounted = true

    async function loadProfile() {
      setLoading(true)
      setError(null)

      try {
        const [profileData, statsData] = await Promise.all([
          getProfessionalProfile(user.id),
          getProfessionalStats(user.id),
        ])

        if (!isMounted) return

        setProfessionalProfile(profileData)
        setStats(statsData)
        setIsEditing(!profileData)
        setValues({
          full_name: profileData?.full_name || authProfile?.full_name || '',
          business_name: profileData?.business_name || '',
          phone: profileData?.phone || authProfile?.phone || '',
          whatsapp: profileData?.whatsapp || authProfile?.phone || '',
          email: profileData?.email || user?.email || '',
          specialty: normalizeSpecialty(profileData?.specialty || 'mantenimiento_general'),
          secondary_specialties: profileData?.secondary_specialties || '',
          work_zone: profileData?.work_zone || '',
          city: profileData?.city || '',
          province: profileData?.province || '',
          service_description: profileData?.service_description || '',
          availability: normalizeAvailability(profileData?.availability),
          working_days: profileData?.working_days || (profileData?.availability && !availabilityOptions.some((option) => option.value === profileData.availability) ? profileData.availability : ''),
          working_hours: profileData?.working_hours || '',
          experience_years: profileData?.experience_years || 0,
          license_number: profileData?.license_number || '',
          availability_notes: profileData?.availability_notes || '',
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
  }, [authProfile?.full_name, authProfile?.phone, user?.email, user?.id])

  function handleChange(event) {
    const { name, value } = event.target

    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
      ...(name === 'province' ? { city: '' } : {}),
    }))
  }

  function resetForm() {
    setValues({
      full_name: professionalProfile?.full_name || authProfile?.full_name || '',
      business_name: professionalProfile?.business_name || '',
      phone: professionalProfile?.phone || authProfile?.phone || '',
      whatsapp: professionalProfile?.whatsapp || authProfile?.phone || '',
      email: professionalProfile?.email || user?.email || '',
      specialty: normalizeSpecialty(professionalProfile?.specialty || 'mantenimiento_general'),
      secondary_specialties: professionalProfile?.secondary_specialties || '',
      work_zone: professionalProfile?.work_zone || '',
      city: professionalProfile?.city || '',
      province: professionalProfile?.province || '',
      service_description: professionalProfile?.service_description || '',
      availability: normalizeAvailability(professionalProfile?.availability),
      working_days: professionalProfile?.working_days || (professionalProfile?.availability && !availabilityOptions.some((option) => option.value === professionalProfile.availability) ? professionalProfile.availability : ''),
      working_hours: professionalProfile?.working_hours || '',
      experience_years: professionalProfile?.experience_years || 0,
      license_number: professionalProfile?.license_number || '',
      availability_notes: professionalProfile?.availability_notes || '',
    })
    setError(null)
    setSuccess(null)
    setIsEditing(!professionalProfile)
  }

  function validateForm() {
    if (!values.specialty) return 'Seleccioná una especialidad principal.'
    if (!values.work_zone.trim() && !values.city) return 'Completá una zona de trabajo o seleccioná una ciudad.'
    if (!values.availability) return 'Seleccioná el estado de disponibilidad.'
    if (!isValidEmail(values.email)) return 'Ingresá un email válido.'
    if (Number(values.experience_years) < 0) return 'Los años de experiencia no pueden ser negativos.'
    if (values.service_description.length > 900) return 'La descripción del servicio no debe superar los 900 caracteres.'

    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setSaving(false)
      return
    }

    try {
      const savedProfile = await saveProfessionalProfile(user.id, values, professionalProfile?.id)
      setProfessionalProfile(savedProfile)
      setValues((currentValues) => ({
        ...currentValues,
        specialty: normalizeSpecialty(savedProfile.specialty),
      }))
      setIsEditing(false)
      setSuccess('Perfil profesional guardado.')
    } catch (profileError) {
      setError(profileError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title="Perfil profesional" role="Profesional externo" headingEyebrow="Ficha de proveedor externo">
      <section className="professional-profile-heading">
        <div>
          <h2>Perfil profesional</h2>
          <p>Gestioná tus datos de contacto, disponibilidad y servicios ofrecidos.</p>
        </div>
        {!isEditing ? (
          <button type="button" className="secondary-button" onClick={() => setIsEditing(true)}>
            <Pencil size={16} />
            Editar perfil
          </button>
        ) : null}
      </section>

      {loading ? <p className="muted">Cargando perfil...</p> : null}
      {error ? <p className="error-message">{error}</p> : null}
      {success ? <p className="success-message">{success}</p> : null}

      <section className="professional-summary-card">
        <div className="professional-avatar">{getInitials(displayName)}</div>
        <div className="professional-summary-main">
          <p className="eyebrow">Proveedor de mantenimiento</p>
          <h2>{displayName}</h2>
          <div className="professional-summary-tags">
            <span>{getSpecialtyLabel(normalizedSpecialty)}</span>
            <span><MapPin size={14} /> {values.work_zone || values.city || 'Zona no definida'}</span>
            <span className={`availability-badge availability-${values.availability}`}>
              {getAvailabilityLabel(values.availability)}
            </span>
            <span><Star size={14} /> {professionalProfile?.rating || 0} promedio</span>
          </div>
        </div>
        <div className="professional-summary-contact">
          <span><Phone size={15} /> {values.whatsapp || values.phone || 'Sin contacto'}</span>
          <span><Clock size={15} /> {values.working_hours || 'Horario no definido'}</span>
        </div>
      </section>

      <section className="professional-metrics-grid">
        <article><FileText size={18} /><strong>{stats.applications}</strong><span>Postulaciones</span></article>
        <article><BriefcaseBusiness size={18} /><strong>{stats.assignedJobs}</strong><span>Asignados</span></article>
        <article><Clock size={18} /><strong>{stats.jobsInProgress}</strong><span>En proceso</span></article>
        <article><BadgeCheck size={18} /><strong>{stats.finishedJobs}</strong><span>Finalizados</span></article>
      </section>

      {isEditing ? (
        <form className="professional-profile-form" onSubmit={handleSubmit}>
          <section className="property-form-card">
            <div className="property-form-card-header">
              <p className="eyebrow">Contacto</p>
              <h2>Datos de contacto</h2>
            </div>
            <div className="property-form-grid">
              <label>
                Nombre completo
                <input name="full_name" value={values.full_name} onChange={handleChange} placeholder="Nombre y apellido" />
              </label>
              <label>
                Razón social
                <input name="business_name" value={values.business_name} onChange={handleChange} placeholder="Empresa o marca comercial" />
              </label>
              <label>
                Teléfono
                <input name="phone" value={values.phone} onChange={handleChange} placeholder="Ej: 3764 123456" />
              </label>
              <label>
                WhatsApp
                <input name="whatsapp" value={values.whatsapp} onChange={handleChange} placeholder="Ej: +54 9 3764 123456" />
              </label>
              <label>
                Email
                <input name="email" type="email" value={values.email} onChange={handleChange} placeholder="correo@ejemplo.com" />
              </label>
              <label>
                Zona de trabajo
                <input name="work_zone" value={values.work_zone} onChange={handleChange} placeholder="Oberá y alrededores" />
              </label>
              <label>
                Provincia
                <select name="province" value={values.province} onChange={handleChange}>
                  <option value="">Seleccioná una provincia</option>
                  {provinces.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </label>
              <label>
                Ciudad
                <select name="city" value={values.city} onChange={handleChange} disabled={!values.province}>
                  <option value="">{values.province ? 'Seleccioná una ciudad' : 'Seleccioná una provincia primero'}</option>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="property-form-card">
            <div className="property-form-card-header">
              <p className="eyebrow">Servicio</p>
              <h2>Servicio profesional</h2>
            </div>
            <div className="property-form-grid">
              <label>
                Especialidad principal
                <select name="specialty" value={values.specialty} onChange={handleChange} required>
                  {professionalSpecialties.map((specialty) => (
                    <option key={specialty.value} value={specialty.value}>{specialty.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Especialidades secundarias
                <input name="secondary_specialties" value={values.secondary_specialties} onChange={handleChange} placeholder="Ej: pintura, mantenimiento general" />
              </label>
              <label>
                Años de experiencia
                <input name="experience_years" type="number" min="0" value={values.experience_years} onChange={handleChange} />
              </label>
              <label>
                Matrícula o habilitación
                <input name="license_number" value={values.license_number} onChange={handleChange} placeholder="Opcional" />
              </label>
              <label className="full-row">
                Descripción del servicio
                <textarea name="service_description" value={values.service_description} onChange={handleChange} rows="5" placeholder="Contá qué trabajos realizás, materiales habituales, tipo de urgencias que atendés y condiciones del servicio." />
              </label>
            </div>
          </section>

          <section className="property-form-card">
            <div className="property-form-card-header">
              <p className="eyebrow">Agenda</p>
              <h2>Disponibilidad</h2>
            </div>
            <div className="property-form-grid">
              <label>
                Estado de disponibilidad
                <select name="availability" value={values.availability} onChange={handleChange} required>
                  {availabilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label>
                Días de atención
                <input name="working_days" value={values.working_days} onChange={handleChange} placeholder="Lunes a viernes" />
              </label>
              <label>
                Horario de atención
                <input name="working_hours" value={values.working_hours} onChange={handleChange} placeholder="08:00 a 17:00" />
              </label>
              <label>
                Observaciones
                <input name="availability_notes" value={values.availability_notes} onChange={handleChange} placeholder="Urgencias, traslados, guardias, etc." />
              </label>
            </div>
          </section>

          <div className="property-form-actions">
            <button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
            <button type="button" className="secondary-button" onClick={resetForm}>
              {professionalProfile ? 'Cancelar' : 'Restablecer'}
            </button>
          </div>
        </form>
      ) : (
        <section className="professional-view-grid">
          <article className="property-form-card">
            <div className="property-form-card-header">
              <p className="eyebrow">Contacto</p>
              <h2>Datos de contacto</h2>
            </div>
            <div className="professional-view-list">
              <ProfileField label="Nombre" value={values.full_name || displayName} />
              <ProfileField label="Razón social" value={values.business_name} />
              <ProfileField label="Teléfono" value={values.phone} />
              <ProfileField label="WhatsApp" value={values.whatsapp} />
              <ProfileField label="Email" value={values.email} />
              <ProfileField label="Ubicación" value={[values.city, values.province].filter(Boolean).join(', ')} />
            </div>
          </article>
          <article className="property-form-card">
            <div className="property-form-card-header">
              <p className="eyebrow">Servicio</p>
              <h2>Ficha profesional</h2>
            </div>
            <div className="professional-view-list">
              <ProfileField label="Especialidad" value={getSpecialtyLabel(normalizedSpecialty)} />
              <ProfileField label="Secundarias" value={values.secondary_specialties} />
              <ProfileField label="Experiencia" value={`${values.experience_years || 0} años`} />
              <ProfileField label="Matrícula" value={values.license_number} />
              <ProfileField label="Disponibilidad" value={getAvailabilityLabel(values.availability)} />
              <ProfileField label="Atención" value={[values.working_days, values.working_hours].filter(Boolean).join(' · ')} />
            </div>
            <p className="professional-description">{values.service_description || 'Sin descripción del servicio.'}</p>
          </article>
        </section>
      )}
    </DashboardLayout>
  )
}

export default ProfessionalProfile

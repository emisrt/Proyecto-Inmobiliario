import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../context/useAuth'
import { citiesByProvince, provinces } from '../../data/argentinaLocations'
import { getInitialPropertyStatus, getProperty, listPropertyOwners, saveProperty } from '../../services/propertyService'

const initialValues = {
  title: '',
  address: '',
  province: '',
  city: '',
  neighborhood: '',
  operation_type: 'alquiler',
  property_type: 'departamento',
  price: '',
  currency: 'ARS',
  status: 'disponible_alquiler',
  description: '',
  owner_id: '',
  image_url: '',
  bedrooms: 0,
  bathrooms: 0,
  total_area: '',
  covered_area: '',
  has_garage: false,
  has_yard: false,
  has_pool: false,
  pets_allowed: false,
}

const propertyTypes = [
  { value: 'casa', label: 'Casa' },
  { value: 'departamento', label: 'Departamento' },
  { value: 'local', label: 'Local comercial' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'galpon', label: 'Galpón' },
  { value: 'quinta', label: 'Quinta' },
  { value: 'otro', label: 'Otro' },
]

const propertyStatuses = [
  { value: 'registrada', label: 'Registrada' },
  { value: 'disponible', label: 'Disponible' },
  { value: 'disponible_alquiler', label: 'Disponible alquiler' },
  { value: 'disponible_venta', label: 'Disponible venta' },
  { value: 'alquilada', label: 'Alquilada' },
  { value: 'vendida', label: 'Vendida' },
  { value: 'suspendida', label: 'Suspendida' },
  { value: 'anulada', label: 'Anulada' },
]

function isValidImageUrl(value) {
  if (!value) return false

  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

function PropertyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [owners, setOwners] = useState([])
  const [ownerSearch, setOwnerSearch] = useState('')
  const [loading, setLoading] = useState(Boolean(id))
  const [ownersLoading, setOwnersLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const isEditing = Boolean(id)

  const cityOptions = useMemo(() => {
    const baseCities = citiesByProvince[values.province] || []
    if (values.city && !baseCities.includes(values.city)) {
      return [...baseCities, values.city]
    }
    return baseCities
  }, [values.city, values.province])

  const filteredOwners = useMemo(() => {
    const normalizedSearch = ownerSearch.trim().toLowerCase()
    if (!normalizedSearch) return owners

    return owners.filter((owner) => (
      owner.full_name?.toLowerCase().includes(normalizedSearch)
      || owner.email?.toLowerCase().includes(normalizedSearch)
      || owner.phone?.toLowerCase().includes(normalizedSearch)
      || owner.id.toLowerCase().includes(normalizedSearch)
    ))
  }, [ownerSearch, owners])

  const imagePreviewUrl = useMemo(
    () => (isValidImageUrl(values.image_url) ? values.image_url : null),
    [values.image_url],
  )

  useEffect(() => {
    let isMounted = true

    async function loadOwners() {
      setOwnersLoading(true)

      try {
        const data = await listPropertyOwners()
        if (isMounted) setOwners(data)
      } catch (ownerError) {
        if (isMounted) setError(ownerError.message)
      } finally {
        if (isMounted) setOwnersLoading(false)
      }
    }

    loadOwners()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadProperty() {
      if (!id) return

      setLoading(true)
      setError(null)

      try {
        const property = await getProperty(id)
        if (!property) throw new Error('No se encontró la propiedad.')
        if (!isMounted) return

        setValues({
          title: property.title || '',
          address: property.address || '',
          province: property.province || '',
          city: property.city || '',
          neighborhood: property.neighborhood || '',
          operation_type: property.operation_type || 'alquiler',
          property_type: property.property_type || 'departamento',
          price: property.price || '',
          currency: property.currency || 'ARS',
          status: property.status || getInitialPropertyStatus(property.operation_type),
          description: property.description || '',
          owner_id: property.owner_id || '',
          image_url: property.image_url || '',
          bedrooms: property.bedrooms || 0,
          bathrooms: property.bathrooms || 0,
          total_area: property.total_area ?? '',
          covered_area: property.covered_area ?? '',
          has_garage: Boolean(property.has_garage),
          has_yard: Boolean(property.has_yard),
          has_pool: Boolean(property.has_pool),
          pets_allowed: Boolean(property.pets_allowed),
        })
      } catch (propertyError) {
        if (isMounted) setError(propertyError.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadProperty()

    return () => {
      isMounted = false
    }
  }, [id])

  function handleChange(event) {
    const { checked, name, type, value } = event.target

    setValues((currentValues) => ({
      ...currentValues,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'province' ? { city: '' } : {}),
    }))
  }

  function validateForm() {
    if (!values.title.trim()) return 'El título es obligatorio.'
    if (!values.operation_type) return 'Seleccioná la operación.'
    if (!values.property_type) return 'Seleccioná el tipo de inmueble.'
    if (!values.province) return 'Seleccioná una provincia.'
    if (!values.city) return 'Seleccioná una ciudad o localidad.'
    if (!values.address.trim()) return 'La dirección es obligatoria.'
    if (!values.price || Number(values.price) <= 0) return 'El precio debe ser mayor a 0.'
    if (Number(values.bedrooms) < 0) return 'La cantidad de dormitorios no puede ser negativa.'
    if (Number(values.bathrooms) < 0) return 'La cantidad de baños no puede ser negativa.'
    if (values.total_area !== '' && Number(values.total_area) < 0) return 'La superficie total no puede ser negativa.'
    if (values.covered_area !== '' && Number(values.covered_area) < 0) return 'La superficie cubierta no puede ser negativa.'
    if (values.total_area !== '' && values.covered_area !== '' && Number(values.covered_area) > Number(values.total_area)) {
      return 'La superficie cubierta no puede ser mayor que la superficie total.'
    }

    return null
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)
    setSuccess(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)

    try {
      const savedProperty = await saveProperty(values, user.id, id)
      setSuccess('Propiedad guardada correctamente.')
      setTimeout(() => navigate(`/inmobiliaria/propiedades/${savedProperty.id}`), 500)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout
      title={isEditing ? 'Editar propiedad' : 'Nueva propiedad'}
      role="Inmobiliaria"
      roleLabel="Agente"
      headingEyebrow="Carga de propiedades"
    >
      {loading ? <p className="muted">Cargando propiedad...</p> : null}
      {error ? <p className="error-message">{error}</p> : null}
      {success ? <p className="success-message">{success}</p> : null}

      <form className="property-editor" onSubmit={handleSubmit}>
        <section className="property-form-card">
          <div className="property-form-card-header">
            <p className="eyebrow">Datos principales</p>
            <h2>Información comercial</h2>
          </div>
          <div className="property-form-grid">
            <label className="full-row">
              Título
              <input name="title" value={values.title} onChange={handleChange} required placeholder="Departamento céntrico en alquiler" />
            </label>
            <label>
              Tipo de inmueble
              <select name="property_type" value={values.property_type} onChange={handleChange} required>
                {propertyTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </label>
            <label>
              Operación
              <select name="operation_type" value={values.operation_type} onChange={handleChange} required>
                <option value="alquiler">Alquiler</option>
                <option value="venta">Venta</option>
              </select>
            </label>
            <label>
              Precio
              <input name="price" type="number" min="1" step="1" value={values.price} onChange={handleChange} required />
            </label>
            <label>
              Moneda
              <select name="currency" value={values.currency} onChange={handleChange}>
                <option value="ARS">ARS</option>
                <option value="USD">USD</option>
              </select>
            </label>
            {isEditing ? (
              <label>
                Estado
                <select name="status" value={values.status} onChange={handleChange}>
                  {propertyStatuses.map((status) => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="form-help full-row">
                El estado inicial se asignará automáticamente según la operación seleccionada.
              </p>
            )}
          </div>
        </section>

        <section className="property-form-card">
          <div className="property-form-card-header">
            <p className="eyebrow">Ubicación</p>
            <h2>Datos de localización</h2>
          </div>
          <div className="property-form-grid">
            <label>
              Provincia
              <select name="province" value={values.province} onChange={handleChange} required>
                <option value="">Seleccioná una provincia</option>
                {provinces.map((province) => (
                  <option key={province} value={province}>{province}</option>
                ))}
              </select>
            </label>
            <label>
              Ciudad / Localidad
              <select name="city" value={values.city} onChange={handleChange} required disabled={!values.province}>
                <option value="">{values.province ? 'Seleccioná una ciudad' : 'Seleccioná una provincia primero'}</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </label>
            <label>
              Barrio
              <input name="neighborhood" value={values.neighborhood} onChange={handleChange} placeholder="Centro, Villa Sarita, etc." />
            </label>
            <label>
              Dirección
              <input name="address" value={values.address} onChange={handleChange} required placeholder="Calle y numeración" />
            </label>
          </div>
        </section>

        <section className="property-form-card">
          <div className="property-form-card-header">
            <p className="eyebrow">Características</p>
            <h2>Comodidades y superficies</h2>
          </div>
          <div className="property-form-grid">
            <label>
              Dormitorios
              <input name="bedrooms" type="number" min="0" value={values.bedrooms} onChange={handleChange} />
            </label>
            <label>
              Baños
              <input name="bathrooms" type="number" min="0" value={values.bathrooms} onChange={handleChange} />
            </label>
            <label>
              Superficie total
              <input name="total_area" type="number" min="0" step="0.01" value={values.total_area} onChange={handleChange} placeholder="m²" />
            </label>
            <label>
              Superficie cubierta
              <input name="covered_area" type="number" min="0" step="0.01" value={values.covered_area} onChange={handleChange} placeholder="m²" />
            </label>
          </div>
          <div className="property-toggle-grid">
            <label><input name="has_garage" type="checkbox" checked={values.has_garage} onChange={handleChange} /> Cochera</label>
            <label><input name="has_yard" type="checkbox" checked={values.has_yard} onChange={handleChange} /> Patio</label>
            <label><input name="has_pool" type="checkbox" checked={values.has_pool} onChange={handleChange} /> Pileta</label>
            <label><input name="pets_allowed" type="checkbox" checked={values.pets_allowed} onChange={handleChange} /> Mascotas permitidas</label>
          </div>
        </section>

        <section className="property-form-card">
          <div className="property-form-card-header">
            <p className="eyebrow">Publicación</p>
            <h2>Imagen y descripción</h2>
          </div>
          <div className="property-media-grid">
            <div>
              <label>
                Imagen de portada
                <input name="image_url" value={values.image_url} onChange={handleChange} placeholder="https://ejemplo.com/imagen.jpg" />
              </label>
              <label>
                Descripción
                <textarea name="description" value={values.description} onChange={handleChange} rows="6" placeholder="Describí ambientes, estado general, ubicación y condiciones relevantes." />
              </label>
            </div>
            <div className="property-image-preview">
              {imagePreviewUrl ? (
                <img src={imagePreviewUrl} alt="Previsualización de portada" />
              ) : (
                <span>Previsualización de imagen</span>
              )}
            </div>
          </div>
        </section>

        <section className="property-form-card">
          <div className="property-form-card-header">
            <p className="eyebrow">Propietario</p>
            <h2>Asignación opcional</h2>
          </div>
          <div className="property-form-grid">
            <label>
              Buscar propietario
              <input value={ownerSearch} onChange={(event) => setOwnerSearch(event.target.value)} placeholder="Nombre, email, teléfono o ID" />
            </label>
            <label>
              Propietario
              <select name="owner_id" value={values.owner_id} onChange={handleChange} disabled={ownersLoading || owners.length === 0}>
                <option value="">Sin propietario asignado</option>
                {filteredOwners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.full_name || owner.email || owner.id}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {!ownersLoading && owners.length === 0 ? (
            <p className="form-help">No hay propietarios registrados. Podés guardar la propiedad sin propietario y asociarlo más tarde.</p>
          ) : null}
        </section>

        <div className="property-form-actions">
          <button type="submit" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar propiedad'}
          </button>
          <button type="button" className="secondary-button" onClick={() => navigate('/inmobiliaria/propiedades')}>
            Cancelar
          </button>
        </div>
      </form>
    </DashboardLayout>
  )
}

export default PropertyForm

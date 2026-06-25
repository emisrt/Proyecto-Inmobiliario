import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/DashboardLayout'
import { useAuth } from '../../context/useAuth'
import { getProperty, saveProperty } from '../../services/propertyService'

const initialValues = {
  title: '',
  address: '',
  city: '',
  operation_type: 'alquiler',
  property_type: 'departamento',
  price: '',
  status: 'registrada',
  description: '',
  owner_id: '',
  image_url: '',
}

function PropertyForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [values, setValues] = useState(initialValues)
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadProperty() {
      if (!id) return

      setLoading(true)
      setError(null)

      try {
        const property = await getProperty(id)
        if (!property) throw new Error('No se encontro la propiedad.')
        if (!isMounted) return

        setValues({
          title: property.title || '',
          address: property.address || '',
          city: property.city || '',
          operation_type: property.operation_type || 'alquiler',
          property_type: property.property_type || 'departamento',
          price: property.price || '',
          status: property.status || 'registrada',
          description: property.description || '',
          owner_id: property.owner_id || '',
          image_url: property.image_url || '',
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
    const { name, value } = event.target
    setValues((currentValues) => ({ ...currentValues, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError(null)

    if (!values.title || !values.address || !values.operation_type || !values.property_type) {
      setError('Completá titulo, direccion, operacion y tipo de propiedad.')
      return
    }

    setSaving(true)

    try {
      const savedProperty = await saveProperty(values, user.id, id)
      navigate(`/inmobiliaria/propiedades/${savedProperty.id}`)
    } catch (saveError) {
      setError(saveError.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout title={id ? 'Editar propiedad' : 'Nueva propiedad'} role="Inmobiliaria">
      <section className="panel dashboard-section">
        {loading ? <p className="muted">Cargando propiedad...</p> : null}
        {error ? <p className="error-message">{error}</p> : null}
        <form className="form two-column-form" onSubmit={handleSubmit}>
          <label>
            Titulo
            <input name="title" value={values.title} onChange={handleChange} required />
          </label>
          <label>
            Direccion
            <input name="address" value={values.address} onChange={handleChange} required />
          </label>
          <label>
            Ciudad
            <input name="city" value={values.city} onChange={handleChange} />
          </label>
          <label>
            Operacion
            <select name="operation_type" value={values.operation_type} onChange={handleChange}>
              <option value="alquiler">Alquiler</option>
              <option value="venta">Venta</option>
            </select>
          </label>
          <label>
            Tipo
            <select name="property_type" value={values.property_type} onChange={handleChange}>
              <option value="departamento">Departamento</option>
              <option value="casa">Casa</option>
              <option value="local">Local</option>
              <option value="terreno">Terreno</option>
              <option value="oficina">Oficina</option>
            </select>
          </label>
          <label>
            Precio
            <input name="price" type="number" min="0" value={values.price} onChange={handleChange} />
          </label>
          <label>
            Estado
            <select name="status" value={values.status} onChange={handleChange}>
              <option value="registrada">Registrada</option>
              <option value="disponible">Disponible</option>
              <option value="disponible_alquiler">Disponible alquiler</option>
              <option value="disponible_venta">Disponible venta</option>
              <option value="alquilada">Alquilada</option>
              <option value="vendida">Vendida</option>
              <option value="suspendida">Suspendida</option>
              <option value="anulada">Anulada</option>
            </select>
          </label>
          <label>
            ID propietario
            <input name="owner_id" value={values.owner_id} onChange={handleChange} placeholder="UUID de profile" />
          </label>
          <label className="full-row">
            URL de imagen
            <input name="image_url" value={values.image_url} onChange={handleChange} placeholder="https://..." />
          </label>
          <label className="full-row">
            Descripcion
            <textarea name="description" value={values.description} onChange={handleChange} rows="4" />
          </label>
          <div className="form-actions full-row">
            <button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : 'Guardar propiedad'}
            </button>
            <button type="button" className="secondary-button" onClick={() => navigate('/inmobiliaria/propiedades')}>
              Cancelar
            </button>
          </div>
        </form>
      </section>
    </DashboardLayout>
  )
}

export default PropertyForm

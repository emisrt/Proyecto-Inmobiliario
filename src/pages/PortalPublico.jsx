import PublicHeader from '../components/PublicHeader'

const properties = [
  {
    id: 1,
    title: 'Departamento centrico',
    operation: 'Alquiler',
    price: '$ 420.000',
    details: '2 ambientes - 48 m2 - Disponible',
  },
  {
    id: 2,
    title: 'Casa con patio',
    operation: 'Venta',
    price: '$ 95.000.000',
    details: '4 ambientes - 120 m2 - Publicada',
  },
  {
    id: 3,
    title: 'Monoambiente amoblado',
    operation: 'Alquiler',
    price: '$ 290.000',
    details: '1 ambiente - 32 m2 - Disponible',
  },
]

function PortalPublico() {
  return (
    <>
      <PublicHeader />
      <main className="page">
        <section className="page-heading">
          <p>Portal publico</p>
          <h1>Propiedades disponibles</h1>
        </section>
        <section className="filters">
          <input type="search" placeholder="Buscar por direccion o tipo" />
          <select defaultValue="">
              <option value="">Operacion</option>
            <option value="alquiler">Alquiler</option>
            <option value="venta">Venta</option>
          </select>
          <button type="button">Filtrar</button>
        </section>
        <section className="property-grid">
          {properties.map((property) => (
            <article className="property-card" key={property.id}>
              <div className="image-placeholder">Imagen</div>
              <p className="eyebrow">{property.operation}</p>
              <h2>{property.title}</h2>
              <p>{property.details}</p>
              <strong>{property.price}</strong>
            </article>
          ))}
        </section>
      </main>
    </>
  )
}

export default PortalPublico

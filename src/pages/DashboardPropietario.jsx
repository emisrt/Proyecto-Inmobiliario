import DashboardLayout from '../components/DashboardLayout'

function DashboardPropietario() {
  return (
    <DashboardLayout title="Panel de Propietario" role="Propietario">
      <section className="grid">
        <article className="panel">
          <h2>Mis propiedades</h2>
          <p>Monitoreo de inmuebles publicados, alquilados o suspendidos.</p>
        </article>
        <article className="panel">
          <h2>Contratos</h2>
          <p>Consulta de contratos activos y vencimientos asociados.</p>
        </article>
        <article className="panel">
          <h2>Pagos y recibos</h2>
          <p>Resumen de pagos recibidos, pendientes y comprobantes.</p>
        </article>
      </section>
    </DashboardLayout>
  )
}

export default DashboardPropietario

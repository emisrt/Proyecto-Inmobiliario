import { Link } from 'react-router-dom'

function Unauthorized() {
  return (
    <main className="not-found">
      <section className="auth-card">
        <p className="eyebrow">Acceso restringido</p>
        <h1>Acceso no autorizado</h1>
        <p className="muted">
          Tu usuario no tiene permisos para ingresar a esta seccion del sistema.
        </p>
        <Link to="/portal">Volver al portal</Link>
      </section>
    </main>
  )
}

export default Unauthorized

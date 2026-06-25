import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <main className="not-found">
      <section className="auth-card">
        <p className="eyebrow">404</p>
        <h1>Pagina no encontrada</h1>
        <p className="muted">La ruta solicitada no existe en este prototipo.</p>
        <Link to="/portal">Volver al portal publico</Link>
      </section>
    </main>
  )
}

export default NotFound

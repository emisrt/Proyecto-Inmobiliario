import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import BrandLogo from './BrandLogo'

function DashboardLayout({ title, role, children }) {
  const { logout, profile } = useAuth()

  return (
    <div className="dashboard-shell">
      <aside className="sidebar">
        <BrandLogo className="sidebar-brand" compact />
        <span className="role-pill">{role}</span>
        {profile?.full_name ? <p className="sidebar-user">{profile.full_name}</p> : null}
        <nav className="sidebar-nav">
          <Link to="/inmobiliaria">Inmobiliaria</Link>
          <Link to="/propietario">Propietario</Link>
          <Link to="/inquilino">Inquilino</Link>
          <Link to="/profesional">Profesional</Link>
          <Link to="/portal">Portal publico</Link>
        </nav>
        <button className="logout-button" type="button" onClick={logout}>
          Cerrar sesion
        </button>
      </aside>
      <main className="dashboard-main">
        <section className="page-heading">
          <p>Wireframe funcional</p>
          <h1>{title}</h1>
        </section>
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout

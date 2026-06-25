import { Link } from 'react-router-dom'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import BrandLogo from './BrandLogo'

function DashboardLayout({ title, role, children }) {
  const { logout, profile } = useAuth()

  return (
    <div className="dashboard-shell dashboard-shell-top">
      <header className="dashboard-topbar">
        <BrandLogo compact />
        <div className="dashboard-userbar">
          <div className="dashboard-user-avatar">
            <User size={15} />
          </div>
          <div className="dashboard-user-copy">
            <p>{profile?.full_name || 'Usuario Locative'}</p>
            <span>{role}</span>
          </div>
          <button className="dashboard-logout-button" type="button" onClick={logout}>
            <LogOut size={15} />
            <span>Salir</span>
          </button>
        </div>
      </header>
      <main className="dashboard-main dashboard-main-centered">
        <section className="page-heading dashboard-welcome">
          <p>Sesion iniciada como <span className="role-pill role-pill-inline">{role}</span></p>
          <h1>{title}</h1>
        </section>
        <nav className="dashboard-nav">
          <Link to="/inmobiliaria">Inmobiliaria</Link>
          <Link to="/propietario">Propietario</Link>
          <Link to="/inquilino">Inquilino</Link>
          <Link to="/profesional">Profesional</Link>
          <Link to="/portal">Portal publico</Link>
        </nav>
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout

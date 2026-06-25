import { NavLink } from 'react-router-dom'
import {
  Bell,
  Building2,
  CreditCard,
  FileText,
  Home,
  LogOut,
  User,
  Wrench,
} from 'lucide-react'
import { useAuth } from '../context/useAuth'
import BrandLogo from './BrandLogo'

const roleNavigation = {
  Inmobiliaria: [
    { to: '/inmobiliaria', label: 'Inicio', icon: Home },
    { to: '/portal', label: 'Propiedades', icon: Building2 },
    { to: '/inmobiliaria', label: 'Contratos', icon: FileText },
    { to: '/inmobiliaria', label: 'Pagos', icon: CreditCard },
  ],
  Propietario: [
    { to: '/propietario', label: 'Inicio', icon: Home },
    { to: '/propietario', label: 'Mis propiedades', icon: Building2 },
    { to: '/propietario', label: 'Contratos', icon: FileText },
    { to: '/propietario', label: 'Cobros', icon: CreditCard },
  ],
  Inquilino: [
    { to: '/inquilino', label: 'Inicio', icon: Home },
    { to: '/inquilino', label: 'Mis pagos', icon: CreditCard },
    { to: '/inquilino', label: 'Mi contrato', icon: FileText },
    { to: '/inquilino', label: 'Reclamos', icon: Wrench },
  ],
  'Profesional de arreglos': [
    { to: '/profesional', label: 'Trabajos', icon: Wrench },
    { to: '/profesional', label: 'Postulaciones', icon: FileText },
  ],
}

function DashboardLayout({ title, role, children }) {
  const { logout, profile } = useAuth()
  const navItems = roleNavigation[role] || roleNavigation.Inmobiliaria

  return (
    <div className="figma-dashboard">
      <header className="figma-dashboard-topbar">
        <BrandLogo compact variant="light" />
        <div className="dashboard-userbar">
          <button className="notification-button" type="button" aria-label="Notificaciones">
            <Bell size={17} />
            <span />
          </button>
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
      <div className="figma-dashboard-body">
        <aside className="figma-sidebar">
          <nav>
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <NavLink key={item.label} to={item.to}>
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>
          <div className="figma-sidebar-profile">
            <p>{profile?.full_name || 'Usuario Locative'}</p>
            <span>{role}</span>
          </div>
        </aside>
        <main className="figma-dashboard-main">
          <section className="figma-dashboard-heading">
            <p>Sesion iniciada como {role}</p>
            <h1>{title}</h1>
          </section>
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout

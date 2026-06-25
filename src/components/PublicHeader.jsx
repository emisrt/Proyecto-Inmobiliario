import { NavLink } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { getRoleHome } from '../utils/roles'
import BrandLogo from './BrandLogo'

function PublicHeader() {
  const { isAuthenticated, loading, logout, profile } = useAuth()

  return (
    <header className="topbar">
      <BrandLogo />
      <nav className="nav">
        <NavLink to="/portal">Propiedades</NavLink>
        {!loading && isAuthenticated ? (
          <>
            <NavLink to={getRoleHome(profile?.role)}>Mi panel</NavLink>
            <button className="nav-button" type="button" onClick={logout}>
              Salir
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Ingresar</NavLink>
            <NavLink to="/register">Registro</NavLink>
          </>
        )}
      </nav>
    </header>
  )
}

export default PublicHeader

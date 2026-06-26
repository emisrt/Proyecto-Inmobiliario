import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { User } from 'lucide-react'
import { useAuth } from '../context/useAuth'
import { getRoleHome } from '../utils/roles'
import BrandLogo from './BrandLogo'

function PublicHeader() {
  const { isAuthenticated, loading, logout, profile, user } = useAuth()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const panelPath = getRoleHome(profile?.role)

  useEffect(() => {
    function handlePointerDown(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  async function handleLogout() {
    setIsUserMenuOpen(false)
    await logout()
  }

  return (
    <header className="public-header">
      <div className="public-header-inner">
        <BrandLogo />
        <nav className="nav public-nav">
          <NavLink to="/portal">Propiedades</NavLink>
          {!loading && isAuthenticated ? (
            <>
              <NavLink to={panelPath}>Panel</NavLink>
              <div className="public-user-menu" ref={menuRef}>
                <button
                  aria-expanded={isUserMenuOpen}
                  aria-label="Abrir menú de usuario"
                  className="public-user-button"
                  type="button"
                  onClick={() => setIsUserMenuOpen((currentValue) => !currentValue)}
                >
                  <User size={18} />
                </button>
                {isUserMenuOpen ? (
                  <div className="public-user-dropdown">
                    <div className="public-user-summary">
                      <strong>{profile?.full_name || user?.email || 'Usuario Locative'}</strong>
                      <span>{profile?.role || 'usuario autenticado'}</span>
                    </div>
                    <NavLink to={panelPath} onClick={() => setIsUserMenuOpen(false)}>
                      Panel
                    </NavLink>
                    <button type="button" onClick={handleLogout}>
                      Cerrar sesión
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            !loading && <NavLink to="/login">Ingresar</NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}

export default PublicHeader

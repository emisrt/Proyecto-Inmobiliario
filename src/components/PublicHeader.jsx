import { NavLink } from 'react-router-dom'
import BrandLogo from './BrandLogo'

function PublicHeader() {
  return (
    <header className="topbar">
      <BrandLogo />
      <nav className="nav">
        <NavLink to="/portal">Portal publico</NavLink>
        <NavLink to="/login">Ingresar</NavLink>
        <NavLink to="/register">Registro</NavLink>
      </nav>
    </header>
  )
}

export default PublicHeader

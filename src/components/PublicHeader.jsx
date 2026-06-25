import { Link, NavLink } from 'react-router-dom'

function PublicHeader() {
  return (
    <header className="topbar">
      <Link className="brand" to="/">
        Sistema Inmobiliario
      </Link>
      <nav className="nav">
        <NavLink to="/portal">Portal publico</NavLink>
        <NavLink to="/login">Ingresar</NavLink>
        <NavLink to="/register">Registro</NavLink>
      </nav>
    </header>
  )
}

export default PublicHeader

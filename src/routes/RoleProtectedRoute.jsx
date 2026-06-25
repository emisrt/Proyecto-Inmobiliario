import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import Unauthorized from '../pages/Unauthorized'

function RoleProtectedRoute({ allowedRoles, children }) {
  const { loading, isAuthenticated, profile } = useAuth()
  const location = useLocation()

  if (loading) {
    return <main className="loading-page">Cargando sesion...</main>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!profile || !allowedRoles.includes(profile.role)) {
    return <Unauthorized />
  }

  return children
}

export default RoleProtectedRoute

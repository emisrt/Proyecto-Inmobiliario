import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardInmobiliaria from '../pages/DashboardInmobiliaria'
import DashboardInquilino from '../pages/DashboardInquilino'
import DashboardProfesional from '../pages/DashboardProfesional'
import DashboardPropietario from '../pages/DashboardPropietario'
import Login from '../pages/Login'
import NotFound from '../pages/NotFound'
import PortalPublico from '../pages/PortalPublico'
import Register from '../pages/Register'
import Unauthorized from '../pages/Unauthorized'
import RoleProtectedRoute from './RoleProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/portal" replace />} />
      <Route path="/portal" element={<PortalPublico />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        path="/inmobiliaria"
        element={
          <RoleProtectedRoute allowedRoles={['agente_inmobiliario']}>
            <DashboardInmobiliaria />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inquilino"
        element={
          <RoleProtectedRoute allowedRoles={['inquilino']}>
            <DashboardInquilino />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/profesional"
        element={
          <RoleProtectedRoute allowedRoles={['profesional']}>
            <DashboardProfesional />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/propietario"
        element={
          <RoleProtectedRoute allowedRoles={['propietario']}>
            <DashboardPropietario />
          </RoleProtectedRoute>
        }
      />
      <Route path="/dashboard/inmobiliaria" element={<Navigate to="/inmobiliaria" replace />} />
      <Route path="/dashboard/inquilino" element={<Navigate to="/inquilino" replace />} />
      <Route path="/dashboard/profesional" element={<Navigate to="/profesional" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default AppRoutes

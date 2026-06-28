import { Navigate, Route, Routes } from 'react-router-dom'
import DashboardInmobiliaria from '../pages/DashboardInmobiliaria'
import DashboardInquilino from '../pages/DashboardInquilino'
import DashboardProfesional from '../pages/DashboardProfesional'
import DashboardPropietario from '../pages/DashboardPropietario'
import ComingSoon from '../pages/ComingSoon'
import Login from '../pages/Login'
import NotFound from '../pages/NotFound'
import PortalPublico from '../pages/PortalPublico'
import Register from '../pages/Register'
import Unauthorized from '../pages/Unauthorized'
import AssignedJobs from '../pages/professional/AssignedJobs'
import AvailableRepairDetail from '../pages/professional/AvailableRepairDetail'
import AvailableRepairs from '../pages/professional/AvailableRepairs'
import ProfessionalApplications from '../pages/professional/ProfessionalApplications'
import ProfessionalProfile from '../pages/professional/ProfessionalProfile'
import AssignTenant from '../pages/properties/AssignTenant'
import PropertyDetail from '../pages/properties/PropertyDetail'
import PropertyForm from '../pages/properties/PropertyForm'
import PropertyList from '../pages/properties/PropertyList'
import AgentRepairForm from '../pages/repairs/AgentRepairForm'
import AgentRepairList from '../pages/repairs/AgentRepairList'
import RepairApplications from '../pages/repairs/RepairApplications'
import RepairDetail from '../pages/repairs/RepairDetail'
import RepairForm from '../pages/repairs/RepairForm'
import TenantRepairList from '../pages/repairs/TenantRepairList'
import RoleProtectedRoute from './RoleProtectedRoute'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/portal" replace />} />
      <Route path="/portal" element={<PortalPublico />} />
      <Route path="/portal/propiedades/:id" element={<PropertyDetail publicView />} />
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
        path="/inmobiliaria/propiedades"
        element={
          <RoleProtectedRoute allowedRoles={['agente_inmobiliario']}>
            <PropertyList />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inmobiliaria/propiedades/nueva"
        element={
          <RoleProtectedRoute allowedRoles={['agente_inmobiliario']}>
            <PropertyForm />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inmobiliaria/propiedades/:id"
        element={
          <RoleProtectedRoute allowedRoles={['agente_inmobiliario']}>
            <PropertyDetail />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inmobiliaria/propiedades/:id/editar"
        element={
          <RoleProtectedRoute allowedRoles={['agente_inmobiliario']}>
            <PropertyForm />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inmobiliaria/propiedades/:id/asignar-inquilino"
        element={
          <RoleProtectedRoute allowedRoles={['agente_inmobiliario']}>
            <AssignTenant />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inmobiliaria/contratos"
        element={
          <RoleProtectedRoute allowedRoles={['agente_inmobiliario']}>
            <ComingSoon title="Contratos" role="Inmobiliaria" roleLabel="Agente" homePath="/inmobiliaria" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inmobiliaria/contratos/nuevo"
        element={
          <RoleProtectedRoute allowedRoles={['agente_inmobiliario']}>
            <ComingSoon title="Nuevo contrato" role="Inmobiliaria" roleLabel="Agente" homePath="/inmobiliaria" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inmobiliaria/pagos"
        element={
          <RoleProtectedRoute allowedRoles={['agente_inmobiliario']}>
            <ComingSoon title="Pagos" role="Inmobiliaria" roleLabel="Agente" homePath="/inmobiliaria" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inmobiliaria/profesionales"
        element={
          <RoleProtectedRoute allowedRoles={['agente_inmobiliario']}>
            <ComingSoon title="Profesionales" role="Inmobiliaria" roleLabel="Agente" homePath="/inmobiliaria" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inmobiliaria/arreglos"
        element={
          <RoleProtectedRoute allowedRoles={['agente_inmobiliario']}>
            <AgentRepairList />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inmobiliaria/arreglos/nuevo"
        element={
          <RoleProtectedRoute allowedRoles={['agente_inmobiliario']}>
            <AgentRepairForm />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inmobiliaria/arreglos/:id"
        element={
          <RoleProtectedRoute allowedRoles={['agente_inmobiliario']}>
            <RepairDetail mode="agent" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inmobiliaria/arreglos/:id/postulaciones"
        element={
          <RoleProtectedRoute allowedRoles={['agente_inmobiliario']}>
            <RepairApplications />
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
        path="/inquilino/arreglos"
        element={
          <RoleProtectedRoute allowedRoles={['inquilino']}>
            <TenantRepairList />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inquilino/arreglos/nuevo"
        element={
          <RoleProtectedRoute allowedRoles={['inquilino']}>
            <RepairForm />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inquilino/arreglos/:id"
        element={
          <RoleProtectedRoute allowedRoles={['inquilino']}>
            <RepairDetail mode="tenant" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inquilino/pagos"
        element={
          <RoleProtectedRoute allowedRoles={['inquilino']}>
            <ComingSoon title="Mis pagos" role="Inquilino" homePath="/inquilino" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/inquilino/contrato"
        element={
          <RoleProtectedRoute allowedRoles={['inquilino']}>
            <ComingSoon title="Mi contrato" role="Inquilino" homePath="/inquilino" />
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
        path="/profesional/perfil"
        element={
          <RoleProtectedRoute allowedRoles={['profesional']}>
            <ProfessionalProfile />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/profesional/arreglos-disponibles"
        element={
          <RoleProtectedRoute allowedRoles={['profesional']}>
            <AvailableRepairs />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/profesional/arreglos-disponibles/:id"
        element={
          <RoleProtectedRoute allowedRoles={['profesional']}>
            <AvailableRepairDetail />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/profesional/postulaciones"
        element={
          <RoleProtectedRoute allowedRoles={['profesional']}>
            <ProfessionalApplications />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/profesional/trabajos-asignados"
        element={
          <RoleProtectedRoute allowedRoles={['profesional']}>
            <AssignedJobs />
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
      <Route
        path="/propietario/propiedades"
        element={
          <RoleProtectedRoute allowedRoles={['propietario']}>
            <DashboardPropietario view="properties" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/propietario/contratos"
        element={
          <RoleProtectedRoute allowedRoles={['propietario']}>
            <DashboardPropietario view="contracts" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/propietario/pagos"
        element={
          <RoleProtectedRoute allowedRoles={['propietario']}>
            <DashboardPropietario view="payments" />
          </RoleProtectedRoute>
        }
      />
      <Route
        path="/propietario/arreglos"
        element={
          <RoleProtectedRoute allowedRoles={['propietario']}>
            <DashboardPropietario view="repairs" />
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

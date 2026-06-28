import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Banknote,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  CreditCard,
  FilePlus2,
  FileText,
  Home,
  Plus,
  UserRound,
  UsersRound,
  Wrench,
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import StatusBadge from '../components/StatusBadge'
import { formatDate } from '../utils/formatters'
import { supabase } from '../services/supabaseClient'

const initialStats = {
  totalProperties: 0,
  activeContracts: 0,
  pendingPayments: 0,
  overduePayments: 0,
  pendingRepairs: 0,
  publishedRepairs: 0,
  pendingApplications: 0,
  jobsInProgress: 0,
}

const emptyDashboardData = {
  stats: initialStats,
  properties: [],
  repairs: [],
  clients: [],
  errors: [],
}

async function countRows(table, queryBuilder) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true })

  if (queryBuilder) {
    query = queryBuilder(query)
  }

  const { count, error } = await query

  if (error) throw error

  return count || 0
}

async function runSafe(label, task, fallback) {
  try {
    return { label, data: await task(), error: null }
  } catch (error) {
    return { label, data: fallback, error: error.message }
  }
}

function buildClientsFromContracts(contracts) {
  const clientMap = new Map()

  contracts.forEach((contract) => {
    const propertyTitle = contract.properties?.title || 'Propiedad sin título'

    if (contract.owner) {
      const existingOwner = clientMap.get(contract.owner_id) || {
        id: contract.owner_id,
        name: contract.owner.full_name || 'Propietario',
        role: 'Propietario',
        count: 0,
        status: 'Al día',
      }

      existingOwner.count += 1
      existingOwner.detail = `${existingOwner.count} propiedad${existingOwner.count === 1 ? '' : 'es'} asociada${existingOwner.count === 1 ? '' : 's'}`
      clientMap.set(contract.owner_id, existingOwner)
    }

    if (contract.tenant) {
      const existingTenant = clientMap.get(contract.tenant_id) || {
        id: contract.tenant_id,
        name: contract.tenant.full_name || 'Inquilino',
        role: 'Inquilino',
        count: 0,
        status: contract.status === 'vencido' ? 'Vencido' : 'Al día',
      }

      existingTenant.count += 1
      existingTenant.detail = `${existingTenant.count} contrato${existingTenant.count === 1 ? '' : 's'} activo${existingTenant.count === 1 ? '' : 's'}`
      existingTenant.property = propertyTitle
      clientMap.set(contract.tenant_id, existingTenant)
    }
  })

  return Array.from(clientMap.values()).slice(0, 5)
}

function DashboardMetricCard({ icon: Icon, tone, title, value, subtitle }) {
  return (
    <article className={`agent-metric-card agent-metric-${tone}`}>
      <div className="agent-metric-icon">
        <Icon size={21} />
      </div>
      <div>
        <p>{title}</p>
        <strong>{value}</strong>
        <span>{subtitle}</span>
      </div>
    </article>
  )
}

function IndicatorPill({ icon: Icon, tone, label, value }) {
  return (
    <article className={`agent-indicator-pill agent-indicator-${tone}`}>
      <Icon size={17} />
      <span>{value}</span>
      <p>{label}</p>
    </article>
  )
}

function EmptyDashboardState({ children }) {
  return <div className="agent-empty-state">{children}</div>
}

function DashboardInmobiliaria() {
  const [dashboardData, setDashboardData] = useState(emptyDashboardData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setLoading(true)

      if (!supabase) {
        setDashboardData({
          ...emptyDashboardData,
          errors: ['Supabase no está configurado.'],
        })
        setLoading(false)
        return
      }

      const [
        totalProperties,
        activeContracts,
        pendingPayments,
        overduePayments,
        pendingRepairs,
        publishedRepairs,
        pendingApplications,
        jobsInProgress,
        recentProperties,
        recentRepairs,
        activeClients,
      ] = await Promise.all([
        runSafe('Total de propiedades', () => countRows('properties'), 0),
        runSafe('Contratos vigentes', () => countRows('contracts', (query) => query.eq('status', 'activo')), 0),
        runSafe('Pagos pendientes', () => countRows('payments', (query) => query.eq('status', 'pendiente')), 0),
        runSafe('Pagos vencidos', () => countRows('payments', (query) => query.eq('status', 'vencido')), 0),
        runSafe('Arreglos pendientes', () => countRows('repair_requests', (query) => query.eq('status', 'pendiente')), 0),
        runSafe('Arreglos publicados', () => countRows('repair_requests', (query) => query.in('status', ['publicada', 'publicado'])), 0),
        runSafe('Postulaciones pendientes', () => countRows('job_applications', (query) => query.eq('status', 'pendiente')), 0),
        runSafe('Trabajos en proceso', () => countRows('repair_requests', (query) => query.eq('status', 'en_proceso')), 0),
        runSafe(
          'Propiedades recientes',
          async () => {
            const { data, error } = await supabase
              .from('properties')
              .select('id, title, address, city, property_type, operation_type, status, created_at, owner:owner_id(full_name)')
              .order('created_at', { ascending: false })
              .limit(5)

            if (error) throw error
            return data || []
          },
          [],
        ),
        runSafe(
          'Solicitudes de arreglo',
          async () => {
            const { data, error } = await supabase
              .from('repair_requests')
              .select('id, title, priority, status, created_at, properties(title, address), assigned_professional:assigned_professional_id(full_name)')
              .order('created_at', { ascending: false })
              .limit(5)

            if (error) throw error
            return data || []
          },
          [],
        ),
        runSafe(
          'Clientes activos',
          async () => {
            const { data, error } = await supabase
              .from('contracts')
              .select('id, status, tenant_id, owner_id, tenant:tenant_id(full_name), owner:owner_id(full_name), properties(title)')
              .in('status', ['activo', 'vencido'])
              .order('created_at', { ascending: false })
              .limit(12)

            if (error) throw error
            return buildClientsFromContracts(data || [])
          },
          [],
        ),
      ])

      if (!isMounted) return

      const stats = {
        totalProperties: totalProperties.data,
        activeContracts: activeContracts.data,
        pendingPayments: pendingPayments.data,
        overduePayments: overduePayments.data,
        pendingRepairs: pendingRepairs.data,
        publishedRepairs: publishedRepairs.data,
        pendingApplications: pendingApplications.data,
        jobsInProgress: jobsInProgress.data,
      }

      const errors = [
        totalProperties,
        activeContracts,
        pendingPayments,
        overduePayments,
        pendingRepairs,
        publishedRepairs,
        pendingApplications,
        jobsInProgress,
        recentProperties,
        recentRepairs,
        activeClients,
      ]
        .filter((result) => result.error)
        .map((result) => `${result.label}: ${result.error}`)

      setDashboardData({
        stats,
        properties: recentProperties.data,
        repairs: recentRepairs.data,
        clients: activeClients.data,
        errors,
      })
      setLoading(false)
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const activeRepairs = useMemo(
    () => dashboardData.stats.pendingRepairs + dashboardData.stats.publishedRepairs + dashboardData.stats.jobsInProgress,
    [dashboardData.stats],
  )

  return (
    <DashboardLayout
      title="Resumen general"
      role="Inmobiliaria"
      roleLabel="Agente"
      organizationName="Inmobiliaria Demo"
      headingEyebrow="Panel de gestión de la inmobiliaria"
    >
      {loading ? <p className="loading-feedback">Cargando información del panel...</p> : null}
      {dashboardData.errors.length > 0 ? (
        <div className="agent-warning-box">
          <strong>Algunos datos no se pudieron cargar.</strong>
          <span>El resto del panel sigue disponible. Revisá permisos RLS o tablas en Supabase.</span>
        </div>
      ) : null}

      <section className="agent-metrics-grid">
        <DashboardMetricCard
          icon={Building2}
          tone="blue"
          title="Propiedades activas"
          value={dashboardData.stats.totalProperties}
          subtitle="Disponibles y alquiladas"
        />
        <DashboardMetricCard
          icon={FileText}
          tone="indigo"
          title="Contratos vigentes"
          value={dashboardData.stats.activeContracts}
          subtitle="Contratos en curso"
        />
        <DashboardMetricCard
          icon={CreditCard}
          tone="amber"
          title="Pagos pendientes"
          value={dashboardData.stats.pendingPayments}
          subtitle="Facturas por cobrar"
        />
        <DashboardMetricCard
          icon={Wrench}
          tone="green"
          title="Arreglos en gestión"
          value={activeRepairs}
          subtitle="Solicitudes activas"
        />
      </section>

      <section className="agent-indicators-grid">
        <IndicatorPill icon={Banknote} tone="danger" label="pagos vencidos" value={dashboardData.stats.overduePayments} />
        <IndicatorPill icon={Wrench} tone="info" label="arreglos publicados" value={dashboardData.stats.publishedRepairs} />
        <IndicatorPill icon={ClipboardList} tone="violet" label="postulaciones pendientes" value={dashboardData.stats.pendingApplications} />
        <IndicatorPill icon={BriefcaseBusiness} tone="success" label="trabajos en proceso" value={dashboardData.stats.jobsInProgress} />
      </section>

      <section className="agent-dashboard-grid">
        <article className="agent-dashboard-card agent-dashboard-card-large">
          <div className="agent-card-header">
            <div>
              <p className="eyebrow">Cartera</p>
              <h2>Propiedades</h2>
            </div>
            <Link to="/inmobiliaria/propiedades">Ver todas</Link>
          </div>

          {dashboardData.properties.length === 0 ? (
            <EmptyDashboardState>No hay propiedades recientes para mostrar.</EmptyDashboardState>
          ) : (
            <div className="agent-property-list">
              {dashboardData.properties.map((property) => (
                <Link className="agent-list-row" key={property.id} to={`/inmobiliaria/propiedades/${property.id}`}>
                  <span className="agent-row-icon">
                    <Home size={18} />
                  </span>
                  <span className="agent-row-main">
                    <strong>{property.title || property.address}</strong>
                    <small>
                      {property.property_type} · {property.owner?.full_name || 'Sin propietario asignado'}
                    </small>
                  </span>
                  <StatusBadge status={property.status} />
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className="agent-dashboard-card">
          <div className="agent-card-header">
            <div>
              <p className="eyebrow">Operación</p>
              <h2>Accesos rápidos</h2>
            </div>
          </div>
          <div className="agent-quick-actions">
            <Link to="/inmobiliaria/propiedades/nueva">
              <Plus size={17} />
              Nueva propiedad
            </Link>
            <Link to="/inmobiliaria/contratos/nuevo">
              <FilePlus2 size={17} />
              Nuevo contrato
            </Link>
            <Link to="/inmobiliaria/arreglos/nuevo">
              <Wrench size={17} />
              Nueva solicitud
            </Link>
            <Link to="/inmobiliaria/pagos">
              <CreditCard size={17} />
              Ver pagos
            </Link>
            <Link to="/inmobiliaria/profesionales">
              <UsersRound size={17} />
              Ver profesionales
            </Link>
          </div>
        </article>

        <article className="agent-dashboard-card agent-dashboard-card-large">
          <div className="agent-card-header">
            <div>
              <p className="eyebrow">Mantenimiento</p>
              <h2>Solicitudes de arreglo</h2>
            </div>
            <div className="agent-card-actions">
              <Link to="/inmobiliaria/arreglos/nuevo">Nueva solicitud</Link>
              <Link to="/inmobiliaria/arreglos">Ver todas</Link>
            </div>
          </div>

          {dashboardData.repairs.length === 0 ? (
            <EmptyDashboardState>No hay solicitudes de arreglo pendientes.</EmptyDashboardState>
          ) : (
            <div className="agent-repair-table">
              <div className="agent-repair-head">
                <span>Solicitud</span>
                <span>Propiedad</span>
                <span>Profesional</span>
                <span>Prioridad</span>
                <span>Estado</span>
                <span>Fecha</span>
              </div>
              {dashboardData.repairs.map((repair) => (
                <Link className="agent-repair-row" key={repair.id} to={`/inmobiliaria/arreglos/${repair.id}`}>
                  <strong>{repair.title}</strong>
                  <span>{repair.properties?.title || repair.properties?.address || 'Sin propiedad'}</span>
                  <span>{repair.assigned_professional?.full_name || 'Sin asignar'}</span>
                  <span className={`priority-pill priority-${repair.priority}`}>{repair.priority}</span>
                  <StatusBadge status={repair.status} />
                  <span>{formatDate(repair.created_at?.slice(0, 10))}</span>
                </Link>
              ))}
            </div>
          )}
        </article>

        <article className="agent-dashboard-card">
          <div className="agent-card-header">
            <div>
              <p className="eyebrow">Relaciones</p>
              <h2>Clientes activos</h2>
            </div>
          </div>

          {dashboardData.clients.length === 0 ? (
            <EmptyDashboardState>No hay clientes activos para mostrar.</EmptyDashboardState>
          ) : (
            <div className="agent-client-list">
              {dashboardData.clients.map((client) => (
                <div className="agent-client-row" key={`${client.role}-${client.id}`}>
                  <span className="agent-row-icon">
                    <UserRound size={17} />
                  </span>
                  <span className="agent-row-main">
                    <strong>{client.name}</strong>
                    <small>{client.role} · {client.detail || client.property || 'Vinculado a la inmobiliaria'}</small>
                  </span>
                  <span className={`client-status ${client.status === 'Vencido' ? 'client-status-danger' : ''}`}>{client.status}</span>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </DashboardLayout>
  )
}

export default DashboardInmobiliaria

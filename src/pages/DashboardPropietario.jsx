import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import SimpleTable from '../components/SimpleTable'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/useAuth'
import { getOwnerDashboard } from '../services/ownerService'
import { formatCurrency, formatDate, formatDisplayText } from '../utils/formatters'

function getPropertyLabel(property) {
  return [property?.title, property?.address].filter(Boolean).join(' · ') || 'Propiedad no especificada'
}

function getPersonLabel(profile) {
  if (!profile) return 'Sin asignar'
  return [profile.full_name, profile.email || profile.phone].filter(Boolean).join(' · ') || 'No especificado'
}

function DashboardPropietario({ view = 'overview' }) {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState({
    properties: [],
    contracts: [],
    payments: [],
    repairs: [],
    stats: {
      properties: 0,
      activeContracts: 0,
      pendingPayments: 0,
      activeRepairs: 0,
    },
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      if (!user?.id) return

      setLoading(true)
      setError(null)

      try {
        const data = await getOwnerDashboard(user.id)
        if (isMounted) setDashboardData(data)
      } catch (dashboardError) {
        if (isMounted) setError(dashboardError.message)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [user?.id])

  const visibleSections = useMemo(() => {
    if (view === 'overview') return ['properties', 'contracts', 'payments', 'repairs']
    return [view]
  }, [view])

  const propertyColumns = [
    {
      header: 'Propiedad',
      key: 'property',
      render: (property) => (
        <div className="table-main-copy">
          <strong>{property.title || 'Sin título'}</strong>
          <span>{[property.address, property.city].filter(Boolean).join(', ') || 'Ubicación no especificada'}</span>
        </div>
      ),
    },
    { header: 'Operación', key: 'operation', render: (property) => formatDisplayText(property.operation_type) },
    { header: 'Precio', key: 'price', render: (property) => formatCurrency(property.price, property.currency || 'ARS') },
    { header: 'Estado', key: 'status', render: (property) => <StatusBadge status={property.status} /> },
    {
      header: 'Detalle',
      key: 'detail',
      render: (property) => <Link to={`/portal/propiedades/${property.id}`}>Ver detalle</Link>,
    },
  ]

  const contractColumns = [
    { header: 'Propiedad', key: 'property', render: (contract) => getPropertyLabel(contract.properties) },
    { header: 'Inquilino', key: 'tenant', render: (contract) => getPersonLabel(contract.tenant) },
    { header: 'Inicio', key: 'start_date', render: (contract) => formatDate(contract.start_date) },
    { header: 'Fin', key: 'end_date', render: (contract) => formatDate(contract.end_date) },
    { header: 'Monto mensual', key: 'monthly_amount', render: (contract) => formatCurrency(contract.monthly_amount) },
    { header: 'Estado', key: 'status', render: (contract) => <StatusBadge status={contract.status} /> },
  ]

  const paymentColumns = [
    { header: 'Propiedad', key: 'property', render: (payment) => getPropertyLabel(payment.contracts?.properties) },
    { header: 'Inquilino', key: 'tenant', render: (payment) => getPersonLabel(payment.tenant) },
    { header: 'Monto', key: 'amount', render: (payment) => formatCurrency(payment.amount) },
    { header: 'Vencimiento', key: 'due_date', render: (payment) => formatDate(payment.due_date) },
    { header: 'Estado', key: 'status', render: (payment) => <StatusBadge status={payment.status} /> },
  ]

  const repairColumns = [
    {
      header: 'Solicitud',
      key: 'repair',
      render: (repair) => (
        <div className="table-main-copy">
          <strong>{repair.title || 'Solicitud sin título'}</strong>
          <span>{getPropertyLabel(repair.properties)}</span>
        </div>
      ),
    },
    { header: 'Prioridad', key: 'priority', render: (repair) => <StatusBadge status={repair.priority} /> },
    { header: 'Estado', key: 'status', render: (repair) => <StatusBadge status={repair.status} /> },
    { header: 'Fecha generación', key: 'created_at', render: (repair) => formatDate(repair.created_at?.slice(0, 10)) },
    { header: 'Profesional', key: 'professional', render: (repair) => getPersonLabel(repair.assigned_professional) },
  ]

  return (
    <DashboardLayout
      title="Panel del propietario"
      role="Propietario"
      headingEyebrow="Consulta de propiedades administradas"
    >
      <section className="dashboard-welcome">
        <h1>Panel del propietario</h1>
        <p className="muted">Consulta el estado de tus propiedades administradas por la inmobiliaria.</p>
      </section>

      {loading ? <p className="loading-feedback">Cargando información del propietario...</p> : null}
      {error ? <p className="error-message">{error}</p> : null}

      <section className="stats-grid">
        <StatCard label="Propiedades administradas" value={dashboardData.stats.properties} />
        <StatCard label="Contratos activos" value={dashboardData.stats.activeContracts} />
        <StatCard label="Pagos pendientes" value={dashboardData.stats.pendingPayments} />
        <StatCard label="Arreglos en curso" value={dashboardData.stats.activeRepairs} />
      </section>

      <nav className="dashboard-nav" aria-label="Secciones del propietario">
        <Link to="/propietario/propiedades">Mis propiedades</Link>
        <Link to="/propietario/contratos">Contratos</Link>
        <Link to="/propietario/pagos">Pagos</Link>
        <Link to="/propietario/arreglos">Arreglos</Link>
      </nav>

      {visibleSections.includes('properties') ? (
        <section className="panel dashboard-section">
          <h2>Mis propiedades</h2>
          <SimpleTable
            columns={propertyColumns}
            rows={dashboardData.properties}
            emptyMessage="No tenés propiedades asociadas por el momento."
          />
        </section>
      ) : null}

      {visibleSections.includes('contracts') ? (
        <section className="panel dashboard-section">
          <h2>Contratos asociados</h2>
          <SimpleTable
            columns={contractColumns}
            rows={dashboardData.contracts}
            emptyMessage="No hay contratos activos."
          />
        </section>
      ) : null}

      {visibleSections.includes('payments') ? (
        <section className="panel dashboard-section">
          <h2>Pagos</h2>
          <SimpleTable
            columns={paymentColumns}
            rows={dashboardData.payments}
            emptyMessage="No hay pagos pendientes."
          />
        </section>
      ) : null}

      {visibleSections.includes('repairs') ? (
        <section className="panel dashboard-section">
          <h2>Arreglos</h2>
          <SimpleTable
            columns={repairColumns}
            rows={dashboardData.repairs}
            emptyMessage="No hay arreglos en curso."
          />
        </section>
      ) : null}
    </DashboardLayout>
  )
}

export default DashboardPropietario

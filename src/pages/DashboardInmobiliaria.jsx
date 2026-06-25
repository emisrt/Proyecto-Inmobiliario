import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import StatCard from '../components/StatCard'
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

async function countRows(table, queryBuilder) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true })

  if (queryBuilder) {
    query = queryBuilder(query)
  }

  const { count, error } = await query

  if (error) throw error

  return count || 0
}

function DashboardInmobiliaria() {
  const [stats, setStats] = useState(initialStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setLoading(true)
      setError(null)

      if (!supabase) {
        setError('Supabase no esta configurado.')
        setLoading(false)
        return
      }

      try {
        const [
          totalProperties,
          activeContracts,
          pendingPayments,
          overduePayments,
          pendingRepairs,
          publishedRepairs,
          pendingApplications,
          jobsInProgress,
        ] = await Promise.all([
          countRows('properties'),
          countRows('contracts', (query) => query.eq('status', 'activo')),
          countRows('payments', (query) => query.eq('status', 'pendiente')),
          countRows('payments', (query) => query.eq('status', 'vencido')),
          countRows('repair_requests', (query) => query.eq('status', 'pendiente')),
          countRows('repair_requests', (query) => query.in('status', ['publicada', 'publicado'])),
          countRows('job_applications', (query) => query.eq('status', 'pendiente')),
          countRows('repair_requests', (query) => query.eq('status', 'en_proceso')),
        ])

        if (!isMounted) return

        setStats({
          totalProperties,
          activeContracts,
          pendingPayments,
          overduePayments,
          pendingRepairs,
          publishedRepairs,
          pendingApplications,
          jobsInProgress,
        })
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
  }, [])

  return (
    <DashboardLayout title="Panel de Inmobiliaria" role="Inmobiliaria">
      {loading ? <p className="muted">Cargando metricas...</p> : null}
      {error ? <p className="error-message">{error}</p> : null}

      <section className="stats-grid">
        <StatCard label="Total de propiedades" value={stats.totalProperties} />
        <StatCard label="Contratos activos" value={stats.activeContracts} />
        <StatCard label="Pagos pendientes" value={stats.pendingPayments} />
        <StatCard label="Pagos vencidos" value={stats.overduePayments} />
        <StatCard label="Arreglos pendientes" value={stats.pendingRepairs} />
        <StatCard label="Arreglos publicados" value={stats.publishedRepairs} />
        <StatCard label="Postulaciones pendientes" value={stats.pendingApplications} />
        <StatCard label="Trabajos en proceso" value={stats.jobsInProgress} />
      </section>
      <section className="panel dashboard-section">
        <div className="section-header">
          <h2>Accesos rapidos</h2>
          <div className="form-actions">
            <Link className="button-link" to="/inmobiliaria/propiedades">Gestionar propiedades</Link>
            <Link className="button-link" to="/inmobiliaria/arreglos">Gestionar arreglos</Link>
          </div>
        </div>
      </section>
    </DashboardLayout>
  )
}

export default DashboardInmobiliaria

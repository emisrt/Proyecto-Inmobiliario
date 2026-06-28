import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import SimpleTable from '../components/SimpleTable'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/useAuth'
import { supabase } from '../services/supabaseClient'
import { toUserErrorMessage } from '../utils/userMessages'
import { formatCurrency, formatDate } from '../utils/formatters'

const repairColumns = [
  { header: 'Trabajo', accessor: 'title' },
  { header: 'Tipo', accessor: 'repair_type' },
  { header: 'Prioridad', key: 'priority', render: (repair) => <StatusBadge status={repair.priority} /> },
  { header: 'Publicado', key: 'created_at', render: (repair) => formatDate(repair.created_at?.slice(0, 10)) },
]

const applicationColumns = [
  { header: 'Mensaje', accessor: 'message' },
  { header: 'Presupuesto', key: 'estimated_budget', render: (application) => formatCurrency(application.estimated_budget) },
  { header: 'Estado', key: 'status', render: (application) => <StatusBadge status={application.status} /> },
]

const assignedColumns = [
  { header: 'Trabajo', accessor: 'title' },
  { header: 'Tipo', accessor: 'repair_type' },
  { header: 'Estado', key: 'status', render: (repair) => <StatusBadge status={repair.status} /> },
]

function DashboardProfesional() {
  const { user } = useAuth()
  const [professionalProfile, setProfessionalProfile] = useState(null)
  const [availableJobs, setAvailableJobs] = useState([])
  const [applications, setApplications] = useState([])
  const [assignedJobs, setAssignedJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setLoading(true)
      setError(null)

      if (!supabase || !user?.id) {
        setLoading(false)
        return
      }

      try {
        const [profileResult, jobsResult, applicationsResult, assignedResult] = await Promise.all([
          supabase
            .from('professional_profiles')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle(),
          supabase
            .from('repair_requests')
            .select('*')
            .in('status', ['publicada', 'publicado'])
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('job_applications')
            .select('*')
            .eq('professional_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('repair_requests')
            .select('*')
            .eq('assigned_professional_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
        ])

        if (profileResult.error) throw profileResult.error
        if (jobsResult.error) throw jobsResult.error
        if (applicationsResult.error) throw applicationsResult.error
        if (assignedResult.error) throw assignedResult.error

        if (!isMounted) return

        setProfessionalProfile(profileResult.data)
        setAvailableJobs(jobsResult.data || [])
        setApplications(applicationsResult.data || [])
        setAssignedJobs(assignedResult.data || [])
      } catch (dashboardError) {
        if (isMounted) setError(toUserErrorMessage(dashboardError, 'No se pudo cargar la información profesional.'))
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [user?.id])

  return (
    <DashboardLayout title="Panel de profesional externo" role="Profesional externo">
      {loading ? <p className="loading-feedback">Cargando datos profesionales...</p> : null}
      {error ? <p className="error-message">{error}</p> : null}

      <section className="stats-grid">
        <StatCard
          label="Especialidad"
          value={professionalProfile?.specialty || 'Sin perfil'}
          hint={professionalProfile?.availability || professionalProfile?.work_zone}
        />
        <StatCard label="Trabajos disponibles" value={availableJobs.length} />
        <StatCard label="Postulaciones realizadas" value={applications.length} />
        <StatCard label="Trabajos asignados" value={assignedJobs.length} />
      </section>

      <section className="panel dashboard-section">
        <div className="section-header">
          <h2>Ultimos arreglos publicados</h2>
          <Link className="button-link" to="/profesional/arreglos-disponibles">Ver arreglos disponibles</Link>
        </div>
        <SimpleTable
          columns={repairColumns}
          rows={availableJobs}
          emptyMessage="No hay arreglos publicados disponibles."
          emptyDescription="Cuando la inmobiliaria publique trabajos, vas a poder revisarlos y postularte."
        />
      </section>

      <section className="panel dashboard-section">
        <h2>Postulaciones realizadas</h2>
        <SimpleTable
          columns={applicationColumns}
          rows={applications}
          emptyMessage="Todavía no realizaste postulaciones."
          emptyDescription="Postulate a un arreglo publicado para que aparezca en este listado."
        />
      </section>

      <section className="panel dashboard-section">
        <h2>Trabajos asignados</h2>
        <SimpleTable
          columns={assignedColumns}
          rows={assignedJobs}
          emptyMessage="No tenés trabajos asignados."
          emptyDescription="Los trabajos aceptados por la inmobiliaria aparecerán acá."
        />
      </section>
    </DashboardLayout>
  )
}

export default DashboardProfesional

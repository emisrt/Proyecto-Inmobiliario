import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/DashboardLayout'
import SimpleTable from '../components/SimpleTable'
import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../context/useAuth'
import { supabase } from '../services/supabaseClient'
import { formatCurrency, formatDate } from '../utils/formatters'
import { toUserErrorMessage } from '../utils/userMessages'

const paymentColumns = [
  { header: 'Monto', key: 'amount', render: (payment) => formatCurrency(payment.amount) },
  { header: 'Vencimiento', key: 'due_date', render: (payment) => formatDate(payment.due_date) },
  { header: 'Estado', key: 'status', render: (payment) => <StatusBadge status={payment.status} /> },
]

const repairColumns = [
  { header: 'Solicitud', accessor: 'title' },
  { header: 'Tipo', accessor: 'repair_type' },
  { header: 'Estado', key: 'status', render: (repair) => <StatusBadge status={repair.status} /> },
]

function DashboardInquilino() {
  const { user } = useAuth()
  const [contract, setContract] = useState(null)
  const [nextPayment, setNextPayment] = useState(null)
  const [payments, setPayments] = useState([])
  const [repairs, setRepairs] = useState([])
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
        const { data: activeContract, error: contractError } = await supabase
          .from('contracts')
          .select('*, properties(title, address)')
          .eq('tenant_id', user.id)
          .eq('status', 'activo')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (contractError) throw contractError

        const [nextPaymentResult, paymentsResult, repairsResult] = await Promise.all([
          supabase
            .from('payments')
            .select('*')
            .eq('tenant_id', user.id)
            .eq('status', 'pendiente')
            .order('due_date', { ascending: true })
            .limit(1)
            .maybeSingle(),
          supabase
            .from('payments')
            .select('*')
            .eq('tenant_id', user.id)
            .order('due_date', { ascending: false })
            .limit(5),
          supabase
            .from('repair_requests')
            .select('*')
            .eq('tenant_id', user.id)
            .order('created_at', { ascending: false })
            .limit(5),
        ])

        if (nextPaymentResult.error) throw nextPaymentResult.error
        if (paymentsResult.error) throw paymentsResult.error
        if (repairsResult.error) throw repairsResult.error

        if (!isMounted) return

        setContract(activeContract)
        setNextPayment(nextPaymentResult.data)
        setPayments(paymentsResult.data || [])
        setRepairs(repairsResult.data || [])
      } catch (dashboardError) {
        if (isMounted) setError(toUserErrorMessage(dashboardError, 'No se pudo cargar la información del inquilino.'))
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
    <DashboardLayout title="Panel de Inquilino" role="Inquilino">
      {loading ? <p className="loading-feedback">Cargando datos del alquiler...</p> : null}
      {error ? <p className="error-message">{error}</p> : null}

      <section className="stats-grid">
        <StatCard
          label="Contrato activo"
          value={contract ? contract.properties?.title || 'Contrato activo' : 'Sin contrato'}
          hint={contract ? `${formatDate(contract.start_date)} - ${formatDate(contract.end_date)}` : null}
        />
        <StatCard
          label="Proxima factura pendiente"
          value={nextPayment ? formatCurrency(nextPayment.amount) : 'Sin pendientes'}
          hint={nextPayment ? `Vence ${formatDate(nextPayment.due_date)}` : null}
        />
      </section>

      <section className="panel dashboard-section">
        <h2>Ultimos pagos</h2>
        <SimpleTable
          columns={paymentColumns}
          rows={payments}
          emptyMessage="No hay pagos registrados."
          emptyDescription="Cuando se generen facturas para tu contrato, vas a verlas en esta sección."
        />
      </section>

      <section className="panel dashboard-section">
        <div className="section-header">
          <h2>Ultimas solicitudes de arreglo</h2>
          <Link className="button-link" to="/inquilino/arreglos/nuevo">Solicitar arreglo</Link>
        </div>
        <SimpleTable
          columns={repairColumns}
          rows={repairs}
          emptyMessage="No hay solicitudes de arreglo registradas."
          emptyDescription="Si necesitás reportar un problema en la propiedad, podés crear una solicitud."
          emptyAction={<Link className="button-link" to="/inquilino/arreglos/nuevo">Solicitar arreglo</Link>}
        />
      </section>
    </DashboardLayout>
  )
}

export default DashboardInquilino

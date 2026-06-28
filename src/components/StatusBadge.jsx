function normalizeStatus(status) {
  return String(status || 'sin_estado')
    .toLowerCase()
    .replaceAll(' ', '_')
}

const statusLabels = {
  agente_inmobiliario: 'Agente inmobiliario',
  inquilino: 'Inquilino',
  propietario: 'Propietario',
  profesional: 'Profesional',
  visitante: 'Visitante',
  pendiente_confirmacion: 'Pendiente de confirmación',
  disponible_alquiler: 'Disponible alquiler',
  disponible_venta: 'Disponible venta',
  en_proceso: 'En proceso',
  sin_estado: 'Sin estado',
}

function StatusBadge({ status }) {
  const normalizedStatus = normalizeStatus(status)
  const label = statusLabels[normalizedStatus] || String(status || 'Sin estado').replaceAll('_', ' ')

  return (
    <span className={`status-badge status-${normalizedStatus}`}>
      {label}
    </span>
  )
}

export default StatusBadge

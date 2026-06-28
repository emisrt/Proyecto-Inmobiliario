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
  borrador: 'Borrador',
  activo: 'Activo',
  finalizado: 'Finalizado',
  rescindido: 'Rescindido',
  pendiente: 'Pendiente',
  abonado: 'Abonado',
  vencido: 'Vencido',
  anulado: 'Anulado',
  abonado_con_recargo: 'Abonado con recargo',
  pendiente_confirmacion: 'Pendiente de confirmación',
  disponible: 'Disponible',
  disponible_alquiler: 'Disponible alquiler',
  disponible_venta: 'Disponible venta',
  registrada: 'Registrada',
  alquilada: 'Alquilada',
  vendida: 'Vendida',
  suspendida: 'Suspendida',
  publicada: 'Publicado',
  publicado: 'Publicado',
  en_proceso: 'En proceso',
  resuelta: 'Resuelto',
  resuelto: 'Resuelto',
  cancelada: 'Cancelado',
  cancelado: 'Cancelado',
  aceptada: 'Aceptada',
  rechazada: 'Rechazada',
  baja: 'Baja',
  media: 'Media',
  alta: 'Alta',
  urgente: 'Urgente',
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

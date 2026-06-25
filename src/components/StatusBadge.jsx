function normalizeStatus(status) {
  return String(status || 'sin_estado')
    .toLowerCase()
    .replaceAll(' ', '_')
}

function StatusBadge({ status }) {
  const normalizedStatus = normalizeStatus(status)

  return (
    <span className={`status-badge status-${normalizedStatus}`}>
      {String(status || 'Sin estado').replaceAll('_', ' ')}
    </span>
  )
}

export default StatusBadge

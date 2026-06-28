export function formatCurrency(value, currency = 'ARS') {
  if (value === null || value === undefined) return '-'

  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(Number(value))
}

export function formatDate(value) {
  if (!value) return '-'

  return new Intl.DateTimeFormat('es-AR').format(new Date(`${value}T00:00:00`))
}

export function formatDisplayText(value, fallback = 'No especificado') {
  if (value === null || value === undefined || value === '') return fallback

  return String(value).replaceAll('_', ' ')
}

export function formatProfileName(profile, fallback = 'Sin datos cargados') {
  if (!profile) return fallback

  return profile.full_name || profile.email || profile.phone || fallback
}

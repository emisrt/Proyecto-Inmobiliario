export function toUserErrorMessage(error, fallback = 'No se pudo completar la acción. Intentá nuevamente.') {
  const rawMessage = typeof error === 'string' ? error : error?.message

  if (!rawMessage) return fallback

  const message = rawMessage.toLowerCase()

  if (message.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos.'
  }

  if (message.includes('email rate limit exceeded')) {
    return 'Se alcanzó el límite de intentos por email. Esperá unos minutos antes de volver a probar.'
  }

  if (message.includes('jwt') || message.includes('row-level security') || message.includes('violates row-level security')) {
    return 'No tenés permisos para realizar esta acción.'
  }

  if (message.includes('failed to fetch') || message.includes('network')) {
    return 'No se pudo conectar con el servicio. Revisá tu conexión e intentá nuevamente.'
  }

  if (message.includes('schema cache') || message.includes('column') || message.includes('relation') || message.includes('constraint')) {
    return 'La base de datos necesita una actualización de esquema. Revisá la guía SQL del proyecto.'
  }

  return rawMessage
}

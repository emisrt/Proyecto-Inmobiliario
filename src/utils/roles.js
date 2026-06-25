export const ROLE_HOME = {
  agente_inmobiliario: '/inmobiliaria',
  inquilino: '/inquilino',
  propietario: '/propietario',
  profesional: '/profesional',
  visitante: '/portal',
}

export function getRoleHome(role) {
  return ROLE_HOME[role] || '/portal'
}

import { supabase } from './supabaseClient'

const activeRepairStatuses = ['pendiente', 'publicada', 'publicado', 'en_proceso', 'pendiente_confirmacion']

export async function listOwnerProperties(ownerId) {
  const { data, error } = await supabase
    .from('properties')
    .select('id, title, address, city, operation_type, property_type, price, currency, status')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function listOwnerContracts(ownerId) {
  const { data, error } = await supabase
    .from('contracts')
    .select('id, property_id, start_date, end_date, monthly_amount, status, properties(title, address), tenant:tenant_id(full_name, email, phone)')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function listOwnerPayments(contractIds) {
  if (contractIds.length === 0) return []

  const { data, error } = await supabase
    .from('payments')
    .select('id, contract_id, tenant_id, amount, due_date, status, tenant:tenant_id(full_name, email), contracts(property_id, properties(title, address))')
    .in('contract_id', contractIds)
    .order('due_date', { ascending: true })

  if (error) throw error
  return data || []
}

export async function listOwnerRepairs(propertyIds) {
  if (propertyIds.length === 0) return []

  const { data, error } = await supabase
    .from('repair_requests')
    .select('id, title, priority, status, created_at, properties(title, address), assigned_professional:assigned_professional_id(full_name, phone)')
    .in('property_id', propertyIds)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getOwnerDashboard(ownerId) {
  const properties = await listOwnerProperties(ownerId)
  const propertyIds = properties.map((property) => property.id)
  const contracts = await listOwnerContracts(ownerId)
  const contractIds = contracts.map((contract) => contract.id)
  const [payments, repairs] = await Promise.all([
    listOwnerPayments(contractIds),
    listOwnerRepairs(propertyIds),
  ])

  return {
    properties,
    contracts,
    payments,
    repairs,
    stats: {
      properties: properties.length,
      activeContracts: contracts.filter((contract) => contract.status === 'activo').length,
      pendingPayments: payments.filter((payment) => ['pendiente', 'vencido'].includes(payment.status)).length,
      activeRepairs: repairs.filter((repair) => activeRepairStatuses.includes(repair.status)).length,
    },
  }
}

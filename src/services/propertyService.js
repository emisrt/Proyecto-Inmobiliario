import { supabase } from './supabaseClient'

const propertySelect = '*, owner:owner_id(full_name), agent:agent_id(full_name)'
const contractSummarySelect = `
  id,
  property_id,
  tenant_id,
  owner_id,
  agent_id,
  start_date,
  end_date,
  monthly_amount,
  status,
  tenant:tenant_id(full_name, email, phone)
`
const contractSummaryFallbackSelect = `
  id,
  property_id,
  tenant_id,
  owner_id,
  agent_id,
  start_date,
  end_date,
  monthly_amount,
  status,
  tenant:tenant_id(full_name, phone)
`

export const publicPropertyStatuses = ['disponible', 'disponible_alquiler', 'disponible_venta']

export function getInitialPropertyStatus(operationType) {
  return operationType === 'venta' ? 'disponible_venta' : 'disponible_alquiler'
}

export async function listProperties({ search = '', operationType = '' } = {}) {
  let query = supabase
    .from('properties')
    .select(propertySelect)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`title.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%,province.ilike.%${search}%,neighborhood.ilike.%${search}%,property_type.ilike.%${search}%`)
  }

  if (operationType) {
    query = query.eq('operation_type', operationType)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function listPublicProperties({ search = '', operationType = '' } = {}) {
  let query = supabase
    .from('properties')
    .select(propertySelect)
    .in('status', publicPropertyStatuses)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`title.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%,province.ilike.%${search}%,neighborhood.ilike.%${search}%,property_type.ilike.%${search}%`)
  }

  if (operationType) {
    query = query.eq('operation_type', operationType)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getProperty(id) {
  const { data, error } = await supabase.from('properties').select(propertySelect).eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function saveProperty(property, userId, id) {
  const payload = {
    title: property.title,
    address: property.address,
    province: property.province || null,
    city: property.city || null,
    neighborhood: property.neighborhood || null,
    operation_type: property.operation_type,
    property_type: property.property_type,
    price: Number(property.price || 0),
    currency: property.currency || 'ARS',
    status: id ? property.status : getInitialPropertyStatus(property.operation_type),
    description: property.description || null,
    owner_id: property.owner_id || null,
    agent_id: property.agent_id || userId,
    image_url: property.image_url || null,
    bedrooms: Number(property.bedrooms || 0),
    bathrooms: Number(property.bathrooms || 0),
    total_area: property.total_area === '' || property.total_area === null ? null : Number(property.total_area),
    covered_area: property.covered_area === '' || property.covered_area === null ? null : Number(property.covered_area),
    has_garage: Boolean(property.has_garage),
    has_yard: Boolean(property.has_yard),
    has_pool: Boolean(property.has_pool),
    pets_allowed: Boolean(property.pets_allowed),
  }

  const query = id
    ? supabase.from('properties').update(payload).eq('id', id).select().single()
    : supabase.from('properties').insert(payload).select().single()

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function listPropertyOwners() {
  const query = supabase
    .from('profiles')
    .select('id, full_name, email, phone')
    .eq('role', 'propietario')
    .order('full_name', { ascending: true })

  const { data, error } = await query
  if (error && error.message?.includes('email')) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('profiles')
      .select('id, full_name, phone')
      .eq('role', 'propietario')
      .order('full_name', { ascending: true })

    if (fallbackError) throw fallbackError
    return fallbackData || []
  }

  if (error) throw error
  return data || []
}

export async function updatePropertyStatus(id, status) {
  const { data, error } = await supabase.from('properties').update({ status }).eq('id', id).select(propertySelect).single()
  if (error) throw error
  return data
}

export async function getPropertyContractSummary(propertyId) {
  const query = supabase
    .from('contracts')
    .select(contractSummarySelect)
    .eq('property_id', propertyId)
    .in('status', ['activo', 'pendiente'])
    .order('created_at', { ascending: false })
    .limit(1)

  const { data, error } = await query.maybeSingle()

  if (error && error.message?.includes('email')) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('contracts')
      .select(contractSummaryFallbackSelect)
      .eq('property_id', propertyId)
      .in('status', ['activo', 'pendiente'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (fallbackError) throw fallbackError
    return fallbackData
  }

  if (error) throw error
  return data
}

async function countRows(tableName, applyFilters) {
  let query = supabase.from(tableName).select('id', { count: 'exact', head: true })
  query = applyFilters ? applyFilters(query) : query

  const { count, error } = await query
  if (error) throw error
  return count || 0
}

export async function getPropertyDeletionSummary(propertyId) {
  const { data: contracts, error: contractsError } = await supabase
    .from('contracts')
    .select('id, status')
    .eq('property_id', propertyId)

  if (contractsError) throw contractsError

  const contractIds = (contracts || []).map((contract) => contract.id)
  const [repairs, activeRepairs, payments] = await Promise.all([
    countRows('repair_requests', (query) => query.eq('property_id', propertyId)),
    countRows('repair_requests', (query) =>
      query.eq('property_id', propertyId).in('status', ['pendiente', 'publicada', 'publicado', 'en_proceso', 'pendiente_confirmacion']),
    ),
    contractIds.length > 0
      ? countRows('payments', (query) => query.in('contract_id', contractIds))
      : Promise.resolve(0),
  ])

  const activeContracts = (contracts || []).filter((contract) => ['activo', 'pendiente'].includes(contract.status)).length

  return {
    contracts: contracts?.length || 0,
    activeContracts,
    repairs,
    activeRepairs,
    payments,
  }
}

export async function deleteProperty(id) {
  const { error } = await supabase.from('properties').delete().eq('id', id)
  if (error) throw error
}

import { supabase } from './supabaseClient'

const propertySelect = '*, owner:owner_id(full_name), agent:agent_id(full_name)'

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
  const { data, error } = await supabase.from('properties').update({ status }).eq('id', id).select().single()
  if (error) throw error
  return data
}

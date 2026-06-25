import { supabase } from './supabaseClient'

const propertySelect = '*, owner:owner_id(full_name), agent:agent_id(full_name)'

export const publicPropertyStatuses = ['disponible', 'disponible_alquiler', 'disponible_venta']

export async function listProperties({ search = '', operationType = '' } = {}) {
  let query = supabase
    .from('properties')
    .select(propertySelect)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(`title.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%`)
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
    query = query.or(`title.ilike.%${search}%,address.ilike.%${search}%,city.ilike.%${search}%`)
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
    city: property.city || null,
    operation_type: property.operation_type,
    property_type: property.property_type,
    price: Number(property.price || 0),
    status: property.status,
    description: property.description || null,
    owner_id: property.owner_id || null,
    agent_id: property.agent_id || userId,
    image_url: property.image_url || null,
  }

  const query = id
    ? supabase.from('properties').update(payload).eq('id', id).select().single()
    : supabase.from('properties').insert(payload).select().single()

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function updatePropertyStatus(id, status) {
  const { data, error } = await supabase.from('properties').update({ status }).eq('id', id).select().single()
  if (error) throw error
  return data
}

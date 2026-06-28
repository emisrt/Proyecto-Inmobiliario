import { supabase } from './supabaseClient'

export const publishedRepairStatuses = ['publicada', 'publicado']

export async function getActiveTenantContract(userId) {
  const { data, error } = await supabase
    .from('contracts')
    .select('*, properties(title, address)')
    .eq('tenant_id', userId)
    .eq('status', 'activo')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function listTenantRepairs(userId) {
  const { data, error } = await supabase
    .from('repair_requests')
    .select('*, properties(title, address), assigned_professional:assigned_professional_id(full_name, phone)')
    .eq('tenant_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function listAgentRepairs({ status = '' } = {}) {
  let query = supabase
    .from('repair_requests')
    .select('*, properties(title, address, city), tenant:tenant_id(full_name, email, phone), assigned_professional:assigned_professional_id(full_name, phone)')
    .order('created_at', { ascending: false })

  if (status === 'publicado') {
    query = query.in('status', publishedRepairStatuses)
  } else if (status === 'resuelto') {
    query = query.in('status', ['resuelto', 'resuelta'])
  } else if (status === 'cancelado') {
    query = query.in('status', ['cancelado', 'cancelada'])
  } else if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function listRepairProperties(agentId) {
  let query = supabase
    .from('properties')
    .select('id, title, address, city, status')
    .order('title', { ascending: true })

  if (agentId) {
    query = query.eq('agent_id', agentId)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getActiveContractByProperty(propertyId) {
  const { data, error } = await supabase
    .from('contracts')
    .select('id, tenant_id, status, tenant:tenant_id(full_name, email, phone)')
    .eq('property_id', propertyId)
    .eq('status', 'activo')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function listPublishedRepairs() {
  const { data, error } = await supabase
    .from('repair_requests')
    .select('*, properties(title, address), tenant:tenant_id(full_name, email, phone)')
    .in('status', publishedRepairStatuses)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getRepair(id) {
  const { data, error } = await supabase
    .from('repair_requests')
    .select('*, properties(title, address), tenant:tenant_id(full_name, email, phone), assigned_professional:assigned_professional_id(full_name, phone)')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createTenantRepair(userId, values) {
  const activeContract = await getActiveTenantContract(userId)

  if (!activeContract) {
    throw new Error('Necesitas un contrato activo para solicitar un arreglo.')
  }

  const payload = {
    property_id: activeContract.property_id,
    contract_id: activeContract.id,
    tenant_id: userId,
    created_by_id: userId,
    requested_by_role: 'inquilino',
    title: values.title,
    description: values.description || null,
    repair_type: values.repair_type,
    priority: values.priority,
    status: 'pendiente',
  }

  const { data, error } = await supabase.from('repair_requests').insert(payload).select().single()
  if (error) throw error
  return data
}

export async function createAgentRepair(agentId, values) {
  const { data, error } = await supabase.rpc('create_agent_repair_request', {
    p_property_id: values.property_id,
    p_contract_id: values.contract_id || null,
    p_tenant_id: values.tenant_id || null,
    p_created_by_id: agentId,
    p_title: values.title,
    p_description: values.description,
    p_repair_type: values.repair_type,
    p_priority: values.priority,
    p_status: values.status,
    p_agent_notes: values.agent_notes || null,
  })

  if (error) throw error
  return data
}

export async function updateRepairByAgent(id, values) {
  const payload = {
    status: values.status,
    priority: values.priority,
    agent_notes: values.agent_notes || null,
  }

  const { data, error } = await supabase.from('repair_requests').update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function updateRepairStatus(id, status) {
  const { data, error } = await supabase
    .from('repair_requests')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function listAssignedRepairs(userId) {
  const { data, error } = await supabase
    .from('repair_requests')
    .select('*, properties(title, address), tenant:tenant_id(full_name, email, phone)')
    .eq('assigned_professional_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

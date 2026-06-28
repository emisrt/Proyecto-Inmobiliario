import { supabase } from './supabaseClient'

export async function searchAssignableProfiles(search) {
  const value = search.trim()

  if (!value) {
    throw new Error('Ingresá un nombre o email para buscar.')
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, phone, role')
    .in('role', ['inquilino', 'propietario', 'visitante'])
    .or(`full_name.ilike.%${value}%,email.ilike.%${value}%`)
    .order('full_name', { ascending: true })
    .limit(8)

  if (error && error.message?.includes('email')) {
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('profiles')
      .select('id, full_name, phone, role')
      .in('role', ['inquilino', 'propietario', 'visitante'])
      .ilike('full_name', `%${value}%`)
      .order('full_name', { ascending: true })
      .limit(8)

    if (fallbackError) throw fallbackError
    return fallbackData || []
  }

  if (error) throw error
  return data || []
}

export async function getActiveContractByProperty(propertyId) {
  const { data, error } = await supabase
    .from('contracts')
    .select('id, tenant_id, status')
    .eq('property_id', propertyId)
    .eq('status', 'activo')
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function getActiveContractByTenant(tenantId) {
  const { data, error } = await supabase
    .from('contracts')
    .select('id, property_id, status')
    .eq('tenant_id', tenantId)
    .eq('status', 'activo')
    .limit(1)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function assignTenantToProperty({ propertyId, tenantId, agentId, startDate, endDate, monthlyAmount, status, rules }) {
  const { data, error } = await supabase.rpc('assign_tenant_to_property', {
    p_property_id: propertyId,
    p_tenant_id: tenantId,
    p_agent_id: agentId,
    p_start_date: startDate,
    p_end_date: endDate,
    p_monthly_amount: Number(monthlyAmount),
    p_status: status,
    p_rules: rules || null,
  })

  if (error) throw error
  return data
}

import { supabase } from './supabaseClient'

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function findProfileByIdentifier(identifier) {
  const value = identifier.trim()

  if (!value) {
    throw new Error('Ingresá un ID de usuario o email.')
  }

  const query = supabase
    .from('profiles')
    .select('id, full_name, email, phone, role')
    .limit(1)

  const { data, error } = uuidPattern.test(value)
    ? await query.eq('id', value).maybeSingle()
    : await query.ilike('email', value).maybeSingle()

  if (error) throw error
  if (!data) throw new Error('Usuario no encontrado.')

  return data
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

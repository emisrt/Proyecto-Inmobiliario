import { supabase } from './supabaseClient'

export async function getProfessionalProfile(userId) {
  const { data, error } = await supabase
    .from('professional_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function saveProfessionalProfile(userId, values, profileId) {
  const payload = {
    user_id: userId,
    specialty: values.specialty,
    work_zone: values.work_zone || null,
    service_description: values.service_description || null,
    availability: values.availability || null,
  }

  const query = profileId
    ? supabase.from('professional_profiles').update(payload).eq('id', profileId).select().single()
    : supabase.from('professional_profiles').insert(payload).select().single()

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function listProfessionalApplications(userId) {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*, repair_requests(title, repair_type, priority, status, properties(title, address))')
    .eq('professional_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getApplicationForRepair(repairId, userId) {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('repair_request_id', repairId)
    .eq('professional_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function applyToRepair(repairId, userId, values) {
  const existingApplication = await getApplicationForRepair(repairId, userId)

  if (existingApplication) {
    return { data: existingApplication, alreadyApplied: true }
  }

  const payload = {
    repair_request_id: repairId,
    professional_id: userId,
    message: values.message || null,
    estimated_budget: values.estimated_budget ? Number(values.estimated_budget) : null,
    status: 'pendiente',
  }

  const { data, error } = await supabase.from('job_applications').insert(payload).select().single()
  if (error) throw error
  return { data, alreadyApplied: false }
}

export async function listRepairApplications(repairId) {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*, professional:professional_id(full_name, phone)')
    .eq('repair_request_id', repairId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const applications = data || []
  const professionalIds = applications.map((application) => application.professional_id)

  if (professionalIds.length === 0) return applications

  const { data: profiles, error: profileError } = await supabase
    .from('professional_profiles')
    .select('user_id, specialty, work_zone')
    .in('user_id', professionalIds)

  if (profileError) throw profileError

  const profileByUserId = new Map((profiles || []).map((profile) => [profile.user_id, profile]))

  return applications.map((application) => ({
    ...application,
    professional_profile: profileByUserId.get(application.professional_id) || null,
  }))
}

export async function acceptApplication(application) {
  const { error: acceptError } = await supabase
    .from('job_applications')
    .update({ status: 'aceptada' })
    .eq('id', application.id)

  if (acceptError) throw acceptError

  const { error: repairError } = await supabase
    .from('repair_requests')
    .update({
      status: 'en_proceso',
      assigned_professional_id: application.professional_id,
    })
    .eq('id', application.repair_request_id)

  if (repairError) throw repairError

  const { error: rejectOthersError } = await supabase
    .from('job_applications')
    .update({ status: 'rechazada' })
    .eq('repair_request_id', application.repair_request_id)
    .neq('id', application.id)

  if (rejectOthersError) throw rejectOthersError
}

export async function rejectApplication(applicationId) {
  const { error } = await supabase.from('job_applications').update({ status: 'rechazada' }).eq('id', applicationId)
  if (error) throw error
}

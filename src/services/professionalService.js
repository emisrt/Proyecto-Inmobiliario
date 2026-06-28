import { supabase } from './supabaseClient'

export const professionalSpecialties = [
  { value: 'electricidad', label: 'Electricidad' },
  { value: 'plomeria', label: 'Plomería' },
  { value: 'gas', label: 'Gas' },
  { value: 'pintura', label: 'Pintura' },
  { value: 'carpinteria', label: 'Carpintería' },
  { value: 'albanileria', label: 'Albañilería' },
  { value: 'cerrajeria', label: 'Cerrajería' },
  { value: 'aire_acondicionado', label: 'Aire acondicionado' },
  { value: 'mantenimiento_general', label: 'Mantenimiento general' },
  { value: 'jardineria', label: 'Jardinería' },
  { value: 'otro', label: 'Otro' },
]

export const availabilityOptions = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'ocupado', label: 'Ocupado' },
  { value: 'no_disponible', label: 'No disponible' },
]

const specialtyAliases = {
  electricista: 'electricidad',
  electricidad: 'electricidad',
  plomero: 'plomeria',
  plomeria: 'plomeria',
  plomería: 'plomeria',
  gasista: 'gas',
  gas: 'gas',
  pintor: 'pintura',
  pintura: 'pintura',
  carpintero: 'carpinteria',
  carpinteria: 'carpinteria',
  carpintería: 'carpinteria',
  albañil: 'albanileria',
  albanil: 'albanileria',
  albañileria: 'albanileria',
  albañilería: 'albanileria',
  cerrajero: 'cerrajeria',
  cerrajeria: 'cerrajeria',
  cerrajería: 'cerrajeria',
  jardinero: 'jardineria',
  jardineria: 'jardineria',
  jardinería: 'jardineria',
}

export function normalizeSpecialty(value) {
  const normalizedValue = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replaceAll(' ', '_')

  return specialtyAliases[normalizedValue] || (professionalSpecialties.some((item) => item.value === normalizedValue) ? normalizedValue : 'otro')
}

async function countRows(table, queryBuilder) {
  let query = supabase.from(table).select('*', { count: 'exact', head: true })

  if (queryBuilder) {
    query = queryBuilder(query)
  }

  const { count, error } = await query
  if (error) throw error
  return count || 0
}

async function safeCount(task) {
  try {
    return await task()
  } catch {
    return 0
  }
}

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
    full_name: values.full_name || null,
    business_name: values.business_name || null,
    phone: values.phone || null,
    whatsapp: values.whatsapp || null,
    email: values.email || null,
    specialty: normalizeSpecialty(values.specialty),
    secondary_specialties: values.secondary_specialties || null,
    work_zone: values.work_zone || null,
    city: values.city || null,
    province: values.province || null,
    service_description: values.service_description || null,
    availability: values.availability || 'disponible',
    working_days: values.working_days || null,
    working_hours: values.working_hours || null,
    experience_years: Number(values.experience_years || 0),
    license_number: values.license_number || null,
    availability_notes: values.availability_notes || null,
  }

  const query = profileId
    ? supabase.from('professional_profiles').update(payload).eq('id', profileId).select().single()
    : supabase.from('professional_profiles').insert(payload).select().single()

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getProfessionalStats(userId) {
  const [applications, assignedJobs, jobsInProgress, finishedJobs] = await Promise.all([
    safeCount(() => countRows('job_applications', (query) => query.eq('professional_id', userId))),
    safeCount(() => countRows('repair_requests', (query) => query.eq('assigned_professional_id', userId))),
    safeCount(() => countRows('repair_requests', (query) => query.eq('assigned_professional_id', userId).eq('status', 'en_proceso'))),
    safeCount(() => countRows('repair_requests', (query) => query.eq('assigned_professional_id', userId).in('status', ['resuelto', 'resuelta']))),
  ])

  return {
    applications,
    assignedJobs,
    jobsInProgress,
    finishedJobs,
  }
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
    .select('*, professional:professional_id(full_name, email, phone)')
    .eq('repair_request_id', repairId)
    .order('created_at', { ascending: false })

  if (error) throw error

  const applications = data || []
  const professionalIds = applications.map((application) => application.professional_id)

  if (professionalIds.length === 0) return applications

  const { data: profiles, error: profileError } = await supabase
    .from('professional_profiles')
    .select('user_id, specialty, work_zone, availability')
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

-- Sistema inmobiliario - datos de prueba.
-- Ejecutar despues de crear usuarios reales en Supabase Auth.
--
-- Paso previo:
-- 1. Crear manualmente estos usuarios desde Authentication > Users.
-- 2. Copiar cada UUID real.
-- 3. Reemplazar los UUID de ejemplo de este archivo por los UUID reales.

with ids as (
  select
    '00000000-0000-0000-0000-000000000001'::uuid as agent_id,
    '00000000-0000-0000-0000-000000000002'::uuid as tenant_1_id,
    '00000000-0000-0000-0000-000000000003'::uuid as tenant_2_id,
    '00000000-0000-0000-0000-000000000004'::uuid as owner_1_id,
    '00000000-0000-0000-0000-000000000005'::uuid as owner_2_id,
    '00000000-0000-0000-0000-000000000006'::uuid as plumber_id,
    '00000000-0000-0000-0000-000000000007'::uuid as electrician_id,
    '00000000-0000-0000-0000-000000000008'::uuid as painter_id
),
seed_profiles as (
  insert into public.profiles (id, full_name, role, phone)
  select agent_id, 'Inmobiliaria Centro', 'agente_inmobiliario', '3764-100001' from ids
  union all select tenant_1_id, 'Lucia Gomez', 'inquilino', '3764-200001' from ids
  union all select tenant_2_id, 'Martin Silva', 'inquilino', '3764-200002' from ids
  union all select owner_1_id, 'Ana Rodriguez', 'propietario', '3764-300001' from ids
  union all select owner_2_id, 'Carlos Pereira', 'propietario', '3764-300002' from ids
  union all select plumber_id, 'Diego Fernandez', 'profesional', '3764-400001' from ids
  union all select electrician_id, 'Sofia Benitez', 'profesional', '3764-400002' from ids
  union all select painter_id, 'Ramon Ortiz', 'profesional', '3764-400003' from ids
  on conflict (id) do update
  set full_name = excluded.full_name,
      role = excluded.role,
      phone = excluded.phone
  returning 1
),
seed_properties as (
  insert into public.properties (
    id,
    title,
    address,
    city,
    operation_type,
    property_type,
    price,
    status,
    description,
    owner_id,
    agent_id
  )
  values
    (
      '10000000-0000-0000-0000-000000000001',
      'Departamento centrico',
      'San Martin 1240',
      'Posadas',
      'alquiler',
      'departamento',
      420000,
      'alquilada',
      'Departamento de dos ambientes cercano al centro.',
      (select owner_1_id from ids),
      (select agent_id from ids)
    ),
    (
      '10000000-0000-0000-0000-000000000002',
      'Casa con patio',
      'Av. Uruguay 2450',
      'Posadas',
      'venta',
      'casa',
      95000000,
      'disponible',
      'Casa familiar con patio amplio y cochera.',
      (select owner_2_id from ids),
      (select agent_id from ids)
    ),
    (
      '10000000-0000-0000-0000-000000000003',
      'Monoambiente amoblado',
      'Rivadavia 880',
      'Posadas',
      'alquiler',
      'departamento',
      290000,
      'alquilada',
      'Monoambiente equipado para estudiante.',
      (select owner_1_id from ids),
      (select agent_id from ids)
    ),
    (
      '10000000-0000-0000-0000-000000000004',
      'Local comercial',
      'Cordoba 1550',
      'Posadas',
      'alquiler',
      'local',
      650000,
      'disponible',
      'Local a la calle con deposito.',
      (select owner_2_id from ids),
      (select agent_id from ids)
    ),
    (
      '10000000-0000-0000-0000-000000000005',
      'Oficina luminosa',
      'Bolivar 730',
      'Posadas',
      'alquiler',
      'oficina',
      380000,
      'suspendida',
      'Oficina con recepcion y sala de reuniones.',
      (select owner_1_id from ids),
      (select agent_id from ids)
    )
  on conflict (id) do nothing
  returning 1
),
seed_contracts as (
  insert into public.contracts (
    id,
    property_id,
    tenant_id,
    owner_id,
    agent_id,
    start_date,
    end_date,
    monthly_amount,
    status,
    rules
  )
  values
    (
      '20000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001',
      (select tenant_1_id from ids),
      (select owner_1_id from ids),
      (select agent_id from ids),
      '2026-01-01',
      '2027-12-31',
      420000,
      'activo',
      'Pago mensual antes del dia 10.'
    ),
    (
      '20000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000003',
      (select tenant_2_id from ids),
      (select owner_1_id from ids),
      (select agent_id from ids),
      '2026-03-01',
      '2028-02-28',
      290000,
      'activo',
      'No se permiten mascotas sin autorizacion.'
    ),
    (
      '20000000-0000-0000-0000-000000000003',
      '10000000-0000-0000-0000-000000000004',
      (select tenant_1_id from ids),
      (select owner_2_id from ids),
      (select agent_id from ids),
      '2026-04-01',
      '2027-03-31',
      650000,
      'activo',
      'Uso exclusivamente comercial.'
    )
  on conflict (id) do nothing
  returning 1
),
seed_payments as (
  insert into public.payments (
    id,
    contract_id,
    tenant_id,
    amount,
    issue_date,
    due_date,
    payment_date,
    status,
    payment_method
  )
  values
    (
      '30000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      (select tenant_1_id from ids),
      420000,
      '2026-06-01',
      '2026-06-10',
      null,
      'pendiente',
      null
    ),
    (
      '30000000-0000-0000-0000-000000000002',
      '20000000-0000-0000-0000-000000000001',
      (select tenant_1_id from ids),
      420000,
      '2026-05-01',
      '2026-05-10',
      '2026-05-08',
      'abonado',
      'transferencia'
    ),
    (
      '30000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000002',
      (select tenant_2_id from ids),
      290000,
      '2026-04-01',
      '2026-04-10',
      null,
      'vencido',
      null
    ),
    (
      '30000000-0000-0000-0000-000000000004',
      '20000000-0000-0000-0000-000000000003',
      (select tenant_1_id from ids),
      650000,
      '2026-06-01',
      '2026-06-10',
      null,
      'anulado',
      null
    ),
    (
      '30000000-0000-0000-0000-000000000005',
      '20000000-0000-0000-0000-000000000002',
      (select tenant_2_id from ids),
      315000,
      '2026-05-01',
      '2026-05-10',
      '2026-05-18',
      'abonado_con_recargo',
      'mercado_pago'
    )
  on conflict (id) do nothing
  returning 1
),
seed_repairs as (
  insert into public.repair_requests (
    id,
    property_id,
    contract_id,
    tenant_id,
    title,
    description,
    repair_type,
    priority,
    status,
    assigned_professional_id,
    agent_notes
  )
  values
    (
      '40000000-0000-0000-0000-000000000001',
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      (select tenant_1_id from ids),
      'Perdida bajo mesada',
      'Hay humedad y goteo constante en la cocina.',
      'plomeria',
      'alta',
      'pendiente',
      null,
      null
    ),
    (
      '40000000-0000-0000-0000-000000000002',
      '10000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000002',
      (select tenant_2_id from ids),
      'Tomacorriente sin tension',
      'El tomacorriente del dormitorio no funciona.',
      'electricidad',
      'media',
      'pendiente',
      null,
      null
    ),
    (
      '40000000-0000-0000-0000-000000000003',
      '10000000-0000-0000-0000-000000000001',
      '20000000-0000-0000-0000-000000000001',
      (select tenant_1_id from ids),
      'Pintura de pared con humedad',
      'Se solicita presupuesto para reparar y pintar.',
      'pintura',
      'media',
      'publicada',
      null,
      'Publicada para recibir postulaciones.'
    ),
    (
      '40000000-0000-0000-0000-000000000004',
      '10000000-0000-0000-0000-000000000003',
      '20000000-0000-0000-0000-000000000002',
      (select tenant_2_id from ids),
      'Cambio de llave termica',
      'La llave termica se dispara al encender el horno.',
      'electricidad',
      'urgente',
      'publicada',
      null,
      'Requiere profesional matriculado.'
    ),
    (
      '40000000-0000-0000-0000-000000000005',
      '10000000-0000-0000-0000-000000000004',
      '20000000-0000-0000-0000-000000000003',
      (select tenant_1_id from ids),
      'Canilla rota en local',
      'Canilla del bano pierde agua.',
      'plomeria',
      'alta',
      'en_proceso',
      (select plumber_id from ids),
      'Profesional asignado.'
    )
  on conflict (id) do nothing
  returning 1
),
seed_professionals as (
  insert into public.professional_profiles (
    id,
    user_id,
    specialty,
    work_zone,
    service_description,
    availability,
    rating
  )
  values
    (
      '50000000-0000-0000-0000-000000000001',
      (select plumber_id from ids),
      'Plomero',
      'Posadas y Garupa',
      'Reparaciones sanitarias, perdidas y colocacion de griferia.',
      'Lunes a viernes',
      4.60
    ),
    (
      '50000000-0000-0000-0000-000000000002',
      (select electrician_id from ids),
      'Electricista',
      'Posadas',
      'Instalaciones domiciliarias y revision de tableros.',
      'Turnos por la tarde',
      4.80
    ),
    (
      '50000000-0000-0000-0000-000000000003',
      (select painter_id from ids),
      'Pintor',
      'Posadas',
      'Pintura interior, exterior y tratamiento de humedad.',
      'Disponibilidad inmediata',
      4.40
    )
  on conflict (id) do nothing
  returning 1
)
insert into public.job_applications (
  id,
  repair_request_id,
  professional_id,
  message,
  estimated_budget,
  status
)
values
  (
    '60000000-0000-0000-0000-000000000001',
    '40000000-0000-0000-0000-000000000003',
    (select painter_id from ids),
    'Puedo revisar la humedad y cotizar materiales.',
    85000,
    'pendiente'
  ),
  (
    '60000000-0000-0000-0000-000000000002',
    '40000000-0000-0000-0000-000000000004',
    (select electrician_id from ids),
    'Trabajo con instalaciones certificadas.',
    120000,
    'pendiente'
  ),
  (
    '60000000-0000-0000-0000-000000000003',
    '40000000-0000-0000-0000-000000000003',
    (select plumber_id from ids),
    'Puedo revisar si la humedad viene de una perdida.',
    70000,
    'pendiente'
  )
on conflict (id) do nothing;

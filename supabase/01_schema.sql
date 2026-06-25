-- Sistema inmobiliario - esquema inicial
-- Ejecutar primero en Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'visitante',
  phone text,
  created_at timestamp with time zone not null default now(),
  constraint profiles_role_check check (
    role in (
      'agente_inmobiliario',
      'inquilino',
      'propietario',
      'profesional',
      'visitante'
    )
  )
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  address text not null,
  city text,
  operation_type text not null,
  property_type text not null,
  price numeric(12, 2) not null default 0,
  status text not null default 'disponible',
  description text,
  owner_id uuid references public.profiles(id) on delete set null,
  agent_id uuid references public.profiles(id) on delete set null,
  image_url text,
  created_at timestamp with time zone not null default now(),
  constraint properties_operation_type_check check (operation_type in ('alquiler', 'venta')),
  constraint properties_property_type_check check (
    property_type in ('casa', 'departamento', 'local', 'terreno', 'oficina')
  ),
  constraint properties_status_check check (
    status in (
      'registrada',
      'disponible',
      'disponible_alquiler',
      'disponible_venta',
      'alquilada',
      'vendida',
      'suspendida',
      'anulada'
    )
  ),
  constraint properties_price_check check (price >= 0)
);

create table if not exists public.contracts (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  owner_id uuid references public.profiles(id) on delete set null,
  agent_id uuid references public.profiles(id) on delete set null,
  start_date date not null,
  end_date date not null,
  monthly_amount numeric(12, 2) not null default 0,
  status text not null default 'activo',
  rules text,
  created_at timestamp with time zone not null default now(),
  constraint contracts_status_check check (
    status in ('borrador', 'activo', 'finalizado', 'rescindido', 'vencido')
  ),
  constraint contracts_dates_check check (end_date >= start_date),
  constraint contracts_monthly_amount_check check (monthly_amount >= 0)
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  contract_id uuid not null references public.contracts(id) on delete cascade,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12, 2) not null default 0,
  issue_date date not null default current_date,
  due_date date not null,
  payment_date date,
  status text not null default 'pendiente',
  payment_method text,
  created_at timestamp with time zone not null default now(),
  constraint payments_status_check check (
    status in ('pendiente', 'abonado', 'vencido', 'anulado', 'abonado_con_recargo')
  ),
  constraint payments_amount_check check (amount >= 0)
);

create table if not exists public.repair_requests (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  contract_id uuid references public.contracts(id) on delete set null,
  tenant_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  repair_type text not null,
  priority text not null default 'media',
  status text not null default 'pendiente',
  assigned_professional_id uuid references public.profiles(id) on delete set null,
  agent_notes text,
  created_at timestamp with time zone not null default now(),
  constraint repair_requests_priority_check check (priority in ('baja', 'media', 'alta', 'urgente')),
  constraint repair_requests_status_check check (
    status in (
      'pendiente',
      'publicada',
      'publicado',
      'en_proceso',
      'pendiente_confirmacion',
      'resuelta',
      'resuelto',
      'cancelada',
      'cancelado'
    )
  )
);

create table if not exists public.professional_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  specialty text not null,
  work_zone text,
  service_description text,
  availability text,
  rating numeric(3, 2) not null default 0,
  created_at timestamp with time zone not null default now(),
  constraint professional_profiles_rating_check check (rating >= 0 and rating <= 5)
);

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  repair_request_id uuid not null references public.repair_requests(id) on delete cascade,
  professional_id uuid not null references public.profiles(id) on delete cascade,
  message text,
  estimated_budget numeric(12, 2),
  status text not null default 'pendiente',
  created_at timestamp with time zone not null default now(),
  constraint job_applications_status_check check (
    status in ('pendiente', 'aceptada', 'rechazada', 'cancelada')
  ),
  constraint job_applications_budget_check check (
    estimated_budget is null or estimated_budget >= 0
  ),
  constraint job_applications_unique_professional unique (repair_request_id, professional_id)
);

create table if not exists public.property_images (
  id uuid primary key default gen_random_uuid(),
  property_id uuid not null references public.properties(id) on delete cascade,
  image_url text,
  storage_path text,
  created_at timestamp with time zone not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_properties_status on public.properties(status);
create index if not exists idx_properties_owner_id on public.properties(owner_id);
create index if not exists idx_properties_agent_id on public.properties(agent_id);
create index if not exists idx_contracts_property_id on public.contracts(property_id);
create index if not exists idx_contracts_tenant_id on public.contracts(tenant_id);
create index if not exists idx_contracts_owner_id on public.contracts(owner_id);
create index if not exists idx_contracts_agent_id on public.contracts(agent_id);
create index if not exists idx_payments_contract_id on public.payments(contract_id);
create index if not exists idx_payments_tenant_id on public.payments(tenant_id);
create index if not exists idx_repair_requests_property_id on public.repair_requests(property_id);
create index if not exists idx_repair_requests_contract_id on public.repair_requests(contract_id);
create index if not exists idx_repair_requests_tenant_id on public.repair_requests(tenant_id);
create index if not exists idx_repair_requests_status on public.repair_requests(status);
create index if not exists idx_repair_requests_professional_id
  on public.repair_requests(assigned_professional_id);
create index if not exists idx_professional_profiles_user_id
  on public.professional_profiles(user_id);
create index if not exists idx_job_applications_repair_request_id
  on public.job_applications(repair_request_id);
create index if not exists idx_job_applications_professional_id
  on public.job_applications(professional_id);
create index if not exists idx_property_images_property_id
  on public.property_images(property_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(new.raw_user_meta_data ->> 'role', 'visitante'),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Sistema inmobiliario - politicas finales de Row Level Security.
-- Ejecutar despues de 00_full_demo_schema.sql o 01_schema.sql, segun el camino elegido.

alter table public.profiles enable row level security;
alter table public.properties enable row level security;
alter table public.contracts enable row level security;
alter table public.payments enable row level security;
alter table public.repair_requests enable row level security;
alter table public.professional_profiles enable row level security;
alter table public.job_applications enable row level security;
alter table public.property_images enable row level security;

alter table public.repair_requests
  alter column tenant_id drop not null;

alter table public.repair_requests
  add column if not exists created_by_id uuid references public.profiles(id) on delete set null;

alter table public.repair_requests
  add column if not exists requested_by_role text;

do $$
begin
  if not exists (
    select 1
    from information_schema.table_constraints
    where constraint_schema = 'public'
      and table_name = 'repair_requests'
      and constraint_name = 'repair_requests_requested_by_role_check'
  ) then
    alter table public.repair_requests
      add constraint repair_requests_requested_by_role_check
      check (
        requested_by_role is null
        or requested_by_role in ('inquilino', 'agente_inmobiliario', 'propietario')
      );
  end if;
end $$;

create or replace function public.current_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.profiles
  where id = auth.uid()
  limit 1
$$;

create or replace function public.is_agent()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_user_role() = 'agente_inmobiliario'
$$;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_select_related" on public.profiles;
drop policy if exists "properties_select_public_or_related" on public.properties;
drop policy if exists "properties_insert_agent" on public.properties;
drop policy if exists "properties_update_agent" on public.properties;
drop policy if exists "properties_delete_agent" on public.properties;
drop policy if exists "contracts_select_related" on public.contracts;
drop policy if exists "contracts_insert_agent" on public.contracts;
drop policy if exists "contracts_update_agent" on public.contracts;
drop policy if exists "contracts_delete_agent" on public.contracts;
drop policy if exists "payments_select_related" on public.payments;
drop policy if exists "payments_insert_agent" on public.payments;
drop policy if exists "payments_update_agent" on public.payments;
drop policy if exists "payments_delete_agent" on public.payments;
drop policy if exists "repair_requests_select_related" on public.repair_requests;
drop policy if exists "repair_requests_insert_tenant" on public.repair_requests;
drop policy if exists "repair_requests_insert_agent" on public.repair_requests;
drop policy if exists "repair_requests_update_agent" on public.repair_requests;
drop policy if exists "professional_profiles_select_related" on public.professional_profiles;
drop policy if exists "professional_profiles_insert_own" on public.professional_profiles;
drop policy if exists "professional_profiles_update_own" on public.professional_profiles;
drop policy if exists "job_applications_select_related" on public.job_applications;
drop policy if exists "job_applications_insert_professional" on public.job_applications;
drop policy if exists "job_applications_update_professional_or_agent" on public.job_applications;
drop policy if exists "property_images_select_public_or_related" on public.property_images;
drop policy if exists "property_images_insert_agent" on public.property_images;
drop policy if exists "property_images_update_agent" on public.property_images;
drop policy if exists "property_images_delete_agent" on public.property_images;

-- Profiles
create policy "profiles_select_related"
on public.profiles
for select
to authenticated
using (
  auth.uid() = id
  or public.is_agent()
  or exists (
    select 1
    from public.contracts c
    where c.owner_id = auth.uid()
      and (
        c.tenant_id = profiles.id
        or c.owner_id = profiles.id
      )
  )
  or exists (
    select 1
    from public.repair_requests rr
    join public.properties p on p.id = rr.property_id
    where p.owner_id = auth.uid()
      and rr.assigned_professional_id = profiles.id
  )
);

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Properties
create policy "properties_select_public_or_related"
on public.properties
for select
to anon, authenticated
using (
  status in ('disponible', 'disponible_alquiler', 'disponible_venta')
  or public.is_agent()
  or owner_id = auth.uid()
  or exists (
    select 1
    from public.contracts c
    where c.property_id = properties.id
      and c.tenant_id = auth.uid()
  )
);

create policy "properties_insert_agent"
on public.properties
for insert
to authenticated
with check (public.is_agent());

create policy "properties_update_agent"
on public.properties
for update
to authenticated
using (public.is_agent())
with check (public.is_agent());

create policy "properties_delete_agent"
on public.properties
for delete
to authenticated
using (public.current_user_role() = 'agente_inmobiliario');

-- Contracts
create policy "contracts_select_related"
on public.contracts
for select
to authenticated
using (
  public.is_agent()
  or tenant_id = auth.uid()
  or owner_id = auth.uid()
);

create policy "contracts_insert_agent"
on public.contracts
for insert
to authenticated
with check (public.is_agent());

create policy "contracts_update_agent"
on public.contracts
for update
to authenticated
using (public.is_agent())
with check (public.is_agent());

create policy "contracts_delete_agent"
on public.contracts
for delete
to authenticated
using (public.is_agent());

-- Payments
create policy "payments_select_related"
on public.payments
for select
to authenticated
using (
  public.is_agent()
  or tenant_id = auth.uid()
  or exists (
    select 1
    from public.contracts c
    where c.id = payments.contract_id
      and c.owner_id = auth.uid()
  )
);

create policy "payments_insert_agent"
on public.payments
for insert
to authenticated
with check (public.is_agent());

create policy "payments_update_agent"
on public.payments
for update
to authenticated
using (public.is_agent())
with check (public.is_agent());

create policy "payments_delete_agent"
on public.payments
for delete
to authenticated
using (public.is_agent());

-- Repair requests
create policy "repair_requests_select_related"
on public.repair_requests
for select
to authenticated
using (
  tenant_id = auth.uid()
  or created_by_id = auth.uid()
  or assigned_professional_id = auth.uid()
  or (
    public.current_user_role() = 'profesional'
    and status in ('publicada', 'publicado')
  )
  or (
    public.current_user_role() = 'agente_inmobiliario'
    and exists (
      select 1
      from public.properties p
      where p.id = repair_requests.property_id
        and p.agent_id = auth.uid()
    )
  )
  or (
    public.current_user_role() = 'propietario'
    and exists (
      select 1
      from public.properties p
      where p.id = repair_requests.property_id
        and p.owner_id = auth.uid()
    )
  )
);

create policy "repair_requests_insert_tenant"
on public.repair_requests
for insert
to authenticated
with check (
  public.current_user_role() = 'inquilino'
  and property_id is not null
  and tenant_id = auth.uid()
  and created_by_id = auth.uid()
  and requested_by_role = 'inquilino'
);

create policy "repair_requests_insert_agent"
on public.repair_requests
for insert
to authenticated
with check (
  public.current_user_role() = 'agente_inmobiliario'
  and property_id is not null
  and created_by_id = auth.uid()
  and requested_by_role = 'agente_inmobiliario'
  and exists (
    select 1
    from public.properties p
    where p.id = repair_requests.property_id
      and p.agent_id = auth.uid()
  )
);

create policy "repair_requests_update_agent"
on public.repair_requests
for update
to authenticated
using (
  public.current_user_role() = 'agente_inmobiliario'
  and exists (
    select 1
    from public.properties p
    where p.id = repair_requests.property_id
      and p.agent_id = auth.uid()
  )
)
with check (
  public.current_user_role() = 'agente_inmobiliario'
  and exists (
    select 1
    from public.properties p
    where p.id = repair_requests.property_id
      and p.agent_id = auth.uid()
  )
);

-- Professional profiles
create policy "professional_profiles_select_related"
on public.professional_profiles
for select
to authenticated
using (
  public.is_agent()
  or user_id = auth.uid()
);

create policy "professional_profiles_insert_own"
on public.professional_profiles
for insert
to authenticated
with check (
  public.current_user_role() = 'profesional'
  and user_id = auth.uid()
);

create policy "professional_profiles_update_own"
on public.professional_profiles
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

-- Job applications
create policy "job_applications_select_related"
on public.job_applications
for select
to authenticated
using (
  public.is_agent()
  or professional_id = auth.uid()
);

create policy "job_applications_insert_professional"
on public.job_applications
for insert
to authenticated
with check (
  public.current_user_role() = 'profesional'
  and professional_id = auth.uid()
  and exists (
    select 1
    from public.repair_requests rr
    where rr.id = job_applications.repair_request_id
      and rr.status in ('publicada', 'publicado')
  )
);

create policy "job_applications_update_professional_or_agent"
on public.job_applications
for update
to authenticated
using (
  public.is_agent()
  or professional_id = auth.uid()
)
with check (
  public.is_agent()
  or professional_id = auth.uid()
);

-- Property images
create policy "property_images_select_public_or_related"
on public.property_images
for select
to anon, authenticated
using (
  exists (
    select 1
    from public.properties p
    where p.id = property_images.property_id
      and (
        p.status in ('disponible', 'disponible_alquiler', 'disponible_venta')
        or public.is_agent()
        or p.owner_id = auth.uid()
        or exists (
          select 1
          from public.contracts c
          where c.property_id = p.id
            and c.tenant_id = auth.uid()
        )
      )
  )
);

create policy "property_images_insert_agent"
on public.property_images
for insert
to authenticated
with check (public.is_agent());

create policy "property_images_update_agent"
on public.property_images
for update
to authenticated
using (public.is_agent())
with check (public.is_agent());

create policy "property_images_delete_agent"
on public.property_images
for delete
to authenticated
using (public.is_agent());

-- Caso de uso: asignar inquilino a propiedad en alquiler.
-- Ejecutar despues de 01_schema.sql, 02_rls.sql y 04_demo_compatibility.sql.

alter table public.profiles
add column if not exists email text;

update public.profiles p
set email = u.email
from auth.users u
where p.id = u.id
  and (p.email is null or p.email = '');

alter table public.contracts
drop constraint if exists contracts_status_check;

alter table public.contracts
add constraint contracts_status_check check (
  status in ('borrador', 'pendiente', 'activo', 'finalizado', 'rescindido', 'vencido')
);

drop policy if exists "profiles_update_agent_role" on public.profiles;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, phone)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.email,
    coalesce(new.raw_user_meta_data ->> 'role', 'visitante'),
    new.raw_user_meta_data ->> 'phone'
  )
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

create or replace function public.assign_tenant_to_property(
  p_property_id uuid,
  p_tenant_id uuid,
  p_agent_id uuid,
  p_start_date date,
  p_end_date date,
  p_monthly_amount numeric,
  p_status text,
  p_rules text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_property public.properties%rowtype;
  v_tenant public.profiles%rowtype;
  v_contract_id uuid;
begin
  if public.current_user_role() <> 'agente_inmobiliario' then
    raise exception 'Solo la inmobiliaria puede asignar inquilinos.';
  end if;

  if p_agent_id <> auth.uid() then
    raise exception 'El agente autenticado no coincide con la solicitud.';
  end if;

  select *
  into v_property
  from public.properties
  where id = p_property_id
  for update;

  if not found then
    raise exception 'No se encontro la propiedad.';
  end if;

  if v_property.operation_type <> 'alquiler'
    or v_property.status not in ('disponible', 'disponible_alquiler') then
    raise exception 'La propiedad no esta disponible para alquiler.';
  end if;

  select *
  into v_tenant
  from public.profiles
  where id = p_tenant_id
  for update;

  if not found then
    raise exception 'Usuario no encontrado.';
  end if;

  if v_tenant.role in ('agente_inmobiliario', 'profesional') then
    raise exception 'No se puede asignar este rol como inquilino.';
  end if;

  if p_monthly_amount <= 0 then
    raise exception 'El monto mensual debe ser mayor a 0.';
  end if;

  if p_start_date >= p_end_date then
    raise exception 'La fecha de inicio debe ser anterior a la finalizacion.';
  end if;

  if p_status not in ('pendiente', 'activo') then
    raise exception 'Estado de contrato invalido.';
  end if;

  if exists (
    select 1
    from public.contracts
    where property_id = p_property_id
      and status = 'activo'
  ) then
    raise exception 'Esta propiedad ya tiene un contrato activo.';
  end if;

  if exists (
    select 1
    from public.contracts
    where tenant_id = p_tenant_id
      and status = 'activo'
  ) then
    raise exception 'El usuario ya tiene un contrato activo.';
  end if;

  insert into public.contracts (
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
  values (
    p_property_id,
    p_tenant_id,
    v_property.owner_id,
    p_agent_id,
    p_start_date,
    p_end_date,
    p_monthly_amount,
    p_status,
    p_rules
  )
  returning id into v_contract_id;

  update public.properties
  set status = 'alquilada',
      operation_type = 'alquiler',
      agent_id = p_agent_id
  where id = p_property_id;

  update public.profiles
  set role = 'inquilino'
  where id = p_tenant_id
    and role <> 'inquilino';

  return v_contract_id;
end;
$$;

grant execute on function public.assign_tenant_to_property(
  uuid,
  uuid,
  uuid,
  date,
  date,
  numeric,
  text,
  text
) to authenticated;

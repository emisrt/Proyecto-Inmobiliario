-- Mejoras de arreglos para inmobiliaria.
-- Ejecutar despues de 05_assign_tenant.sql.

alter table public.repair_requests
alter column tenant_id drop not null;

alter table public.repair_requests
add column if not exists created_by_id uuid references public.profiles(id) on delete set null,
add column if not exists requested_by_role text;

alter table public.repair_requests
drop constraint if exists repair_requests_requested_by_role_check;

alter table public.repair_requests
add constraint repair_requests_requested_by_role_check check (
  requested_by_role is null
  or requested_by_role in ('inquilino', 'agente_inmobiliario')
);

create or replace function public.create_agent_repair_request(
  p_property_id uuid,
  p_contract_id uuid,
  p_tenant_id uuid,
  p_created_by_id uuid,
  p_title text,
  p_description text,
  p_repair_type text,
  p_priority text,
  p_status text,
  p_agent_notes text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_contract public.contracts%rowtype;
  v_repair_id uuid;
begin
  if public.current_user_role() <> 'agente_inmobiliario' then
    raise exception 'Solo la inmobiliaria puede crear solicitudes de arreglo.';
  end if;

  if p_created_by_id <> auth.uid() then
    raise exception 'El agente autenticado no coincide con la solicitud.';
  end if;

  if p_property_id is null then
    raise exception 'La propiedad es obligatoria.';
  end if;

  if coalesce(trim(p_title), '') = '' then
    raise exception 'El titulo es obligatorio.';
  end if;

  if coalesce(trim(p_description), '') = '' then
    raise exception 'La descripcion es obligatoria.';
  end if;

  if p_priority not in ('baja', 'media', 'alta', 'urgente') then
    raise exception 'Prioridad invalida.';
  end if;

  if p_status not in ('pendiente', 'publicado', 'publicada') then
    raise exception 'Estado inicial invalido.';
  end if;

  if p_contract_id is null then
    select *
    into v_contract
    from public.contracts
    where property_id = p_property_id
      and status = 'activo'
    order by created_at desc
    limit 1;

    if found then
      p_contract_id := v_contract.id;
      p_tenant_id := v_contract.tenant_id;
    end if;
  end if;

  insert into public.repair_requests (
    property_id,
    contract_id,
    tenant_id,
    created_by_id,
    requested_by_role,
    title,
    description,
    repair_type,
    priority,
    status,
    agent_notes
  )
  values (
    p_property_id,
    p_contract_id,
    p_tenant_id,
    p_created_by_id,
    'agente_inmobiliario',
    p_title,
    p_description,
    p_repair_type,
    p_priority,
    p_status,
    p_agent_notes
  )
  returning id into v_repair_id;

  return v_repair_id;
end;
$$;

grant execute on function public.create_agent_repair_request(
  uuid,
  uuid,
  uuid,
  uuid,
  text,
  text,
  text,
  text,
  text,
  text
) to authenticated;

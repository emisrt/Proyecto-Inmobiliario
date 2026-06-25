-- Compatibilidad para la demo funcional Locative.
-- Ejecutar despues de 01_schema.sql y 02_rls.sql en Supabase SQL Editor.

alter table public.properties
add column if not exists image_url text;

alter table public.properties
drop constraint if exists properties_status_check;

alter table public.properties
add constraint properties_status_check check (
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
);

alter table public.repair_requests
drop constraint if exists repair_requests_status_check;

alter table public.repair_requests
add constraint repair_requests_status_check check (
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
);

drop policy if exists "properties_select_public_or_related" on public.properties;
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

drop policy if exists "repair_requests_select_related" on public.repair_requests;
create policy "repair_requests_select_related"
on public.repair_requests
for select
to authenticated
using (
  public.is_agent()
  or tenant_id = auth.uid()
  or assigned_professional_id = auth.uid()
  or (
    public.current_user_role() = 'profesional'
    and status in ('publicada', 'publicado')
  )
);

drop policy if exists "job_applications_insert_professional" on public.job_applications;
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

drop policy if exists "property_images_select_public_or_related" on public.property_images;
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
